from datetime import timedelta
from django.utils import timezone
import os, sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from location.models import Provincia, Ciudad, Direccion
from users.models import Usuario, TipoCliente, Cliente, Cuidador
from services.models import Servicio, Calificacion, DiaSemanal, Experiencia, Certificacion, HorarioDiario
from chat.models import Conversacion, Mensaje

# -------------------------
# Helpers
# -------------------------

def get_or_create_user(username, email, first_name, last_name, direccion, telefono, desc, desc_min, password, fecha_nacimiento=None):
    user, created = Usuario.objects.get_or_create(
        username=username,
        defaults=dict(
            email=email,
            first_name=first_name,
            last_name=last_name,
            direccion=direccion,
            telefono=telefono,
            descripcion=desc,
            descripcion_min=desc_min,
            fecha_nacimiento=fecha_nacimiento,
        )
    )
    if created:
        user.set_password(password)
        user.save()
    return user

def attach_cliente(usuario, tipos):
    cliente, _ = Cliente.objects.get_or_create(usuario=usuario)
    cliente.tipos_cliente.set(tipos)
    return cliente

def attach_cuidador(usuario, tipos, anios=3):
    cuidador, _ = Cuidador.objects.get_or_create(usuario=usuario, defaults={"anios_experiencia": anios})
    cuidador.tipos_cliente.set(tipos)
    return cuidador

def mk_servicio(cliente, cuidador, start, end, aceptado, desc, dias, horas_dia="Mañana"):
    s = Servicio.objects.create(
        cliente=cliente,
        receptor=cuidador,
        fecha_inicio=start,
        fecha_fin=end,
        descripcion=desc,
        horas_dia=horas_dia,
        aceptado=aceptado,
    )
    s.dias_semanales.set(dias)
    return s

def rate(servicio, autor, receptor, puntuacion, comentario):
    Calificacion.objects.get_or_create(
        servicio=servicio,
        autor=autor,
        receptor=receptor,
        defaults={"puntuacion": puntuacion, "comentario": comentario},
    )

def ensure_days():
    names = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    return [DiaSemanal.objects.get_or_create(nombre=n)[0] for n in names]

def ensure_horarios():
    slots = ["Mañana", "Tarde", "Noche", "Todo el dia"]
    return [HorarioDiario.objects.get_or_create(nombre=s)[0] for s in slots]

def mk_certificacion(cuidador, nombre_archivo, nombre_label):
    archivo = f"certificaciones/{nombre_archivo}"
    return Certificacion.objects.create(
        cuidador=cuidador,
        nombre=nombre_label,
        archivo=archivo
    )

def create_conversation_and_messages(cliente, cuidador, messages_data):
    """Crea una conversación entre cliente y cuidador con mensajes"""
    conversacion, created = Conversacion.objects.get_or_create(
        cliente=cliente,
        cuidador=cuidador
    )
    
    for mensaje_data in messages_data:
        Mensaje.objects.create(
            conversacion=conversacion,
            emisor=mensaje_data['emisor'],
            contenido=mensaje_data['contenido']
        )
    
    return conversacion

# -------------------------
# MAIN SEED FUNCTION
# -------------------------

def seed():
    print("🚀 Creando datos realistas en español...")

    prov_cba, _ = Provincia.objects.get_or_create(nombre="Córdoba")
    prov_bsas, _ = Provincia.objects.get_or_create(nombre="Buenos Aires")
    prov_sf, _ = Provincia.objects.get_or_create(nombre="Santa Fe")
    
    cba, _ = Ciudad.objects.get_or_create(nombre="Córdoba", provincia=prov_cba)
    rosario, _ = Ciudad.objects.get_or_create(nombre="Rosario", provincia=prov_sf)
    la_plata, _ = Ciudad.objects.get_or_create(nombre="La Plata", provincia=prov_bsas)
    villa_carlos_paz, _ = Ciudad.objects.get_or_create(nombre="Villa Carlos Paz", provincia=prov_cba)
    
    direcciones = [
        Direccion.objects.get_or_create(direccion="Av. Colón 1234", ciudad=cba)[0],
        Direccion.objects.get_or_create(direccion="San Martín 567", ciudad=cba)[0],
        Direccion.objects.get_or_create(direccion="Belgrano 890", ciudad=rosario)[0],
        Direccion.objects.get_or_create(direccion="Rivadavia 234", ciudad=la_plata)[0],
        Direccion.objects.get_or_create(direccion="Av. Cárcano 456", ciudad=villa_carlos_paz)[0],
        Direccion.objects.get_or_create(direccion="San Jerónimo 789", ciudad=cba)[0],
        Direccion.objects.get_or_create(direccion="Duarte Quirós 321", ciudad=cba)[0],
        Direccion.objects.get_or_create(direccion="Caseros 654", ciudad=rosario)[0],
    ]

    tipos_cliente = [
        TipoCliente.objects.get_or_create(nombre="Adultos Mayores")[0],
        TipoCliente.objects.get_or_create(nombre="Discapacidad Motriz")[0],
        TipoCliente.objects.get_or_create(nombre="Discapacidad Intelectual")[0],
        TipoCliente.objects.get_or_create(nombre="Post-operatorio")[0],
        TipoCliente.objects.get_or_create(nombre="Enfermedades Crónicas")[0],
        TipoCliente.objects.get_or_create(nombre="Cuidados Paliativos")[0],
        TipoCliente.objects.get_or_create(nombre="Rehabilitación")[0],
        TipoCliente.objects.get_or_create(nombre="Demencia/Alzheimer")[0],
    ]

    dias = ensure_days()
    ensure_horarios()

    now = timezone.now()
    
    clientes_data = [
        {
            "username": "ana_martinez",
            "email": "ana.martinez@email.com",
            "first_name": "Ana",
            "last_name": "Martínez",
            "telefono": "351-123-4567",
            "descripcion": "Soy una mujer de 78 años que necesita ayuda con las tareas diarias y acompañamiento médico. Me gusta leer y escuchar música clásica.",
            "descripcion_min": "Necesito acompañamiento diario",
            "fecha_nacimiento": now.date() - timedelta(days=78*365),
            "tipos": [tipos_cliente[0], tipos_cliente[4]]
        },
        {
            "username": "carlos_rodriguez",
            "email": "carlos.rodriguez@email.com",
            "first_name": "Carlos",
            "last_name": "Rodríguez",
            "telefono": "351-234-5678",
            "descripcion": "Hombre de 65 años en recuperación post-cirugía de cadera. Necesito ayuda con movilidad y rehabilitación.",
            "descripcion_min": "Recuperación post-operatoria",
            "fecha_nacimiento": now.date() - timedelta(days=65*365),
            "tipos": [tipos_cliente[1], tipos_cliente[3], tipos_cliente[6]]
        },
        {
            "username": "maria_gonzalez",
            "email": "maria.gonzalez@email.com",
            "first_name": "María",
            "last_name": "González",
            "telefono": "351-345-6789",
            "descripcion": "Madre de familia buscando cuidado especializado para mi hijo de 25 años con discapacidad intelectual. Necesitamos alguien paciente y comprensivo.",
            "descripcion_min": "Cuidado especializado",
            "fecha_nacimiento": now.date() - timedelta(days=55*365),
            "tipos": [tipos_cliente[2]]
        },
        {
            "username": "roberto_silva",
            "email": "roberto.silva@email.com",
            "first_name": "Roberto",
            "last_name": "Silva",
            "telefono": "351-456-7890",
            "descripcion": "Hombre de 82 años con diagnóstico de Alzheimer en etapa temprana. Busco cuidador con experiencia en demencia.",
            "descripcion_min": "Cuidado para demencia",
            "fecha_nacimiento": now.date() - timedelta(days=82*365),
            "tipos": [tipos_cliente[0], tipos_cliente[7]]
        }
    ]

    cuidadores_data = [
        {
            "username": "patricia_lopez",
            "email": "patricia.lopez@email.com",
            "first_name": "Patricia",
            "last_name": "López",
            "telefono": "351-567-8901",
            "descripcion": "Enfermera profesional con 8 años de experiencia en cuidados domiciliarios. Especializada en adultos mayores y cuidados paliativos.",
            "descripcion_min": "Enfermera especializada",
            "fecha_nacimiento": now.date() - timedelta(days=35*365),
            "anios_experiencia": 8,
            "tipos": [tipos_cliente[0], tipos_cliente[4], tipos_cliente[5]]
        },
        {
            "username": "jorge_mendez",
            "email": "jorge.mendez@email.com",
            "first_name": "Jorge",
            "last_name": "Méndez",
            "telefono": "351-678-9012",
            "descripcion": "Técnico en rehabilitación con 6 años de experiencia. Especializado en recuperación post-operatoria y discapacidad motriz.",
            "descripcion_min": "Especialista en rehabilitación",
            "fecha_nacimiento": now.date() - timedelta(days=42*365),
            "anios_experiencia": 6,
            "tipos": [tipos_cliente[1], tipos_cliente[3], tipos_cliente[6]]
        },
        {
            "username": "silvia_fernandez",
            "email": "silvia.fernandez@email.com",
            "first_name": "Silvia",
            "last_name": "Fernández",
            "telefono": "351-789-0123",
            "descripcion": "Psicóloga especializada en discapacidad intelectual con 10 años de experiencia. Trabajo con familias y personas con necesidades especiales.",
            "descripcion_min": "Psicóloga especializada",
            "fecha_nacimiento": now.date() - timedelta(days=38*365),
            "anios_experiencia": 10,
            "tipos": [tipos_cliente[2], tipos_cliente[7]]
        },
        {
            "username": "miguel_torres",
            "email": "miguel.torres@email.com",
            "first_name": "Miguel",
            "last_name": "Torres",
            "telefono": "351-890-1234",
            "descripcion": "Auxiliar de enfermería con 5 años de experiencia en geriatría. Especializado en cuidados de adultos mayores y acompañamiento médico.",
            "descripcion_min": "Auxiliar especializado",
            "fecha_nacimiento": now.date() - timedelta(days=29*365),
            "anios_experiencia": 5,
            "tipos": [tipos_cliente[0], tipos_cliente[4]]
        }
    ]

    usuarios_clientes = []
    usuarios_cuidadores = []
    
    for i, cliente_data in enumerate(clientes_data):
        user = get_or_create_user(
            cliente_data["username"],
            cliente_data["email"],
            cliente_data["first_name"],
            cliente_data["last_name"],
            direcciones[i],
            cliente_data["telefono"],
            cliente_data["descripcion"],
            cliente_data["descripcion_min"],
            "Cliente123!",
            cliente_data["fecha_nacimiento"]
        )
        attach_cliente(user, cliente_data["tipos"])
        usuarios_clientes.append(user)
    
    for i, cuidador_data in enumerate(cuidadores_data):
        user = get_or_create_user(
            cuidador_data["username"],
            cuidador_data["email"],
            cuidador_data["first_name"],
            cuidador_data["last_name"],
            direcciones[i+4],
            cuidador_data["telefono"],
            cuidador_data["descripcion"],
            cuidador_data["descripcion_min"],
            "Cuidador123!",
            cuidador_data["fecha_nacimiento"]
        )
        attach_cuidador(user, cuidador_data["tipos"], cuidador_data["anios_experiencia"])
        usuarios_cuidadores.append(user)

    servicios_data = [
        {
            "cliente": usuarios_clientes[0],
            "cuidador": usuarios_cuidadores[0],
            "fecha_inicio": now - timedelta(days=30),
            "fecha_fin": now - timedelta(days=29),
            "aceptado": True,
            "descripcion": "Acompañamiento diario para toma de medicación y paseos cortos. Ana necesita ayuda con su diabetes y movilidad reducida.",
            "horas_dia": "Mañana",
            "dias": [dias[0], dias[2], dias[4]]
        },
        {
            "cliente": usuarios_clientes[0],
            "cuidador": usuarios_cuidadores[0],
            "fecha_inicio": now - timedelta(days=15),
            "fecha_fin": now - timedelta(days=14),
            "aceptado": True,
            "descripcion": "Acompañamiento a consulta médica y ayuda con ejercicios de fisioterapia.",
            "horas_dia": "Tarde",
            "dias": [dias[1]]
        },
        {
            "cliente": usuarios_clientes[1],
            "cuidador": usuarios_cuidadores[1],
            "fecha_inicio": now - timedelta(days=25),
            "fecha_fin": now - timedelta(days=24),
            "aceptado": True,
            "descripcion": "Sesión de rehabilitación post-cirugía de cadera. Ejercicios de movilidad y fortalecimiento.",
            "horas_dia": "Mañana",
            "dias": [dias[0], dias[3], dias[5]]
        },
        {
            "cliente": usuarios_clientes[1],
            "cuidador": usuarios_cuidadores[1],
            "fecha_inicio": now - timedelta(days=10),
            "fecha_fin": now - timedelta(days=9),
            "aceptado": True,
            "descripcion": "Continuación del tratamiento de rehabilitación. Progreso notable en la movilidad.",
            "horas_dia": "Tarde",
            "dias": [dias[2], dias[4]]
        },
        {
            "cliente": usuarios_clientes[2],
            "cuidador": usuarios_cuidadores[2],
            "fecha_inicio": now - timedelta(days=20),
            "fecha_fin": now - timedelta(days=19),
            "aceptado": True,
            "descripcion": "Sesión de apoyo psicológico y actividades recreativas para mi hijo. Silvia es muy paciente y comprensiva.",
            "horas_dia": "Tarde",
            "dias": [dias[1], dias[3], dias[6]]
        },
        {
            "cliente": usuarios_clientes[3],
            "cuidador": usuarios_cuidadores[3],
            "fecha_inicio": now - timedelta(days=18),
            "fecha_fin": now - timedelta(days=17),
            "aceptado": True,
            "descripcion": "Cuidado especializado para persona con Alzheimer. Miguel tiene experiencia en demencia y es muy cuidadoso.",
            "horas_dia": "Todo el dia",
            "dias": [dias[0], dias[1], dias[2], dias[3], dias[4]]
        },
        {
            "cliente": usuarios_clientes[0],
            "cuidador": usuarios_cuidadores[0],
            "fecha_inicio": now + timedelta(days=2),
            "fecha_fin": now + timedelta(days=3),
            "aceptado": False,
            "descripcion": "Evaluación inicial para nuevo plan de cuidados domiciliarios.",
            "horas_dia": "Mañana",
            "dias": [dias[0]]
        },
        {
            "cliente": usuarios_clientes[1],
            "cuidador": usuarios_cuidadores[1],
            "fecha_inicio": now + timedelta(days=5),
            "fecha_fin": now + timedelta(days=6),
            "aceptado": False,
            "descripcion": "Seguimiento de rehabilitación y evaluación de progreso.",
            "horas_dia": "Tarde",
            "dias": [dias[3]]
        }
    ]

    servicios_creados = []
    for servicio_data in servicios_data:
        servicio = mk_servicio(
            servicio_data["cliente"],
            servicio_data["cuidador"],
            servicio_data["fecha_inicio"],
            servicio_data["fecha_fin"],
            servicio_data["aceptado"],
            servicio_data["descripcion"],
            servicio_data["dias"],
            servicio_data["horas_dia"]
        )
        servicios_creados.append(servicio)

    calificaciones_data = [
        {
            "servicio": servicios_creados[0],
            "autor": usuarios_clientes[0],
            "receptor": usuarios_cuidadores[0],
            "puntuacion": 5,
            "comentario": "Patricia es una excelente profesional. Muy cuidadosa con mi medicación y siempre puntual. La recomiendo totalmente."
        },
        {
            "servicio": servicios_creados[1],
            "autor": usuarios_clientes[0],
            "receptor": usuarios_cuidadores[0],
            "puntuacion": 5,
            "comentario": "Excelente acompañamiento al médico. Patricia me ayudó mucho y me hizo sentir segura durante toda la consulta."
        },
        {
            "servicio": servicios_creados[0],
            "autor": usuarios_cuidadores[0],
            "receptor": usuarios_clientes[0],
            "puntuacion": 5,
            "comentario": "Ana es una señora muy amable y colaborativa. Sigue todas las indicaciones médicas correctamente."
        },
        {
            "servicio": servicios_creados[2],
            "autor": usuarios_clientes[1],
            "receptor": usuarios_cuidadores[1],
            "puntuacion": 4,
            "comentario": "Jorge es muy profesional en rehabilitación. Me ayudó mucho con mi recuperación post-cirugía."
        },
        {
            "servicio": servicios_creados[3],
            "autor": usuarios_clientes[1],
            "receptor": usuarios_cuidadores[1],
            "puntuacion": 5,
            "comentario": "Excelente progreso gracias a Jorge. Muy recomendable para rehabilitación."
        },
        {
            "servicio": servicios_creados[2],
            "autor": usuarios_cuidadores[1],
            "receptor": usuarios_clientes[1],
            "puntuacion": 4,
            "comentario": "Carlos es muy comprometido con su rehabilitación. Buen paciente para trabajar."
        },
        {
            "servicio": servicios_creados[4],
            "autor": usuarios_clientes[2],
            "receptor": usuarios_cuidadores[2],
            "puntuacion": 5,
            "comentario": "Silvia es increíble con mi hijo. Tiene mucha paciencia y experiencia. Mi hijo la adora."
        },
        {
            "servicio": servicios_creados[4],
            "autor": usuarios_cuidadores[2],
            "receptor": usuarios_clientes[2],
            "puntuacion": 5,
            "comentario": "María es una madre muy comprensiva y colaborativa. Su hijo es un encanto."
        },
        {
            "servicio": servicios_creados[5],
            "autor": usuarios_clientes[3],
            "receptor": usuarios_cuidadores[3],
            "puntuacion": 4,
            "comentario": "Miguel es muy cuidadoso y paciente. Entiende bien las necesidades de personas con Alzheimer."
        },
        {
            "servicio": servicios_creados[5],
            "autor": usuarios_cuidadores[3],
            "receptor": usuarios_clientes[3],
            "puntuacion": 4,
            "comentario": "Roberto es una persona muy amable. Aunque tiene Alzheimer, es colaborativo y respetuoso."
        }
    ]

    for calificacion_data in calificaciones_data:
        rate(
            calificacion_data["servicio"],
            calificacion_data["autor"],
            calificacion_data["receptor"],
            calificacion_data["puntuacion"],
            calificacion_data["comentario"]
        )

    conversaciones_data = [
        {
            "cliente": usuarios_clientes[0],
            "cuidador": usuarios_cuidadores[0],
            "messages": [
                {
                    "emisor": usuarios_clientes[0],
                    "contenido": "Hola Patricia, gracias por aceptar mi solicitud. ¿Podrías venir mañana a las 9 AM?"
                },
                {
                    "emisor": usuarios_cuidadores[0],
                    "contenido": "Hola Ana, por supuesto. Mañana a las 9 AM estaré ahí. ¿Necesitas que traiga algo especial?"
                },
                {
                    "emisor": usuarios_clientes[0],
                    "contenido": "Solo necesito ayuda con mi medicación de la mañana. Gracias por tu profesionalismo."
                },
                {
                    "emisor": usuarios_cuidadores[0],
                    "contenido": "Perfecto, Ana. Nos vemos mañana. Que tengas una buena noche."
                }
            ]
        },
        {
            "cliente": usuarios_clientes[1],
            "cuidador": usuarios_cuidadores[1],
            "messages": [
                {
                    "emisor": usuarios_clientes[1],
                    "contenido": "Jorge, ¿cómo va mi progreso con la rehabilitación?"
                },
                {
                    "emisor": usuarios_cuidadores[1],
                    "contenido": "Hola Carlos, muy bien! Has mejorado mucho la movilidad de la cadera. Seguimos con los ejercicios."
                },
                {
                    "emisor": usuarios_clientes[1],
                    "contenido": "Excelente, gracias por tu dedicación. ¿Cuándo es la próxima sesión?"
                },
                {
                    "emisor": usuarios_cuidadores[1],
                    "contenido": "El jueves a las 3 PM. Te confirmo mañana."
                }
            ]
        },
        {
            "cliente": usuarios_clientes[2],
            "cuidador": usuarios_cuidadores[2],
            "messages": [
                {
                    "emisor": usuarios_clientes[2],
                    "contenido": "Silvia, mi hijo está muy contento con las actividades que haces. ¿Podrías venir más seguido?"
                },
                {
                    "emisor": usuarios_cuidadores[2],
                    "contenido": "Me alegra mucho saberlo! Tu hijo es muy especial. Podemos coordinar más sesiones."
                },
                {
                    "emisor": usuarios_clientes[2],
                    "contenido": "Perfecto, te escribo para coordinar los horarios."
                }
            ]
        }
    ]

    for conversacion_data in conversaciones_data:
        create_conversation_and_messages(
            conversacion_data["cliente"],
            conversacion_data["cuidador"],
            conversacion_data["messages"]
        )

    experiencias_data = [
        {
            "cuidador": usuarios_cuidadores[0],
            "descripcion": "Enfermera en Hospital Privado de Córdoba - Unidad de Geriatría (2018-2022)",
            "fecha_inicio": now - timedelta(days=5*365),
            "fecha_fin": now - timedelta(days=1*365)
        },
        {
            "cuidador": usuarios_cuidadores[0],
            "descripcion": "Cuidados Domiciliarios Especializados - Empresa Privada (2022-actualidad)",
            "fecha_inicio": now - timedelta(days=2*365),
            "fecha_fin": now
        },
        {
            "cuidador": usuarios_cuidadores[1],
            "descripcion": "Centro de Rehabilitación Física - Rosario (2019-2023)",
            "fecha_inicio": now - timedelta(days=4*365),
            "fecha_fin": now - timedelta(days=1*365)
        },
        {
            "cuidador": usuarios_cuidadores[1],
            "descripcion": "Consultorio Privado de Fisioterapia (2023-actualidad)",
            "fecha_inicio": now - timedelta(days=1*365),
            "fecha_fin": now
        },
        {
            "cuidador": usuarios_cuidadores[2],
            "descripcion": "Centro de Atención Integral para Personas con Discapacidad (2015-2020)",
            "fecha_inicio": now - timedelta(days=8*365),
            "fecha_fin": now - timedelta(days=3*365)
        },
        {
            "cuidador": usuarios_cuidadores[2],
            "descripcion": "Práctica Privada de Psicología Especializada (2020-actualidad)",
            "fecha_inicio": now - timedelta(days=4*365),
            "fecha_fin": now
        },
        {
            "cuidador": usuarios_cuidadores[3],
            "descripcion": "Residencia Geriátrica San José - Villa Carlos Paz (2020-2023)",
            "fecha_inicio": now - timedelta(days=3*365),
            "fecha_fin": now - timedelta(days=1*365)
        },
        {
            "cuidador": usuarios_cuidadores[3],
            "descripcion": "Servicio de Cuidados Domiciliarios (2023-actualidad)",
            "fecha_inicio": now - timedelta(days=1*365),
            "fecha_fin": now
        }
    ]

    for experiencia_data in experiencias_data:
        Experiencia.objects.get_or_create(
            cuidador=experiencia_data["cuidador"],
            descripcion=experiencia_data["descripcion"],
            fecha_inicio=experiencia_data["fecha_inicio"],
            fecha_fin=experiencia_data["fecha_fin"]
        )

    certificaciones_data = [
        {
            "cuidador": usuarios_cuidadores[0],
            "archivo": "cert_patricia_enfermeria.pdf",
            "nombre": "Licenciatura en Enfermería - Universidad Nacional de Córdoba"
        },
        {
            "cuidador": usuarios_cuidadores[0],
            "archivo": "cert_patricia_geriatria.pdf",
            "nombre": "Especialización en Cuidados Geriátricos"
        },
        {
            "cuidador": usuarios_cuidadores[1],
            "archivo": "cert_jorge_fisioterapia.pdf",
            "nombre": "Técnico Superior en Fisioterapia y Rehabilitación"
        },
        {
            "cuidador": usuarios_cuidadores[1],
            "archivo": "cert_jorge_rehabilitacion.pdf",
            "nombre": "Curso de Rehabilitación Post-Quirúrgica"
        },
        {
            "cuidador": usuarios_cuidadores[2],
            "archivo": "cert_silvia_psicologia.pdf",
            "nombre": "Licenciatura en Psicología - Universidad Nacional de Rosario"
        },
        {
            "cuidador": usuarios_cuidadores[2],
            "archivo": "cert_silvia_discapacidad.pdf",
            "nombre": "Especialización en Discapacidad Intelectual"
        },
        {
            "cuidador": usuarios_cuidadores[3],
            "archivo": "cert_miguel_auxiliar.pdf",
            "nombre": "Auxiliar de Enfermería - Instituto Técnico"
        },
        {
            "cuidador": usuarios_cuidadores[3],
            "archivo": "cert_miguel_alzheimer.pdf",
            "nombre": "Curso de Cuidados para Personas con Alzheimer"
        }
    ]

    for cert_data in certificaciones_data:
        mk_certificacion(
            cert_data["cuidador"],
            cert_data["archivo"],
            cert_data["nombre"]
        )

    print("✅ Datos realistas creados con éxito!")
    print(f"   👥 Clientes creados: {len(usuarios_clientes)}")
    print(f"   👨‍⚕️ Cuidadores creados: {len(usuarios_cuidadores)}")
    print(f"   🏥 Servicios creados: {Servicio.objects.count()}")
    print(f"   ⭐ Calificaciones creadas: {Calificacion.objects.count()}")
    print(f"   💬 Conversaciones creadas: {Conversacion.objects.count()}")
    print(f"   📝 Mensajes creados: {Mensaje.objects.count()}")
    print(f"   🏆 Experiencias creadas: {Experiencia.objects.count()}")
    print(f"   📜 Certificaciones creadas: {Certificacion.objects.count()}")
    print(f"   🏷️ Tipos de cliente: {TipoCliente.objects.count()}")

if __name__ == "__main__":
    seed()
