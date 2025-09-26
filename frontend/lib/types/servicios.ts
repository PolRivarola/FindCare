// Lo que devuelve DRF (ajustá a tu serializer real)
export type ServicioDTO = {
  id: number;
  cliente: number | { id: number; username: string; first_name?: string; last_name?: string; ciudad?: string; provincia?: string };
  receptor: number | { id: number; username: string; first_name?: string; last_name?: string };
  fecha_inicio: string;   // ISO string
  fecha_fin: string;      // ISO string
  descripcion: string;
  horas_dia: string;
  dias_semanales: Array<number | { id: number; nombre?: string }>;
  aceptado: boolean;
};

// Lo que tu UI espera hoy (tu "Solicitud")
export type Solicitud = {
  id: number;
  id_cliente: number;
  id_cuidador: number;
  foto: string;
  cliente: string;
  servicio: string[];     // etiquetas o descripciones
  fecha_inicio: string;   // YYYY-MM-DD
  fecha_fin: string;      // YYYY-MM-DD
  hora: string;           // tal como lo mostrás
  rangos_horarios: string[];
  aceptado: boolean;
};
