import type { ServicioDTO, Solicitud } from "../types/servicios";

function toDateOnly(iso: string) {
  // asume formato ISO del backend, corta a YYYY-MM-DD
  return iso?.slice(0, 10) ?? "";
}

function pickUsername(u: number | { id: number; username: string; first_name?: string; last_name?: string; ciudad?: string; provincia?: string }) {
  if (typeof u === "number") return { id: u, label: `Usuario ${u}`, ciudad: "—", provincia: "—" };
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return { 
    id: u.id, 
    label: full || u.username,
    ciudad: u.ciudad || "—",
    provincia: u.provincia || "—"
  };
}
  
export function mapServiciosToUI(rows: ServicioDTO[]): Solicitud[] {
  return rows.map((r) => {
    const cliente = pickUsername(r.cliente);
    const receptor = pickUsername(r.receptor);

    return {
      id: r.id,
      id_cliente: cliente.id,
      id_cuidador: receptor.id,
      foto: "/placeholder.jpg",                       // ajustá si luego traés foto real
      cliente: cliente.label,                         // nombre que mostrás en tu card
      cliente_ciudad: cliente.ciudad,
      cliente_provincia: cliente.provincia,
      servicio: [r.descripcion].filter(Boolean),      // puedes expandir a tags si querés
      fecha_inicio: toDateOnly(r.fecha_inicio),
      fecha_fin: toDateOnly(r.fecha_fin),
      hora: r.horas_dia || "—",
      rangos_horarios: [],
      aceptado: r.aceptado                            // derivá si necesitás
    };
  });
}
