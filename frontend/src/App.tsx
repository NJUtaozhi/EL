import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import NetworkStatus from '@/components/NetworkStatus'
import PageTransition from '@/components/PageTransition'

// ===== 代码分割：非首屏页面按需懒加载 =====
// 首页保持同步加载（首屏关键路径），其余页面拆分 chunk
const Home = lazy(() => import('@/pages/Home'))
const Log = lazy(() => import('@/pages/Log'))
const Analysis = lazy(() => import('@/pages/Analysis'))
const Profile = lazy(() => import('@/pages/Profile'))
const Intervention = lazy(() => import('@/pages/Intervention'))
const Checkin = lazy(() => import('@/pages/Checkin'))
const Chat = lazy(() => import('@/pages/Chat'))

/** Suspense 加载态 */
function PageLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid var(--bg-mask)',
          borderTopColor: 'var(--color-secondary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <span style={{ fontSize: 13, color: 'var(--text-light)' }}>加载中...</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <NetworkStatus />
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route
                path="/"
                element={
                  <PageTransition pageKey="home">
                    <Home />
                  </PageTransition>
                }
              />
              <Route
                path="/log"
                element={
                  <PageTransition pageKey="log">
                    <Log />
                  </PageTransition>
                }
              />
              <Route
                path="/analysis"
                element={
                  <PageTransition pageKey="analysis">
                    <Analysis />
                  </PageTransition>
                }
              />
              <Route
                path="/profile"
                element={
                  <PageTransition pageKey="profile">
                    <Profile />
                  </PageTransition>
                }
              />
              <Route
                path="/intervention"
                element={
                  <PageTransition pageKey="intervention">
                    <Intervention />
                  </PageTransition>
                }
              />
              <Route
                path="/checkin"
                element={
                  <PageTransition pageKey="checkin">
                    <Checkin />
                  </PageTransition>
                }
              />
              <Route
                path="/chat"
                element={
                  <PageTransition pageKey="chat">
                    <Chat />
                  </PageTransition>
                }
              />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
