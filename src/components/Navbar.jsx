import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function role(){try{const t=localStorage.getItem('token'); if(!t) return null; return JSON.parse(atob(t.split('.')[1])).role}catch{return null}}

export default function Navbar(){
  const r = role()
  return (
    <nav className="w-full flex justify-between items-center px-10 py-6 backdrop-blur-xl bg-white/5 border-b border-white/10 text-white">
      <Link to="/" className="text-3xl font-bold tracking-wide">Evalx</Link>
      <div className="flex gap-3 items-center">
        <Link to="/events" className="hover:text-gray-300">Events</Link>
        {r==='organizer' && <Link to="/organizer/dashboard" className="hover:text-gray-300">Dashboard</Link>}
        {!r && <Link to="/login" className="hover:text-gray-300">Login</Link>}
        {!r && <Link to="/signup"><Button variant="outline" size="sm">Signup</Button></Link>}
        {r && <Button size="sm" onClick={()=>{localStorage.removeItem('token'); location.href='/'}}>Logout</Button>}
      </div>
    </nav>
  )
}
