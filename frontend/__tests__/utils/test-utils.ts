import { NextRequest, NextResponse } from "next/server"
import { jest } from "@jest/globals"

// Mock NextRequest
export function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
}): NextRequest {
  const { method = "GET", url = "http://localhost:3000", headers = {}, body = null } = options

  // Create headers object
  const headersObj = new Headers()
  Object.entries(headers).forEach(([key, value]) => {
    headersObj.append(key, value)
  })

  // Create request
  const request = new NextRequest(url, {
    method,
    headers: headersObj,
  })

  // Mock json method
  request.json = jest.fn().mockResolvedValue(body)

  return request
}

// Mock NextResponse for testing
export function createMockResponse(options: {
  status?: number
  headers?: Record<string, string>
  body?: any
}): NextResponse {
  const { status = 200, headers = {}, body = {} } = options

  const response = NextResponse.json(body, { status })

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Mock fetch responses
export function mockFetchResponse(status: number, data: any) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

// Reset all mocks
export function resetMocks() {
  jest.resetAllMocks()
  ;(global.fetch as jest.Mock).mockReset()
}

