import { useState } from "react";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [logeado, setLogeado] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (usuario === "ConcursosHumanas" && password === "concursos2026") {
      setLogeado(true);
      setError("");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    setLogeado(false);
    setUsuario("");
    setPassword("");
  };

  if (!logeado) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{ backgroundImage: "url('/FONDO_Campus_UNVM.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <img src="/COLOR Membrete-UNVMHumanas.png" alt="UNVM Humanas" className="h-16 object-contain" />
          </div>

          <h1 className="text-center text-2xl font-bold text-gray-800 mb-6">
            Área de Concursos - Instituto de Humanas
          </h1>

          <h4 className="text-center text-sm font-normal text-gray-600 mb-6">
            Sistema de gestión de concursos y evaluaciones docentes
          </h4>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}