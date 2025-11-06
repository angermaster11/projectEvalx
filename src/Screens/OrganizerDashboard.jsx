import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function OrganizerDashboard(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <Navbar/>
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <div className="mt-6 flex gap-4">
          <Link to="/organizer/create"><Button>Create Event</Button></Link>
          <Link to="/events" className="underline self-center">Browse All Events</Link>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
