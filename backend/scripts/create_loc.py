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

# -------------------------
# Helpers
# -------------------------

def get_or_create_user(username, email, first_name, last_name, direccion, telefono, desc, desc_min, password):
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

def mk_servicio(cliente, cuidador, start, end, aceptado, desc, dias):
    s = Servicio.objects.create(
        cliente=cliente,
        receptor=cuidador,
        fecha_inicio=start,
        fecha_fin=end,
        descripcion=desc,
        horas_dia="4",
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
    slots = ["Mañana", "Tarde", "Noche"]
    return [HorarioDiario.objects.get_or_create(nombre=s)[0] for s in slots]

def mk_certificacion(cuidador, nombre_archivo, nombre_label):
    archivo = f"certificaciones/{nombre_archivo}"
    return Certificacion.objects.create(
        cuidador=cuidador,
        nombre=nombre_label,
        archivo=archivo
    )

# -------------------------
# MAIN SEED FUNCTION
# -------------------------

def seed():
    print("🚀 Creando datos dummy...")

    # Base geográfica mínima
    prov, _ = Provincia.objects.get_or_create(nombre="Córdoba")
    cba, _ = Ciudad.objects.get_or_create(nombre="Córdoba", provincia=prov)
    dir1, _ = Direccion.objects.get_or_create(direccion="Av. Siempre Viva 742", ciudad=cba)
    dir2, _ = Direccion.objects.get_or_create(direccion="Av. Colón 1000", ciudad=cba)
    dir3, _ = Direccion.objects.get_or_create(direccion="Bv. San Juan 123", ciudad=cba)
    dir4, _ = Direccion.objects.get_or_create(direccion="Av. Sabattini 2500", ciudad=cba)

    # Tipos cliente
    tc1, _ = TipoCliente.objects.get_or_create(nombre="Edad avanzada")
    tc2, _ = TipoCliente.objects.get_or_create(nombre="Discapacidad motriz")
    tc3, _ = TipoCliente.objects.get_or_create(nombre="Discapacidad intelectual")

    # Días y horarios
    dias = ensure_days()
    ensure_horarios()

    # Usuarios
    cliente1 = get_or_create_user("cliente_demo", "cliente@test.com", "Ana", "Pérez", dir1, "351-555-0001",
                                  "Busco acompañamiento diario", "Acompañamiento", "Cliente123!")
    cliente2 = get_or_create_user("cliente_demo2", "cliente2@test.com", "Laura", "García", dir3, "351-555-0011",
                                  "Asistencia post-operatoria", "Post-op", "Cliente123!")
    cuidador1 = get_or_create_user("cuidador_demo", "cuidador@test.com", "Pedro", "Gómez", dir2, "351-555-0002",
                                   "Experiencia en movilidad", "Movilidad", "Cuidador123!")
    cuidador2 = get_or_create_user("cuidador_demo2", "cuidador2@test.com", "María", "López", dir4, "351-555-0022",
                                   "Adultos mayores y rehabilitación", "Adultos mayores", "Cuidador123!")

    # Perfiles
    attach_cliente(cliente1, [tc1, tc2])
    attach_cliente(cliente2, [tc2, tc3])
    attach_cuidador(cuidador1, [tc1], anios=5)
    attach_cuidador(cuidador2, [tc1, tc3], anios=7)

    now = timezone.now()

    # Servicios cliente1 ↔ cuidador1
    s1 = mk_servicio(cliente1, cuidador1, now - timedelta(days=15), now - timedelta(days=14, hours=-2), True,
                     "Acompañamiento en domicilio; movilidad reducida.", dias)
    rate(s1, autor=cliente1, receptor=cuidador1, puntuacion=5, comentario="Excelente atención y puntualidad.")
    rate(s1, autor=cuidador1, receptor=cliente1, puntuacion=5, comentario="Paciente y familia muy amables.")

    s2 = mk_servicio(cliente1, cuidador1, now - timedelta(days=7), now - timedelta(days=6, hours=-3), True,
                     "Control de medicación y caminatas.", dias)
    rate(s2, autor=cuidador1, receptor=cliente1, puntuacion=4, comentario="Todo en orden; podríamos ajustar horarios.")

    mk_servicio(cliente1, cuidador1, now - timedelta(hours=2), now + timedelta(hours=4), True,
                "Turno de media jornada.", dias)
    mk_servicio(cliente1, cuidador1, now + timedelta(days=2), now + timedelta(days=2, hours=6), True,
                "Acompañamiento a control médico.", dias)
    mk_servicio(cliente1, cuidador1, now + timedelta(days=5), now + timedelta(days=5, hours=4), False,
                "Visita de evaluación inicial.", dias)

    # Servicios cliente2 ↔ cuidador2
    t1 = mk_servicio(cliente2, cuidador2, now - timedelta(days=20), now - timedelta(days=19, hours=-1), True,
                     "Asistencia post-operatoria; control de signos vitales.", dias)
    rate(t1, autor=cliente2, receptor=cuidador2, puntuacion=3, comentario="Correcto; mejorar puntualidad.")

    mk_servicio(cliente2, cuidador2, now - timedelta(days=3), now - timedelta(days=2, hours=-3), True,
                "Acompañamiento para rehabilitación.", dias)
    mk_servicio(cliente2, cuidador2, now - timedelta(hours=1), now + timedelta(hours=5), True,
                "Turno diurno.", dias)
    mk_servicio(cliente2, cuidador2, now + timedelta(days=1), now + timedelta(days=1, hours=4), False,
                "Evaluación inicial.", dias)

    # Experiencias y certificaciones
    Experiencia.objects.get_or_create(
        cuidador=cuidador1,
        descripcion="Residencia geriátrica - 2 años",
        fecha_inicio=now - timedelta(days=800),
        fecha_fin=now - timedelta(days=100)
    )
    Experiencia.objects.get_or_create(
        cuidador=cuidador2,
        descripcion="Asistencia domiciliaria - 3 años",
        fecha_inicio=now - timedelta(days=1200),
        fecha_fin=now - timedelta(days=200)
    )

    mk_certificacion(cuidador1, "cert_pedro.txt", "Auxiliar de Enfermería")
    mk_certificacion(cuidador2, "cert_maria.txt", "Cuidado Adultos Mayores")

    print("✅ Datos de prueba creados con éxito.")
    print("   Total Servicios:", Servicio.objects.count())
    print("   Total Calificaciones:", Calificacion.objects.count())

if __name__ == "__main__":
    seed()
