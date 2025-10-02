# Cómo Usar esta Carpeta para las Imágenes de tus Productos

Esta carpeta (`public/images`) es el lugar centralizado para guardar todas las imágenes de tus productos (principales, de galería, etc.).

## ¿Cómo funciona?

Cualquier archivo que coloques aquí estará disponible públicamente a través de la URL de tu sitio web.

Next.js y Firebase Hosting sirven automáticamente todo el contenido de la carpeta `public` desde la raíz de tu dominio.

## Pasos para Añadir y Usar una Nueva Imagen

1.  **Arrastra tu imagen a esta carpeta**: Simplemente arrastra y suelta los archivos de imagen de tu producto (ej. `mi-nuevo-popper.jpg`) en esta carpeta `public/images/` desde el explorador de archivos.

2.  **Construye la URL**: La URL que usarás en Stripe (o en cualquier otro lugar) será siempre:
    `/images/NOMBRE_DEL_ARCHIVO`

    **Ejemplos:**
    *   Si subes `rush-gold.png`, la URL será `/images/rush-gold.png`.
    *   Si creas una subcarpeta para organizar, como `public/images/accesorios/` y subes `inhalador.jpg`, la URL será `/images/accesorios/inhalador.jpg`.

3.  **Pégala en Stripe**: Copia esta URL y pégala en el campo de la imagen principal del producto en tu panel de Stripe, o en los metadatos `gallery_images` separadas por comas.

¡Y listo! No necesitas hacer nada más. La imagen se servirá automáticamente a través de tu dominio.
