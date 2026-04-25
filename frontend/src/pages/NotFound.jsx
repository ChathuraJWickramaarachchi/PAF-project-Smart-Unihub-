import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-10 selection:bg-primary/20">
      <div className="relative w-full max-w-4xl aspect-video bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 flex flex-col items-center justify-center text-center space-y-12 overflow-hidden shadow-2xl">
         {/* Decorative Grid */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         
         <div className="relative">
            <h1 className="text-[12rem] font-black text-white/5 tracking-tighter leading-none italic select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-8xl animate-bounce">🛰️</span>
            </div>
         </div>

         <div className="space-y-4 relative">
            <h2 className="text-4xl font-black text-white tracking-widest uppercase italic">Coordinate <span className="text-primary not-italic">Error</span></h2>
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] italic">Lost in the SmartUni Data Stream</p>
         </div>

         <Link 
           to="/" 
           className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 relative group"
         >
           <span className="relative z-10">Return to Terminal</span>
         </Link>

         {/* Bottom Telemetry */}
         <div className="absolute bottom-10 w-full px-20 flex justify-between items-center opacity-30 select-none">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">Node: Edge_Server_04</span>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">Status: Unreachable</span>
         </div>
      </div>
    </div>
  )
}
