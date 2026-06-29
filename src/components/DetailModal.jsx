export default function DetailModal({ data, onClose }) {
  const principal = data.cargos[0] || {};

  // 🔥 normalizador robusto de carreras (| o ,)
  const splitCarreras = (carrera) => {
    if (!carrera) return [];

    return carrera
      .toString()
      .split(/[\|,]/) // soporta ambos separadores
      .map((c) => c.trim())
      .filter(Boolean);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

      <div className="bg-white w-full max-w-3xl p-6 rounded max-h-[80vh] overflow-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">
            {data.nombre}
          </h2>

          <button
            onClick={onClose}
            className="text-red-500 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* 🔥 INFO PRINCIPAL */}
        <div className="text-sm mb-4 space-y-2">

          {/* CARRERA */}
          {principal.carrera && (
            <div>
              <p><b>Carrera:</b></p>

              <div className="ml-3 mt-1 space-y-1">
                {Array.from(
                  new Set(splitCarreras(principal.carrera))
                ).map((c, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{c}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVIDAD */}
          {principal.actividad && (
            <p><b>Actividad:</b> {principal.actividad}</p>
          )}

          {/* CÓDIGO */}
          {principal.codigo && (
            <p><b>Código:</b> {principal.codigo}</p>
          )}

          {/* AÑO */}
          {principal.anio && (
            <p><b>Año:</b> {principal.anio}</p>
          )}
        </div>

        {/* DNI */}
        <p className="text-sm mb-4 text-gray-600">
          DNI: {data.dni}
        </p>

        {/* CARGOS */}
        <div className="space-y-3">

          {data.cargos.map((c, i) => (
            <div key={i} className="border p-3 rounded bg-gray-50 text-sm">

              {c.designacion && (
                <p><b>Designación:</b> {c.designacion}</p>
              )}

              {c.cargo && (
                <p><b>Cargo:</b> {c.cargo}</p>
              )}

              {c.dedicacion && (
                <p><b>Dedicación:</b> {c.dedicacion}</p>
              )}

              {c.añoConcurso && (
                <p><b>Año último concurso:</b> {c.añoConcurso}</p>
              )}

              {c.añoEvaluacion && (
                <p><b>Año última evaluación:</b> {c.añoEvaluacion}</p>
              )}

              {c.desde && c.desde.toString().trim() !== "" && (
                <p><b>Desde/Hasta:</b> {c.desde}</p>
              )}

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}