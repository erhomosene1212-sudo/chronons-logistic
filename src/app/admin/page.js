'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Plus, Search, ShieldX, Activity, Database, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [blacklist, setBlacklist] = useState([]);
  const [newNumber, setNewNumber] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      fetchRegistry();
    }
  }, [isAuthorized]);

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real server-side app, this would be a session-based check. 
    // Here we use the env var passed to client (not ideal but fits 'basic' requirement).
    if (password === process.env.NEXT_PUBLIC_CHRONOS_ADMIN_PASS) {
      setIsAuthorized(true);
    } else {
      alert("UNAUTHORIZED ACCESS. PROTOCOL TERMINATED.");
    }
  };

  async function fetchRegistry() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('fraud_registry')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBlacklist(data);
    setIsLoading(false);
  }

  const addToBlacklist = async (e) => {
    e.preventDefault();
    if (!newNumber) return;

    const { error } = await supabase
      .from('fraud_registry')
      .insert([{ waybill_number: newNumber.toUpperCase(), reason: newReason }]);

    if (!error) {
       setNewNumber('');
       setNewReason('');
       fetchRegistry();
    }
  };

  const remove = async (id) => {
    const { error } = await supabase.from('fraud_registry').delete().eq('id', id);
    if (!error) fetchRegistry();
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-900/50 border border-white/5 p-12 rounded-3xl space-y-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <ShieldAlert className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase italic">Authorized Access Only</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Admin Protocol Key"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-primary text-center font-mono"
            />
            <button className="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-xl transition-all">
              Initialize Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Nav */}
        <div className="flex justify-between items-center border-b border-white/5 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <ShieldAlert className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase italic">Chronos Admin</h1>
              <p className="text-slate-500 text-xs font-mono font-bold tracking-widest uppercase">Global Fraud Registry Control</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-500 uppercase">System Status</div>
                <div className="text-sm font-medium text-accent">Active // 1,248 Nodes Online</div>
             </div>
             <div className="w-10 h-10 bg-slate-800 rounded-full border border-white/10" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Form Side */}
          <div className="space-y-8">
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Plus size={18} className="text-primary" /> Blacklist New Entry
              </h2>
              <form onSubmit={addToBlacklist} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tracking Number</label>
                  <input 
                    value={newNumber}
                    onChange={e => setNewNumber(e.target.value)}
                    placeholder="e.g. GIG-0000"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason / Evidence</label>
                  <textarea 
                    value={newReason}
                    onChange={e => setNewReason(e.target.value)}
                    placeholder="Describe the scam pattern..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all h-32"
                  />
                </div>
                <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20">
                  Update Registry
                </button>
              </form>
            </div>

            <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl space-y-2">
               <div className="flex items-center gap-2 text-danger font-bold text-sm uppercase italic">
                 <AlertOctagon size={16} /> Danger Zone
               </div>
               <p className="text-xs text-danger/70 leading-relaxed">
                 Adding a waybill to the registry will trigger immediate 'CRITICAL_FRAUD' status for all users globally.
               </p>
            </div>
          </div>

          {/* List Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database size={20} className="text-secondary" /> Blacklisted Labels
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input 
                  placeholder="Filter registry..."
                  className="bg-slate-900 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              {blacklist.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={item.id}
                  className="bg-slate-900/30 border border-white/5 hover:border-white/10 p-5 rounded-2xl flex justify-between items-center group transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="bg-danger/20 p-3 rounded-xl">
                      <ShieldX className="text-danger" size={20} />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-lg text-white tracking-widest">{item.waybill_number}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">{item.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Added On</div>
                      <div className="text-xs font-medium text-slate-400">{new Date(item.created_at).toLocaleDateString()}</div>
                    </div>
                    <button 
                      onClick={() => remove(item.id)}
                      className="p-2.5 rounded-lg bg-slate-800 text-slate-500 hover:text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
