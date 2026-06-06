/**
 * LLM 配置
 * 使用 DeepSeek API（OpenAI 兼容格式）
 */
import { config } from './index'

export const llmConfig = {
  apiKey: config.llm.apiKey,
  baseURL: config.llm.apiUrl,
  model: config.llm.model,
  // 归因分析的 system prompt 模板
  attributionSystemPrompt: `你是一位专业的拖延心理学专家。请根据用户描述的任务和拖延理由，判断其拖延类型。

拖延类型包括：
1. 畏难型：任务难度大，担心做不好
2. 焦虑型：对任务结果过度担忧
3. 贪玩型：被娱乐活动分散注意力
4. 无规划型：缺乏时间管理，不知从何开始
5. 完美主义型：过度追求完美，迟迟不开始

请以 JSON 格式返回：{ "type": "类型", "confidence": 0.0~1.0, "keywords": ["关键词"], "suggestion": "简短建议" }`,
}
