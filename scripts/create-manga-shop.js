// Script to create "My Manga Store" page
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
      description: 'Majin Buu collectible figure, 15 cm. High quality, limited edition Dragon Ball Z. Perfect for fans of the classic series.',
      price: 29.99,
      stock: 100,
    },
  });

  await p.product.update({
    where: { id: 'cmnbugylz001xcsas9eyei1mq' },
    data: {
      name: 'Son Goku Super Saiyan',
      description: 'Son Goku figure in Super Saiyan mode, 18 cm. Detailed paint and iconic battle pose. Special edition.',
      price: 34.99,
      stock: 80,
    },
  });

  await p.product.update({
    where: { id: 'cmndbbklx0001cswoapeg06o9' },
    data: {
      name: 'Boo — Dark Edition',
      description: 'Exclusive Majin Boo figure in dark form, 17 cm. Premium finish with hand-painted details.',
      price: 44.99,
      stock: 40,
    },
  });

  // ── 2. Create new products for the other manga figure images ─────────
  const naruto = await p.product.create({
    data: {
      name: 'Naruto Uzumaki — Sage Mode',
      description: 'Naruto Uzumaki figure in Sage Mode, 16 cm. Sage Mode details with facial marks. Collector’s edition.',
      price: 34.99,
      stock: 50,
      imageUrl: '/uploads/nedladdning--4--1774773696129.jpg',
    },
  });

  const vegeta = await p.product.create({
    data: {
      name: 'Vegeta Super Saiyan Blue',
      description: 'Vegeta figure in Super Saiyan Blue transformation, 18 cm. High quality, detailed paint with blue metallic effect.',
      price: 39.99,
      stock: 30,
      imageUrl: '/uploads/nedladdning--3--1774773699295.jpg',
    },
  });

  console.log('Products updated/created:', { naruto: naruto.id, vegeta: vegeta.id });

  // ── 3. Delete existing page if slug already exists ───────────────────
  const existing = await p.page.findUnique({ where: { slug: 'my-manga-store' } });
  if (existing) {
    await p.block.deleteMany({ where: { pageId: existing.id } });
    await p.page.delete({ where: { id: existing.id } });
    console.log('Deleted existing page');
  }

  // ── 4. Create the page ───────────────────────────────────────────────
  const page = await p.page.create({
    data: {
      title: 'My Manga Store',
      slug: 'my-manga-store',
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
        Title: '🎌 My Manga Store',
        TitleColor: '#ffffff',
        TitleSize: '3.5rem',
        Subtitle: 'The best anime & manga figures',
        SubtitleColor: '#fcd34d',
        Description: 'Exclusive collection · Dragon Ball · Naruto · One Piece and more',
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
        Title: 'Why Choose Us',
        TitleColor: '#ffffff',
        Subtitle: 'We are the reference store for anime figures in Spain',
        SubtitleColor: '#94a3b8',
        Stat1Number: '50+',
        Stat1Label: 'Unique figures',
        Stat1Icon: 'fas fa-star',
        Stat2Number: '1.200+',
        Stat2Label: 'Happy customers',
        Stat2Icon: 'fas fa-heart',
        Stat3Number: '5★',
        Stat3Label: 'Average rating',
        Stat3Icon: 'fas fa-award',
        Stat4Number: '24h',
        Stat4Label: 'Express shipping',
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
        Title: 'Our Products',
        TitleColor: '#1e293b',
        TitleSize: '2.25rem',
        TitleAlignment: 'center',
        Subtitle: 'High-quality collectible figures — limited editions',
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
    { id: 'cmnbu6vly001rcsasebr859ii', name: 'Majin Buu — Dragon Ball Z', price: '29.99', image: '/uploads/1767628969980.jpg', desc: 'Limited edition Dragon Ball Z figure, 15 cm.', stock: '100' },
    { id: 'cmnbugylz001xcsas9eyei1mq', name: 'Son Goku Super Saiyan', price: '34.99', image: '/uploads/1767628895817.jpg', desc: 'Iconic Super Saiyan battle pose, 18 cm.', stock: '80' },
    { id: 'cmndbbklx0001cswoapeg06o9', name: 'Boo — Dark Edition', price: '44.99', image: '/uploads/1767628969980.jpg', desc: 'Dark form of Majin Boo, premium finish.', stock: '40' },
    { id: naruto.id, name: 'Naruto — Sage Mode', price: '34.99', image: '/uploads/nedladdning--4--1774773696129.jpg', desc: 'Sage Mode with facial marks, 16 cm.', stock: '50' },
    { id: vegeta.id, name: 'Vegeta SSJ Blue', price: '39.99', image: '/uploads/nedladdning--3--1774773699295.jpg', desc: 'Blue metallic effect Super Saiyan Blue, 18 cm.', stock: '30' },
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
          ButtonText: '🛒 Add to cart',
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
        Title: 'Are you an anime fan?',
        TitleColor: '#ffffff',
        TitleSize: '2.5rem',
        Subtitle: 'Subscribe and get a 10% discount on your first purchase. New figures every week.',
        SubtitleColor: 'rgba(255,255,255,0.85)',
        Btn1Text: 'View full collection',
        Btn1Url: '/my-manga-store',
        Btn1BgColor: '#fcd34d',
        Btn1TextColor: '#1e293b',
        Btn2Text: 'Contact',
        Btn2Url: '/contact',
        Btn2Color: '#ffffff',
        BackgroundColor: '#dc2626',
        BackgroundColor2: '#7f1d1d',
        PaddingY: '5rem',
        TextAlign: 'center',
      }),
    },
  });

  console.log('\n✅ Page "My Manga Store" created successfully!');
  console.log('   URL: /my-manga-store');
  console.log('   Admin: /admin/pages/' + page.id);
}

main()
  .catch((e) => { console.error('Error:', e); process.exit(1); })
  .finally(() => p.$disconnect());