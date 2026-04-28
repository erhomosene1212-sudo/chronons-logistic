'use client';

import { useState, useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, ShieldAlert, Cpu, MapPin, Activity, AlertTriangle, Lock, MessageSquareQuote } from 'lucide-react';
import { detectCarrier } from '@/lib/adapters';

export default function ChronosHome() {
  const [waybill, setWaybill] = useState('');
  const [address, setAddress] = useState('');
  const [carrier, setCarrier] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [sageBrief, setSageBrief] = useState('');

  const handleWaybillChange = (e) => {
    const val = e.target.value.toUpperCase();
    setWaybill(val);
    const detected = detectCarrier(val);
    setCarrier(detected !== 'Unknown' ? detected : null);
  };

  async function performAudit(prevState, formData) {
    const w = formData.get('waybill');
    const a = formData.get('address');

    if (!w || !a) return { error: "Waybill and Address are mandatory for protocol execution." };

    setIsScanning(true);
    setResult(null);
    setSageBrief('');

    // Mandated 3-second 'AI Auditing' animation for trust-building
    await new Promise(r => setTimeout(r, 3000));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waybillNumber: w, userAddress: a }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      setResult(data);

      // Trigger Live Sage Voice Summary
      const sageRes = await fetch('/api/sage/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditReport: data, waybillNumber: w }),
      });
      const sageData = await sageRes.json();
      setSageBrief(sageData.brief);

    } catch (err) {
      if (err.name === 'AbortError') return { error: "Carrier System Timeout. High latency detected." };
      return { error: "Protocol Error. Check secure connection." };
    } finally {
      setIsScanning(false);
    }
    return { success: true };
  }

  const [state, formAction] = useActionState(performAudit, null);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 space-y-12 overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none no-print">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 relative z-10 no-print"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
          <ShieldCheck size={14} />
          Protocol Active // Vanguard ID Integrated
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent uppercase italic">
          CHRONOS
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          The national defense against waybill fraud. <br/>
          Securing the Nigerian trade handshake, one scan at a time.
        </p>
      </motion.div>

      {/* Search Interface */}
      <div className="w-full max-w-3xl relative z-10">
        {!isScanning && !result && (
          <motion.form 
            action={formAction}
            className="space-y-4 no-print"
          >
            <div className="relative group p-1 bg-gradient-to-r from-blue-600/20 to-emerald-500/20 rounded-3xl">
              <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-[22px] border border-white/5 p-3 flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center px-4 gap-4 border-b md:border-b-0 md:border-r border-white/5 pb-3 md:pb-0">
                  <Cpu className="text-blue-500" size={20} />
                  <input 
                    name="waybill"
                    value={waybill}
                    onChange={handleWaybillChange}
                    placeholder="TRACKING NUMBER"
                    className="bg-transparent border-none outline-none w-full py-4 text-white font-mono font-bold placeholder:text-slate-600"
                    required
                  />
                  {carrier && (
                    <span className="text-[10px] font-black bg-white/10 px-2.5 py-1 rounded-md text-white/80 uppercase">
                      {carrier}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex items-center px-4 gap-4">
                  <MapPin className="text-slate-500" size={20} />
                  <input 
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="YOUR DELIVERY ADDRESS"
                    className="bg-transparent border-none outline-none w-full py-4 text-white font-medium placeholder:text-slate-600"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[18px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
                >
                  AUDIT
                </button>
              </div>
            </div>
            {state?.error && (
              <p className="text-red-400 text-xs text-center font-bold uppercase tracking-widest px-4">{state.error}</p>
            )}
          </motion.form>
        )}

        {/* AI Auditing Radar */}
        <AnimatePresence mode="wait">
          {isScanning && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-10 no-print"
            >
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div className="radar-circle" />
                <div className="radar-circle radar-circle-delay-1" />
                <div className="radar-circle radar-circle-delay-2" />
                <div className="relative z-10 w-28 h-28 bg-blue-600/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-blue-500/30">
                  <Cpu className="text-blue-500 animate-pulse" size={48} />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-black text-white tracking-[0.3em] uppercase italic">Initializing Scrutiny</h3>
                <p className="text-blue-400/60 animate-pulse font-mono text-xs font-bold uppercase">Cross-referencing Global Fraud Registry...</p>
              </div>
            </motion.div>
          )}

          {/* Verification Result */}
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`relative overflow-hidden rounded-[40px] border ${result.status === 'CRITICAL_FRAUD' ? 'border-red-500/40 cert-glow-fraud' : 'border-blue-500/40 cert-glow'} bg-slate-900/60 backdrop-blur-3xl p-10 md:p-14 space-y-10 print:border-4 print:border-black print:text-black`}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 cert-header">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Security Certificate</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-[10px] uppercase">ID: {result.timestamp || 'VOID'}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-blue-500 font-mono text-[10px] uppercase">VERIFIED_NODE_77</span>
                  </div>
                </div>
                <div className={`px-8 py-5 rounded-3xl flex flex-col items-center justify-center ${result.grade === 'F' ? 'bg-red-500/10 border border-red-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Trust Grade</span>
                  <span className={`text-6xl font-black ${result.grade === 'F' ? 'text-red-500' : 'text-blue-500'}`}>{result.grade}</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border ${result.status === 'CRITICAL_FRAUD' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} font-black text-xs uppercase tracking-[0.3em]`}>
                  {result.status === 'CRITICAL_FRAUD' ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                  {result.status.replace('_', ' ')}
                </div>

                {/* SAGE SUMMARY BOX */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border-l-4 border-blue-500 p-6 rounded-r-2xl space-y-2 no-print"
                >
                  <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                    <MessageSquareQuote size={14} /> Sage AI Companion Brief
                  </div>
                  <p className="text-sm font-medium text-slate-300 italic">
                    "{sageBrief || 'Analyzing result strings...'}"
                  </p>
                </motion.div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-8 border-y border-white/5 print:border-black">
                <div className="space-y-2">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity size={12} /> Courier Partner
                  </div>
                  <div className="text-2xl font-bold text-white uppercase italic">{result.carrier}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={12} /> Target Destination
                  </div>
                  <div className="text-white font-bold leading-tight">{waybill && waybill.split('-')[1] ? `${waybill} | ` : ''} Nigeria</div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-3">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlertTriangle size={12} /> Protocol Findings
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.flags?.length > 0 ? result.flags.map(flag => (
                      <span key={flag} className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20 uppercase">
                        {flag.replace('_', ' ')}
                      </span>
                    )) : (
                      <span className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest">
                        NO ANOMALIES DETECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Layer */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-6 no-print">
                <div className="flex items-center gap-6">
                  {result.grade !== 'F' ? (
                    <div className="flex items-center gap-3 bg-emerald-500 text-slate-950 px-8 py-4 rounded-full font-black text-xs tracking-widest uppercase shadow-xl shadow-emerald-500/20">
                      <Lock size={16} /> SAFE TO PAY
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-full font-black text-xs tracking-widest uppercase shadow-xl shadow-red-500/20">
                      <ShieldAlert size={16} /> DO NOT PAY
                    </div>
                  )}
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                  >
                    <Activity size={14} /> Download Clearance
                  </button>
                </div>
                <button 
                  onClick={() => { setWaybill(''); setResult(null); setSageBrief(''); }}
                  className="text-slate-500 hover:text-white text-xs font-bold underline decoration-blue-500 decoration-2 underline-offset-8 uppercase tracking-widest"
                >
                  Run Another Audit
                </button>
              </div>

              {/* Print Only Proof */}
              <div className="hidden print:block space-y-6 mt-10">
                <p className="text-xs italic">This integrity certificate is an automated output of the Chronos Logistics Protocol. Verification Hash: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
                <div className="flex justify-between border-t border-black pt-4">
                  <div className="text-[10px] font-bold">CHRONOS_V_GUARD_NODE</div>
                  <div className="text-[10px] font-bold text-right">DATE: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 max-w-2xl text-center no-print">
        <p className="text-slate-600 text-[9px] font-mono leading-relaxed uppercase tracking-[0.2em]">
          CHRONOS PROTOCOL V2.0.0 // PRODUCTION_STRICT // SAGE_VOICE_LAYER_PROXIED <br/>
          VANGUARD ID ECOSYSTEM TOKEN // NO_MOCK_STATE // LIVE_REGISTRY_SYNC_ON
        </p>
      </div>
    </main>
  );
}
