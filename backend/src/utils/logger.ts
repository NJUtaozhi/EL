/**
 * Winston 日志
 * 按级别输出到控制台和文件
 */
import winston from 'winston'
import path from 'path'

const logDir = path.join(__dirname, '../../logs')

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`
    }),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`
        }),
      ),
    }),
  ],
})

// 生产环境额外写入文件（非强制，创建logs目录失败也不影响）
if (process.env.NODE_ENV === 'production') {
  try {
    logger.add(new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }))
    logger.add(new winston.transports.File({ filename: path.join(logDir, 'combined.log') }))
  } catch {
    // logs 目录不存在时忽略文件日志
  }
}

export default logger
