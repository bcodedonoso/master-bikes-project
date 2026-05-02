"use client";
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SupervisorDashboard() {
  const router = useRouter();
  const [ventas, setVentas] = useState<any[]>([]);
  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [despachos, setDespachos] = useState<any[]>([]);
  const [arriendos, setArriendos] = useState<any[]>([]);

  // Función para cargar absolutamente todo
  async function cargarTodo() {
    const [resVentas, resRep, resDesp, resArr] = await Promise.all([
      supabase.from('ventas').select('*').order('fecha', { ascending: false }),
      supabase.from('reparaciones').select('*').order('fecha_solicitud', { ascending: false }),
      supabase.from('despachos').select('*').order('id', { ascending: false }),
      supabase.from('arriendos').select('*, productos(nombre)')
    ]);

    setVentas(resVentas.data || []);
    setReparaciones(resRep.data || []);
    setDespachos(resDesp.data || []);
    setArriendos(resArr.data || []);
  }

  useEffect(() => { 
    cargarTodo(); 

    // Suscripción MULTIPLE: Escuchamos todas las áreas del negocio al mismo tiempo
    const canalGeneral = supabase.channel('dashboard_gerencial')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ventas' }, cargarTodo)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reparaciones' }, cargarTodo)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'despachos' }, cargarTodo)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arriendos' }, cargarTodo)
      .subscribe();

    return () => { supabase.removeChannel(canalGeneral); };
  }, []);

  // CALCULOS DE KPIs (Indicadores Clave)
  const ingresosVentas = ventas.reduce((acc, v) => acc + Number(v.monto_total), 0);
  const ingresosArriendos = arriendos.reduce((acc, a) => acc + Number(a.monto_total), 0);
  const ingresosTotales = ingresosVentas + ingresosArriendos;
  
  const tallerActivo = reparaciones.filter(r => r.estado !== 'entregada').length;
  const despachosPendientes = despachos.filter(d => d.estado !== 'entregado').length;
  const bicisArrendadas = arriendos.filter(a => a.estado === 'en_uso').reduce((acc, a) => acc + a.cantidad, 0);

  // Fecha actual formateada
  const fechaHoy = new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Agrupar ingresos por mes (últimos 12 meses)
  const datosMensuales = useMemo(() => {
    const map = new Map<string, { mes: string; ventas: number; arriendos: number }>();

    ventas.forEach((v) => {
      const mes = v.fecha ? v.fecha.slice(0, 7) : '';
      if (!mes) return;
      const actual = map.get(mes) || { mes, ventas: 0, arriendos: 0 };
      actual.ventas += Number(v.monto_total);
      map.set(mes, actual);
    });

    arriendos.forEach((a) => {
      const mes = a.fecha_inicio ? a.fecha_inicio.slice(0, 7) : '';
      if (!mes) return;
      const actual = map.get(mes) || { mes, ventas: 0, arriendos: 0 };
      actual.arriendos += Number(a.monto_total);
      map.set(mes, actual);
    });

    return Array.from(map.values())
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .slice(-12);
  }, [ventas, arriendos]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DEL DASHBOARD */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Centro de Comando</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium capitalize mt-1">{fechaHoy}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Sistema En Vivo</span>
          </div>
        </header>

        {/* FILA DE KPIs (TARJETAS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* KPI 1: Ingresos */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full"></div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Ingresos Globales</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white relative z-10">${ingresosTotales.toLocaleString('es-CL')}</h2>
          </div>

          {/* KPI 2: Taller */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full"></div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Taller (En Proceso)</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white relative z-10">{tallerActivo} <span className="text-lg font-medium text-slate-400">bicis</span></h2>
          </div>

          {/* KPI 3: Despachos */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full"></div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Rutas Pendientes</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white relative z-10">{despachosPendientes} <span className="text-lg font-medium text-slate-400">envíos</span></h2>
          </div>

          {/* KPI 4: Arriendos */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full"></div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Flota Arrendada</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white relative z-10">{bicisArrendadas} <span className="text-lg font-medium text-slate-400">unidades</span></h2>
            <button 
              onClick={() => router.push('/dashboard/supervisor/arriendo')}
              className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline relative z-10"
            >
              Gestionar Arriendos →
            </button>
          </div>
        </div>

        {/* GRÁFICO DE INGRESOS MENSUALES */}
        {datosMensuales.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-10">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Ingresos Mensuales</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={datosMensuales} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any, name: any) => [`$${Number(value).toLocaleString('es-CL')}`, name]}
                  labelFormatter={(label) => `Mes: ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="arriendos" name="Arriendos" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* SECCIÓN PRINCIPAL: LISTAS RECIENTES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA 1 y 2: Últimas Transacciones (Más ancha) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Últimos Movimientos de Dinero</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {ventas.slice(0, 10).map(v => (
                <div key={v.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg">
                      💰
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white capitalize">{v.tipo_servicio.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">ID de transacción: #{v.id}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">+${Number(v.monto_total).toLocaleString('es-CL')}</span>
                </div>
              ))}
              {ventas.length === 0 && <p className="p-8 text-center text-slate-500">Sin movimientos recientes.</p>}
            </div>
          </div>

          {/* COLUMNA 3: Alertas Operativas (Más delgada) */}
          <div className="flex flex-col gap-8">
            
            {/* Taller Express */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Estado de Taller</h3>
              </div>
              <div className="p-5 space-y-3">
                {reparaciones.slice(0, 4).map(r => (
                  <div key={r.id} className="flex justify-between items-center">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{r.descripcion_problema}</p>
                    <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${r.estado === 'entregada' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                      {r.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arriendos Express */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Arriendos Activos</h3>
                <button 
                  onClick={() => router.push('/dashboard/supervisor/arriendo')}
                  className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded uppercase"
                >
                  Gestionar
                </button>
              </div>
              <div className="p-5 space-y-3">
                {arriendos.filter(a => a.estado === 'en_uso').slice(0, 4).map(a => (
                  <div key={a.id} className="flex flex-col border-l-2 border-indigo-500 pl-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{a.productos?.nombre}</p>
                    <p className="text-xs text-slate-500">Hasta el {a.fecha_fin} ({a.cantidad} un)</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}