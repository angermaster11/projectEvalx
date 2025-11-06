import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/api/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function EventSubmissions(){
  const { id } = useParams()
  const [subs, setSubs] = useState([])
  const [selected, setSelected] = useState(null)
  const [roundFilter, setRoundFilter] = useState('')

  async function load(){
    const res = await api.get(`/events/${id}/submissions`, { params: { round: roundFilter || undefined } })
    setSubs(res.data.submissions || [])
  }
  useEffect(()=>{ load() },[id, roundFilter])

  async function saveScore(){
    if(!selected) return
    const payload = {
      total_score: Number(selected.total_score || 0),
      remarks: selected.remarks || ''
    }
    await api.patch(`/events/${id}/submissions/${selected._id}/score`, payload)
    setSelected(null)
    await load()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <Navbar/>
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Submissions</h1>
          <select className="input w-48" value={roundFilter} onChange={e=>setRoundFilter(e.target.value)}>
            <option value="">All Rounds</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left opacity-80">
              <th>Applicant</th><th>Round</th><th>Status</th><th>Total</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s._id} className="border-b border-white/10">
                <td>{s.applicant?.name || s.user_id}</td>
                <td>Round {s.round}</td>
                <td>{s.status}</td>
                <td>{s.total_score ?? '-'}</td>
                <td><button className="underline" onClick={()=>setSelected({...s})}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="card w-96 text-white">
              <h3 className="text-xl font-semibold">Edit Score</h3>
              <input className="input mt-3" type="number" value={selected.total_score || ''} onChange={e=>setSelected({...selected, total_score: e.target.value})} placeholder="Total Score"/>
              <textarea className="input mt-3" rows={4} value={selected.remarks || ''} onChange={e=>setSelected({...selected, remarks: e.target.value})} placeholder="Remarks"></textarea>
              <div className="flex gap-3 mt-4">
                <Button className="flex-1" onClick={saveScore}>Save</Button>
                <Button variant="ghost" className="flex-1" onClick={()=>setSelected(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  )
}
