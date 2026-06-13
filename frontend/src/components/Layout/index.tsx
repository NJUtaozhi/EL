import { useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  Edit1Icon,
  ChartPieIcon,
  UserIcon,
  CheckCircleIcon,
} from 'tdesign-icons-react'
import NavBar from '@/components/NavBar'
import styles from './index.module.css'

/** 底部标签页配置 */
const TABS = [
  {
    key: '/',
    label: '首页',
    Icon: HomeIcon,
  },
  {
    key: '/log',
    label: '记录',
    Icon: Edit1Icon,
  },
  {
    key: '/analysis',
    label: '分析',
    Icon: ChartPieIcon,
  },
  {
    key: '/checkin',
    label: '打卡',
    Icon: CheckCircleIcon,
  },
  {
    key: '/profile',
    label: '我的',
    Icon: UserIcon,
  },
] as const

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = location.pathname

  /** 判断当前是否在某个 Tab 页或其子路由 */
  const isTabActive = (tabKey: string) => {
    if (tabKey === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(tabKey)
  }

  /** 是否显示底部 TabBar（Chat 页不显示） */
  const showTabBar = TABS.some((tab) => isTabActive(tab.key))

  return (
    <div className={styles.layout}>
      {/* 顶部导航栏 */}
      <NavBar />

      {/* 主内容区 */}
      <main className={styles.content}>{children}</main>

      {/* 底部标签栏 */}
      {showTabBar && (
        <footer className={styles.tabbar}>
          {TABS.map(({ key, label, Icon }) => {
            const active = isTabActive(key)
            return (
              <button
                key={key}
                className={`${styles.tabItem} ${active ? styles.tabItemActive : ''}`}
                onClick={() => navigate(key)}
              >
                <div className={styles.tabIconWrap}>
                  <Icon
                    size="22px"
                    className={`${styles.tabIcon} ${active ? styles.tabIconActive : ''}`}
                  />
                  {active && <div className={styles.activeDot} />}
                </div>
                <span className={`${styles.tabLabel} ${active ? styles.tabLabelActive : ''}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </footer>
      )}
    </div>
  )
}
