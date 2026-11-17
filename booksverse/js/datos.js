/*
 * datos.js — Datos de ejemplo de ByBook (catálogo, autores, sagas y lectores).
 *
 * Es la "base de datos" del prototipo: todas las páginas leen de aquí, así una
 * obra tiene siempre el mismo identificador (id) en el catálogo, la ficha, la
 * biblioteca y los perfiles. En el proyecto definitivo esto vendría del servidor.
 *
 * Los lectores, sus lecturas y sus reseñas son INVENTADOS (datos de ejemplo).
 */
(function () {
  'use strict';

  /* ---------- Formatos: cómo se cuenta el progreso de cada uno ---------- */
  const FORMATOS = {
    libro:   { nombre: 'Libro',   plural: 'Libros',   unidad: 'página',   unidades: 'páginas' },
    comic:   { nombre: 'Cómic',   plural: 'Cómics',   unidad: 'número',   unidades: 'números' },
    manga:   { nombre: 'Manga',   plural: 'Manga',    unidad: 'tomo',     unidades: 'tomos' },
    manhwa:  { nombre: 'Manhwa',  plural: 'Manhwa',   unidad: 'capítulo', unidades: 'capítulos' },
    webtoon: { nombre: 'Webtoon', plural: 'Webtoons', unidad: 'episodio', unidades: 'episodios' }
  };

  /* ---------- Autores ---------- */
  const W = 'https://es.wikipedia.org/wiki/';
  const AUTORES = {
    herbert:   { nombre: 'Frank Herbert', orden: 'Herbert', origen: 'EE. UU. · 1920–1986', bio: 'Escritor estadounidense, autor de la saga Dune, una de las más influyentes de la ciencia ficción.', wiki: W + 'Frank_Herbert' },
    tolkien:   { nombre: 'J. R. R. Tolkien', orden: 'Tolkien', origen: 'Reino Unido · 1892–1973', bio: 'Filólogo y escritor, creador de la Tierra Media y padre de la fantasía moderna.', wiki: W + 'J._R._R._Tolkien' },
    martin:    { nombre: 'George R. R. Martin', orden: 'Martin', origen: 'EE. UU. · 1948', bio: 'Autor de Canción de hielo y fuego, la saga que inspiró la serie Juego de tronos.', wiki: W + 'George_R._R._Martin' },
    lewis:     { nombre: 'C. S. Lewis', orden: 'Lewis', origen: 'Reino Unido · 1898–1963', bio: 'Escritor y profesor británico, autor de Las crónicas de Narnia.', wiki: W + 'C._S._Lewis' },
    ruiz:      { nombre: 'Carlos Ruiz Zafón', orden: 'Ruiz Zafón', origen: 'España · 1964–2020', bio: 'Novelista barcelonés, autor de la tetralogía del Cementerio de los Libros Olvidados.', wiki: W + 'Carlos_Ruiz_Zafón' },
    austen:    { nombre: 'Jane Austen', orden: 'Austen', origen: 'Inglaterra · 1775–1817', bio: 'Novelista inglesa conocida por su ironía y sus retratos de la sociedad de su época.', wiki: W + 'Jane_Austen' },
    garcia:    { nombre: 'Gabriel García Márquez', orden: 'García Márquez', origen: 'Colombia · 1927–2014', bio: 'Premio Nobel de Literatura en 1982 y gran figura del realismo mágico.', wiki: W + 'Gabriel_García_Márquez' },
    allende:   { nombre: 'Isabel Allende', orden: 'Allende', origen: 'Chile · 1942', bio: 'Escritora chilena, una de las autoras en español más leídas del mundo.', wiki: W + 'Isabel_Allende' },
    cervantes: { nombre: 'Miguel de Cervantes', orden: 'Cervantes', origen: 'España · 1547–1616', bio: 'Autor de Don Quijote, considerada la primera novela moderna.', wiki: W + 'Miguel_de_Cervantes' },
    orwell:    { nombre: 'George Orwell', orden: 'Orwell', origen: 'Inglaterra · 1903–1950', bio: 'Escritor y periodista británico, autor de dos de las críticas políticas más famosas del siglo XX.', wiki: W + 'George_Orwell' },
    shelley:   { nombre: 'Mary Shelley', orden: 'Shelley', origen: 'Inglaterra · 1797–1851', bio: 'Escritora británica, autora de Frankenstein, considerada una de las primeras novelas de ciencia ficción.', wiki: W + 'Mary_Shelley' },
    saint:     { nombre: 'Antoine de Saint-Exupéry', orden: 'Saint-Exupéry', origen: 'Francia · 1900–1944', bio: 'Escritor y aviador francés, autor de El principito.', wiki: W + 'Antoine_de_Saint-Exupéry' },
    moore:     { nombre: 'Alan Moore', orden: 'Moore', origen: 'Inglaterra · 1953', bio: 'Guionista británico de cómic, autor de Watchmen y V de Vendetta.', wiki: W + 'Alan_Moore' },
    spiegelman:{ nombre: 'Art Spiegelman', orden: 'Spiegelman', origen: 'Suecia / EE. UU. · 1948', bio: 'Dibujante y guionista, ganó el Pulitzer en 1992 con Maus.', wiki: W + 'Art_Spiegelman' },
    satrapi:   { nombre: 'Marjane Satrapi', orden: 'Satrapi', origen: 'Irán / Francia · 1969', bio: 'Historietista y cineasta, autora de la novela gráfica autobiográfica Persépolis.', wiki: W + 'Marjane_Satrapi' },
    oda:       { nombre: 'Eiichiro Oda', orden: 'Oda', origen: 'Japón · 1975', bio: 'Mangaka creador de One Piece, uno de los manga más vendidos de la historia.', wiki: W + 'Eiichirō_Oda' },
    yamada:    { nombre: 'Kanehito Yamada', orden: 'Yamada', origen: 'Japón', bio: 'Guionista de Frieren, dibujado por Tsukasa Abe.', wiki: null },
    miura:     { nombre: 'Kentaro Miura', orden: 'Miura', origen: 'Japón · 1966–2021', bio: 'Mangaka autor de Berserk, referencia de la fantasía oscura.', wiki: W + 'Kentarō_Miura' },
    chugong:   { nombre: 'Chugong', orden: 'Chugong', origen: 'Corea del Sur', bio: 'Autor de la novela web Solo Leveling, adaptada a manhwa y a anime.', wiki: null },
    singshong: { nombre: 'Sing Shong', orden: 'Sing Shong', origen: 'Corea del Sur', bio: 'Nombre del dúo de autores de la novela web Omniscient Reader.', wiki: null },
    smythe:    { nombre: 'Rachel Smythe', orden: 'Smythe', origen: 'Nueva Zelanda', bio: 'Autora del webtoon Lore Olympus, una versión moderna del mito de Hades y Perséfone.', wiki: null },
    siu:       { nombre: 'SIU', orden: 'SIU', origen: 'Corea del Sur', bio: 'Seudónimo del autor de Tower of God, uno de los primeros webtoons de gran éxito.', wiki: null }
  };

  /* ---------- Sagas (el orden de lectura es el orden de la lista) ---------- */
  const SAGAS = {
    dune: { nombre: 'Dune', autor: 'herbert', tono: 'albaricoque', obras: ['dune', 'mesias-dune', 'hijos-dune', 'dios-emperador-dune', 'herejes-dune', 'casa-capitular-dune'] },
    anillo: { nombre: 'El Señor de los Anillos', autor: 'tolkien', tono: 'turquesa', obras: ['comunidad-anillo', 'dos-torres', 'retorno-rey'] },
    hielo: { nombre: 'Canción de hielo y fuego', autor: 'martin', tono: 'gris', obras: ['juego-tronos', 'choque-reyes', 'tormenta-espadas', 'festin-cuervos', 'danza-dragones'] },
    narnia: { nombre: 'Las crónicas de Narnia', autor: 'lewis', tono: 'naranja', nota: 'Orden cronológico de la historia (no el de publicación).', obras: ['sobrino-mago', 'leon-bruja', 'caballo-muchacho', 'principe-caspian', 'viajero-alba', 'silla-plata', 'ultima-batalla'] }
  };

  /*
   * Obras. Cada fila: [id, título, autor, formato, género, año, total, portada, extra]
   *  - total: número de páginas/números/tomos/capítulos/episodios (null = en curso).
   *    Las páginas son aproximadas: cambian según la edición.
   *  - portada: [tono, estilo]. Tonos: naranja, turquesa, albaricoque, gris, blanco.
   *    Estilos: marco, banda, inicial, trama, rayos, diagonal, tiras.
   */
  const FILAS = [
    ['dune', 'Dune', 'herbert', 'libro', 'Ciencia ficción', 1965, 700, ['albaricoque', 'marco'], {
      sinopsis: 'Paul Atreides llega con su familia al desértico planeta Arrakis, el único lugar donde existe la especia. Entre traiciones políticas y antiguas profecías, tendrá que sobrevivir en el desierto junto al pueblo fremen.',
      adaptaciones: [['Película', 'Dune, de David Lynch', 1984], ['Película', 'Dune, de Denis Villeneuve', 2021], ['Película', 'Dune: Parte dos', 2024]],
      curiosidades: ['Antes de convertirse en un clásico, el manuscrito fue rechazado por numerosas editoriales.', 'Ha inspirado películas, series y videojuegos, y se considera una de las novelas más influyentes de la ciencia ficción.']
    }],
    ['mesias-dune', 'El mesías de Dune', 'herbert', 'libro', 'Ciencia ficción', 1969, 290, ['albaricoque', 'marco'], {}],
    ['hijos-dune', 'Hijos de Dune', 'herbert', 'libro', 'Ciencia ficción', 1976, 450, ['albaricoque', 'marco'], {}],
    ['dios-emperador-dune', 'Dios emperador de Dune', 'herbert', 'libro', 'Ciencia ficción', 1981, 430, ['albaricoque', 'marco'], {}],
    ['herejes-dune', 'Herejes de Dune', 'herbert', 'libro', 'Ciencia ficción', 1984, 480, ['albaricoque', 'marco'], {}],
    ['casa-capitular-dune', 'Casa Capitular Dune', 'herbert', 'libro', 'Ciencia ficción', 1985, 460, ['albaricoque', 'marco'], {}],

    ['hobbit', 'El Hobbit', 'tolkien', 'libro', 'Fantasía', 1937, 310, ['turquesa', 'inicial'], {
      sinopsis: 'Bilbo Bolsón, un hobbit amante de la tranquilidad, se ve arrastrado a una aventura con trece enanos y el mago Gandalf para recuperar un tesoro custodiado por un dragón.',
      adaptaciones: [['Película', 'El Hobbit: un viaje inesperado', 2012]]
    }],
    ['comunidad-anillo', 'La Comunidad del Anillo', 'tolkien', 'libro', 'Fantasía', 1954, 490, ['turquesa', 'banda'], {
      sinopsis: 'Frodo hereda un anillo de poder que el Señor Oscuro quiere recuperar. Junto a una comunidad de nueve compañeros, emprende el viaje para destruirlo.',
      adaptaciones: [['Película', 'El Señor de los Anillos: la Comunidad del Anillo', 2001]]
    }],
    ['dos-torres', 'Las dos torres', 'tolkien', 'libro', 'Fantasía', 1954, 420, ['turquesa', 'banda'], { adaptaciones: [['Película', 'El Señor de los Anillos: las dos torres', 2002]] }],
    ['retorno-rey', 'El retorno del Rey', 'tolkien', 'libro', 'Fantasía', 1955, 430, ['turquesa', 'banda'], { adaptaciones: [['Película', 'El Señor de los Anillos: el retorno del Rey', 2003]] }],

    ['juego-tronos', 'Juego de tronos', 'martin', 'libro', 'Fantasía', 1996, 800, ['gris', 'banda'], {
      sinopsis: 'En los Siete Reinos de Poniente, varias familias nobles luchan por el Trono de Hierro mientras, más allá del Muro, despierta una amenaza olvidada.',
      adaptaciones: [['Serie', 'Juego de tronos (HBO)', 2011]]
    }],
    ['choque-reyes', 'Choque de reyes', 'martin', 'libro', 'Fantasía', 1998, 870, ['gris', 'banda'], {}],
    ['tormenta-espadas', 'Tormenta de espadas', 'martin', 'libro', 'Fantasía', 2000, 1100, ['gris', 'banda'], {}],
    ['festin-cuervos', 'Festín de cuervos', 'martin', 'libro', 'Fantasía', 2005, 850, ['gris', 'banda'], {}],
    ['danza-dragones', 'Danza de dragones', 'martin', 'libro', 'Fantasía', 2011, 1100, ['gris', 'banda'], {}],

    ['sobrino-mago', 'El sobrino del mago', 'lewis', 'libro', 'Fantasía', 1955, 200, ['naranja', 'inicial'], {}],
    ['leon-bruja', 'El león, la bruja y el armario', 'lewis', 'libro', 'Fantasía', 1950, 190, ['naranja', 'inicial'], {
      sinopsis: 'Cuatro hermanos atraviesan un armario y llegan a Narnia, un mundo atrapado en un invierno eterno por la Bruja Blanca.',
      adaptaciones: [['Película', 'Las crónicas de Narnia: el león, la bruja y el armario', 2005]]
    }],
    ['caballo-muchacho', 'El caballo y el muchacho', 'lewis', 'libro', 'Fantasía', 1954, 220, ['naranja', 'inicial'], {}],
    ['principe-caspian', 'El príncipe Caspian', 'lewis', 'libro', 'Fantasía', 1951, 230, ['naranja', 'inicial'], {}],
    ['viajero-alba', 'La travesía del Viajero del Alba', 'lewis', 'libro', 'Fantasía', 1952, 250, ['naranja', 'inicial'], {}],
    ['silla-plata', 'La silla de plata', 'lewis', 'libro', 'Fantasía', 1953, 240, ['naranja', 'inicial'], {}],
    ['ultima-batalla', 'La última batalla', 'lewis', 'libro', 'Fantasía', 1956, 220, ['naranja', 'inicial'], {}],

    ['sombra-viento', 'La sombra del viento', 'ruiz', 'libro', 'Misterio', 2001, 570, ['gris', 'marco'], {
      sinopsis: 'En la Barcelona de posguerra, el joven Daniel descubre en el Cementerio de los Libros Olvidados una novela cuyo autor parece haber desaparecido. Alguien está quemando todos sus ejemplares.'
    }],
    ['orgullo-prejuicio', 'Orgullo y prejuicio', 'austen', 'libro', 'Clásicos', 1813, 430, ['blanco', 'marco'], {
      sinopsis: 'Elizabeth Bennet y el señor Darcy chocan desde su primer encuentro. Una historia sobre las primeras impresiones, el orgullo y las normas sociales de la Inglaterra rural.',
      adaptaciones: [['Película', 'Orgullo y prejuicio, de Joe Wright', 2005]]
    }],
    ['cien-anos', 'Cien años de soledad', 'garcia', 'libro', 'Clásicos', 1967, 490, ['naranja', 'banda'], {
      sinopsis: 'La historia de la familia Buendía a lo largo de siete generaciones en el pueblo de Macondo, donde lo extraordinario forma parte de la vida diaria.',
      adaptaciones: [['Serie', 'Cien años de soledad (Netflix)', 2024]]
    }],
    ['casa-espiritus', 'La casa de los espíritus', 'allende', 'libro', 'Clásicos', 1982, 510, ['turquesa', 'marco'], {
      sinopsis: 'La saga de la familia Trueba durante cuatro generaciones, entre la política, el amor y la magia, en un país que recuerda a Chile.',
      adaptaciones: [['Película', 'La casa de los espíritus', 1993]]
    }],
    ['quijote', 'Don Quijote de la Mancha', 'cervantes', 'libro', 'Clásicos', 1605, 1300, ['albaricoque', 'inicial'], {
      sinopsis: 'Un hidalgo que ha leído demasiados libros de caballerías decide hacerse caballero andante y recorrer La Mancha junto a su escudero, Sancho Panza.',
      curiosidades: ['Se considera la primera novela moderna y es una de las obras más editadas de la historia.']
    }],
    ['orwell-1984', '1984', 'orwell', 'libro', 'Ciencia ficción', 1949, 350, ['gris', 'inicial'], {
      sinopsis: 'Winston Smith trabaja reescribiendo la historia para el Partido en un Estado que lo vigila todo. Hasta que empieza a dudar.',
      adaptaciones: [['Película', '1984, de Michael Radford', 1984]]
    }],
    ['rebelion-granja', 'Rebelión en la granja', 'orwell', 'libro', 'Clásicos', 1945, 140, ['albaricoque', 'banda'], {
      sinopsis: 'Los animales de una granja expulsan a los humanos y crean su propio gobierno. Pronto, algunos animales empiezan a ser más iguales que otros.'
    }],
    ['frankenstein', 'Frankenstein', 'shelley', 'libro', 'Terror', 1818, 280, ['gris', 'marco'], {
      sinopsis: 'Victor Frankenstein consigue dar vida a un ser hecho de restos humanos y huye horrorizado de su creación.',
      adaptaciones: [['Película', 'El doctor Frankenstein, de James Whale', 1931]]
    }],
    ['principito', 'El principito', 'saint', 'libro', 'Clásicos', 1943, 100, ['turquesa', 'inicial'], {
      sinopsis: 'Un aviador perdido en el desierto conoce a un pequeño príncipe llegado de otro planeta.',
      adaptaciones: [['Película', 'El principito, de Mark Osborne', 2015]],
      curiosidades: ['Es uno de los libros más traducidos del mundo, a cientos de idiomas y dialectos.']
    }],

    ['watchmen', 'Watchmen', 'moore', 'comic', 'Superhéroes', 1986, 12, ['naranja', 'trama'], {
      sinopsis: 'En una versión alternativa de los años ochenta, un grupo de superhéroes retirados investiga el asesinato de uno de los suyos.',
      adaptaciones: [['Película', 'Watchmen, de Zack Snyder', 2009], ['Serie', 'Watchmen (HBO)', 2019]]
    }],
    ['maus', 'Maus', 'spiegelman', 'comic', 'Histórico', 1980, 2, ['blanco', 'trama'], {
      sinopsis: 'Art Spiegelman cuenta cómo su padre sobrevivió al Holocausto, dibujando a los judíos como ratones y a los nazis como gatos.',
      curiosidades: ['Es el primer cómic que ganó un premio Pulitzer (1992).']
    }],
    ['persepolis', 'Persépolis', 'satrapi', 'comic', 'Histórico', 2000, 4, ['gris', 'trama'], {
      sinopsis: 'Marjane Satrapi relata su infancia y juventud en Irán durante la revolución islámica y la guerra con Irak.',
      adaptaciones: [['Película', 'Persépolis', 2007]]
    }],

    ['one-piece', 'One Piece', 'oda', 'manga', 'Aventura', 1997, null, ['naranja', 'rayos'], {
      sinopsis: 'Monkey D. Luffy, un chico con el cuerpo de goma, navega con su tripulación en busca del legendario tesoro One Piece para convertirse en el Rey de los Piratas.',
      adaptaciones: [['Anime', 'One Piece', 1999], ['Serie', 'One Piece (Netflix)', 2023]]
    }],
    ['frieren', 'Frieren', 'yamada', 'manga', 'Fantasía', 2020, null, ['albaricoque', 'rayos'], {
      sinopsis: 'Tras derrotar al Rey Demonio, la elfa Frieren sobrevive a sus compañeros humanos y emprende un viaje para entender el tiempo que compartieron.',
      adaptaciones: [['Anime', 'Frieren', 2023]]
    }],
    ['berserk', 'Berserk', 'miura', 'manga', 'Fantasía', 1989, null, ['gris', 'rayos'], {
      sinopsis: 'Guts, un mercenario marcado por una maldición, recorre un mundo medieval y cruel en busca de venganza.',
      adaptaciones: [['Anime', 'Berserk', 1997]]
    }],

    ['solo-leveling', 'Solo Leveling', 'chugong', 'manhwa', 'Acción', 2018, 200, ['turquesa', 'diagonal'], {
      sinopsis: 'Sung Jin-Woo, el cazador más débil, recibe un poder que le permite subir de nivel sin límite.',
      adaptaciones: [['Anime', 'Solo Leveling', 2024]]
    }],
    ['omniscient-reader', 'Omniscient Reader', 'singshong', 'manhwa', 'Fantasía', 2020, null, ['gris', 'diagonal'], {
      sinopsis: 'Kim Dokja es el único lector de una novela web… hasta que el mundo se convierte en esa novela.'
    }],

    ['lore-olympus', 'Lore Olympus', 'smythe', 'webtoon', 'Romance', 2018, null, ['albaricoque', 'tiras'], {
      sinopsis: 'Una versión moderna del mito de Hades y Perséfone, con los dioses del Olimpo viviendo en una ciudad actual.'
    }],
    ['tower-of-god', 'Tower of God', 'siu', 'webtoon', 'Fantasía', 2010, null, ['turquesa', 'tiras'], {
      sinopsis: 'Bam entra en una torre misteriosa para encontrar a su amiga Rachel. Cada piso es una prueba distinta.',
      adaptaciones: [['Anime', 'Tower of God', 2020]]
    }]
  ];

  // Convertimos cada fila en un objeto con nombres claros
  const OBRAS = {};
  FILAS.forEach((f) => {
    const extra = f[8] || {};
    OBRAS[f[0]] = {
      id: f[0], titulo: f[1], autor: f[2], formato: f[3], genero: f[4], anio: f[5], total: f[6],
      tono: f[7][0], estilo: f[7][1],
      sinopsis: extra.sinopsis || '',
      adaptaciones: (extra.adaptaciones || []).map((a) => ({ tipo: a[0], titulo: a[1], anio: a[2] })),
      curiosidades: extra.curiosidades || []
    };
  });
  // Añadimos a cada obra su saga y su número de volumen
  Object.keys(SAGAS).forEach((sagaId) => {
    SAGAS[sagaId].obras.forEach((obraId, i) => { OBRAS[obraId].saga = sagaId; OBRAS[obraId].volumen = i + 1; });
  });

  /*
   * Lectores de ejemplo. Cada lectura: [obra, estado, nota (0-5), progreso, fecha, favorito, reseña]
   * Estados: 'quiero' (Quiero leer), 'leyendo' (Leyendo), 'leido' (Leído).
   */
  const LECTORES = {
    'lucia.lee': {
      nombre: 'Lucía', iniciales: 'LU', tono: 'turquesa', publico: true, teSigue: true, formatoFavorito: 'Manhwa',
      bio: 'Manhwas de fantasía y café. Si tiene sistema de niveles, lo leo. Reseñas cortas y sinceras.',
      lecturas: [
        ['solo-leveling', 'leido', 5, 200, '2026-11-10', true, 'El manhwa perfecto para empezar. Las peleas se leen como una película y el ritmo no decae.'],
        ['omniscient-reader', 'leyendo', 0, 128, '2026-11-08', false, ''],
        ['tower-of-god', 'leyendo', 0, 210, '2026-11-02', false, ''],
        ['dune', 'leyendo', 0, 140, '2026-10-30', false, ''],
        ['frieren', 'leido', 5, 12, '2026-10-21', true, 'Fantasía tranquila que te rompe el corazón poco a poco. Imprescindible.'],
        ['lore-olympus', 'leido', 4, 0, '2026-09-14', false, ''],
        ['maus', 'leido', 5, 2, '2026-08-03', true, 'Si crees que los cómics son solo superhéroes, lee esto.'],
        ['one-piece', 'quiero', 0, 0, '2026-07-20', false, '']
      ]
    },
    'dani.comics': {
      nombre: 'Dani', iniciales: 'DA', tono: 'naranja', publico: true, teSigue: true, formatoFavorito: 'Cómics',
      bio: 'Coleccionista de novela gráfica. Moore, Spiegelman y mucha tinta.',
      lecturas: [
        ['watchmen', 'leido', 5, 12, '2026-11-09', true, 'Cada viñeta está pensada al milímetro. Lo releo cada año y siempre encuentro algo nuevo.'],
        ['persepolis', 'leyendo', 0, 2, '2026-11-05', false, ''],
        ['maus', 'leido', 5, 2, '2026-10-12', true, 'Duro y necesario. El dibujo sencillo hace que pese todavía más.'],
        ['orwell-1984', 'leido', 4, 350, '2026-09-01', false, ''],
        ['berserk', 'quiero', 0, 0, '2026-08-15', false, '']
      ]
    },
    'sara.manga': {
      nombre: 'Sara', iniciales: 'SA', tono: 'albaricoque', publico: true, teSigue: false, formatoFavorito: 'Manga',
      bio: 'Shōnen de día, shōjo de noche. Coleccionando tomos sin parar.',
      lecturas: [
        ['one-piece', 'leyendo', 0, 107, '2026-11-10', true, ''],
        ['frieren', 'leido', 4, 12, '2026-11-03', true, 'Pocas historias hablan tan bien del paso del tiempo. Le quito una estrella por el ritmo del principio.'],
        ['berserk', 'leido', 5, 41, '2026-10-02', false, ''],
        ['lore-olympus', 'quiero', 0, 0, '2026-09-20', false, '']
      ]
    },
    'marcos_lee': {
      nombre: 'Marcos', iniciales: 'MA', tono: 'gris', publico: true, teSigue: true, formatoFavorito: 'Libros',
      bio: 'Ciencia ficción clásica y algún thriller para el metro.',
      lecturas: [
        ['dune', 'leido', 5, 700, '2026-11-07', true, 'La mejor ciencia ficción que he leído. El mundo de Arrakis se siente real.'],
        ['mesias-dune', 'leyendo', 0, 120, '2026-11-08', false, ''],
        ['orwell-1984', 'leido', 4, 350, '2026-10-01', false, ''],
        ['frankenstein', 'quiero', 0, 0, '2026-09-11', false, '']
      ]
    },
    'pablo.lee': {
      nombre: 'Pablo', iniciales: 'PA', tono: 'blanco', publico: true, teSigue: false, formatoFavorito: 'Libros',
      bio: 'Clubs de lectura, poesía y libros con más de 600 páginas.',
      lecturas: [
        ['cien-anos', 'leido', 5, 490, '2026-11-06', true, 'Macondo se te queda dentro. Hay que leerlo con un árbol genealógico al lado, y merece la pena.'],
        ['dune', 'leido', 4, 700, '2026-10-18', false, 'Lento al principio, brutal al final.'],
        ['quijote', 'leyendo', 0, 410, '2026-11-01', false, ''],
        ['juego-tronos', 'quiero', 0, 0, '2026-08-30', false, '']
      ]
    },
    'alex.verse': {
      nombre: 'Álex', iniciales: 'AL', tono: 'turquesa', publico: true, teSigue: false, formatoFavorito: 'Manhwa',
      bio: 'Si es de regresiones o academias de magia, ya lo he leído.',
      lecturas: [
        ['omniscient-reader', 'leido', 5, 0, '2026-11-04', true, 'El mejor giro de la premisa "el mundo se convierte en una novela". Cada arco mejora al anterior.'],
        ['solo-leveling', 'leido', 4, 200, '2026-10-10', false, ''],
        ['tower-of-god', 'quiero', 0, 0, '2026-09-02', false, '']
      ]
    },
    'irene.webtoon': {
      nombre: 'Irene', iniciales: 'IR', tono: 'naranja', publico: false, teSigue: false, formatoFavorito: 'Webtoons',
      bio: 'Episodio nuevo cada viernes = día favorito de la semana.', lecturas: []
    },
    'nuria.reads': {
      nombre: 'Nuria', iniciales: 'NU', tono: 'albaricoque', publico: false, teSigue: true, formatoFavorito: 'Manga',
      bio: 'Seinen, terror y finales que duelen.', lecturas: []
    }
  };

  // Convertimos las lecturas de cada lector en objetos
  Object.keys(LECTORES).forEach((usuario) => {
    const l = LECTORES[usuario];
    l.usuario = usuario;
    l.lecturas = l.lecturas.map((r) => ({ obra: r[0], estado: r[1], nota: r[2], progreso: r[3], fecha: r[4], favorito: r[5], resena: r[6] }));
  });

  /* ---------- Funciones de ayuda para leer los datos ---------- */
  const Datos = {
    FORMATOS, AUTORES, SAGAS, OBRAS, LECTORES,

    obra(id) { return OBRAS[id] || null; },
    listaObras() { return Object.keys(OBRAS).map((id) => OBRAS[id]); },
    autor(id) { return AUTORES[id] || null; },
    lector(usuario) { return LECTORES[usuario] || null; },
    listaLectores() { return Object.keys(LECTORES).map((u) => LECTORES[u]); },
    obrasDeAutor(autorId) { return this.listaObras().filter((o) => o.autor === autorId); },

    // Reseñas de ejemplo de una obra (de los lectores con perfil público)
    resenasDeEjemplo(obraId) {
      const lista = [];
      this.listaLectores().forEach((l) => {
        if (!l.publico) return;
        l.lecturas.forEach((r) => { if (r.obra === obraId && (r.resena || r.nota)) lista.push(Object.assign({ lector: l }, r)); });
      });
      return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
    },

    // Actividad de ejemplo de todos los lectores públicos, de la más reciente a la más antigua
    actividadDeEjemplo() {
      const lista = [];
      this.listaLectores().forEach((l) => {
        if (!l.publico) return;
        l.lecturas.forEach((r) => lista.push(Object.assign({ lector: l }, r)));
      });
      return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
    },

    // Enlaces de compra: búsquedas por título y autor en tiendas reales (comprobadas)
    enlacesCompra(obra) {
      const texto = encodeURIComponent(obra.titulo + ' ' + AUTORES[obra.autor].nombre);
      return [
        { tienda: 'Todos tus libros', detalle: 'Librerías independientes', url: 'https://www.todostuslibros.com/busquedas?keyword=' + texto },
        { tienda: 'Amazon', detalle: 'Tienda online', url: 'https://www.amazon.es/s?k=' + texto }
      ];
    }
  };

  window.ByBookDatos = Datos;
})();
