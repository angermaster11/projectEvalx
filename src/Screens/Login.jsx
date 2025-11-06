import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import api from '@/api/api'

export default function Login(){
  const navigate = useNavigate()

  async function handleLogin(e){
    e.preventDefault()
    const usernameOrEmail = e.target.usernameOrEmail.value
    const password = e.target.password.value
    const payload = usernameOrEmail.includes('@') ? { email: usernameOrEmail, password } : { username: usernameOrEmail, password }
    try{
      const res = await api.post('/auth/login', payload)
      if(res.data?.success){
        localStorage.setItem('token', res.data.access_token)
        const role = JSON.parse(atob(res.data.access_token.split('.')[1])).role
        navigate(role==='organizer' ? '/organizer/dashboard' : '/events')
      }else{
        alert(res.data?.detail || 'Login failed')
      }
    }catch(err){
      alert(err.response?.data?.detail || 'Login error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-4">
      <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-10 backdrop-blur-xl shadow-xl">
        <h1 className="text-4xl font-extrabold text-center">Welcome Back</h1>
        <p className="text-center opacity-80 text-sm mt-1 mb-6">Login to continue 🚀</p>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <input name="usernameOrEmail" className="input peer" placeholder=" "/>
            <label className="absolute left-4 -top-3 text-sm px-2 bg-gray-900 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 text-purple-300 transition-all">Username or Email</label>
          </div>
          <div className="relative">
            <input type="password" name="password" className="input peer" placeholder=" "/>
            <label className="absolute left-4 -top-3 text-sm px-2 bg-gray-900 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 text-purple-300 transition-all">Password</label>
          </div>
          <Button className="w-full h-12 text-lg" size="lg" type="submit">Login</Button>
        </form>
        <p className="mt-6 text-center opacity-70 text-sm">No account? <Link to="/signup" className="underline text-purple-400">Signup</Link></p>
      </div>
    </div>
  )
}
