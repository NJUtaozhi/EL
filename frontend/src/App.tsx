import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Log from '@/pages/Log'
import Analysis from '@/pages/Analysis'
import Profile from '@/pages/Profile'
import Intervention from '@/pages/Intervention'
import Checkin from '@/pages/Checkin'
import Chat from '@/pages/Chat'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<Log />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/intervention" element={<Intervention />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
