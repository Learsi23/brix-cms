// Script to create "Mi Tienda de Manga" page
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

function field(value) {
  return { Value: value };
}

function blockJson(fields) {
  const obj = {};
  for (const [k, v] of Object.entries(fields)) {
    obj[k] = field(v);
  }
  return JSON.stringify(obj);
}

async function main() {
  // ── 1. Update existing products with better manga names ──────────────
  await p.product.update({
    where: { id: 'cmnbu6vly001rcsasebr859ii' },
    data: {
      name: 'Majin Buu — Dragon Ball Z',
      description: 'Figura de colección de Majin Buu, 15 cm. Alta calidad, edición limitada Dragon Ball Z. Perfecta para fans de la serie clásica.',
      price: 29.99,
      stock: 100,
    },
  });

  await p.product.update({
    where: { id: 'cmnbugylz001xcsas9eyei1mq' },
    data: {
      name: 'Son Goku Super Saiyan',
      description: 'Figura de Son Goku en modo Super Saiyan, 18 cm. Pintura detallada y pose icónica de batalla. Edición especial.',
      price: 34.99,
      stock: 80,
    },
  });

  await p.product.update({
    where: { id: 'cmndbbklx0001cswoapeg06o9' },
    data: {
      name: 'Boo — Edición Oscura',
      description: 'Figura exclusiva de Majin Boo en su forma oscura, 17 cm. Acabado premium con detalles pintados a mano.',
      price: 44.99,
      stock: 40,
    },
  });

  // ── 2. Create new products for the other manga figure images ─────────
  const naruto = await p.product.create({
    data: {
      name: 'Naruto Uzumaki — Modo Sabio',
      description: 'Figura de Naruto Uzumaki en Modo Sabio, 16 cm. Detalles del Sage Mode con marcas faciales. Edición coleccionista.',
      price: 34.99,
      stock: 50,
      imageUrl: '/uploads/nedladdning--4--1774773696129.jpg',
    },
  });

  const vegeta = await p.product.create({
    data: {
      name: 'Vegeta Super Saiyan Blue',
      description: 'Figura de Vegeta en transformación Super Saiyan Blue, 18 cm. Alta calidad, pintura al detalle con efecto metálico azul.',
      price: 39.99,
      stock: 30,
      imageUrl: '/uploads/nedladdning--3--1774773699295.jpg',
    },
  });

  console.log('Products updated/created:', { naruto: naruto.id, vegeta: vegeta.id });

  // ── 3. Delete existing page if slug already exists ───────────────────
  const existing = await p.page.findUnique({ where: { slug: 'mi-tienda-de-manga' } });
  if (existing) {
    await p.block.deleteMany({ where: { pageId: existing.id } });
    await p.page.delete({ where: { id: existing.id } });
    console.log('Deleted existing page');
  }

  // ── 4. Create the page ───────────────────────────────────────────────
  const page = await p.page.create({
    data: {
      title: 'Mi Tienda de Manga',
      slug: 'mi-tienda-de-manga',
      isPublished: true,
      sortOrder: 5,
      pageType: 'standard',
    },
  });
  console.log('Page created:', page.id);

  // ── 5. Hero Block ────────────────────────────────────────────────────
  await p.block.create({
    data: {
      type: 'HeroBlock',
      sortOrder: 0,
      pageId: page.id,
      jsonData: blockJson({
        Title: '🎌 Mi Tienda de Manga',
        TitleColor: '#ffffff',
        TitleSize: '3.5rem',
        Subtitle: 'Las mejores figuras de anime & manga',
        SubtitleColor: '#fcd34d',
        Description: 'Colección exclusiva · Dragon Ball · Naruto · One Piece y más',
      }),
    },
  });

  // ── 6. Stats Block ───────────────────────────────────────────────────
  await p.block.create({
    data: {
      type: 'StatsBlock',
      sortOrder: 1,
      pageId: page.id,
      jsonData: blockJson({
        Title: 'Por qué elegirnos',
        TitleColor: '#ffffff',
        Subtitle: 'Somos la tienda de referencia en figuras de anime en España',
        SubtitleColor: '#94a3b8',
        Stat1Number: '50+',
        Stat1Label: 'Figuras únicas',
        Stat1Icon: 'fas fa-star',
        Stat2Number: '1.200+',
        Stat2Label: 'Clientes felices',
        Stat2Icon: 'fas fa-heart',
        Stat3Number: '5★',
        Stat3Label: 'Valoración media',
        Stat3Icon: 'fas fa-award',
        Stat4Number: '24h',
        Stat4Label: 'Envío express',
        Stat4Icon: 'fas fa-truck',
        NumberColor: '#f59e0b',
        LabelColor: '#94a3b8',
        BackgroundColor: '#0f172a',
        CardBgColor: '#1e293b',
        PaddingY: '4rem',
      }),
    },
  });

  // ── 7. Section Title ─────────────────────────────────────────────────
  await p.block.create({
    data: {
      type: 'TextBlock',
      sortOrder: 2,
      pageId: page.id,
      jsonData: blockJson({
        Title: 'Nuestros Productos',
        TitleColor: '#1e293b',
        TitleSize: '2.25rem',
        TitleAlignment: 'center',
        Subtitle: 'Figuras de colección de alta calidad — ediciones limitadas',
        SubtitleColor: '#6b7280',
        SubtitleAlignment: 'center',
        HorizontalPosition: 'center',
        PaddingTop: '3rem',
        PaddingBottom: '0.5rem',
        PaddingLeft: '1rem',
        PaddingRight: '1rem',
        MarginTop: '0',
        MarginBottom: '0',
        MarginLeft: '0',
        MarginRight: '0',
      }),
    },
  });

  // ── 8. Column Block (3 columns) containing product cards ─────────────
  const columnBlock = await p.block.create({
    data: {
      type: 'ColumnBlock',
      sortOrder: 3,
      pageId: page.id,
      jsonData: blockJson({
        Columns: '3',
        Gap: 'gap-6',
      }),
    },
  });

  // Product IDs (existing updated + newly created)
  const products = [
    { id: 'cmnbu6vly001rcsasebr859ii', name: 'Majin Buu — Dragon Ball Z', price: '29.99', image: '/uploads/1767628969980.jpg', desc: 'Figura edición limitada Dragon Ball Z, 15 cm.', stock: '100' },
    { id: 'cmnbugylz001xcsas9eyei1mq', name: 'Son Goku Super Saiyan', price: '34.99', image: '/uploads/1767628895817.jpg', desc: 'Pose icónica de batalla Super Saiyan, 18 cm.', stock: '80' },
    { id: 'cmndbbklx0001cswoapeg06o9', name: 'Boo — Edición Oscura', price: '44.99', image: '/uploads/1767628969980.jpg', desc: 'Forma oscura de Majin Boo, acabado premium.', stock: '40' },
    { id: naruto.id, name: 'Naruto — Modo Sabio', price: '34.99', image: '/uploads/nedladdning--4--1774773696129.jpg', desc: 'Sage Mode con marcas faciales, 16 cm.', stock: '50' },
    { id: vegeta.id, name: 'Vegeta SSJ Blue', price: '39.99', image: '/uploads/nedladdning--3--1774773699295.jpg', desc: 'Efecto metálico azul Super Saiyan Blue, 18 cm.', stock: '30' },
  ];

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    await p.block.create({
      data: {
        type: 'ProductCardBlock',
        sortOrder: i,
        pageId: page.id,
        parentId: columnBlock.id,
        jsonData: blockJson({
          ProductId: prod.id,
          Name: prod.name,
          Description: prod.desc,
          Price: prod.price,
          Image: prod.image,
          Stock: prod.stock,
          ButtonText: '🛒 Añadir al carrito',
          BackgroundColor: '#ffffff',
        }),
      },
    });
  }

  // ── 9. Spacer ────────────────────────────────────────────────────────
  await p.block.create({
    data: {
      type: 'SpacerBlock',
      sortOrder: 4,
      pageId: page.id,
      jsonData: blockJson({ Height: '3rem', BackgroundColor: '#ffffff' }),
    },
  });

  // ── 10. CTA Banner ───────────────────────────────────────────────────
  await p.block.create({
    data: {
      type: 'CTABannerBlock',
      sortOrder: 5,
      pageId: page.id,
      jsonData: blockJson({
        Title: '¿Eres fan del anime?',
        TitleColor: '#ffffff',
        TitleSize: '2.5rem',
        Subtitle: 'Suscríbete y recibe un 10% de descuento en tu primera compra. Nuevas figuras cada semana.',
        SubtitleColor: 'rgba(255,255,255,0.85)',
        Btn1Text: 'Ver toda la colección',
        Btn1Url: '/mi-tienda-de-manga',
        Btn1BgColor: '#fcd34d',
        Btn1TextColor: '#1e293b',
        Btn2Text: 'Contactar',
        Btn2Url: '/contacto',
        Btn2Color: '#ffffff',
        BackgroundColor: '#dc2626',
        BackgroundColor2: '#7f1d1d',
        PaddingY: '5rem',
        TextAlign: 'center',
      }),
    },
  });

  console.log('\n✅ Page "Mi Tienda de Manga" created successfully!');
  console.log('   URL: /mi-tienda-de-manga');
  console.log('   Admin: /admin/pages/' + page.id);
}

main()
  .catch((e) => { console.error('Error:', e); process.exit(1); })
  .finally(() => p.$disconnect());
