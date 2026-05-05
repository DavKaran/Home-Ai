import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Trash2, Bot, User } from 'lucide-react';

// ─── Smart Home Knowledge Base ───────────────────────────────────────────────
// This comprehensive knowledge base is injected into every Gemini request
// to ensure the chatbot ONLY answers with verified, accurate information.
const SMART_HOME_KNOWLEDGE_BASE = `
=== HOMEAI SMART HOME KNOWLEDGE BASE ===

[APP INFO]
- HomeAI is an AI-powered smart home device troubleshooter
- It diagnoses issues with smart bulbs, security cameras, smart speakers, thermostats, and smart plugs
- Users select their device type, brand, model, and symptoms, then AI analyzes telemetry data
- Users can also upload photos/videos of their devices for visual diagnosis
- The app uses live device telemetry data combined with AI analysis for accurate results

[SUPPORTED DEVICES & BRANDS]

1. SMART BULBS:
   - Philips: Hue A19 Color, Hue White, Hue Lightstrip, Hue Play
   - LIFX: Color A19, Mini White, Z Strip
   - TP-Link Kasa: KL130, KL110
   - Wyze: Wyze Bulb Color, Wyze Bulb White
   - Sengled: Smart Wi-Fi LED, Smart Bluetooth LED
   Common symptoms: Not turning on, Flickering, Unresponsive to app, Color won't change

2. SECURITY CAMERAS:
   - Ring: Stick Up Cam, Indoor Cam, Floodlight Cam, Video Doorbell
   - Wyze: Wyze Cam v3, Wyze Cam Pan v2, Wyze Video Doorbell
   - Arlo: Pro 4, Essential, Ultra 2
   - Google Nest: Nest Cam (Battery), Nest Cam Indoor, Nest Doorbell
   - Blink: Blink Outdoor, Blink Mini
   Common symptoms: Offline, Blurred video, Night vision failed, No motion alerts

3. SMART SPEAKERS:
   - Amazon: Echo Dot, Echo Studio, Echo Show 8
   - Google: Nest Mini, Nest Audio, Nest Hub Max
   - Sonos: One, Roam, Move, Arc
   - Apple: HomePod mini, HomePod (2nd Gen)
   - Bose: Smart Speaker 500, Portable Smart Speaker
   Common symptoms: No sound, Not responding to voice, Wi-Fi drop, Crackling audio

4. THERMOSTATS:
   - Google Nest: Nest Learning Thermostat, Nest Thermostat E
   - Ecobee: SmartThermostat Premium, Ecobee3 Lite
   - Honeywell Home: T9 Smart Thermostat, Wi-Fi Smart Color
   - Emerson: Sensi Touch, Sensi Classic
   Common symptoms: Wrong temperature, Not turning on AC/Heat, Offline, Screen blank

5. SMART PLUGS:
   - TP-Link Kasa: EP25, HS103, KP115
   - Wemo: Smart Plug, Mini Smart Plug
   - Wyze: Wyze Plug, Wyze Plug Outdoor
   - Amazon Basics: Smart Plug
   - Gosund: Smart Plug Mini
   Common symptoms: Not supplying power, Disconnecting randomly, Button stuck

[TROUBLESHOOTING GUIDES]

GENERAL STEPS (Apply to ALL devices):
1. Power cycle: Unplug the device for 30 seconds, then plug it back in
2. Check Wi-Fi: Ensure your router is working and the device is within range
3. Update firmware: Check the manufacturer's app for firmware updates
4. Factory reset: As a last resort, reset the device to factory defaults (consult manual for specific button combos)
5. Check the manufacturer's app: Ensure you're using the latest version of the companion app

SMART BULB TROUBLESHOOTING:
- Not turning on: Check the physical light switch is ON, verify the bulb is screwed in properly, try in a different socket
- Flickering: Usually caused by incompatible dimmer switches. Smart bulbs need non-dimming switches. Also check for loose connections
- Unresponsive to app: Remove and re-add the bulb in the app. Check if bulb is on the 2.4GHz Wi-Fi band (most smart bulbs don't support 5GHz)
- Color won't change: Ensure the bulb model supports color (not just white). Reset the bulb by toggling the switch 5 times rapidly
- Philips Hue specific: Ensure the Hue Bridge is connected and has a green light. Check Zigbee interference
- LIFX specific: These connect directly to Wi-Fi (no hub needed). Must be on 2.4GHz

SECURITY CAMERA TROUBLESHOOTING:
- Offline: Check Wi-Fi signal strength at camera location. Cameras need strong, stable connections. Consider a Wi-Fi extender
- Blurred video: Clean the camera lens. Check if night vision IR LEDs are reflecting off nearby surfaces
- Night vision failed: Ensure night vision is enabled in settings. Clean the lens. Check for IR LED failure (visible as faint red glow)
- No motion alerts: Check motion detection zones in the app. Ensure notifications are enabled both in-app AND in phone settings
- Ring specific: Check Ring Protect subscription status. Ensure doorbell transformer provides 16-24V AC
- Wyze Cam specific: Check microSD card for errors if using local storage

SMART SPEAKER TROUBLESHOOTING:
- No sound: Check volume level in the app. Ensure not muted. Try "Alexa/Hey Google, set volume to 5"
- Not responding to voice: Check microphone mute button (usually on top). Ensure wake word is correct
- Wi-Fi drop: Move closer to router. Check for 5GHz vs 2.4GHz band. Reboot router
- Crackling audio: Usually interference. Move away from other electronics, microwaves, or baby monitors
- Amazon Echo specific: Blue ring = listening, Red ring = muted, Orange ring = connecting to Wi-Fi
- Sonos specific: Check Sonos system in the Sonos app. Ensure SonosNet mesh is healthy

THERMOSTAT TROUBLESHOOTING:
- Wrong temperature: Place thermostat away from direct sunlight, drafts, and heat sources. Recalibrate in settings
- Not turning on AC/Heat: Check the C-wire connection. Many smart thermostats need a C-wire for power. Check HVAC breaker
- Offline: Check Wi-Fi connection. Thermostat batteries may need replacement (Nest uses internal rechargeable battery)
- Screen blank: Check C-wire power. For Nest, charge via USB for 1 hour. Check HVAC system breaker
- Nest specific: "Delayed" message means low battery. E73 error = no power from HVAC, check wiring
- Ecobee specific: Green = normal, Black screen = no power. Check PEK (Power Extender Kit) installation

SMART PLUG TROUBLESHOOTING:
- Not supplying power: Check if the plug is toggled ON in the app. Check the outlet itself with another device
- Disconnecting randomly: Usually Wi-Fi range issues. Smart plugs on 2.4GHz only. Check for IP conflicts
- Button stuck: Physical defect - contact manufacturer for replacement under warranty
- TP-Link Kasa specific: Amber light = no Wi-Fi, Green light = connected. Reset: hold button 5 seconds
- Wemo specific: Blinking orange = setup mode. Reset: hold button for 10 seconds until light blinks rapidly

[WI-FI BEST PRACTICES]
- Most smart home devices ONLY work on 2.4GHz Wi-Fi (NOT 5GHz)
- Keep router firmware updated
- Maximum 30-50 smart devices per router (consider mesh systems for more)
- Use a dedicated IoT network/VLAN for smart devices if your router supports it
- Recommended mesh systems: Google Nest WiFi, Eero, TP-Link Deco
- Optimal router placement: central location, elevated, away from walls and metal objects
- If devices keep disconnecting: check for channel congestion using a Wi-Fi analyzer app

[HOW TO USE HOMEAI]
1. Click "Start Diagnosing" or "Open Dashboard" on the landing page
2. Select your device type from the dropdown (Bulb, Camera, Speaker, Thermostat, Plug)
3. Choose your brand and specific model
4. Select the symptoms you're experiencing (you can select multiple)
5. Optionally upload a photo/video of the device or use the live camera
6. Click "Start AI Diagnosis" to run the analysis
7. Review the AI diagnosis, confidence score, and recommended fixes
8. Check your diagnosis history for past issues
`;

// ─── Gemini API Key (same as main app) ───────────────────────────────────────
const apiKey = "AIzaSyD-1Pzya5dKNvJ8OJubu2efTBCl7GIAj48";

// ─── Chat API Call ───────────────────────────────────────────────────────────
const sendChatMessage = async (conversationHistory) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: conversationHistory,
    systemInstruction: {
      parts: [{
        text: `You are "Roger", the friendly and highly knowledgeable AI assistant for HomeAI — a smart home device troubleshooter app.

YOUR ABSOLUTE RULES:
1. ONLY answer questions using the knowledge base provided below. Do NOT make up information.
2. If a question is outside the knowledge base or about non-smart-home topics, respond: "I specialize in smart home troubleshooting! I can help with issues related to smart bulbs, cameras, speakers, thermostats, and smart plugs. Feel free to ask me anything about those! 😊"
3. Be warm, professional, and concise. Use emojis sparingly to feel friendly.
4. For troubleshooting questions, provide step-by-step numbered solutions.
5. If the user mentions a specific brand/model, tailor your advice to that exact product.
6. Always suggest using the HomeAI diagnostic tool for more detailed, personalized analysis when appropriate.
7. Keep responses focused and under 200 words unless the user asks for detailed guides.
8. NEVER say "I think" or "I believe" — always state information confidently since it comes from verified data.

${SMART_HOME_KNOWLEDGE_BASE}`
      }]
    },
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 500,
    }
  };

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || response.statusText);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) throw new Error("Empty response from AI");

      return textResponse.trim();
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

// ─── Quick Suggestion Chips ──────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  "How do I use HomeAI?",
  "My bulb won't turn on",
  "Camera is offline",
  "Speaker has no sound",
  "Wi-Fi best practices",
];

// ─── Chatbot Component ──────────────────────────────────────────────────────
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hey there! 👋 I'm **Roger**, your smart home assistant. Ask me anything about troubleshooting your devices — bulbs, cameras, speakers, thermostats, or plugs. I'm here to help!",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || isTyping) return;

    // Add user message
    const userMsg = { role: 'user', text, time: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history for Gemini (multi-turn)
      const conversationHistory = updatedMessages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const reply = await sendChatMessage(conversationHistory);

      setMessages(prev => [...prev, {
        role: 'bot',
        text: reply,
        time: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Oops! I'm having trouble connecting right now. Please try again in a moment. 🔄",
        time: new Date(),
        isError: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'bot',
      text: "Chat cleared! 🧹 How can I help you with your smart home devices?",
      time: new Date(),
    }]);
  };

  // Simple markdown-like bold rendering
  const renderText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* ── Floating Action Button ──────────────────────────────────────── */}
      <button
        id="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[90] w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl group ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-700 rotate-0 shadow-slate-900/50'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/40 hover:shadow-indigo-500/60'
        }`}
        style={{ 
          animation: isOpen ? 'none' : 'chatFabPulse 3s ease-in-out infinite',
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-300" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
        )}
        
        {/* Notification dot */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#06060e] animate-pulse" />
        )}
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────────────── */}
      <div
        id="chatbot-panel"
        className={`fixed bottom-24 right-6 z-[89] w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl overflow-hidden transition-all duration-400 ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
        style={{
          height: 'min(580px, calc(100vh - 160px))',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(99, 102, 241, 0.15)',
        }}
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl" />

        <div className="relative z-10 flex flex-col h-full">
          
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 px-5 py-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Roger — HomeAI Assistant</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Online • Smart Home Expert</p>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Messages ────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin" id="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                style={{
                  animation: 'chatMsgIn 0.3s ease-out both',
                  animationDelay: `${Math.min(idx * 50, 200)}ms`,
                }}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-1 ${
                  msg.role === 'user'
                    ? 'bg-indigo-500/20'
                    : 'bg-purple-500/20'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-indigo-400" />
                    : <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-md'
                      : msg.isError
                        ? 'bg-red-500/10 text-red-300 border border-red-500/20 rounded-tl-md'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-md'
                  }`}>
                    {renderText(msg.text)}
                  </div>
                  <p className={`text-[10px] text-slate-600 mt-1 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.time)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5" style={{ animation: 'chatMsgIn 0.3s ease-out both' }}>
                <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-1 bg-purple-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 px-4 py-3 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-slate-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out infinite' }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.2s infinite' }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full" style={{ animation: 'typingDot 1.4s ease-in-out 0.4s infinite' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Suggestions (show only when few messages) ──────── */}
          {messages.length <= 2 && !isTyping && (
            <div className="flex-shrink-0 px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input Area ──────────────────────────────────────────────── */}
          <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-slate-700/30">
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-2xl border border-slate-700/50 px-4 py-1 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <input
                ref={inputRef}
                id="chatbot-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your smart home..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 py-3 outline-none"
                disabled={isTyping}
              />
              <button
                id="chatbot-send"
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && !isTyping
                    ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-2">
              Powered by Gemini AI • Smart Home Knowledge Base
            </p>
          </div>
        </div>
      </div>

      {/* ── Inline Styles (animations) ──────────────────────────────────── */}
      <style>{`
        @keyframes chatFabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
        }
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        #chatbot-messages::-webkit-scrollbar { width: 4px; }
        #chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        #chatbot-messages::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.3); border-radius: 99px; }
        #chatbot-messages::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.5); }
      `}</style>
    </>
  );
}
