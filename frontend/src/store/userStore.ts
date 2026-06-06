/**
 * 用户状态管理
 */
import { create } from 'zustand'
import type { User } from '@/types/user'

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoggedIn: !!localStorage.getItem('token'),
  setUser: (user) => set({ user, isLoggedIn: true }),
  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token, isLoggedIn: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isLoggedIn: false })
  },
}))
