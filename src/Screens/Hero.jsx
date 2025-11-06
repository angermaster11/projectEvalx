import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Hero(){
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <Navbar/>
      <section className="flex flex-col items-center text-center mt-28 px-4">
        <h2 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-2xl">
          Project Evaluation.&nbsp;<span className="text-white">Simplified.</span>
        </h2>
        <p className="text-xl max-w-3xl mt-6 opacity-90">Evalx helps organizers run multi‑round events with AI‑assisted evaluation and manual scoring.</p>
        <div className="mt-10 flex gap-6">
          <Link to="/events"><Button size="lg">Browse Events</Button></Link>
          <Link to="/organizer/create"><Button variant="outline" size="lg">Create Event</Button></Link>
        </div>
      </section>
      <Footer/>
    </div>
  )
}
