"use client";
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ComprarBtn({ productoId, precio }: { productoId: number, precio: number }) {
  const [loading, setLoading] = useState(false);

  const handleCompra = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Debes iniciar sesión para comprar");
      setLoading(false);
      return;
    }

    // 1. Crear el Despacho para el Tracking del cliente
    await supabase.from('despachos').insert([{
      cliente_id: user.id,
      direccion: "Dirección Registrada del Cliente", 
      estado: 'pedido_tomado'
    }]);

    // 2. Registrar la Venta para que el Supervisor vea el dinero
    await supabase.from('ventas').insert([{
      monto_total: precio,
      tipo_servicio: 'venta_producto'
    }]);

    alert("¡Compra exitosa! Revisa el seguimiento en tu panel.");
    setLoading(false);
  };

  return (
    <button 
      onClick={handleCompra} 
      disabled={loading} 
      className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition disabled:bg-gray-400"
    >
      {loading ? 'Procesando...' : 'Comprar Ahora'}
    </button>
  );
}