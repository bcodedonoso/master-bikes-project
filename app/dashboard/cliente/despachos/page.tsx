"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function MisDespachos() {
  const [misPedidos, setMisPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarMisPedidos() {
      // 1. Obtenemos al usuario conectado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Buscamos solo los despachos que le pertenecen a este cliente
        const { data } = await supabase
          .from('despachos')
          .select('*')
          .eq('cliente_id', user.id)
          .order('id', { ascending: false });
        
        setMisPedidos(data || []);
      }
      setCargando(false);
    }
    cargarMisPedidos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* ENCABEZADO Y BOTÓN DE VOLVER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black dark:text-white">Mis Despachos</h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">Rastrea el estado de tus compras</p>
          </div>
          <Link 
            href="/dashboard/cliente" 
            className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition shadow-sm"
          >
            ← Volver al Panel
          </Link>
        </header>

        {/* LISTADO DE PEDIDOS */}
        <div className="space-y-4">
          {cargando ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400 font-bold">Cargando tus pedidos...</div>
          ) : misPedidos.length > 0 ? (
            misPedidos.map(p => (
              <div 
                key={p.id} 
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-bold text-xl text-black dark:text-white mb-1">{p.detalle}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dirección de entrega: {p.direccion}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">N° de Orden: #{p.id}</p>
                </div>
                
                {/* ETIQUETA DE ESTADO DINÁMICA */}
                <div className="mt-2 md:mt-0">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest inline-block ${
                    p.estado === 'entregado' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                    : p.estado === 'en_transito'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                  }`}>
                    {p.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aún no tienes pedidos registrados.</p>
              <Link href="/dashboard/cliente" className="text-blue-600 dark:text-blue-400 font-bold mt-2 inline-block hover:underline">
                ¡Ve a la tienda para hacer tu primera compra!
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}