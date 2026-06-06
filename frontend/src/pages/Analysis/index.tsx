import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRightIcon } from 'tdesign-icons-react'
import type { CreateTaskDTO } from '@/types/task'
import type { AttributionResult as AttributionResultType } from '@/types/analysis'
import { useTaskStore } from '@/store/taskStore'
import { getTasks, createTask } from '@/api/task'
import { submitForAnalysis } from '@/api/analysis'
import AttributionResult from './components/AttributionResult'
import AnalysisTagCloud from './components/TagCloud'
import styles from './style.module.css'

/** 页面状态 */
type PageState = 'select' | 'analyzing' | 'result' | 'error'

export default function AnalysisPage() {
  const [searchParams] = useSearchParams()
  const preselectedTaskId = searchParams.get('taskId')
  const { tasks, setTasks, addTask } = useTaskStore()

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(
    preselectedTaskId ? Number(preselectedTaskId) : null
  )
  const [pageState, setPageState] = useState<PageState>(
    preselectedTaskId ? 'analyzing' : 'select'
  )
  const [result, setResult] = useState<AttributionResultType | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // 任务名输入（无任务时的快速创建）
  const [quickTitle, setQuickTitle] = useState('')

  // 加载任务列表
  useEffect(() => {
    if (tasks.length === 0) {
      getTasks().then(setTasks).catch(() => {})
    }
  }, [tasks.length, setTasks])

  // 如果有预选任务，自动触发分析
  useEffect(() => {
    if (preselectedTaskId) {
      const id = Number(preselectedTaskId)
      setSelectedTaskId(id)
      triggerAnalysis(id)
    }
  }, [preselectedTaskId])

  /** 触发归因分析 */
  const triggerAnalysis = useCallback(async (taskId: number) => {
    setPageState('analyzing')
    setErrorMsg('')
    try {
      const res = await submitForAnalysis(taskId)
      setResult(res)
      setPageState('result')
    } catch {
      setErrorMsg('分析失败，请检查后端服务是否正常运行')
      setPageState('error')
    }
  }, [])

  /** 快速创建任务并分析 */
  const handleQuickCreate = async () => {
    if (!quickTitle.trim()) return
    try {
      const newTask = await createTask({ title: quickTitle.trim() })
      addTask(newTask)
      setSelectedTaskId(newTask.id)
      setQuickTitle('')
      triggerAnalysis(newTask.id)
    } catch {
      setErrorMsg('创建任务失败')
      setPageState('error')
    }
  }

  /** 选择已有任务 */
  const handleSelectTask = (taskId: number) => {
    setSelectedTaskId(taskId)
    triggerAnalysis(taskId)
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

  return (
    <div className={`page-container ${styles.analysis}`}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>🔍 归因分析</h2>
        <p className={styles.pageDesc}>AI 帮你分析拖延背后的深层原因</p>
      </div>

      {/* ===== 状态：选择任务 ===== */}
      {pageState === 'select' && (
        <div className={styles.selectSection}>
          {/* 快速创建 */}
          <div className={`card ${styles.quickCreate}`}>
            <h3 className={styles.sectionTitle}>⚡ 快速记录并分析</h3>
            <div className={styles.quickRow}>
              <input
                className={styles.quickInput}
                type="text"
                placeholder="输入一件你拖延的事..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickCreate()}
                maxLength={50}
              />
              <button
                className={styles.quickBtn}
                onClick={handleQuickCreate}
                disabled={!quickTitle.trim()}
              >
                分析
              </button>
            </div>
          </div>

          {/* 已有任务列表 */}
          {tasks.length > 0 && (
            <div className={styles.taskSection}>
              <h3 className={styles.sectionTitle}>📋 或选择已有记录</h3>
              <div className={styles.taskList}>
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    className={`card ${styles.taskItem}`}
                    onClick={() => handleSelectTask(task.id)}
                  >
                    <div className={styles.taskInfo}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      {task.reason && (
                        <span className={styles.taskReason}>{task.reason}</span>
                      )}
                    </div>
                    <ChevronRightIcon size="18px" className={styles.taskArrow} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className={`card ${styles.emptyHint}`}>
              <p>👆 上方快速输入，或先去「记录」页添加拖延事件</p>
            </div>
          )}
        </div>
      )}

      {/* ===== 状态：分析中 ===== */}
      {pageState === 'analyzing' && (
        <div className={`card ${styles.analyzing}`}>
          <div className={styles.spinner} />
          <p className={styles.analyzingTitle}>正在分析中...</p>
          <p className={styles.analyzingDesc}>
            DeepSeek AI 正在解读你的拖延模式
          </p>
          {selectedTask && (
            <p className={styles.analyzingTask}>📌 {selectedTask.title}</p>
          )}
        </div>
      )}

      {/* ===== 状态：分析结果 ===== */}
      {pageState === 'result' && result && (
        <div className={styles.resultSection}>
          {/* 已分析的任务 */}
          {selectedTask && (
            <div className={styles.analyzedTask}>
              <span className={styles.analyzedLabel}>分析对象</span>
              <span className={styles.analyzedTitle}>📌 {selectedTask.title}</span>
            </div>
          )}

          {/* 归因结果卡片 */}
          <AttributionResult result={result} />

          {/* 关键词云 */}
          {result.keywords.length > 0 && (
            <AnalysisTagCloud keywords={result.keywords} />
          )}

          {/* 操作按钮 */}
          <div className={styles.actions}>
            <button
              className={styles.backBtn}
              onClick={() => {
                setPageState('select')
                setResult(null)
                setSelectedTaskId(null)
              }}
            >
              分析其他任务
            </button>
            <button
              className={styles.interventionBtn}
              onClick={() =>
                (window.location.href = '/intervention')
              }
            >
              查看干预建议 →
            </button>
          </div>
        </div>
      )}

      {/* ===== 状态：出错 ===== */}
      {pageState === 'error' && (
        <div className={`card ${styles.errorState}`}>
          <span className={styles.errorIcon}>😢</span>
          <p className={styles.errorText}>{errorMsg}</p>
          <button
            className={styles.retryBtn}
            onClick={() => {
              if (selectedTaskId) {
                triggerAnalysis(selectedTaskId)
              } else {
                setPageState('select')
              }
            }}
          >
            重试
          </button>
        </div>
      )}
    </div>
  )
}
