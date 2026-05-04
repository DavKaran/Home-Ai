import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#06060e] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30 relative">
      
      {/* Ambient Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-32 max-w-5xl mx-auto">
        
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full border border-slate-700/50 bg-slate-800/30 backdrop-blur-md mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-medium text-slate-300 tracking-wide">AI-Powered Diagnostics Engine</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          <span className="text-white">Smart Home</span> <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 drop-shadow-sm">
            Troubleshooter
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
          Diagnose and fix your smart devices instantly with our AI-powered engine. 
          Get personalized solutions, confidence scores, and step-by-step guidance.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to="/dashboard"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            <Cpu className="w-5 h-5 mr-2" /> Start Diagnosing <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <Link 
            to="/features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-slate-300 border border-slate-700/60 hover:bg-slate-800/50 hover:text-white transition-all flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Explore Features
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '97%', label: 'DIAGNOSIS ACCURACY' },
            { value: '50+', label: 'DEVICE MODELS' },
            { value: '<2s', label: 'AVG RESPONSE TIME' },
            { value: '24/7', label: 'AVAILABILITY' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#0f0e1a] border border-indigo-500/10 rounded-2xl p-6 md:p-8 text-center flex flex-col justify-center items-center hover:border-indigo-500/30 transition-colors">
              <div className="text-3xl md:text-4xl font-black text-indigo-300 mb-2">{stat.value}</div>
              <div className="text-[10px] md:text-xs font-bold text-slate-500 tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="bg-[#0f0e1a] border border-indigo-500/20 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
           
           <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10">Ready to Troubleshoot?</h2>
           <p className="text-slate-400 text-lg mb-10 relative z-10">Stop guessing. Let AI diagnose your smart home issues in seconds.</p>
           
           <Link 
            to="/dashboard"
            className="relative z-10 inline-block bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1"
          >
            Launch Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
