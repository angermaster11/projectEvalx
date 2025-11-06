import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/api/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

function role(){try{const t=localStorage.getItem('token'); if(!t) return null; return JSON.parse(atob(t.split('.')[1])).role}catch{return null}}

export default function EventDetail(){
  const { id } = useParams()
  const [event, setEvent] = useState(null)

  useEffect(()=>{ (async()=>{
    const res = await api.get(`/events/${id}`)
    setEvent(res.data.event)
  })() },[id])

  if(!event) return <div className="text-white p-10">Loading...</div>

  const r = role()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <Navbar/>
      <div className="max-w-4xl mx-auto p-8">
        <img src={event.banner_url || event.image_url} className="w-full h-64 object-cover rounded-2xl mb-6"/>
        <h1 className="text-4xl font-bold">{event.name}</h1>
        <p className="opacity-80 mt-3">{event.description}</p>

        <h3 className="text-2xl font-semibold mt-8">Rounds</h3>
        <ul className="list-disc ml-6 mt-2">
          {(event.rounds||[]).map((r,i)=>(<li key={i}>{r.name} — {r.type}</li>))}
        </ul>

        {r && r!=='organizer' && (
          <Link to={`/events/${event._id}/submit`}><Button className="mt-8">Apply / Submit</Button></Link>
        )}
        {r==='organizer' && (
          <Link to={`/organizer/event/${event._id}/submissions`} className="underline mt-8 inline-block">View Submissions →</Link>
        )}
      </div>
      <div className="max-w-5xl mx-auto w-full px-4">
        <div className="mt-6 flex gap-3">
          <a href={\`/events/\${id}/submit\`} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10">Submit</a>
          <a href={\`/events/\${id}/leaderboard\`} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10">Leaderboard</a>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
