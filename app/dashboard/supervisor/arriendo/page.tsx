"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function GestionArriendos() {
  const [arriendos, setArriendos] = useState<any[]>([]);

  async function cargar() {
    const { data } = await supabase.from('arriendos').select('*, productos(nombre)').order('id', { ascending: false });
    setArriendos(data || []);
  }

  useEffect(() => { cargar(); }, []);

  const cambiarEstado = async (id: number, nuevo: string) => {
    await supabase.from('arriendos').update({ estado: nuevo }).eq('id', id);
    cargar();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-2xl font-black mb-6 dark:text-white">Control de Arriendos y Devoluciones</h1>
      <div className="grid gap-4">
        {arriendos.map(a => (
          <div key={a.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 flex justify-between items-center">
            <div>
              <p className="font-bold dark:text-white">{a.productos?.nombre} - {a.cantidad} bicis</p>
              <p className="text-sm text-gray-500">Desde: {a.fecha_inicio} | Hasta: {a.fecha_fin}</p>
              <p className="text-xs font-black text-blue-600 uppercase mt-1">Estado: {a.estado}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => cambiarEstado(a.id, 'en_uso')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Entrega</button>
              <button onClick={() => cambiarEstado(a.id, 'devuelto')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Devolución</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}