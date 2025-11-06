import { Routes, Route, Navigate } from 'react-router-dom'
import Hero from '@/Screens/Hero.jsx'
import Login from '@/Screens/Login.jsx'
import Signup from '@/Screens/Signup.jsx'
import Events from '@/Screens/Events.jsx'
import EventDetail from '@/Screens/EventDetail.jsx'
import EventSubmit from '@/Screens/EventSubmit.jsx'
import Leaderboard from '@/Screens/Leaderboard.jsx'
import OrganizerDashboard from '@/Screens/OrganizerDashboard.jsx'
import CreateEvent from '@/Screens/CreateEvent.jsx'
import EventSubmissions from '@/Screens/EventSubmissions.jsx'

function getRole() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role || null
  } catch { return null }
}

function Protected({ children, role }) {
  const r = getRole()
  if (!r) return <Navigate to="/login" replace />
  if (role && r !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/events/:id/submit" element={<Protected><EventSubmit /></Protected>} />
      <Route path="/organizer/dashboard" element={<Protected role="organizer"><OrganizerDashboard /></Protected>} />
      <Route path="/organizer/create" element={<Protected role="organizer"><CreateEvent /></Protected>} />
      <Route path="/organizer/event/:id/submissions" element={<Protected role="organizer"><EventSubmissions /></Protected>} />
          <Route path="/events/:id/leaderboard" element={<Leaderboard />} />
    </Routes>
  )
}
