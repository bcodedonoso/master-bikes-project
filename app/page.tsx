import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
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
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-900 border-b-2 border-gray-100 dark:border-gray-800 py-4 px-8 flex justify-between items-center shadow-sm">
        <Image src="/logo.png" alt="MasterBikes" width={140} height={40} className="h-10 w-auto" priority />
        <Link href="/login" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-xl font-bold hover:bg-blue-600 dark:hover:bg-blue-400 transition">
          Ingresar
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto p-10">
        <div className="mb-12">
          <h2 className="text-5xl font-black text-black dark:text-white mb-4">Catálogo de Ventas</h2>
          <p className="text-gray-900 dark:text-gray-300 font-bold text-lg">Equipamiento profesional Shimano y bicicletas de alta gama.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {productos?.map((prod) => (
            <div key={prod.id} className="group bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 p-6 rounded-3xl hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-sm">
              <span className="text-[12px] font-black bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full uppercase mb-4 inline-block">
                {prod.categoria}
              </span>
              <h3 className="text-2xl font-black text-black dark:text-white mb-2">{prod.nombre}</h3>
              <p className="text-gray-900 dark:text-gray-300 font-medium mb-6 line-clamp-2">{prod.descripcion}</p>
              
              <div className="flex justify-between items-center pt-6 border-t-2 border-gray-50 dark:border-gray-700">
                <span className="text-2xl font-black text-black dark:text-white">${prod.precio.toLocaleString('es-CL')}</span>
                
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