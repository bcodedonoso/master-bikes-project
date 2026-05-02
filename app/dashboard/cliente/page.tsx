"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ClienteDashboard() {
  const router = useRouter();
  
  // Estados de datos
  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [misArriendos, setMisArriendos] = useState<any[]>([]);
  const [bicisArriendo, setBicisArriendo] = useState<any[]>([]);
  const [productosVenta, setProductosVenta] = useState<any[]>([]);
  
  // Estados de formularios
  const [descripcionTaller, setDescripcionTaller] = useState('');
  const [biciSeleccionada, setBiciSeleccionada] = useState<any>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cantidadBicis, setCantidadBicis] = useState(1);
  const [loading, setLoading] = useState(false);

  async function cargarTodo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Mis Reparaciones
    const { data: rep } = await supabase.from('reparaciones').select('*').eq('cliente_id', user.id).order('fecha_solicitud', { ascending: false });
    setReparaciones(rep || []);

    // 2. Mis Arriendos
    const { data: arrLog } = await supabase.from('arriendos').select('*, productos(nombre)').eq('cliente_id', user.id).order('id', { ascending: false });
    setMisArriendos(arrLog || []);

    // 3. Catálogo Arriendo
    const { data: catArr } = await supabase.from('productos').select('*').eq('tipo', 'arriendo');
    if (catArr) { setBicisArriendo(catArr); if(!biciSeleccionada) setBiciSeleccionada(catArr[0]); }

    // 4. Catálogo Venta
    const { data: catVen } = await supabase.from('productos').select('*').eq('tipo', 'venta');
    setProductosVenta(catVen || []);
  }

  useEffect(() => { cargarTodo(); }, []);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // ACCIÓN: Pedir Reparación
  const handleSolicitarTaller = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('reparaciones').insert([{ cliente_id: user?.id, descripcion_problema: descripcionTaller, estado: 'solicitada' }]);
    setDescripcionTaller('');
    alert("Solicitud enviada al taller");
    cargarTodo();
    setLoading(false);
  };

  // ACCIÓN: Reservar Arriendo
  const handleReservarArriendo = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!fechaInicio || !fechaFin) return alert("Selecciona las fechas");
    const { data: { user } } = await supabase.auth.getUser();
    const total = (biciSeleccionada?.precio_diario || 0) * cantidadBicis;
    
    await supabase.from('arriendos').insert([{ 
      cliente_id: user?.id, producto_id: biciSeleccionada.id, fecha_inicio: fechaInicio, 
      fecha_fin: fechaFin, cantidad: cantidadBicis, monto_total: total, estado: 'reservado'
    }]);
    alert("Arriendo reservado con éxito");
    cargarTodo();
  };

  // ACCIÓN: Comprar Producto (MODIFICADA SIN EMAIL)
  const handleComprar = async (p: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Guardamos la venta en la base de datos
    await supabase.from('ventas').insert([{ monto_total: p.precio, tipo_servicio: 'venta_producto' }]);
    
    // Generamos el despacho
    await supabase.from('despachos').insert([{ 
      cliente_id: user?.id, 
      detalle: `Compra: ${p.nombre}`, 
      direccion: "Dirección Guardada", 
      estado: 'pedido_tomado' 
    }]);
    
    // Ya no hay fetch('/api/email'...), solo aviso directo y recarga
    alert(`¡Compra de ${p.nombre} exitosa! Puedes ver el estado en la sección de Despachos.`);
    cargarTodo();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 text-center md:text-left">
          <div>
            <h1 className="text-4xl font-extrabold text-black dark:text-white italic">MasterBikes</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Servicios de Ciclismo Profesional</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link href="/dashboard/cliente/despachos" className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none transition hover:scale-105">📍 MIS DESPACHOS</Link>
            <button onClick={handleCerrarSesion} className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-6 py-2.5 rounded-2xl font-black transition hover:opacity-80">SALIR</button>
          </div>
        </header>

        {/* SECCIÓN 1: FORMULARIOS (ARRIENDO Y TALLER) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* ARRIENDOS */}
          <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-2xl font-black mb-6 text-black dark:text-white">Reservar para Grupo</h2>
            <form onSubmit={handleReservarArriendo} className="space-y-4">
              <select onChange={(e) => setBiciSeleccionada(bicisArriendo.find(b => b.id === Number(e.target.value)))} className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-black dark:text-white rounded-2xl border border-gray-200 dark:border-gray-600 font-bold outline-none">
                {bicisArriendo.map(b => <option key={b.id} value={b.id}>{b.nombre} (${b.precio_diario}/día)</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={fechaInicio} onChange={(e)=>setFechaInicio(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-700 text-black dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-xs" />
                <input type="date" value={fechaFin} onChange={(e)=>setFechaFin(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-700 text-black dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-xs" />
              </div>
              <input type="number" min="1" value={cantidadBicis} onChange={(e)=>setCantidadBicis(Number(e.target.value))} className="w-full p-4 bg-gray-50 dark:bg-gray-700 text-black dark:text-white rounded-2xl border border-gray-200 dark:border-gray-600 font-bold" placeholder="¿Cuántas bicis?" />
              <button className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black hover:opacity-80 transition">RESERVAR AHORA</button>
            </form>
          </section>

          {/* TALLER */}
          <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-2xl font-black mb-6 text-black dark:text-white">Ingreso a Taller</h2>
            <form onSubmit={handleSolicitarTaller} className="space-y-4">
              <textarea 
                className="w-full p-5 bg-gray-50 dark:bg-gray-700 text-black dark:text-white rounded-2xl border border-gray-200 dark:border-gray-600 font-medium outline-none" 
                rows={4} placeholder="¿Qué le sucede a tu bicicleta?"
                value={descripcionTaller} onChange={(e)=>setDescripcionTaller(e.target.value)}
              />
              <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">
                {loading ? 'ENVIANDO...' : 'SOLICITAR REPARACIÓN'}
              </button>
            </form>
          </section>
        </div>

        {/* SECCIÓN 2: HISTORIALES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* MIS REPARACIONES */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-black mb-6 text-black dark:text-white">Estado de mis Bicicletas</h3>
            <div className="space-y-3">
              {reparaciones.map(r => (
                <div key={r.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <p className="font-bold text-sm text-black dark:text-white">{r.descripcion_problema}</p>
                  <span className="text-[9px] font-black px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 rounded-full uppercase">{r.estado}</span>
                </div>
              ))}
            </div>
          </div>
          {/* MIS ARRIENDOS */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-black mb-6 text-black dark:text-white">Mis Arriendos Activos</h3>
            <div className="space-y-3">
              {misArriendos.map(a => (
                <div key={a.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-bold text-sm text-black dark:text-white">{a.productos?.nombre}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{a.fecha_inicio} al {a.fecha_fin}</p>
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full uppercase">{a.estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: TIENDA */}
        <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3rem] border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-3xl font-black text-black dark:text-white mb-10">Tienda de Repuestos y Bicis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosVenta.map(p => (
              <div key={p.id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-[2rem] flex flex-col justify-between border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition">
                <div>
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{p.categoria}</span>
                  <h4 className="text-xl font-bold text-black dark:text-white mt-2">{p.nombre}</h4>
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <p className="text-2xl font-black text-black dark:text-white">${p.precio.toLocaleString()}</p>
                  <button onClick={() => handleComprar(p)} className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-xl font-black text-xs transition hover:scale-105 hover:opacity-90">
                    COMPRAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}