// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
import { TextEncoder, TextDecoder } from "util"
import { jest } from "@jest/globals"

// Mock fetch globally
global.fetch = jest.fn()

// Mock crypto.randomUUID
global.crypto = {
  ...global.crypto,
  randomUUID: () => "test-uuid-1234",
}

// Polyfill TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock environment variables
process.env = {
  ...process.env,
  AIORNOT_API_KEY: "test-aiornot-key",
  OPENAI_API_KEY: "test-openai-key",
  BYPASS_AUTH: "true",
  NODE_ENV: "test",
}

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

console.error = (...args) => {
  if (args[0]?.includes?.("Warning:")) return
  originalConsoleError(...args)
}

console.warn = (...args) => {
  if (args[0]?.includes?.("Warning:")) return
  originalConsoleWarn(...args)
}

console.log = (...args) => {
  // Suppress logs during tests
  if (process.env.DEBUG) {
    originalConsoleLog(...args)
  }
}

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})

