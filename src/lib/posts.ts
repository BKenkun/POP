export interface Comment {
    id: string;
    author: string;
    content: string;
    date: string;
  }
  
  export interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    date: string;
    comments: Comment[];
  }
  
  export const posts: Post[] = [
    {
      id: 'post_001',
      slug: 'guia-definitiva-poppers',
      title: 'La Guía Definitiva Sobre los Poppers',
      excerpt: 'Todo lo que necesitas saber sobre qué son los poppers, sus efectos, y cómo usarlos de forma segura. Descubre los diferentes tipos y encuentra el que mejor se adapta a ti.',
      content: `
        <p>Los poppers, también conocidos como nitritos de alquilo, son sustancias químicas que se inhalan para obtener una serie de efectos recreativos. En esta guía completa, exploraremos todo lo que necesitas saber sobre ellos.</p>
        <h3 class="font-bold text-xl my-4">¿Qué son exactamente?</h3>
        <p>Originalmente utilizados en medicina para tratar afecciones cardíacas, los poppers se popularizaron en la cultura de club por sus efectos de euforia y relajación muscular. Se presentan en pequeñas botellas de vidrio y su líquido se evapora rápidamente al abrirse, permitiendo su inhalación.</p>
        <h3 class="font-bold text-xl my-4">Efectos Comunes</h3>
        <ul>
            <li>Sensación de calor y euforia intensa pero breve.</li>
            <li>Relajación de los músculos lisos, incluyendo los del ano y la vagina.</li>
            <li>Aumento del ritmo cardíaco y posible descenso de la presión arterial.</li>
            <li>Mareos o dolores de cabeza en algunos usuarios.</li>
        </ul>
        <h3 class="font-bold text-xl my-4">Consejos de Uso Seguro</h3>
        <p>Es crucial usar los poppers con responsabilidad. Nunca ingieras el líquido y evita el contacto directo con la piel. Úsalos en un área bien ventilada y nunca los combines con medicamentos para la disfunción eréctil como la Viagra, ya que puede causar una caída peligrosa de la presión arterial.</p>
      `,
      imageUrl: 'https://picsum.photos/800/400?random=10',
      author: 'El equipo de Popper España',
      date: '2024-07-20T10:00:00Z',
      comments: [
        { id: 'c1', author: 'Carlos G.', content: '¡Muy informativo! Gracias por la guía.', date: '2024-07-21T12:00:00Z' },
        { id: 'c2', author: 'Ana M.', content: 'No tenía idea de los riesgos con otros medicamentos. ¡Buen aviso!', date: '2024-07-21T14:30:00Z' },
      ],
    },
    {
      id: 'post_002',
      slug: 'diferencias-tipos-popper',
      title: 'Rush vs. Gold Rush: ¿Cuál es la Diferencia?',
      excerpt: 'Analizamos dos de las marcas más populares del mercado. Compara sus ingredientes, potencia y efectos para decidir cuál es el mejor para tu próxima experiencia.',
      content: `
        <p>Rush y Gold Rush son dos de los nombres más reconocidos en el mundo de los poppers, pero ¿en qué se diferencian? Aunque ambos pertenecen a la misma familia de productos, sus formulaciones y efectos pueden variar.</p>
        <h3 class="font-bold text-xl my-4">Rush Original</h3>
        <p>El Rush Original es a menudo considerado el estándar de la industria. Su fórmula a base de nitrito de isopropilo proporciona un efecto rápido y potente, ideal para quienes buscan una sensación clásica e intensa. Es conocido por su fiabilidad y consistencia.</p>
        <h3 class="font-bold text-xl my-4">Gold Rush</h3>
        <p>Gold Rush, por otro lado, a menudo presenta una mezcla de nitritos que puede incluir isopropilo y otros compuestos para refinar la experiencia. Muchos usuarios describen sus efectos como más suaves y duraderos, con un aroma a menudo percibido como menos áspero que otras variedades. Es una opción premium para quienes buscan una experiencia más sofisticada.</p>
        <h3 class="font-bold text-xl my-4">Conclusión</h3>
        <p>La elección entre Rush y Gold Rush depende de tus preferencias personales. Si buscas un golpe rápido y fuerte, el Rush clásico puede ser tu mejor opción. Si prefieres una subida más gradual y una experiencia más refinada, Gold Rush podría ser el indicado.</p>
      `,
      imageUrl: 'https://picsum.photos/800/400?random=11',
      author: 'Dr. Popper',
      date: '2024-07-15T09:00:00Z',
      comments: [],
    },
  ];
  