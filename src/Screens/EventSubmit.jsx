import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/api/api'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'

export default function EventSubmit(){
  const { id } = useParams()
  const [event,setEvent] = useState(null)
  const [round,setRound] = useState(1)
  const [file,setFile] = useState(null)
  const [uploadedUrl,setUploadedUrl] = useState('')
  const [videoUrl,setVideoUrl] = useState('')
  const [repoUrl,setRepoUrl] = useState('')
  const [submitting,setSubmitting] = useState(false)
  const [error,setError] = useState('')
  const [ok,setOk] = useState('')

  useEffect(()=>{
    let cancel=false
    async function run(){
      try{
        const res = await api.get(`/events/${id}`)
        if(!cancel){
          setEvent(res.data.event)
          setRound(1)
        }
      }catch(e){
        setError(e?.response?.data?.detail||'Failed to load event')
      }
    }
    run()
    return ()=>{cancel=true}
  },[id])

  async function uploadRound1(){
    setError('')
    setOk('')
    if(!file) { setError('Select a file'); return }
    const fd = new FormData()
    fd.append('file', file)
    try{
      const res = await api.post('/events/upload-file', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUploadedUrl(res.data.file_url)
      setOk('File uploaded')
    }catch(e){
      setError(e?.response?.data?.detail||'Upload failed')
    }
  }

  async function submit(){
    setSubmitting(true)
    setError('')
    setOk('')
    try{
      const r = parseInt(round)
      let data = {}
      if(r===1){
        const url = uploadedUrl
        if(!url) { setError('Upload a file first'); setSubmitting(false); return }
        data = { file_url: url }
      }else if(r===2){
        if(!videoUrl || !repoUrl){ setError('Provide video_url and repo_url'); setSubmitting(false); return }
        data = { video_url: videoUrl, repo_url: repoUrl }
      }else if(r===3){
        data = {}
      }
      const payload = { event_id: id, round: r, data }
      const res = await api.post(`/events/${id}/submit`, payload)
      setOk('Submitted')
    }catch(e){
      setError(e?.response?.data?.detail||'Submit failed')
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-black text-white">
      <Navbar/>
      <div className="max-w-2xl w-full mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Submit to Event</h1>
          <div className="flex gap-3">
            <Link to={`/events/${id}`} className="hover:underline">Event</Link>
            <Link to={`/events/${id}/leaderboard`} className="hover:underline">Leaderboard</Link>
          </div>
        </div>

        {event && (
          <div className="mb-6 p-4 rounded-2xl border border-white/10 bg-white/5">
            <div className="font-medium">{event.name}</div>
            <div className="text-white/70">{event.description}</div>
          </div>
        )}

        {error && <div className="mb-4 text-red-400">{error}</div>}
        {ok && <div className="mb-4 text-emerald-400">{ok}</div>}

        <label className="block text-sm mb-2">Round</label>
        <select className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 mb-6" value={round} onChange={e=>setRound(e.target.value)}>
          {(event?.rounds||[]).map((r,i)=>(<option value={i+1} key={i}>Round {i+1}</option>))}
          {(!event?.rounds || event.rounds.length===0) && <option value={1}>Round 1</option>}
        </select>

        {parseInt(round)===1 && (
          <div className="space-y-3">
            <input type="file" className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2" onChange={e=>setFile(e.target.files?.[0]||null)}/>
            <div className="text-sm text-white/70">PPT, PPTX, DOC, DOCX, PDF</div>
            <Button onClick={uploadRound1}>Upload</Button>
            {uploadedUrl && <div className="text-sm break-all">Uploaded: {uploadedUrl}</div>}
          </div>
        )}

        {parseInt(round)===2 && (
          <div className="space-y-3">
            <input className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2" placeholder="Video URL" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} />
            <input className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2" placeholder="GitHub Repo URL" value={repoUrl} onChange={e=>setRepoUrl(e.target.value)} />
          </div>
        )}

        {parseInt(round)===3 && (
          <div className="text-white/70">No upload required. Wait for interview schedule.</div>
        )}

        <Button className="mt-6" disabled={submitting} onClick={submit}>{submitting?'Submitting...':'Submit'}</Button>
      </div>
      <Footer/>
    </div>
  )
}
