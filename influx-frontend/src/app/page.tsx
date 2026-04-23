"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Sticky Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-white/5 py-4 px-8 flex justify-between items-center"
      >
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          INFLUX<span className="text-accent">.</span>
        </Link>
        <div className="flex gap-6 items-center font-medium">
          <Link href="/auth/login" className="text-text-secondary hover:text-white transition-colors">
            Login
          </Link>
          <Link
            href="/auth/register"
            className="bg-primary hover:bg-primary/80 transition-all text-white px-5 py-2 rounded-full shadow-[0_0_15px_rgba(75,27,130,0.5)] hover:shadow-[0_0_25px_rgba(75,27,130,0.8)]"
          >
            Sign Up
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 flex flex-col items-center text-center">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/30 blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto z-10"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Influence</span> 
            <br /> Meets Opportunity
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Connect. Collaborate. Create. The premier platform matching visionary brands with the creator economy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth/register?role=influencer">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white font-semibold px-8 py-4 rounded-full text-lg shadow-[0_0_20px_rgba(75,27,130,0.6)] hover:shadow-[0_0_35px_rgba(75,27,130,0.9)] transition-all"
              >
                Join as Influencer
              </motion.button>
            </Link>
            <Link href="/auth/register?role=brand">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="glassmorphism text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/10 transition-all border border-white/20"
              >
                Join as Brand
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Floating Mock Stats Cards */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0, y: [-10, 10, -10] }}
          transition={{ opacity: { duration: 1, delay: 0.8 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          className="hidden xl:flex absolute left-10 2xl:left-32 top-[60%] glassmorphism rounded-2xl p-4 items-center gap-4 z-0"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 shadow-lg shadow-pink-500/20" />
          <div>
            <p className="font-bold text-sm">Campaign Matched!</p>
            <p className="text-xs text-text-secondary">+$2,500 budget</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0, y: [10, -10, 10] }}
          transition={{ opacity: { duration: 1, delay: 1 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          className="hidden xl:flex absolute right-10 2xl:right-32 top-[20%] glassmorphism rounded-2xl p-4 items-center gap-4 z-0"
        >
          <div className="w-12 h-12 rounded-full bg-accent/20 flex justify-center items-center shadow-lg shadow-accent/20">
            <span className="text-xl leading-none">🚀</span>
          </div>
          <div>
            <p className="font-bold text-sm text-left">Engagement Rate</p>
            <p className="text-xs text-accent text-right font-medium">14.2% ↑</p>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <div className="border-y border-white/10 bg-white/5 backdrop-blur-md py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-white">10K+</h3>
            <p className="text-text-secondary mt-2 font-medium uppercase tracking-wider text-sm">Active Influencers</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h3 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-white">500+</h3>
            <p className="text-text-secondary mt-2 font-medium uppercase tracking-wider text-sm">Verified Brands</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            <h3 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-white">$2M+</h3>
            <p className="text-text-secondary mt-2 font-medium uppercase tracking-wider text-sm">Deals Closed</p>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-text-secondary text-lg">Three simple steps to unlock your potential.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            { step: "01", title: "Create Your Profile", desc: "Showcase your portfolio, standard rates, and social stats in a beautifully designed space." },
            { step: "02", title: "Find the Perfect Match", desc: "Brands post openings and browse influencer hubs. Influencers apply directly to campaigns." },
            { step: "03", title: "Collaborate & Grow", desc: "Chat in real-time, negotiate terms, finalize deliverables, and build lasting relationships." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="glassmorphism p-8 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-colors"
            >
              <div className="absolute -right-6 -top-6 text-9xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
                {item.step}
              </div>
              <h3 className="text-2xl font-bold mb-4 relative z-10 text-accent">{item.title}</h3>
              <p className="text-text-secondary leading-relaxed relative z-10">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Loved by Creators</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="glassmorphism p-8 rounded-3xl border-l-4 border-l-primary"
            >
              <p className="text-lg italic mb-6">"INFLUX completely changed how I connect with tech brands. I landed a 6-month ambassadorship my first week on the platform. The UI is just gorgeous."</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-zinc-700 overflow-hidden flex justify-center items-center">
                  <span className="text-2xl">👩🏼‍💻</span>
                </div>
                <div>
                  <h4 className="font-bold">Sarah Jenkins</h4>
                  <p className="text-sm text-text-secondary">Tech Creator · 250K YouTube</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="glassmorphism p-8 rounded-3xl border-l-4 border-l-accent"
            >
              <p className="text-lg italic mb-6">"As an agency, we used to spend weeks hunting for the right influencers via email. Now, we post a campaign and get top-tier talent applying in hours."</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-zinc-700 overflow-hidden flex justify-center items-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-bold">Elevate Digital</h4>
                  <p className="text-sm text-text-secondary">Marketing Agency</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-text-secondary mt-20">
        <p className="mb-4 text-2xl font-bold text-white tracking-tighter">INFLUX<span className="text-accent">.</span></p>
        <p>© 2026 Influx Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
