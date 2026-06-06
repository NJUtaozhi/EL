import { useState, useRef, useCallback } from 'react'
import { checkVoiceSupport, createSpeechRecognition } from '@/utils/voice'

/** 语音识别状态 */
type VoiceStatus = 'idle' | 'listening' | 'error' | 'unsupported'

/**
 * 语音输入 Hook
 * 管理浏览器语音识别 → 转文字
 */
export function useVoiceInput(onResult?: (text: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>(
    checkVoiceSupport() ? 'idle' : 'unsupported'
  )
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null)

  const start = useCallback(() => {
    if (!checkVoiceSupport()) {
      setStatus('unsupported')
      return
    }

    const recognition = createSpeechRecognition()
    if (!recognition) {
      setStatus('unsupported')
      return
    }

    recognitionRef.current = recognition
    setStatus('listening')
    setTranscript('')

    recognition.onresult = (event: Event) => {
      const srEvent = event as Event & {
        results: Array<Array<{ transcript: string }>>
      }
      const last = srEvent.results[srEvent.results.length - 1]
      if (last && last[0]) {
        const text = last[0].transcript
        setTranscript(text)
        onResult?.(text)
      }
    }

    recognition.onerror = () => {
      setStatus('error')
    }

    recognition.onend = () => {
      setStatus((prev) => (prev === 'listening' ? 'idle' : prev))
    }

    recognition.start()
  }, [onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setStatus('idle')
  }, [])

  return {
    status,
    transcript,
    isSupported: status !== 'unsupported',
    isListening: status === 'listening',
    start,
    stop,
  }
}
