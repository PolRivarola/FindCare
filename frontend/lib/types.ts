export type Conversation = {
  id: number;
  nombre: string;    
  tipo: string;      
  ultimoMensaje: string;
  hora: string;      
  noLeidos: number;
};

export type Message = {
  id: number;
  sender: string;    
  content: string;
  time: string;      
  isOwn: boolean;
};

export interface Solicitud {
  id: number;
  id_cliente: number;
  id_cuidador?: number; 
  cliente: string;
  servicio: string[];
  fecha_inicio: string;
  fecha_fin: string;
  hora: string;
  rangos_horarios: string[];
  ubicacion: string;
  foto: string;
}

export interface PerfilCliente {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  descripcion: string;
  foto_perfil: string;
  fotos: (string | File)[];
  categorias: string[];
  provincia: string;
  ciudad: string;
  password: string,
  confirmPassword: string,
}

export type ServicioDTO = {
  id: number;
  cliente: number | { id: number; username: string; first_name?: string; last_name?: string };
  receptor: number | { id: number; username: string; first_name?: string; last_name?: string };
  fecha_inicio: string;   // ISO string
  fecha_fin: string;      // ISO string
  descripcion: string;
  horas_dia: string;
  dias_semanales: Array<number | { id: number; nombre?: string }>;
  aceptado: boolean;
};

export type Review = {
  id: number;
  rating: number;
  author: string;
  date: string;      // ISO string
  comment: string;
};

// Public profile payload returned by backend PerfilPublicoView
export interface PerfilPublico {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  descripcion: string;
  foto_perfil: string;
  fotos: string[];
  categorias: string[];
  provincia: string;
  ciudad: string;
  rating?: number | null;
  reviews: Review[];
  reviews_count?: number;
  experiencia?: number;
  especialidad?: string;
  precio?: number;
  disponible?: boolean;
  tipo_usuario: "cliente" | "cuidador";
  certificados?: { file: string; name: string }[];
  experiencias?: {
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
  }[];
}