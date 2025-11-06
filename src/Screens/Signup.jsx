import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import api from '@/api/api'

export default function Signup(){
  const navigate = useNavigate()
  async function handleSignup(e){
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = Object.fromEntries(form.entries())
    try{
      const res = await api.post('/auth/signup', payload)
      if(res.data?.success){
        localStorage.setItem('token', res.data.access_token)
        const role = JSON.parse(atob(res.data.access_token.split('.')[1])).role
        navigate(role==='organizer' ? '/organizer/dashboard' : '/events')
      }else{
        alert(res.data?.detail || 'Signup failed')
      }
    }catch(err){
      alert(err.response?.data?.detail || 'Signup error')
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-4">
      <div className="w-full max-w-xl bg-white/10 border border-white/20 rounded-3xl p-10 backdrop-blur-xl shadow-xl">
        <h1 className="text-4xl font-extrabold text-center">Create Account</h1>
        <form className="grid grid-cols-2 gap-4 mt-6" onSubmit={handleSignup}>
          <input name="firstName" placeholder="First Name" className="input"/>
          <input name="lastName" placeholder="Last Name" className="input"/>
          <input name="username" placeholder="Username" className="input col-span-2"/>
          <input name="email" placeholder="Email" className="input col-span-2"/>
          <input name="password" type="password" placeholder="Password" className="input col-span-2"/>
          <input name="phone" placeholder="Phone" className="input col-span-2"/>
          <input name="date_of_birth" type="date" className="input col-span-2"/>
          <select name="gender" className="input col-span-2"><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option></select>
          <select name="role" className="input col-span-2"><option value="developer">Developer</option><option value="organizer">Organizer</option></select>
          <Button className="w-full col-span-2 h-12 text-lg" size="lg" type="submit">Signup</Button>
        </form>
        <p className="mt-6 text-center opacity-70 text-sm">Already have an account? <Link to="/login" className="underline text-purple-400">Login</Link></p>
      </div>
    </div>
  )
}
