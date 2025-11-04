from django.utils.text import slugify
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

def generate_username(first_name: str, last_name: str, fecha_nac=None):
    """
    Genera un username único en formato: firstname.lastname.YYYYMMDD
    Si existe duplicado, agrega sufijo numérico: -1, -2, etc.
    """
    if isinstance(fecha_nac, str):
        try:
            from datetime import datetime
            fecha_nac = datetime.fromisoformat(fecha_nac).date()
        except Exception:
            fecha_nac = None
    
    ymd = fecha_nac.strftime("%Y%m%d") if fecha_nac and isinstance(fecha_nac, date) else "00000000"
    base = slugify(f"{first_name}.{last_name}.{ymd}") or "user"
    candidate = base
    i = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f"{base}-{i}"
        i += 1
    return candidate

