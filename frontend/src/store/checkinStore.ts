/**
 * 打卡状态管理
 */
import { create } from 'zustand'

interface CheckinState {
  streak: number
  todayCheckedIn: boolean
  setStreak: (n: number) => void
  setTodayCheckedIn: (v: boolean) => void
}

export const useCheckinStore = create<CheckinState>((set) => ({
  streak: 0,
  todayCheckedIn: false,
  setStreak: (streak) => set({ streak }),
  setTodayCheckedIn: (todayCheckedIn) => set({ todayCheckedIn }),
}))
