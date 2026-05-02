"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function TecnicoDashboard() {
  const [reps, setReps] = useState<any[]>([]);

  async function cargar() {
    // Traemos las que no están entregadas
    const { data } = await supabase.from('reparaciones').select('*').neq('estado', 'entregada').order('fecha_solicitud', { ascending: true });
    setReps(data || []);
  }

  useEffect(() => { cargar(); }, []);

  const update = async (id: number, est: string) => {
    await supabase.from('reparaciones').update({ estado: est }).eq('id', id);
    cargar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-black dark:text-white">Taller MasterBikes</h1>
          <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-widest mt-1">Gestión de Mantenciones</p>
        </header>

        <div className="grid gap-6">
          {reps.length > 0 ? reps.map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <span className="text-[10px] font-black px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded uppercase mb-2 inline-block">
                  Estado: {r.estado}
                </span>
                <p className="font-bold text-xl text-black dark:text-white leading-tight">{r.descripcion_problema}</p>
                <p className="text-xs text-gray-500 mt-1 italic">Ingreso: {new Date(r.fecha_solicitud).toLocaleDateString()}</p>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => update(r.id, 'reparando')} 
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
                >
                  Reparar
                </button>
                <button 
                  onClick={() => update(r.id, 'lista')} 
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
                >
                  Lista
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 font-medium">¡Gran trabajo! No hay bicicletas pendientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}