import VoiceInput from '@/components/VoiceInput'

interface VoiceRecordProps {
  onResult: (text: string) => void
}

/**
 * 语音录入组件
 * 包装 VoiceInput，专用于 Log 页面的拖延理由录入
 */
export default function VoiceRecord({ onResult }: VoiceRecordProps) {
  return <VoiceInput onResult={onResult} />
}
