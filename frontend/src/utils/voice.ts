/**
 * 语音工具
 * 浏览器 SpeechRecognition API 兼容性检测
 */

// 浏览器语音识别实例类型（简化版，兼容各浏览器）
interface BrowserSpeechRecognition {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: Event) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

export const checkVoiceSupport = (): boolean => {
  return (
    !!(window as unknown as Record<string, unknown>).SpeechRecognition ||
    !!(window as unknown as Record<string, unknown>).webkitSpeechRecognition
  )
}

export const createSpeechRecognition = (): BrowserSpeechRecognition | null => {
  const SRClass =
    (window as unknown as Record<string, new () => BrowserSpeechRecognition>)
      .SpeechRecognition ||
    (window as unknown as Record<string, new () => BrowserSpeechRecognition>)
      .webkitSpeechRecognition
  if (!SRClass) return null
  const recognition = new SRClass()
  recognition.lang = 'zh-CN'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  return recognition
}
