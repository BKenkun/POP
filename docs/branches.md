# Gestión de Ramas

La estrategia de control de versiones se basa en una estructura orientada a entornos de desarrollo y producción mediante las ramas principales:

- `develop` → Rama de integración y pruebas.
- `main` → Rama estable correspondiente a producción.

Para cada nueva funcionalidad, mejora o corrección, se crean ramas secundarias siguiendo una nomenclatura descriptiva en formato *kebab-case*, por ejemplo:

```bash
api-keys-env-cleanup