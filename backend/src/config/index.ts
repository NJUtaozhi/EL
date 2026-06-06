/**
 * 统一配置
 * 从 .env 文件读取环境变量，提供默认值
 */
import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  llm: {
    apiKey: process.env.LLM_API_KEY || '',
    apiUrl: process.env.LLM_API_URL || 'https://api.deepseek.com/v1',
    model: process.env.LLM_MODEL || 'deepseek-chat',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'el-secret-key',
    expiresIn: '7d',
  },
}
