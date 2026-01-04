import { getComplianceRules, getAISettings } from "@/lib/db/config-service"
import { logger } from "@/lib/logger"
import type { AIAnalysis } from "@/lib/db/models/submission"

// Maximum number of retries for API calls
const MAX_RETRIES = 3

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = 500,
  context = "API Call",
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      logger.error(`${context} failed after maximum retries`, error, { context })
      throw error
    }

    const nextDelay = delay * 2
    logger.warn(`${context} failed, retrying in ${delay}ms (${retries} retries left)`, {
      context,
      data: { error: error instanceof Error ? error.message : String(error), retries, delay },
    })

    await new Promise((resolve) => setTimeout(resolve, delay))
    return withRetry(fn, retries - 1, nextDelay, context)
  }
}

/**
 * Call AIORNOT API with retry logic
 */
export async function detectAIGeneration(imageUrl: string, apiKey: string): Promise<any> {
  return withRetry(
    async () => {
      const startTime = Date.now()
      const response = await fetch("https://api.aiornot.com/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ image_url: imageUrl }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`AIORNOT API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      logger.info(`AIORNOT API call successful`, {
        context: "ai-detection",
        data: {
          duration,
          aiScore: data.ai_score,
          confidence: data.confidence,
          humanVerified: data.human_verified || false,
        },
      })

      return data
    },
    MAX_RETRIES,
    500,
    "AIORNOT API",
  )
}

/**
 * Call OpenAI API with retry logic
 */
export async function analyzeContent(
  title: string,
  description: string,
  category: string,
  originalIp: string,
  tags: string[] | string,
  imageUrl: string,
  apiKey: string,
): Promise<any> {
  const aiSettings = await getAISettings()

  const prompt = `
    Analyze this fan art submission for IP compliance, content safety, and brand guidelines adherence:
    
    Title: ${title}
    Description: ${description}
    Category: ${category}
    Original IP: ${originalIp}
    Tags: ${Array.isArray(tags) ? tags.join(", ") : tags}
    
    Image URL: ${imageUrl}
    
    Please provide a structured analysis with the following:
    1. IP Compliance: Score from 1-10, list of potential issues, risk level (low/medium/high)
    2. Content Safety: Score from 1-10, list of potential issues, risk level (low/medium/high)
    3. Brand Guidelines Adherence: Level (low/medium/high), list of issues, notes
    4. Overall Risk Score: 1-10
    5. Recommendation: "approve", "reject", or "review"
    6. Reasoning Summary: Brief explanation of the recommendation
    
    Return the analysis in JSON format.
  `

  return withRetry(
    async () => {
      const startTime = Date.now()
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: aiSettings.models.compliance,
          messages: [
            { role: "system", content: aiSettings.promptTemplates.compliance },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      logger.info(`OpenAI API call successful`, {
        context: "content-analysis",
        data: {
          duration,
          model: aiSettings.models.compliance,
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
        },
      })

      return data
    },
    MAX_RETRIES,
    500,
    "OpenAI API",
  )
}

/**
 * Parse OpenAI response with fallback
 */
export function parseOpenAIResponse(content: string): any {
  try {
    // Try to extract JSON from markdown code block
    const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || content.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content
    return JSON.parse(jsonString.replace(/^```json|```$/g, "").trim())
  } catch (error) {
    logger.error("Error parsing OpenAI response", error, {
      context: "content-analysis",
      data: { content: content.substring(0, 200) + "..." },
    })

    // Return fallback analysis
    return {
      ipCompliance: { score: 5, issues: ["Unable to parse AI response"], riskLevel: "medium" },
      contentSafety: { score: 5, issues: ["Unable to parse AI response"], riskLevel: "medium" },
      brandGuidelines: {
        adherence: "medium",
        issues: ["Unable to parse AI response"],
        notes: "Analysis failed, manual review required",
      },
      overallRiskScore: 5,
      recommendation: "review",
      reasoningSummary: "Analysis failed, manual review required",
      isFallback: true,
    }
  }
}

/**
 * Generate fallback AI detection result
 */
export function getFallbackAIDetection() {
  return {
    ai_score: 0.5,
    confidence: 0.5,
    human_verified: false,
    isFallback: true,
  }
}

/**
 * Generate fallback content analysis
 */
export function getFallbackContentAnalysis() {
  return {
    ipCompliance: { score: 5, issues: ["AI service unavailable"], riskLevel: "medium" },
    contentSafety: { score: 5, issues: ["AI service unavailable"], riskLevel: "medium" },
    brandGuidelines: {
      adherence: "medium",
      issues: ["AI service unavailable"],
      notes: "AI service unavailable, manual review required",
    },
    overallRiskScore: 5,
    recommendation: "review",
    reasoningSummary: "AI service unavailable, manual review required",
    isFallback: true,
  }
}

/**
 * Combine AI detection and content analysis results
 */
export async function combineAnalysisResults(aiDetectionResult: any, contentAnalysisResult: any): Promise<AIAnalysis> {
  const complianceRules = await getComplianceRules()

  const combinedAnalysis: AIAnalysis = {
    aiDetection: {
      score: aiDetectionResult.ai_score,
      isAiGenerated: aiDetectionResult.ai_score > complianceRules.aiDetectionThreshold,
      confidence: aiDetectionResult.confidence,
      humanVerified: aiDetectionResult.human_verified || false,
    },
    contentAnalysis: contentAnalysisResult,
    finalRecommendation: "review", // Default to review
    needsHumanReview: true, // Default to requiring human review
  }

  // Only make automated decisions if we didn't use fallbacks
  if (!aiDetectionResult.isFallback && !contentAnalysisResult.isFallback) {
    combinedAnalysis.finalRecommendation =
      aiDetectionResult.ai_score > complianceRules.autoRejectThreshold &&
      contentAnalysisResult.recommendation === "reject"
        ? "reject"
        : contentAnalysisResult.recommendation

    combinedAnalysis.needsHumanReview =
      (aiDetectionResult.ai_score > complianceRules.aiDetectionThreshold &&
        aiDetectionResult.ai_score < complianceRules.autoRejectThreshold) ||
      contentAnalysisResult.recommendation === "review" ||
      contentAnalysisResult.overallRiskScore > complianceRules.ipComplianceThreshold * 10
  }

  return combinedAnalysis
}

/**
 * Analyze a submission using AI services
 */
export async function analyzeSubmission(
  title: string,
  description: string,
  category: string,
  originalIp: string,
  tags: string[] | string,
  imageUrl: string,
): Promise<AIAnalysis> {
  const requestId = crypto.randomUUID()
  logger.info(`Starting submission analysis`, {
    context: "submission-analysis",
    data: { requestId, title, originalIp, category },
  })

  // Step 1: Call AIORNOT API for AI detection
  let aiOrNotData
  try {
    aiOrNotData = await detectAIGeneration(imageUrl, process.env.AIORNOT_API_KEY || "")
  } catch (error) {
    logger.error("AIORNOT API failed after retries", error, {
      context: "submission-analysis",
      data: { requestId },
    })
    // Use fallback AI detection
    aiOrNotData = getFallbackAIDetection()
  }

  // Step 2: Call OpenAI for content analysis
  let analysisResult
  try {
    const openAiResult = await analyzeContent(
      title,
      description,
      category,
      originalIp,
      tags,
      imageUrl,
      process.env.OPENAI_API_KEY || "",
    )
    const openAiAnalysis = openAiResult.choices[0].message.content
    analysisResult = parseOpenAIResponse(openAiAnalysis)
  } catch (error) {
    logger.error("OpenAI API failed after retries", error, {
      context: "submission-analysis",
      data: { requestId },
    })
    // Use fallback content analysis
    analysisResult = getFallbackContentAnalysis()
  }

  // Step 3: Combine results
  const combinedAnalysis = await combineAnalysisResults(aiOrNotData, analysisResult)

  logger.info(`Submission analysis completed`, {
    context: "submission-analysis",
    data: {
      requestId,
      aiScore: aiOrNotData.ai_score,
      recommendation: combinedAnalysis.finalRecommendation,
      needsHumanReview: combinedAnalysis.needsHumanReview,
      usedFallback: aiOrNotData.isFallback || analysisResult.isFallback,
    },
  })

  return combinedAnalysis
}

