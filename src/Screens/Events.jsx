import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/api/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Events(){
  const [events, setEvents] = useState([])
  useEffect(()=>{ (async()=>{
    const res = await api.get('/events')
    setEvents(res.data.events || [])
  })() },[])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <Navbar/>
      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(e => (
          <div key={e._id} className="card">
            <img src={e.banner_url || e.image_url} className="w-full h-40 object-cover rounded-xl mb-3"/>
            <h2 className="text-xl font-semibold">{e.name}</h2>
            <p className="opacity-70 text-sm line-clamp-3">{e.description}</p>
            <Link to={`/events/${e._id}`} className="underline mt-3 inline-block">View</Link>
          </div>
        ))}
      </div>
      <Footer/>
    </div>
  )
}
