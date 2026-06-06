import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshIcon } from 'tdesign-icons-react'
import type { Task, CreateTaskDTO } from '@/types/task'
import { useTaskStore } from '@/store/taskStore'
import { createTask, getTasks, deleteTask } from '@/api/task'
import TaskForm from './components/TaskForm'
import TaskCard from '@/components/TaskCard'
import styles from './style.module.css'

export default function LogPage() {
  const navigate = useNavigate()
  const { tasks, setTasks, addTask, removeTask } = useTaskStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** 加载任务列表 */
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTasks()
      setTasks(data)
    } catch {
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [setTasks])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  /** 创建任务 */
  const handleCreate = useCallback(
    async (data: CreateTaskDTO) => {
      setSubmitting(true)
      try {
        const newTask = await createTask(data)
        addTask(newTask)
      } catch {
        throw new Error('创建失败')
      } finally {
        setSubmitting(false)
      }
    },
    [addTask]
  )

  /** 删除任务 */
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteTask(id)
        removeTask(id)
      } catch {
        // 静默失败，不影响 UI
      }
    },
    [removeTask]
  )

  /** 点击任务卡片 → 跳转分析页 */
  const handleTaskClick = useCallback(
    (task: Task) => {
      navigate(`/analysis?taskId=${task.id}`)
    },
    [navigate]
  )

  return (
    <div className={`page-container ${styles.log}`}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>📝 拖延日志</h2>
        <p className={styles.pageDesc}>记录每一次拖延，了解自己</p>
      </div>

      {/* 新建任务表单 */}
      <div className={styles.formSection}>
        <TaskForm onSubmit={handleCreate} submitting={submitting} />
      </div>

      {/* 任务列表 */}
      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            记录列表
            {tasks.length > 0 && (
              <span className={styles.count}>({tasks.length})</span>
            )}
          </h3>
          <button
            className={styles.refreshBtn}
            onClick={fetchTasks}
            disabled={loading}
            title="刷新列表"
          >
            <RefreshIcon
              size="16px"
              className={loading ? styles.spinning : ''}
            />
          </button>
        </div>

        {/* 加载中 */}
        {loading && (
          <div className={`card ${styles.stateCard}`}>
            <p className={styles.stateText}>加载中...</p>
          </div>
        )}

        {/* 加载错误 */}
        {error && !loading && (
          <div className={`card ${styles.stateCard}`}>
            <p className={styles.stateText}>{error}</p>
            <button className={styles.retryBtn} onClick={fetchTasks}>
              重试
            </button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && tasks.length === 0 && (
          <div className={`card ${styles.emptyState}`}>
            <span className={styles.emptyIcon}>📋</span>
            <p className={styles.emptyText}>还没有拖延记录</p>
            <p className={styles.emptyHint}>点击上方按钮开始记录你的第一次拖延</p>
          </div>
        )}

        {/* 任务列表 */}
        {!loading && !error && tasks.length > 0 && (
          <div className={styles.taskList}>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TaskCard
                  task={task}
                  onDelete={handleDelete}
                  onClick={handleTaskClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
