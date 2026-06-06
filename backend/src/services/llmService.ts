/**
 * DeepSeek API 封装
 * 提供 chatCompletion 通用方法，带重试和超时
 */
import axios, { AxiosError } from 'axios'
import { config } from '../config'
import { llmConfig } from '../config/llm'
import logger from '../utils/logger'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  responseFormat?: 'text' | 'json_object'
}

export interface ChatCompletionResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

const MAX_RETRIES = 2
const TIMEOUT_MS = 30_000 // 30 seconds
const RETRY_DELAY_MS = 1000

/**
 * 调用 DeepSeek chat completion
 * 失败自动重试（最多 2 次），超时 30s
 */
export async function chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
  const { messages, temperature = 0.7, maxTokens = 1024, responseFormat = 'text' } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`DeepSeek API 调用: ${messages.length} messages, attempt ${attempt + 1}/${MAX_RETRIES + 1}`)

      const response = await axios.post(
        `${config.llm.apiUrl}/v1/chat/completions`,
        {
          model: config.llm.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.llm.apiKey}`,
          },
          timeout: TIMEOUT_MS,
        },
      )

      const choice = response.data.choices?.[0]
      if (!choice?.message?.content) {
        throw new Error('DeepSeek API 返回空内容')
      }

      return {
        content: choice.message.content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens ?? 0,
          completionTokens: response.data.usage?.completion_tokens ?? 0,
          totalTokens: response.data.usage?.total_tokens ?? 0,
        },
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (err instanceof AxiosError) {
        const status = err.response?.status
        // 4xx 错误不重试（如 401 认证失败、400 参数错误）
        if (status && status >= 400 && status < 500) {
          logger.error(`DeepSeek API 客户端错误 (${status}): ${err.message}`)
          throw lastError
        }
        logger.warn(`DeepSeek API 请求失败 (attempt ${attempt + 1}): ${err.message}`)
      } else {
        logger.warn(`DeepSeek API 未知错误 (attempt ${attempt + 1}): ${(err as Error).message}`)
      }

      // 最后一次尝试不再等待
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      }
    }
  }

  throw lastError ?? new Error('DeepSeek API 调用失败，已达最大重试次数')
}

/**
 * 根据 System Prompt + User Prompt 做一次对话
 */
export async function singlePrompt(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number; responseFormat?: 'text' | 'json_object' },
): Promise<ChatCompletionResponse> {
  return chatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    ...options,
  })
}
