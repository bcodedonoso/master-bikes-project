"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // FUNCIÓN PARA INICIAR SESIÓN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setMensaje("❌ Correo o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.push('/dashboard/cliente'); // Redirige al panel de cliente
    }
  };

  // FUNCIÓN PARA CREAR CUENTA NUEVA Y ENVIAR CORREO
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    // 1. Crear el usuario en Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMensaje(`❌ Error al registrar: ${error.message}`);
      setLoading(false);
      return;
    }

    // 2. Enviar el correo de bienvenida con Resend
    if (data.user) {
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: '¡Bienvenido a MasterBikes! 🚴‍♂️',
            mensaje: 'Tu cuenta ha sido creada con éxito. Ya puedes iniciar sesión para agendar mantenciones o comprar en nuestra tienda.'
          }),
        });
        setMensaje("✅ ¡Cuenta creada con éxito! Revisa tu correo e inicia sesión.");
      } catch (err) {
        console.error("Error enviando correo:", err);
        setMensaje("✅ Cuenta creada, pero hubo un error al enviar el correo.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">MasterBikes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Ingresa a tu cuenta o regístrate</p>
        </div>

        {mensaje && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-bold text-center ${mensaje.includes('✅') ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
            {mensaje}
          </div>
        )}

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white font-medium outline-none focus:border-blue-500 transition-colors"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white font-medium outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Iniciar Sesión'}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">o si eres nuevo</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            <button 
              onClick={handleRegistro}
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black hover:opacity-80 transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Crear Cuenta Nueva'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}