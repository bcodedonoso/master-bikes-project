import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import ComprarBtn from './components/ComprarBtn';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .eq('tipo', 'venta');

  return (
    <main className="min-h-screen bg-white">
      <nav className="bg-white border-b-2 border-gray-100 py-4 px-8 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-black text-black uppercase">MasterBikes</h1>
        <Link href="/login" className="bg-black text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition">
          Ingresar
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto p-10">
        <div className="mb-12">
          <h2 className="text-5xl font-black text-black mb-4">Catálogo de Ventas</h2>
          <p className="text-gray-900 font-bold text-lg">Equipamiento profesional Shimano y bicicletas de alta gama.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {productos?.map((prod) => (
            <div key={prod.id} className="group bg-white border-2 border-gray-100 p-6 rounded-3xl hover:border-blue-500 transition-all shadow-sm">
              <span className="text-[12px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase mb-4 inline-block">
                {prod.categoria}
              </span>
              <h3 className="text-2xl font-black text-black mb-2">{prod.nombre}</h3>
              <p className="text-gray-900 font-medium mb-6 line-clamp-2">{prod.descripcion}</p>
              
              <div className="flex justify-between items-center pt-6 border-t-2 border-gray-50">
                <span className="text-2xl font-black text-black">${prod.precio.toLocaleString('es-CL')}</span>
                
                {/* AQUÍ ESTÁ EL BOTÓN FUNCIONANDO */}
                <ComprarBtn productoId={prod.id} precio={prod.precio} />
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}