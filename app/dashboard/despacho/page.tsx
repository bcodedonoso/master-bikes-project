"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function DespachoPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  async function cargar() {
    const { data } = await supabase.from('despachos').select('*').order('id', { ascending: false });
    setPedidos(data || []);
  }

  useEffect(() => { cargar(); }, []);

  const update = async (id: number, est: string) => {
    await supabase.from('despachos').update({ estado: est }).eq('id', id);
    cargar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-8 text-black dark:text-white">Logística de Despacho</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-black uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="p-6">Producto / Detalle</th>
                  <th className="p-6">Estado Actual</th>
                  <th className="p-6 text-right">Acciones de Ruta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {pedidos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-black dark:text-white">{p.detalle}</p>
                      <p className="text-xs text-gray-500">ID: #{p.id} - {p.direccion}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        p.estado === 'entregado' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                      }`}>
                        {p.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-2">
                      <button 
                        onClick={() => update(p.id, 'en_transito')} 
                        disabled={p.estado === 'entregado' || p.estado === 'en_transito'}
                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-bold hover:opacity-80 disabled:opacity-30 transition"
                      >
                        Enviar
                      </button>
                      <button 
                        onClick={() => update(p.id, 'entregado')} 
                        disabled={p.estado === 'entregado'}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-30 transition"
                      >
                        Entregar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pedidos.length === 0 && (
            <div className="p-10 text-center text-gray-500 font-medium italic">
              No hay pedidos en el sistema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}