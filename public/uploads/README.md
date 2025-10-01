# Cómo añadir tus propias imágenes

Esta carpeta (`public/uploads`) es tu espacio para añadir imágenes personalizadas a tu proyecto.

## ¿Cómo funciona?

Cualquier archivo que coloques aquí estará disponible públicamente a través de una URL simple. Next.js sirve automáticamente los archivos de la carpeta `public` desde la raíz de tu sitio web.

## Pasos para usar tus imágenes

1.  **Añade tus imágenes a esta carpeta**:
    Arrastra y suelta tus archivos de imagen (JPG, PNG, WEBP, etc.) directamente en esta carpeta `uploads` usando el explorador de archivos de tu entorno de desarrollo. También puedes crear subcarpetas para organizar tus archivos.

2.  **Obtén la URL de la imagen**:
    La URL de tu imagen será siempre `/uploads/` seguido del nombre del archivo (o la ruta si usas subcarpetas).

    **Ejemplos:**

    *   Si añades un archivo `mi-producto.jpg` aquí, su URL será:
        `/uploads/mi-producto.jpg`

    *   Si creas una subcarpeta `galeria` y dentro pones `imagen1.png`, su URL será:
        `/uploads/galeria/imagen1.png`

3.  **Usa la URL donde la necesites**:
    Puedes usar estas URLs en cualquier parte de tu aplicación o, como preguntabas, en los metadatos de tus productos en Stripe.

    *   **Para la imagen principal de un producto en Stripe**: Pega la URL completa (ej. `https://<tu-dominio>.com/uploads/mi-producto.jpg`).
    *   **Para galerías de imágenes en metadatos de Stripe (campo `gallery_images`)**: Pega las URLs separadas por comas.
        Ej: `/uploads/galeria/imagen1.png, /uploads/galeria/imagen2.png`

¡Y eso es todo! Ahora tienes el control total sobre las imágenes de tus productos.
