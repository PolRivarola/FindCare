# FindCare

Este proyecto consistió en el desarrollo de una plataforma web orientada a facilitar la vinculación entre familiares de personas con capacidades limitadas y cuidadores domiciliarios capacitados.

---

## Tecnologías

* **Backend:**
    * **Django:** Un framework web de alto nivel en Python que fomenta el desarrollo rápido y un diseño limpio y pragmático. Impulsa la sólida API y la lógica de negocio de FindCare.
* **Frontend:**
    * **React:** Una biblioteca de JavaScript declarativa, eficiente y flexible para construir interfaces de usuario.
    * **Tailwind CSS:** Un framework CSS "utility-first" para construir rápidamente diseños personalizados.
* **Base de Datos:**
    * **PostgreSQL:** Un potente sistema de base de datos relacional de objetos de código abierto, conocido por su fiabilidad, robustez de características y rendimiento. Está alojado en Render.

---

## Despliegue

FindCare está desplegado en plataformas líderes en la nube:

* **Despliegue del Backend:**
    * El backend de Django está desplegado en Render, proporcionando un entorno escalable y eficiente para nuestra API.

* **Despliegue del Frontend:**
    * El frontend de React está desplegado en Vercel, aprovechando su red de entrega de contenido (CDN) rápida para una experiencia de usuario ágil.

---

## Instalación y Configuración

### Prerrequisitos

* Python 3.12
* Node.js 22.16
* Git

### Configuración del Backend

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/PolRivarola/FindCare.git](https://github.com/PolRivarola/FindCare.git)
    cd /backend 
    ```
2.  **Crea y activa un entorno virtual:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
3.  **Instala las dependencias:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configura las Variables de Entorno:**
    Crea un archivo `.env` en la raíz de tu directorio de backend y añade tus credenciales de base de datos y otra información sensible.
    ```
    
    DATABASE_URL=postgres://usuario:contraseña@host:puerto/nombre_base_datos
    SECRET_KEY=tu_clave_secreta_django
    
    ```
5.  **Ejecuta las migraciones:**
    ```bash
    python manage.py migrate
    ```
6.  **Inicia el servidor del backend:**
    ```bash
    python manage.py runserver
    ```

### Configuración del Frontend

1.  **Navega al directorio del frontend:**
    ```bash
    cd /frontend
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura las Variables de Entorno:**
    Crea un archivo `.env` en la raíz de tu directorio de frontend y añade la URL de tu API de backend.
    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/
    ```
4.  **Inicia el servidor de desarrollo del frontend:**
    ```bash
    npm start
    ```

---
## Demo
https://drive.google.com/file/d/1YDCdWcXtb111rnsGAc9qyA7XOPu-uk5C/view?usp=sharing
