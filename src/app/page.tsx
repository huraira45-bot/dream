import Link from "next/link"
import { Smartphone, Camera, Wand2, QrCode, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Dream App</span>
          </div>
          <Link
            href="/admin/login"
            className="text-sm font-medium hover:text-purple-400 transition-colors"
          >
            Admin Portal
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/20 blur-[120px] -z-10 rounded-full" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-600/10 blur-[100px] -z-10 rounded-full" />

          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Revolutionizing Restaurant Marketing
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Turn Customers into your <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Content Creation Team
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Place a QR code at every table. Customers capture their moments, and our AI automatically generates high-engagement Instagram Reels for your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/admin/login"
                className="group px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                Get Started for Business
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/b/demo-cafe"
                className="px-8 py-4 bg-zinc-900 border border-white/10 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all"
              >
                View Live Demo
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 px-6 border-t border-white/5 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">The Workflow</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-purple-500/50 transition-colors">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <QrCode className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">1. Scan QR</h3>
                <p className="text-zinc-400">
                  Customers scan a unique QR code at your restaurant table. No app installation required.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-pink-500/50 transition-colors">
                <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Camera className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">2. Capture & Upload</h3>
                <p className="text-zinc-400">
                  They record a short video or take photos of their food and experience directly through their browser.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/50 transition-colors">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Wand2 className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">3. AI Reel Generation</h3>
                <p className="text-zinc-400">
                  At the end of the day, our AI stitches the best moments into a viral-ready Instagram Reel for you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 p-1">
            <div className="bg-black rounded-[2.4rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-6 italic leading-tight">
                  "The best marketing is done by your customers."
                </h2>
                <p className="text-zinc-400 text-lg">
                  Stop worrying about content creation. Let your customers showcase the vibe while you focus on the food.
                </p>
              </div>
              <div className="w-full md:w-64 aspect-[9/16] bg-zinc-900 rounded-3xl border border-white/10 flex items-center justify-center relative shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-40" />
                <div className="z-10 text-center p-4">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 text-white/50" />
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Sample AI Reel</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-zinc-500 text-sm">
            © 2025 Dream App. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm text-zinc-400">
            <Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
