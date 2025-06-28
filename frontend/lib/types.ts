export interface Conversation {
  id: number
  nombre: string
  tipo: string
  ultimoMensaje: string
  hora: string
  noLeidos: number
  online: boolean
}

export interface Message {
  id: number
  sender: string
  content: string
  time: string
  isOwn: boolean
}

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