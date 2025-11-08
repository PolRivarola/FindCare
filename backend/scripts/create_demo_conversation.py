"""
Seed a demo conversation between `cuidador_demo` and `ana_martinez` with sample
messages so the chat UI has real data to display.

Usage:
    python backend/scripts/create_demo_conversation.py
"""

import os
import sys

import django


def setup_django():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.append(project_root)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()


def main():
    from django.db import transaction
    from django.contrib.auth import get_user_model

    from chat.models import Conversacion, Mensaje

    User = get_user_model()

    try:
        cliente = User.objects.get(username="ana_martinez")
    except User.DoesNotExist:
        print("No se encontró el usuario 'ana_martinez'.")
        return

    try:
        cuidador = User.objects.get(username="cuidador_demo")
    except User.DoesNotExist:
        print("No se encontró el usuario 'cuidador_demo'.")
        return

    if not hasattr(cliente, "cliente") and not hasattr(cuidador, "cliente"):
        print("Al menos uno de los usuarios debe ser cliente para crear la conversación.")
        return

    if not hasattr(cliente, "cuidador") and not hasattr(cuidador, "cuidador"):
        print("Al menos uno de los usuarios debe ser cuidador para crear la conversación.")
        return

    if hasattr(cliente, "cliente"):
        cliente_user = cliente
        cuidador_user = cuidador
    else:
        cliente_user = cuidador
        cuidador_user = cliente

    conversation, _ = Conversacion.objects.get_or_create(
        cliente=cliente_user,
        cuidador=cuidador_user,
    )

    Mensaje.objects.filter(conversacion=conversation).delete()

    messages = [
        "Hola! Gracias por responder a mi solicitud, me gustaría coordinar una reunión.",
        "Hola Ana, con gusto. ¿Qué día te gustaría que nos reunamos?",
        "¿Podría ser el jueves por la tarde?",
        "El jueves a las 16hs me queda perfecto.",
        "Genial, muchas gracias. ¿Puedes traer referencias impresas?",
        "Claro, llevaré referencias y la lista de servicios que puedo ofrecer.",
        "Perfecto. ¿El punto de encuentro sigue siendo tu domicilio?",
        "Sí, te espero en mi casa. Te pasaré la dirección exacta más tarde.",
        "De acuerdo, quedo atento. ¿Necesitas que lleve algún documento adicional?",
        "Si puedes traer una copia de tu DNI estaría bien.",
        "Listo, la prepararé. ¿Algún requisito de vestimenta?",
        "Algo cómodo está bien, será una charla informal.",
        "Perfecto, muchas gracias.",
        "Gracias a vos. Nos vemos el jueves entonces.",
        "Hasta luego, buena semana.",
        "Igualmente, cualquier cosa me escribes por aquí.",
        "De acuerdo, gracias nuevamente.",
    ]

    autores = [cliente_user, cuidador_user]

    with transaction.atomic():
        for index, texto in enumerate(messages):
            Mensaje.objects.create(
                conversacion=conversation,
                emisor=autores[index % 2],
                contenido=texto,
            )

    print(
        f"Conversación entre '{cliente_user.username}' y "
        f"'{cuidador_user.username}' inicializada con {len(messages)} mensajes."
    )


if __name__ == "__main__":
    setup_django()
    main()
