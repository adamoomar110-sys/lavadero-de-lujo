'use client';
import React, { useState, useEffect } from 'react';
import { ClipboardList, Car, Calendar, User, Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ControlMaestro() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/usuarios');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error de conexión');
      
      const allUsers = data.users || [];
      
      // Flatten all work history from all users into a single master log array
      const masterLogs: any[] = [];
      
      allUsers.forEach((user: any) => {
        if (user.work_history && user.work_history.length > 0) {
          user.work_history.forEach((hist: any) => {
            masterLogs.push({
              id: hist.id,
              user_id: user.id,
              full_name: user.full_name,
              legajo: user.legajo || 'S/L',
              role: user.role,
              cargo: user.cargo || 'Lavador',
              vehicle_plate: hist.vehicle_plate,
              vehicle_model: hist.vehicle_model,
              revenue: hist.revenue,
              date: new Date(hist.date),
              hours_estimated: 1.5 // Standard wash time estimation
            });
          });
        }
      });
      
      // Sort by date descending
      masterLogs.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setLogs(masterLogs);
    } catch (err: any) {
      console.error('❌ Error cargando control maestro:', err.message);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    log.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.vehicle_model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-orange-50">
      <header className="h-24 px-10 flex items-center justify-between border-b border-orange-200 bg-orange-100/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            <ClipboardList size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-black tracking-tighter italic">Control Maestro</h2>
            <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Auditoría de Personal, Autos y Días</p>
          </div>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar por empleado o patente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 rounded-full bg-white border border-orange-200 text-sm font-bold text-black outline-none focus:border-green-400 shadow-sm w-72 transition-all"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="bg-white/80 backdrop-blur-xl border border-orange-200 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-orange-100/50 border-b border-orange-200">
                  <th className="p-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Calendar size={14} /> Fecha y Hora</div>
                  </th>
                  <th className="p-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><User size={14} /> Empleado</div>
                  </th>
                  <th className="p-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Car size={14} /> Vehículo Lavado</div>
                  </th>
                  <th className="p-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Hs. Estimadas</th>
                  <th className="p-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Recaudación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="inline-block w-10 h-10 border-4 border-green-400/20 border-t-green-500 rounded-full animate-spin" />
                      <p className="mt-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Cargando registros...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-sm font-bold text-zinc-500 italic">No se encontraron registros de lavados.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-orange-50/50 transition-colors group">
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">{log.date.toLocaleDateString('es-AR')}</span>
                          <span className="text-xs text-zinc-500 font-medium">{log.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-white text-xs font-bold">
                            {log.full_name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-black">{log.full_name}</span>
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Legajo: {log.legajo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-black text-black bg-orange-100 border border-orange-200 px-2 py-0.5 rounded text-xs w-fit tracking-widest uppercase">
                            {log.vehicle_plate}
                          </span>
                          <span className="text-xs text-zinc-500 font-medium mt-1">{log.vehicle_model}</span>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs">
                          ~ {log.hours_estimated} hs
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <span className="font-black text-lime-600 text-sm">
                          ${log.revenue.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
