/**
 * 路由配置
 * 集中管理所有页面路由，方便后续扩展（如路由守卫、懒加载）
 *
 * 路由表：
 *   /              → 首页仪表盘（今日概览）
 *   /log           → 拖延日志（核心输入：任务+理由+情绪）
 *   /analysis      → 智能归因分析结果
 *   /profile       → 拖延画像（周报+热力图+趋势曲线）
 *   /intervention  → 干预建议（个性化策略卡片）
 *   /checkin       → 打卡微习惯（每日最小行动+徽章墙）
 *   /chat          → AI 对话（多轮对话，与智能体聊天）
 */
export const ROUTES = {
  home: '/',
  log: '/log',
  analysis: '/analysis',
  profile: '/profile',
  intervention: '/intervention',
  checkin: '/checkin',
  chat: '/chat',
} as const
