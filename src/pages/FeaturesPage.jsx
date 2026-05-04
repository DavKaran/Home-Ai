import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Lightbulb, 
  Camera, 
  Mic, 
  Thermometer, 
  Zap, 
  Wifi,
  ArrowRight
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#06060e] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30 relative">
      
      {/* Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Page Header */}
      <div className="relative z-10 text-center px-6 pt-16 pb-4 max-w-5xl mx-auto">
        <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-3">What We Offer</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Features & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Capabilities</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Explore the devices we support and learn how our AI engine works to get you back on track.
        </p>
      </div>

      {/* Supported Devices Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 mb-24">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-3">Supported Devices</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Works With Your Entire Smart Home</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Lightbulb, title: 'Smart Bulbs', desc: 'Flickering, not turning on, brightness issues', brands: 'Philips, LIFX, TP-Link, Wyze, Sengled' },
            { icon: Camera, title: 'Cameras', desc: 'Offline, blurred video, connectivity drops', brands: 'Ring, Wyze, Arlo, Nest, Blink' },
            { icon: Mic, title: 'Speakers', desc: 'No sound, unresponsive, muted states', brands: 'Amazon, Google, Sonos, Apple, Bose' },
            { icon: Thermometer, title: 'Thermostats', desc: 'Wrong temperature, calibration errors', brands: 'Nest, Ecobee, Honeywell, Emerson' },
            { icon: Zap, title: 'Smart Plugs', desc: 'Not working, disconnecting, automation fails', brands: 'TP-Link, Wemo, Wyze, Amazon, Gosund' },
            { icon: Wifi, title: 'Routers & Wi-Fi', desc: 'Signal drops, range issues, connectivity', brands: 'All major brands supported' }
          ].map((device, i) => (
            <div key={i} className="bg-[#0f0e1a] border border-indigo-500/10 p-8 rounded-3xl hover:bg-[#131124] hover:border-indigo-500/25 transition-all group">
              <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <device.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{device.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">{device.desc}</p>
              <p className="text-xs text-indigo-400/70 font-medium">{device.brands}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Three Steps to a Fix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: '01', title: 'Select Device', desc: "Choose your device type, enter the brand and model, and select the symptoms you're experiencing.", color: 'text-blue-400', bg: 'bg-blue-500/20' },
            { num: '02', title: 'AI Diagnosis', desc: "Our rule engine and smart API analyze device status, match symptoms, and generate a confidence-scored diagnosis.", color: 'text-purple-400', bg: 'bg-purple-500/20' },
            { num: '03', title: 'Get Solutions', desc: "Receive personalized, prioritized troubleshooting steps tailored to your home setup and device history.", color: 'text-pink-400', bg: 'bg-pink-500/20' }
          ].map((step, i) => (
            <div key={i} className="bg-[#0f0e1a] border border-indigo-500/10 p-8 rounded-3xl relative overflow-hidden group hover:border-indigo-500/25 transition-all">
              <div className={`absolute top-6 right-6 text-6xl font-black opacity-5 ${step.color}`}>{step.num}</div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-6 ${step.bg} ${step.color}`}>
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="bg-[#0f0e1a] border border-indigo-500/20 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10">See It In Action</h2>
          <p className="text-slate-400 text-lg mb-8 relative z-10">Try the AI-powered diagnostic tool now — no setup required.</p>
          
          <Link 
            to="/dashboard"
            className="relative z-10 inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
