# Gestión de API Keys y Variables de Entorno

Para garantizar la seguridad de la información sensible y evitar la exposición de credenciales en el repositorio de GitHub, se utiliza una configuración basada en archivos `.env`, los cuales están incluidos en el `.gitignore` para impedir su subida al control de versiones.

Estos archivos contienen datos críticos necesarios para la ejecución de la aplicación, como claves API, credenciales y configuraciones específicas del entorno. Por este motivo, si no se dispone de los archivos `.env` en el entorno local, la aplicación no podrá ejecutarse correctamente debido a la ausencia de dichas variables sensibles.

Se gestionan dos archivos diferenciados según el entorno de trabajo:

- `.env.dev` → Configuración específica para desarrollo.
- `.env.prod` → Configuración específica para producción.

Esta separación permite mantener configuraciones independientes y adaptadas a cada entorno, facilitando tanto el desarrollo como el despliegue seguro de la aplicación.
