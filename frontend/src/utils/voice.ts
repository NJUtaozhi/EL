/**
 * 语音工具
 * 浏览器 SpeechRecognition API 兼容性检测
 */
export const checkVoiceSupport = (): boolean => {
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
}

export const createSpeechRecognition = (): SpeechRecognition | null => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) return null
  const recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  return recognition
}
