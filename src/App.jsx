import React, { useState, useEffect, useRef } from 'react';
import Chatbot from './Chatbot.jsx';
import { 
  Settings, 
  Activity, 
  History, 
  Cpu, 
  Wifi, 
  Zap,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ServerCrash,
  Home,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Camera,
  Mic,
  Thermometer,
  ChevronDown,
  UploadCloud,
  X,
  Video,
  StopCircle
} from 'lucide-react';

// --- Configuration ---
const apiKey = "AIzaSyD-1Pzya5dKNvJ8OJubu2efTBCl7GIAj48"; 

// --- Simulated Smart Home API (e.g., SmartThings, Home Assistant) ---
const fetchSmartDeviceStatus = async (deviceType, symptoms = []) => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockData = {
    bulb: { online: true, power: "on", brightness: 20, wifiStrength: "weak (-80dBm)", firmware: "1.0.2" },
    camera: { online: false, power: "on", wifiStrength: "offline", firmware: "2.1.0", lastSeen: "2 hours ago" },
    thermostat: { online: true, power: "on", temperature: 28, targetTemp: 22, firmware: "3.0.1", hvacState: "cooling" },
    speaker: { online: true, volume: 0, muted: true, firmware: "5.4.0", network: "5GHz" },
    plug: { online: true, power: "off", wifiStrength: "good (-45dBm)", firmware: "1.4.8", currentDraw: "0W" }
  };
  
  let status = mockData[deviceType] || { online: true, status: "unknown" };

  // Make the mock telemetry dynamic: If user reports a dead device, the API should reflect it as unreachable.
  const isCriticalIssue = symptoms.some(s => 
    s.toLowerCase().includes('offline') || 
    s.toLowerCase().includes('not turning on') || 
    s.toLowerCase().includes('not supplying power') ||
    s.toLowerCase().includes('unresponsive')
  );

  if (isCriticalIssue) {
    status = { ...status, online: false, power: "unreachable", wifiStrength: "disconnected" };
  }

  return status;
};

// --- Real AI API Engine (Gemini) ---
const runAiDiagnosis = async (deviceInfo, symptoms, telemetry, history, visualData) => {
  // CHANGE HERE: Update the URL to use the standard public 'gemini-1.5-flash' model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  // Format history for the AI to personalize the response
  const historyContext = history.length > 0 
    ? `User History Context: The user has had ${history.length} previous issues. Recent issue: ${history[0].deviceType} (${history[0].diagnosis}). Please personalize the solutions if you notice recurring patterns (like frequent Wi-Fi issues).`
    : "User History Context: First time user. No previous history.";

  let promptText = `
    Analyze the following smart home device issue:
    Device: ${deviceInfo.brand} ${deviceInfo.model} (${deviceInfo.deviceType})
    Reported Symptoms: ${symptoms.join(", ")}
    Live Telemetry Data: ${JSON.stringify(telemetry)}
    ${historyContext}
  `;

  const parts = [{ text: promptText }];

  if (visualData) {
    parts.push({
      inlineData: {
        mimeType: visualData.mimeType,
        data: visualData.data
      }
    });
    
    if (visualData.isVideo) {
      parts[0].text += "\n\nVideo evidence (with audio) of the device is attached. Please analyze both the visual data (LEDs, error codes, physical condition) and the audio. Listen carefully: if you hear normal audio/music/voices but the user reported 'No sound', you MUST prioritize the actual audio evidence. Also listen for abnormal sounds like clicking, buzzing, or automated error voices to help diagnose the exact problem.";
    } else {
      parts[0].text += "\n\nVisual evidence (image) of the device is attached. Please analyze this visual data (look for LED statuses, error codes, physical condition, disconnected wires, etc.) to help diagnose the exact problem and determine if the device is operational.";
    }
  }

  const payload = {
    contents: [{ parts: parts }],
    systemInstruction: {
      parts: [{
        text: `You are an expert Smart Home IT Troubleshooter. Analyze the device, symptoms, telemetry data, user history, and attached visual/audio evidence to diagnose the issue. 
        CRITICAL RULE 1 - EVIDENCE OVERRIDES SYMPTOMS: If the attached video/audio/image evidence contradicts the user's reported symptoms (e.g., the user reports "No sound" but the video contains clear audio from the device, or "Not turning on" but the video shows LEDs on), you MUST base your diagnosis on the HARD EVIDENCE. Point out the contradiction politely, state that the hardware appears operational based on the media, and provide solutions related to user-error, app sync issues, or volume controls.
        CRITICAL RULE 2: If NO media evidence contradicts them, rely on the user's reported symptoms over "perfect" telemetry, as a device can ping online but still be physically broken.
        Provide highly technical but easy-to-understand personalized solutions.
        Return ONLY a valid JSON object matching this exact schema, without any markdown formatting or extra text:
        {
          "diagnosis": "A concise 1-2 sentence explanation. If evidence contradicts symptoms, state what you actually observe in the media (e.g., 'Audio is clearly playing in the video, suggesting the hardware is fine.').",
          "confidence": 0.95, // number between 0.1 and 1.0
          "priority": "low" | "medium" | "high", // Use 'low' if the device is actually working
          "solutions": ["Step 1", "Step 2", "Step 3"] // Array of strings, max 4 steps.
        }`
      }]
    },
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  // Exponential backoff retry logic
  let retries = 3;
  let delay = 1000;
  let lastError = "";
  
  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        // Capture the EXACT error from Google's servers
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google API: ${errorData?.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) throw new Error("Empty response from AI");
      
      // Clean up potential markdown formatting block if the AI returns it
      const cleanedText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      lastError = error.message;
      retries--;
      if (retries === 0) throw new Error(lastError);
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

// --- Device Database ---
const deviceBrandsAndModels = {
  bulb: {
    "Philips": ["Hue A19 Color", "Hue White", "Hue Lightstrip", "Hue Play", "Other"],
    "LIFX": ["Color A19", "Mini White", "Z Strip", "Other"],
    "TP-Link Kasa": ["KL130", "KL110", "Other"],
    "Wyze": ["Wyze Bulb Color", "Wyze Bulb White", "Other"],
    "Sengled": ["Smart Wi-Fi LED", "Smart Bluetooth LED", "Other"],
    "Other": ["Other"]
  },
  camera: {
    "Ring": ["Stick Up Cam", "Indoor Cam", "Floodlight Cam", "Video Doorbell", "Other"],
    "Wyze": ["Wyze Cam v3", "Wyze Cam Pan v2", "Wyze Video Doorbell", "Other"],
    "Arlo": ["Pro 4", "Essential", "Ultra 2", "Other"],
    "Google Nest": ["Nest Cam (Battery)", "Nest Cam Indoor", "Nest Doorbell", "Other"],
    "Blink": ["Blink Outdoor", "Blink Mini", "Other"],
    "Other": ["Other"]
  },
  speaker: {
    "Amazon": ["Echo Dot", "Echo Studio", "Echo Show 8", "Other"],
    "Google": ["Nest Mini", "Nest Audio", "Nest Hub Max", "Other"],
    "Sonos": ["One", "Roam", "Move", "Arc", "Other"],
    "Apple": ["HomePod mini", "HomePod (2nd Gen)", "Other"],
    "Bose": ["Smart Speaker 500", "Portable Smart Speaker", "Other"],
    "Other": ["Other"]
  },
  thermostat: {
    "Google Nest": ["Nest Learning Thermostat", "Nest Thermostat E", "Other"],
    "Ecobee": ["SmartThermostat Premium", "Ecobee3 Lite", "Other"],
    "Honeywell Home": ["T9 Smart Thermostat", "Wi-Fi Smart Color", "Other"],
    "Emerson": ["Sensi Touch", "Sensi Classic", "Other"],
    "Other": ["Other"]
  },
  plug: {
    "TP-Link Kasa": ["EP25", "HS103", "KP115", "Other"],
    "Wemo": ["Smart Plug", "Mini Smart Plug", "Other"],
    "Wyze": ["Wyze Plug", "Wyze Plug Outdoor", "Other"],
    "Amazon Basics": ["Smart Plug", "Other"],
    "Gosund": ["Smart Plug Mini", "Other"],
    "Other": ["Other"]
  }
};

// --- Main Application Component ---
export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [deviceType, setDeviceType] = useState('bulb');
  const [brand, setBrand] = useState('Philips');
  const [model, setModel] = useState('Hue A19 Color');
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  
  // Visual Evidence States
  const [visualData, setVisualData] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const symptomOptions = {
    bulb: ["Not turning on", "Flickering", "Unresponsive to app", "Color won't change"],
    camera: ["Offline", "Blurred video", "Night vision failed", "No motion alerts"],
    speaker: ["No sound", "Not responding to voice", "Wi-Fi drop", "Crackling audio"],
    thermostat: ["Wrong temperature", "Not turning on AC/Heat", "Offline", "Screen blank"],
    plug: ["Not supplying power", "Disconnecting randomly", "Button stuck"]
  };

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  // --- Visual Data Handlers ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (10MB) to prevent browser crashing on base64 encoding
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Please upload media smaller than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result.split(',')[1];
      const isVideo = file.type.startsWith('video');
      setVisualData({ 
        data: base64, 
        mimeType: file.type, 
        preview: isVideo ? URL.createObjectURL(file) : event.target.result,
        isVideo: isVideo
      });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      // Request both video AND audio (microphone) permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: true
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setError("Camera or microphone access denied or unavailable.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
    setVisualData({ 
      data: base64, 
      mimeType: 'image/jpeg', 
      preview: canvas.toDataURL('image/jpeg'),
      isVideo: false
    });
    stopCamera();
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    recordedChunksRef.current = [];
    
    try {
      const stream = videoRef.current.srcObject;
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'video/webm' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          setVisualData({
            data: base64,
            mimeType: blob.type || 'video/webm',
            preview: URL.createObjectURL(blob),
            isVideo: true
          });
          stopCamera();
        };
        reader.readAsDataURL(blob);
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Auto-stop after 5 seconds to keep API payload manageable
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 4) {
            stopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      setError("Failed to start video recording.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (isRecording) stopRecording();
    setIsCameraOpen(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle device type change
  useEffect(() => {
    setSelectedSymptoms([]);
    setVisualData(null);
    setResult(null);
    setError(null);

    // Reset brand and model dropdowns based on the new device type
    const defaultBrand = Object.keys(deviceBrandsAndModels[deviceType])[0];
    setBrand(defaultBrand);
    setModel(deviceBrandsAndModels[deviceType][defaultBrand][0]);
    setCustomBrand('');
    setCustomModel('');
  }, [deviceType]);

  const handleBrandChange = (e) => {
    const newBrand = e.target.value;
    setBrand(newBrand);
    // Automatically select the first model of the newly selected brand
    setModel(deviceBrandsAndModels[deviceType][newBrand][0]);
  };

  const runDiagnosis = async (e) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0 && !visualData) {
      setError("Please select at least one symptom or attach visual evidence.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Fetch live telemetry from simulated device API, passing symptoms so it reacts dynamically
      const telemetry = await fetchSmartDeviceStatus(deviceType, selectedSymptoms);
      
      const finalBrand = brand === 'Other' ? (customBrand || 'Unknown Brand') : brand;
      const finalModel = model === 'Other' ? (customModel || 'Unknown Model') : model;
      const currentDevice = { deviceType, brand: finalBrand, model: finalModel };
      
      // 2. Call Gemini AI with all context (including visual data)
      const aiResult = await runAiDiagnosis(currentDevice, selectedSymptoms, telemetry, history, visualData);
      
      // 3. Combine results
      const finalResult = {
        ...aiResult,
        deviceStatus: telemetry,
        timestamp: new Date().toISOString(),
        deviceInfo: currentDevice,
        hasVisuals: !!visualData
      };

      setResult(finalResult);
      
      // 4. Save to history
      setHistory(prev => [finalResult, ...prev]);

    } catch (err) {
      console.error("Diagnosis Error:", err);
      // Display the actual error message in the UI so the user can see what's wrong
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#06060e] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
        
        {/* Ambient Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">HomeAI</span>
          </div>
          <button 
            onClick={() => setIsStarted(true)}
            className="text-sm font-medium text-slate-300 hover:text-white px-5 py-2.5 rounded-full border border-slate-700/60 hover:bg-slate-800/50 transition-all flex items-center"
          >
            Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-32 max-w-5xl mx-auto">
          
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
            <button 
              onClick={() => setIsStarted(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <Cpu className="w-5 h-5 mr-2" /> Start Diagnosing <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-slate-300 border border-slate-700/60 hover:bg-slate-800/50 hover:text-white transition-all flex items-center justify-center"
            >
              Learn More <ChevronDown className="w-5 h-5 ml-2" />
            </button>
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

        {/* Supported Devices Section */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 mb-32">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-3">Supported Devices</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Works With Your Entire Smart Home</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Lightbulb, title: 'Smart Bulbs', desc: 'Flickering, not turning on, brightness issues' },
              { icon: Camera, title: 'Cameras', desc: 'Offline, blurred video, connectivity drops' },
              { icon: Mic, title: 'Speakers', desc: 'No sound, unresponsive, muted states' },
              { icon: Thermometer, title: 'Thermostats', desc: 'Wrong temperature, calibration errors' },
              { icon: Zap, title: 'Smart Plugs', desc: 'Not working, disconnecting, automation fails' },
              { icon: Wifi, title: 'Routers & Wi-Fi', desc: 'Signal drops, range issues, connectivity' }
            ].map((device, i) => (
              <div key={i} className="bg-[#0f0e1a] border border-indigo-500/10 p-8 rounded-3xl hover:bg-[#131124] transition-colors group">
                <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <device.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{device.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{device.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 mb-32 pt-8">
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
              <div key={i} className="bg-[#0f0e1a] border border-indigo-500/10 p-8 rounded-3xl relative overflow-hidden group">
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

        {/* CTA Section */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
          <div className="bg-[#0f0e1a] border border-indigo-500/20 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
             
             <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10">Ready to Troubleshoot?</h2>
             <p className="text-slate-400 text-lg mb-10 relative z-10">Stop guessing. Let AI diagnose your smart home issues in seconds.</p>
             
             <button 
              onClick={() => setIsStarted(true)}
              className="relative z-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1"
            >
              Launch Dashboard
            </button>
          </div>
        </div>

        {/* Chatbot */}
        <Chatbot />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060e] text-white font-sans p-4 md:p-8 relative overflow-hidden">
      {/* Background decorations matching the front page */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <header className="flex items-start justify-between mb-12 mt-4">
          <div className="flex flex-col">
            <button 
              onClick={() => setIsStarted(false)} 
              className="flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity text-left cursor-pointer focus:outline-none"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">HomeAI</span>
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 tracking-tight pb-1 mb-2">
                Dashboard
              </h1>
              <p className="text-slate-400 text-lg">Diagnose and resolve your smart device issues.</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Intake Form & Device Dashboard */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Device Form */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-lg border border-slate-800 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center text-white">
                <Settings className="w-5 h-5 mr-2 text-blue-400" /> Device Intake Form
              </h2>
              <form onSubmit={runDiagnosis} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Device Type</label>
                    <select 
                      className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all [&>option]:bg-slate-900"
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                    >
                      <option value="bulb">Smart Bulb</option>
                      <option value="camera">Security Camera</option>
                      <option value="speaker">Smart Speaker</option>
                      <option value="thermostat">Thermostat</option>
                      <option value="plug">Smart Plug</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Brand</label>
                    <select 
                      className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all [&>option]:bg-slate-900"
                      value={brand}
                      onChange={handleBrandChange}
                    >
                      {Object.keys(deviceBrandsAndModels[deviceType]).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {brand === 'Other' && (
                      <input 
                        type="text" 
                        className="w-full mt-2 bg-slate-950/50 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all animate-in fade-in slide-in-from-top-2"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        placeholder="Enter brand name"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Model / Name</label>
                  <select 
                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all [&>option]:bg-slate-900"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    {deviceBrandsAndModels[deviceType][brand]?.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {model === 'Other' && (
                    <input 
                      type="text" 
                      className="w-full mt-2 bg-slate-950/50 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all animate-in fade-in slide-in-from-top-2"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="Enter specific model"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Observed Symptoms</label>
                  <div className="flex flex-wrap gap-2">
                    {symptomOptions[deviceType]?.map(symptom => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedSymptoms.includes(symptom) 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Evidence Section */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-sm font-semibold text-slate-400 mb-3">
                    Visual Evidence <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  {!visualData ? (
                    <div className="flex gap-3">
                      <label className="flex-1 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 border-dashed rounded-xl py-3 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                        <UploadCloud className="w-5 h-5 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-300">Upload Media</span>
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                      <button 
                        type="button" 
                        onClick={startCamera} 
                        className="flex-1 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 border-dashed rounded-xl py-3 flex flex-col items-center justify-center transition-colors group"
                      >
                        <Camera className="w-5 h-5 text-pink-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-slate-300">Live Camera</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative inline-block mt-2">
                      {visualData.isVideo ? (
                        <video src={visualData.preview} controls className="h-32 w-auto rounded-xl border border-indigo-500/50 object-cover shadow-lg shadow-indigo-900/20" />
                      ) : (
                        <img src={visualData.preview} alt="Evidence" className="h-32 w-auto rounded-xl border border-indigo-500/50 object-cover shadow-lg shadow-indigo-900/20" />
                      )}
                      <button 
                        type="button" 
                        onClick={() => setVisualData(null)} 
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start text-red-400 text-sm">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-4 transition-all flex items-center justify-center shadow-lg shadow-blue-900/50 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Running Diagnostics...</>
                  ) : (
                    <><Activity className="w-5 h-5 mr-2" /> Start AI Diagnosis</>
                  )}
                </button>
              </form>
            </div>

            {/* Device Telemetry Dashboard (Shows when result is ready) */}
            {result?.deviceStatus && (
              <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-lg border border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold mb-4 flex items-center text-white">
                  <Wifi className="w-5 h-5 mr-2 text-emerald-400" /> Live Device Snapshot
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.deviceStatus).map(([key, val]) => (
                    <div key={key} className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{key}</p>
                      <p className="font-semibold text-slate-200 capitalize">
                        {typeof val === 'boolean' ? (val ? 'Yes / Online' : 'No / Offline') : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Result & History */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* AI Diagnosis Card */}
            {loading ? (
              <div className="bg-slate-900/50 backdrop-blur-md p-12 rounded-3xl shadow-lg border border-slate-800 flex flex-col items-center justify-center space-y-4 h-[400px]">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-900/50 rounded-full animate-spin border-t-blue-500"></div>
                  <Cpu className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-400 font-medium animate-pulse text-center">
                  AI is analyzing telemetry, reading history, <br/> and analyzing visual evidence...
                </p>
              </div>
            ) : result ? (
              <div className="relative rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white border border-slate-700">
                {/* Background Theme based on priority */}
                <div className={`absolute inset-0 opacity-40 ${
                  result.priority === 'high' ? 'bg-gradient-to-br from-red-900 via-slate-900 to-rose-900' 
                  : result.priority === 'medium' ? 'bg-gradient-to-br from-amber-900 via-slate-900 to-orange-900' 
                  : 'bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-900'
                }`}></div>
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"></div>
                
                <div className="relative z-10">
                  {/* Header of Result */}
                  <div className={`p-8 border-b border-slate-700/50 bg-gradient-to-b ${
                    result.priority === 'high' ? 'from-red-900/40 to-transparent' 
                    : result.priority === 'medium' ? 'from-amber-900/40 to-transparent'
                    : 'from-emerald-900/40 to-transparent'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="max-w-[70%]">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-max mb-3 border ${
                          result.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                          : result.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {result.priority === 'high' && <AlertTriangle className="w-3 h-3 mr-1"/>}
                          {result.priority === 'medium' && <Activity className="w-3 h-3 mr-1"/>}
                          {result.priority === 'low' && <CheckCircle2 className="w-3 h-3 mr-1"/>}
                          {result.priority} Priority
                        </span>
                        <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                          {result.diagnosis}
                        </h2>
                      </div>
                      
                      <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl shadow-lg text-center min-w-[100px] backdrop-blur-md">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Confidence</p>
                        <p className={`text-3xl font-black ${
                          result.priority === 'high' ? 'text-red-400' 
                          : result.priority === 'medium' ? 'text-amber-400'
                          : 'text-emerald-400'
                        }`}>
                          {(result.confidence * 100).toFixed(0)}<span className="text-lg">%</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Solutions */}
                  <div className="p-8">
                    <h4 className="flex items-center text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">
                      <Zap className="w-4 h-4 mr-2 text-amber-400" /> Recommended Fixes
                    </h4>
                    <div className="space-y-4">
                      {result.solutions.map((sol, i) => (
                        <div key={i} className="flex items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 border ${
                            result.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                            : result.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {i + 1}
                          </div>
                          <p className="text-slate-200 font-medium leading-relaxed pt-1">
                            {sol}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/30 border-2 border-dashed border-slate-700 p-12 rounded-3xl flex flex-col items-center justify-center text-center h-[400px]">
                <ServerCrash className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Awaiting Telemetry</h3>
                <p className="text-slate-500 max-w-sm">
                  Select a device and report its symptoms. The AI engine will fetch its live status and diagnose the problem.
                </p>
              </div>
            )}

            {/* History Panel */}
            {history.length > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-lg border border-slate-800 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center text-white">
                  <History className="w-5 h-5 mr-2 text-indigo-400" /> Recent Diagnoses
                </h3>
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-800/80 rounded-xl transition-colors border border-transparent hover:border-slate-700">
                      <div>
                        <p className="font-bold text-white text-sm">
                          {item.deviceInfo.brand} {item.deviceInfo.model}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-md">
                          {item.diagnosis}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.priority === 'high' ? 'bg-red-500/20 text-red-300' 
                        : item.priority === 'medium' ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />

      {/* Full Screen Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full relative">
            <h3 className="text-white font-bold text-xl mb-4 text-center">Analyze Device Status</h3>
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative aspect-[3/4] sm:aspect-video mb-6">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-cover"
              ></video>
              <div className={`absolute inset-0 border-2 border-dashed rounded-2xl pointer-events-none m-4 transition-colors ${isRecording ? 'border-red-500 bg-red-500/10' : 'border-indigo-500/30'}`}></div>
              {isRecording && (
                <div className="absolute top-6 right-6 flex items-center bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-white font-medium text-sm text-center min-w-[30px] font-mono">00:0{recordingTime}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {!isRecording ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    type="button" 
                    onClick={capturePhoto} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-xl font-bold transition-colors flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5 mr-2" /> Photo
                  </button>
                  <button 
                    type="button" 
                    onClick={startRecording} 
                    className="flex-1 bg-pink-600 hover:bg-pink-500 text-white px-6 py-4 rounded-xl font-bold transition-colors flex items-center justify-center"
                  >
                    <Video className="w-5 h-5 mr-2" /> Record Video
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={stopRecording} 
                  className="w-full bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-xl font-bold transition-colors flex items-center justify-center animate-pulse"
                >
                  <StopCircle className="w-5 h-5 mr-2" /> Stop Recording
                </button>
              )}
              
              <button 
                type="button" 
                onClick={stopCamera} 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
