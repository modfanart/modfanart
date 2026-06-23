import { describe, expect, it, jest, beforeEach } from "@jest/globals"
import { resetMocks } from "../../utils/test-utils"
import { setupAIMocks } from "../../mocks/ai-service-mocks"
import { mockDbFunctions } from "../../mocks/db-mocks"

// Mock the database functions
jest.mock("@/lib/db/config-service", () => ({
  getComplianceRules: mockDbFunctions.getComplianceRules,
  getAISettings: mockDbFunctions.getAISettings,
}))

// Import the service after mocking dependencies
import {
  withRetry,
  detectAIGeneration,
  analyzeContent,
  parseOpenAIResponse,
  getFallbackAIDetection,
  getFallbackContentAnalysis,
  combineAnalysisResults,
  analyzeSubmission,
} from "@/lib/services/moderation-service"

describe("Moderation Service", () => {
  beforeEach(() => {
    resetMocks()
  })

  describe("withRetry", () => {
    it("should return the result if the function succeeds", async () => {
      const mockFn = jest.fn().mockResolvedValue("success")
      const result = await withRetry(mockFn, 3, 10)
      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it("should retry if the function fails and eventually succeed", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Failed"))
        .mockRejectedValueOnce(new Error("Failed again"))
        .mockResolvedValue("success")

      const result = await withRetry(mockFn, 3, 10)
      expect(result).toBe("success")
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it("should throw an error if all retries fail", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Always fails"))

      await expect(withRetry(mockFn, 2, 10)).rejects.toThrow("Always fails")
      expect(mockFn).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })

  describe("detectAIGeneration", () => {
    it("should call AIORNOT API and return the result", async () => {
      const imageUrl = "https://example.com/test.jpg"
      setupAIMocks({ aiOrNotResponse: "success", imageUrl })

      const result = await detectAIGeneration(imageUrl, "test-api-key")

      expect(result).toEqual(
        expect.objectContaining({
          ai_score: 0.2,
          confidence: 0.95,
          image_url: imageUrl,
        }),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.aiornot.com/v1/analyze",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          }),
          body: JSON.stringify({ image_url: imageUrl }),
        }),
      )
    })

    it("should throw an error if the API call fails", async () => {
      const imageUrl = "https://example.com/test.jpg"
      setupAIMocks({ aiOrNotResponse: "error" })

      await expect(detectAIGeneration(imageUrl, "test-api-key")).rejects.toThrow()
    })
  })

  describe("analyzeContent", () => {
    it("should call OpenAI API and return the result", async () => {
      setupAIMocks({ openAIResponse: "success" })

      const result = await analyzeContent(
        "Test Title",
        "Test Description",
        "fan art",
        "Test IP",
        ["test", "fan art"],
        "https://example.com/test.jpg",
        "test-api-key",
      )

      expect(result).toEqual(
        expect.objectContaining({
          choices: expect.arrayContaining([
            expect.objectContaining({
              message: expect.objectContaining({
                role: "assistant",
                content: expect.any(String),
              }),
            }),
          ]),
        }),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          }),
        }),
      )
    })

    it("should throw an error if the API call fails", async () => {
      setupAIMocks({ openAIResponse: "error" })

      await expect(
        analyzeContent(
          "Test Title",
          "Test Description",
          "fan art",
          "Test IP",
          ["test", "fan art"],
          "https://example.com/test.jpg",
          "test-api-key",
        ),
      ).rejects.toThrow()
    })
  })

  describe("parseOpenAIResponse", () => {
    it("should parse valid JSON response", () => {
      const jsonContent = JSON.stringify({
        ipCompliance: { score: 3, issues: [], riskLevel: "low" },
        recommendation: "approve",
      })

      const result = parseOpenAIResponse(jsonContent)

      expect(result).toEqual({
        ipCompliance: { score: 3, issues: [], riskLevel: "low" },
        recommendation: "approve",
      })
    })

    it("should parse JSON inside markdown code blocks", () => {
      const markdownContent =
        '```json\n{"ipCompliance":{"score":3,"issues":[],"riskLevel":"low"},"recommendation":"approve"}\n```'

      const result = parseOpenAIResponse(markdownContent)

      expect(result).toEqual({
        ipCompliance: { score: 3, issues: [], riskLevel: "low" },
        recommendation: "approve",
      })
    })

    it("should return fallback analysis for invalid JSON", () => {
      const invalidContent = "This is not valid JSON"

      const result = parseOpenAIResponse(invalidContent)

      expect(result).toEqual(
        expect.objectContaining({
          ipCompliance: expect.objectContaining({ score: 5 }),
          recommendation: "review",
          isFallback: true,
        }),
      )
    })
  })

  describe("getFallbackAIDetection", () => {
    it("should return a fallback AI detection result", () => {
      const result = getFallbackAIDetection()

      expect(result).toEqual({
        ai_score: 0.5,
        confidence: 0.5,
        human_verified: false,
        isFallback: true,
      })
    })
  })

  describe("getFallbackContentAnalysis", () => {
    it("should return a fallback content analysis result", () => {
      const result = getFallbackContentAnalysis()

      expect(result).toEqual(
        expect.objectContaining({
          ipCompliance: expect.objectContaining({ score: 5 }),
          contentSafety: expect.objectContaining({ score: 5 }),
          recommendation: "review",
          isFallback: true,
        }),
      )
    })
  })

  describe("combineAnalysisResults", () => {
    it("should combine AI detection and content analysis results", async () => {
      const aiDetectionResult = {
        ai_score: 0.2,
        confidence: 0.95,
        human_verified: false,
      }

      const contentAnalysisResult = {
        ipCompliance: { score: 3, issues: [], riskLevel: "low" },
        contentSafety: { score: 2, issues: [], riskLevel: "low" },
        brandGuidelines: { adherence: "high", issues: [], notes: "" },
        overallRiskScore: 2,
        recommendation: "approve",
        reasoningSummary: "",
      }

      const result = await combineAnalysisResults(aiDetectionResult, contentAnalysisResult)

      expect(result).toEqual(
        expect.objectContaining({
          aiDetection: expect.objectContaining({
            score: 0.2,
            isAiGenerated: false,
          }),
          contentAnalysis: contentAnalysisResult,
          finalRecommendation: "approve",
          needsHumanReview: false,
        }),
      )
    })

    it("should recommend review for high AI scores", async () => {
      const aiDetectionResult = {
        ai_score: 0.8,
        confidence: 0.95,
        human_verified: false,
      }

      const contentAnalysisResult = {
        ipCompliance: { score: 3, issues: [], riskLevel: "low" },
        contentSafety: { score: 2, issues: [], riskLevel: "low" },
        brandGuidelines: { adherence: "high", issues: [], notes: "" },
        overallRiskScore: 2,
        recommendation: "approve",
        reasoningSummary: "",
      }

      const result = await combineAnalysisResults(aiDetectionResult, contentAnalysisResult)

      expect(result).toEqual(
        expect.objectContaining({
          aiDetection: expect.objectContaining({
            score: 0.8,
            isAiGenerated: true,
          }),
          finalRecommendation: "approve", // Still approve but...
          needsHumanReview: true, // Needs human review due to high AI score
        }),
      )
    })

    it("should recommend reject for very high AI scores and reject recommendation", async () => {
      const aiDetectionResult = {
        ai_score: 0.95,
        confidence: 0.95,
        human_verified: false,
      }

      const contentAnalysisResult = {
        ipCompliance: { score: 8, issues: ["Issue"], riskLevel: "high" },
        contentSafety: { score: 7, issues: ["Issue"], riskLevel: "medium" },
        brandGuidelines: { adherence: "low", issues: ["Issue"], notes: "" },
        overallRiskScore: 8,
        recommendation: "reject",
        reasoningSummary: "",
      }

      const result = await combineAnalysisResults(aiDetectionResult, contentAnalysisResult)

      expect(result).toEqual(
        expect.objectContaining({
          aiDetection: expect.objectContaining({
            score: 0.95,
            isAiGenerated: true,
          }),
          finalRecommendation: "reject",
          needsHumanReview: true,
        }),
      )
    })

    it("should always recommend review for fallback results", async () => {
      const aiDetectionResult = {
        ai_score: 0.2,
        confidence: 0.95,
        human_verified: false,
        isFallback: true,
      }

      const contentAnalysisResult = {
        ipCompliance: { score: 3, issues: [], riskLevel: "low" },
        contentSafety: { score: 2, issues: [], riskLevel: "low" },
        brandGuidelines: { adherence: "high", issues: [], notes: "" },
        overallRiskScore: 2,
        recommendation: "approve",
        reasoningSummary: "",
      }

      const result = await combineAnalysisResults(aiDetectionResult, contentAnalysisResult)

      expect(result).toEqual(
        expect.objectContaining({
          finalRecommendation: "review",
          needsHumanReview: true,
        }),
      )
    })
  })

  describe("analyzeSubmission", () => {
    it("should analyze a submission and return combined results", async () => {
      setupAIMocks({
        aiOrNotResponse: "success",
        openAIResponse: "success",
      })

      const result = await analyzeSubmission(
        "Test Title",
        "Test Description",
        "fan art",
        "Test IP",
        ["test", "fan art"],
        "https://example.com/test.jpg",
      )

      expect(result).toEqual(
        expect.objectContaining({
          aiDetection: expect.objectContaining({
            score: expect.any(Number),
            isAiGenerated: expect.any(Boolean),
          }),
          contentAnalysis: expect.objectContaining({
            ipCompliance: expect.any(Object),
            recommendation: expect.any(String),
          }),
          finalRecommendation: expect.any(String),
          needsHumanReview: expect.any(Boolean),
        }),
      )
      expect(global.fetch).toHaveBeenCalledTimes(2) // AIORNOT + OpenAI
    })

    it("should use fallbacks if AI services fail", async () => {
      setupAIMocks({
        aiOrNotResponse: "error",
        openAIResponse: "error",
      })

      const result = await analyzeSubmission(
        "Test Title",
        "Test Description",
        "fan art",
        "Test IP",
        ["test", "fan art"],
        "https://example.com/test.jpg",
      )

      expect(result).toEqual(
        expect.objectContaining({
          finalRecommendation: "review",
          needsHumanReview: true,
        }),
      )
      expect(global.fetch).toHaveBeenCalledTimes(2) // Failed attempts
    })

    it("should handle malformed OpenAI responses", async () => {
      setupAIMocks({
        aiOrNotResponse: "success",
        openAIResponse: "malformed",
      })

      const result = await analyzeSubmission(
        "Test Title",
        "Test Description",
        "fan art",
        "Test IP",
        ["test", "fan art"],
        "https://example.com/test.jpg",
      )

      expect(result).toEqual(
        expect.objectContaining({
          finalRecommendation: "review",
          needsHumanReview: true,
        }),
      )
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})

