/**
 * 测试环境全局配置
 * 使用 vitest mock 模拟 Prisma Client，避免依赖真实数据库
 */
import { vi, beforeEach, afterEach } from 'vitest'

// Mock Prisma Client
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  task: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  analysis: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  checkin: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  badge: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
}

vi.mock('../src/config/database', () => ({
  default: mockPrisma,
}))

// Mock logger to suppress test output
vi.mock('../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock DeepSeek API (llmService)
vi.mock('../src/services/llmService', () => ({
  chatCompletion: vi.fn(),
  singlePrompt: vi.fn(),
}))

beforeEach(() => {
  // 重置所有 mock 状态
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

export { mockPrisma }
