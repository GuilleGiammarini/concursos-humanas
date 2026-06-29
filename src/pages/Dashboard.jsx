import { useEffect, useState } from "react";
import DetailModal from "../components/DetailModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 📊 COMPONENTE CARD
function StatCard({ title, value, variant = "light", size = "normal" }) {
  const styles = {
    blue: "bg-[#0A2E57] text-white",
    red: "bg-[#E30613] text-white",
    light: "bg-[#0F5C4D] text-white",
  };

  const sizes = {
    normal: "p-4",
    small: "p-2",
  };

  const textSizes = {
    normal: "text-3xl",
    small: "text-lg",
  };

  return (
    <div className={`rounded-xl shadow-md ${styles[variant]} ${sizes[size]}`}>
      <p className="text-xs opacity-80">{title}</p>
      <p className={`${textSizes[size]} font-bold`}>{value}</p>
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  const [grouped, setGrouped] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [filtroDesignacion, setFiltroDesignacion] = useState("");
  const [filtroAnioConcurso, setFiltroAnioConcurso] = useState("");
  const [filtroAnioEvaluacion, setFiltroAnioEvaluacion] = useState("");

  const resetFilters = () => {
    setFiltroCarrera("");
    setFiltroDesignacion("");
    setFiltroAnioConcurso("");
    setFiltroAnioEvaluacion("");
    setSearch("");
  };

  const hasActiveFilters =
    filtroCarrera ||
    filtroDesignacion ||
    filtroAnioConcurso ||
    filtroAnioEvaluacion ||
    search;

  const activeFiltersCount = [
    filtroCarrera,
    filtroDesignacion,
    filtroAnioConcurso,
    filtroAnioEvaluacion,
    search,
  ].filter(Boolean).length;

  const splitCarreras = (carrera) => {
    if (!carrera) return [];
    return carrera.split("|").map((c) => c.trim()).filter(Boolean);
  };

  const [stats, setStats] = useState({
    totalDocentes: 0,
    O: 0, E: 0, I: 0, S: 0, T: 0, C: 0,
    concursos: 0,
    evaluaciones: 0,
  });

  const exportToExcel = () => {
    const dataToExport = filtered.flatMap((doc) =>
      doc.cargos.map((c) => ({
        Nombre: doc.nombre,
        DNI: doc.dni,
        Carrera: Array.isArray(c.carrera) ? c.carrera.join(" | ") : c.carrera,
        Designacion: c.designacion,
        Cargo: c.cargo,
        Dedicacion: c.dedicacion,
        Codigo: c.codigo,
        Anio: c.anio,
        Concurso: c.añoConcurso,
        Evaluacion: c.añoEvaluacion,
      }))
    );

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Docentes");
    XLSX.writeFile(wb, "docentes_filtrados.xlsx");
  };

  const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };

  const exportToPDF = async () => {
    const docPdf = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-AR");
    const pageWidth = docPdf.internal.pageSize.getWidth();

    try {
      const imgData = await getBase64ImageFromURL("/COLOR Membrete-UNVMHumanas.png");
      const imgWidth = 60;
      const imgHeight = 18;
      const imgX = pageWidth - imgWidth - 10;
      const imgY = 8;
      docPdf.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);
    } catch (err) {
      console.warn("No se pudo cargar la imagen del encabezado:", err);
    }

    docPdf.setFontSize(14);
    docPdf.text("Sistema de Concursos - I.A.P de Ciencias Humanas", 14, 15);
    docPdf.setFontSize(10);
    docPdf.text(`Fecha: ${fecha}`, 14, 22);
    docPdf.text(`Cantidad de Docentes: ${filtered.length}`, 14, 28);

    const tableData = filtered.flatMap((doc) => {
      const carrerasDocente = [
        ...new Set(
          doc.cargos
            .flatMap((c) => (Array.isArray(c.carrera) ? c.carrera : [c.carrera]))
            .filter(Boolean)
        ),
      ];
      const carrerasTexto = carrerasDocente.join(" | ");
      return doc.cargos.map((c) => [
        doc.nombre || "",
        doc.dni || "",
        carrerasTexto,
        c.designacion || "",
        c.cargo || "",
        c.dedicacion || "",
        c.añoConcurso || "",
        c.añoEvaluacion || "",
      ]);
    });

    autoTable(docPdf, {
      startY: 35,
      head: [["Nombre", "DNI", "Carrera/s", "Designación", "Cargo", "Dedicación", "Año Concurso", "Año Evaluación"]],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [10, 46, 87] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 18 },
        2: { cellWidth: 40 },
        3: { cellWidth: 22 },
        4: { cellWidth: 28 },
        5: { cellWidth: 18 },
        6: { cellWidth: 18 },
        7: { cellWidth: 18 },
      },
      tableWidth: "wrap",
    });

    docPdf.save("informe_unvm_detallado.pdf");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://docs.google.com/spreadsheets/d/1q3AquSHrDNywAVAQ-FCAAnynMCnh5H4VHboWjnw6llY/gviz/tq?tqx=out:json&gid=784691904"
        );
        const text = await res.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const cols = json.table.cols;
        const rows = json.table.rows;

        const formatted = rows.map((row) => {
          const obj = {};
          row.c.forEach((cell, i) => {
            const key = cols[i]?.label?.trim();
            if (!key) return;
            obj[key] = cell?.v ?? "";
          });
          return obj;
        });

        const getDesignacion = (row) => {
          const val = row["DESIGNACIÓN (I-O-E-S-T)"]?.toString().trim();
          if (val) {
            switch (val) {
              case "I": return "Interino";
              case "O": return "Ordinario";
              case "E": return "Estable";
              case "S": return "Suplente";
              case "T": return "Temporal";
              default: return val;
            }
          }
          const desdeHasta = row["Desde//hasta"];
          if (desdeHasta && desdeHasta.toString().trim() !== "") return "Contratado";
          return "";
        };

        const getDni = (rawRow) => rawRow?.c?.[1]?.v || "SIN DNI";
        const getName = (rawRow) => rawRow?.c?.[2]?.v || "SIN NOMBRE";

        const map = {};
        rows.forEach((rawRow, i) => {
          const row = formatted[i];
          const dni = getDni(rawRow);
          const nombre = getName(rawRow);
          if (!dni) return;
          if (!map[dni]) {
            map[dni] = { nombre, dni, cargos: [] };
          }
          map[dni].cargos.push({
            designacion: getDesignacion(row),
            cargo: row["CARGO DIVIDIDO"],
            dedicacion: row["DEDICACIÓN"],
            carrera: splitCarreras(row["CARRERA"]),
            actividad: row["ACTIVIDAD"],
            codigo: row["CODIGO"],
            anio: row["AÑO"],
            reg: row["REG"],
            desde: row["Desde//hasta"],
            añoConcurso: row["AÑO ULTIMO CONCURSO"],
            añoEvaluacion: row["AÑO ULTIMA EVALUACIÓN"],
          });
        });

        const currentYear = new Date().getFullYear();
        const statsTemp = {
          totalDocentes: Object.keys(map).length,
          O: 0, E: 0, I: 0, S: 0, T: 0, C: 0,
          concursos: 0,
          evaluaciones: 0,
        };

        Object.values(map).forEach((doc) => {
          doc.cargos.forEach((c) => {
            switch (c.designacion) {
              case "Ordinario": statsTemp.O++; break;
              case "Estable": statsTemp.E++; break;
              case "Interino": statsTemp.I++; break;
              case "Suplente": statsTemp.S++; break;
              case "Temporal": statsTemp.T++; break;
              case "Contratado": statsTemp.C++; break;
            }
            if (parseInt(c.añoConcurso) === currentYear) statsTemp.concursos++;
            if (parseInt(c.añoEvaluacion) === currentYear) statsTemp.evaluaciones++;
          });
        });

        setStats(statsTemp);
        setGrouped(Object.values(map));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const carreras = [...new Set(grouped.flatMap((d) => d.cargos.flatMap((c) => c.carrera)))].filter(Boolean);
  const aniosConcursos = [...new Set(grouped.flatMap((d) => d.cargos.map((c) => c.añoConcurso)))].filter(Boolean);
  const aniosEvaluaciones = [...new Set(grouped.flatMap((d) => d.cargos.map((c) => c.añoEvaluacion)))].filter(Boolean);

  const filtered = grouped.filter((d) => {
    const matchSearch = (d.nombre + d.dni).toLowerCase().includes(search.toLowerCase());
    const matchCarrera = !filtroCarrera || d.cargos.some((c) => c.carrera.includes(filtroCarrera));
    const matchDesignacion = !filtroDesignacion || d.cargos.some((c) => c.designacion === filtroDesignacion);
    const matchConcurso = !filtroAnioConcurso || d.cargos.some((c) => c.añoConcurso?.toString() === filtroAnioConcurso);
    const matchEvaluacion = !filtroAnioEvaluacion || d.cargos.some((c) => c.añoEvaluacion?.toString() === filtroAnioEvaluacion);
    return matchSearch && matchCarrera && matchDesignacion && matchConcurso && matchEvaluacion;
  });

  const filteredStats = {
    totalDocentes: filtered.length,
    O: 0, E: 0, I: 0, S: 0, T: 0, C: 0,
    concursos: 0,
    evaluaciones: 0,
  };

  const currentYear = new Date().getFullYear();

  filtered.forEach((doc) => {
    doc.cargos.forEach((c) => {
      switch (c.designacion) {
        case "Ordinario": filteredStats.O++; break;
        case "Estable": filteredStats.E++; break;
        case "Interino": filteredStats.I++; break;
        case "Suplente": filteredStats.S++; break;
        case "Temporal": filteredStats.T++; break;
        case "Contratado": filteredStats.C++; break;
      }
      if (parseInt(c.añoConcurso) === currentYear) filteredStats.concursos++;
      if (parseInt(c.añoEvaluacion) === currentYear) filteredStats.evaluaciones++;
    });
  });

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{
        backgroundImage: "url('/Fondo_Pagina_concursos.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* SIDEBAR */}
      <div className="hidden md:flex w-64 bg-[#0A2E57] text-white p-4 flex-col gap-3 h-screen overflow-y-auto flex-shrink-0">

        <h1 className="font-bold text-lg mb-2 flex items-center justify-between">
          UNVM Humanas
          {activeFiltersCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h1>

        <select className="text-black p-2 rounded" value={filtroCarrera} onChange={(e) => setFiltroCarrera(e.target.value)}>
          <option value="">Carrera</option>
          {carreras.map((c, i) => <option key={i}>{c}</option>)}
        </select>

        <select className="text-black p-2 rounded" value={filtroDesignacion} onChange={(e) => setFiltroDesignacion(e.target.value)}>
          <option value="">Designación</option>
          <option value="Ordinario">Ordinario</option>
          <option value="Estable">Estable</option>
          <option value="Interino">Interino</option>
          <option value="Suplente">Suplente</option>
          <option value="Temporal">Temporal</option>
          <option value="Contratado">Contratado</option>
        </select>

        <select className="text-black p-2 rounded" value={filtroAnioConcurso} onChange={(e) => setFiltroAnioConcurso(e.target.value)}>
          <option value="">Año Concurso</option>
          {aniosConcursos.map((a, i) => <option key={i}>{a}</option>)}
        </select>

        <select className="text-black p-2 rounded" value={filtroAnioEvaluacion} onChange={(e) => setFiltroAnioEvaluacion(e.target.value)}>
          <option value="">Año Evaluación</option>
          {aniosEvaluaciones.map((a, i) => <option key={i}>{a}</option>)}
        </select>

        {hasActiveFilters && (
          <button onClick={resetFilters} className="mt-2 bg-white text-[#0A2E57] font-bold py-2 px-3 rounded hover:bg-gray-200 transition">
            Limpiar filtros
          </button>
        )}

        {/* CERRAR SESIÓN — pegado abajo */}
        <div className="mt-auto pt-4">
          <button
            onClick={onLogout}
            className="w-full bg-red-600 text-white font-bold py-2 px-3 rounded hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>
        </div>

      </div>

      {/* COLUMNA DERECHA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* TOPBAR */}
        <div className="bg-white shadow p-3 border-b-2 border-[#0A2E57] flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-bold text-[#0A2E57] text-lg whitespace-nowrap">
              Sistema de Concursos
            </h2>
            <div className="flex justify-center flex-1">
              <img src="/COLOR Membrete-UNVMHumanas.png" alt="UNVM Humanas" className="max-h-[50px] object-contain" />
            </div>
            <input
              className="border p-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-[#0A2E57]"
              placeholder="Buscar docente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition ml-2">
              Exportar Excel
            </button>
            <button onClick={exportToPDF} className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition ml-2">
              Exportar PDF
            </button>
          </div>
        </div>

        {/* CARDS — fijas */}
        <div className="p-4 flex-shrink-0">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <StatCard title="Total Docentes" value={filteredStats.totalDocentes} variant="blue" />
            <StatCard title={`Concursos (${currentYear})`} value={filteredStats.concursos} variant="red" />
            <StatCard title={`Evaluaciones (${currentYear})`} value={filteredStats.evaluaciones} variant="red" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <StatCard title="Ordinarios (O)" value={filteredStats.O} size="small" />
            <StatCard title="Estables (E)" value={filteredStats.E} size="small" />
            <StatCard title="Interinos (I)" value={filteredStats.I} size="small" />
            <StatCard title="Suplentes (S)" value={filteredStats.S} size="small" />
            <StatCard title="Temporarios (T)" value={filteredStats.T} size="small" />
            <StatCard title="Contratados" value={filteredStats.C} size="small" />
          </div>
        </div>

        {/* LISTA DOCENTES — scroll */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((doc, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(doc)}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer border-l-4 border-[#0A2E57]"
                >
                  <h3 className="font-bold text-[#0A2E57]">{doc.nombre}</h3>
                  <p className="text-sm text-gray-600">DNI: {doc.dni}</p>
                  <p className="text-sm mt-2">
                    {doc.cargos.some((c) => c.designacion === "Contratado")
                      ? "Cargo: Contratado"
                      : `Cargos: ${doc.cargos.length}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && <DetailModal data={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}