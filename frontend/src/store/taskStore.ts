/**
 * 任务状态管理 (zustand)
 * 管理任务列表、当前编辑任务
 */
import { create } from 'zustand'
import type { Task } from '@/types/task'

interface TaskState {
  tasks: Task[]
  currentTask: Task | null
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  removeTask: (id: number) => void
  setCurrentTask: (task: Task | null) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  currentTask: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  setCurrentTask: (task) => set({ currentTask: task }),
}))
