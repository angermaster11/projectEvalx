import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/api/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function Leaderboard(){
  const { id } = useParams()
  const [rows,setRows] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')

  useEffect(()=>{
    let cancel=false
    async function run(){
      setLoading(true)
      setError('')
      try{
        const res = await api.get(`/events/${id}/leaderboard`)
        if(!cancel) setRows(res.data.leaderboard||[])
      }catch(e){
        setError(e?.response?.data?.detail||'Failed to load leaderboard')
      }finally{
        if(!cancel) setLoading(false)
      }
    }
    run()
    return ()=>{cancel=true}
  },[id])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-black text-white">
      <Navbar/>
      <div className="max-w-5xl mx-auto w-full px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Leaderboard</h1>
          <div className="flex gap-3">
            <Link to={`/events/${id}`}><Button variant="outline" size="sm">Event</Button></Link>
            <Link to={`/events/${id}/submit`}><Button size="sm">Submit</Button></Link>
          </div>
        </div>
        {loading && <div className="opacity-80">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Round</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3">{r.rank}</td>
                    <td className="px-4 py-3">{r.name||'-'}</td>
                    <td className="px-4 py-3">{r.email||'-'}</td>
                    <td className="px-4 py-3">{r.round}</td>
                    <td className="px-4 py-3">{r.total_score!=null?r.total_score:'-'}</td>
                    <td className="px-4 py-3">{r.status||'-'}</td>
                  </tr>
                ))}
                {rows.length===0 && (
                  <tr><td colSpan="6" className="px-4 py-6 text-center text-white/60">No scored submissions yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  )
}
