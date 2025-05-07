import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './pages/Layout'
import BoardPage from './pages/BoardPage'
import TaskDetailPage from './pages/TaskDetailPage'
import PrivateRoute from './components/auth/PrivateRoute'

// Root component with routing
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={`/board/default`} replace />} />
        <Route path="/board/:boardId" element={<PrivateRoute><BoardPage /></PrivateRoute>} />
        <Route path="/board/:boardId/task/:taskId" element={<PrivateRoute><TaskDetailPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
} 