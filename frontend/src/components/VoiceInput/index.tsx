import { useVoiceInput } from '@/hooks/useVoiceInput'
import { SoundIcon, MicrophoneIcon, CloseIcon } from 'tdesign-icons-react'
import styles from './index.module.css'

interface VoiceInputProps {
  onResult: (text: string) => void
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 语音输入按钮
 * 长按录音 / 点击开始-停止
 * 带波形动画反馈
 */
export default function VoiceInput({ onResult, disabled = false }: VoiceInputProps) {
  const { status, isListening, start, stop, isSupported } = useVoiceInput(onResult)

  if (!isSupported) {
    return (
      <button type="button" className={styles.btn} disabled title="当前浏览器不支持语音识别">
        <MicrophoneIcon size="20px" />
        <span className={styles.btnText}>不支持</span>
      </button>
    )
  }

  const handleClick = () => {
    if (disabled) return
    if (isListening) {
      stop()
    } else {
      start()
    }
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${isListening ? styles.btnListening : ''}`}
      onClick={handleClick}
      disabled={disabled}
      title={isListening ? '点击停止录音' : '点击开始语音输入'}
    >
      <div className={`${styles.iconWrap} ${isListening ? styles.iconWrapActive : ''}`}>
        {isListening ? (
          <>
            <SoundIcon size="18px" className={styles.waveIcon} />
            <span className={styles.wave1} />
            <span className={styles.wave2} />
            <span className={styles.wave3} />
          </>
        ) : (
          <MicrophoneIcon size="20px" />
        )}
      </div>
      <span className={`${styles.btnText} ${isListening ? styles.btnTextActive : ''}`}>
        {isListening ? '录音中...' : '语音'}
      </span>
    </button>
  )
}
