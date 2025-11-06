import { useState } from 'react'
import api from '@/api/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function CreateEvent(){
  const navigate = useNavigate()
  const [event, setEvent] = useState({ name:'', description:'', date:'', max_teams:'', prize:'', registrationDeadline:'', banner:'', image:'' })
  const [rounds, setRounds] = useState([])

  function handle(e){ setEvent({ ...event, [e.target.name]: e.target.value }) }
  function addRound(){ setRounds([...rounds, { name:'', type:'' }]) }
  function updRound(i,key,val){ const r=[...rounds]; r[i][key]=val; setRounds(r) }
  function toB64(file,key){ const rdr=new FileReader(); rdr.onloadend=()=>setEvent(p=>({...p,[key]:rdr.result})); rdr.readAsDataURL(file) }

  async function create(){
    const payload = { ...event, rounds }
    const res = await api.post('/events/create', payload)
    alert('Event Created ✅')
    navigate(`/organizer/event/${res.data.event._id}/submissions`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <Navbar/>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold">Create Event</h1>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <input name="name" className="input" placeholder="Event Name" onChange={handle}/>
          <input name="date" type="date" className="input" onChange={handle}/>
          <input name="max_teams" className="input" placeholder="Max Teams" onChange={handle}/>
          <input name="prize" className="input" placeholder="Prize" onChange={handle}/>
          <input name="registrationDeadline" type="date" className="input" onChange={handle}/>
        </div>
        <textarea name="description" className="input w-full mt-4" rows={4} placeholder="Description" onChange={handle}></textarea>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div><p className="mb-2">Banner</p><input type="file" accept="image/*" onChange={e=>toB64(e.target.files[0],'banner')}/></div>
          <div><p className="mb-2">Poster</p><input type="file" accept="image/*" onChange={e=>toB64(e.target.files[0],'image')}/></div>
        </div>

        <h2 className="text-2xl font-bold mt-6">Rounds</h2>
        {rounds.map((r,i)=>(
          <div key={i} className="grid grid-cols-2 gap-4 mt-2">
            <input className="input" placeholder="Round Name" onChange={e=>updRound(i,'name',e.target.value)}/>
            <input className="input" placeholder="Type (ppt/code/interview)" onChange={e=>updRound(i,'type',e.target.value)}/>
          </div>
        ))}
        <Button className="mt-3" onClick={addRound}>+ Add Round</Button>

        <Button className="mt-6 w-full h-12 text-lg" onClick={create}>Create Event</Button>
      </div>
      <Footer/>
    </div>
  )
}
