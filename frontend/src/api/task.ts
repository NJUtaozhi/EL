/**
 * 任务相关 API
 */
import api from './index'
import type { Task, CreateTaskDTO } from '@/types/task'

/** 创建任务 */
export const createTask = (data: CreateTaskDTO): Promise<Task> =>
  api.post('/tasks', data)

/** 获取任务列表 */
export const getTasks = (): Promise<Task[]> =>
  api.get('/tasks')

/** 获取单个任务 */
export const getTask = (id: number): Promise<Task> =>
  api.get(`/tasks/${id}`)

/** 删除任务 */
export const deleteTask = (id: number): Promise<void> =>
  api.delete(`/tasks/${id}`)
