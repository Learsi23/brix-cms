// prisma/seed.ts — Script de inicialización
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear usuario admin por defecto
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@eden.com' },
    update: {},
    create: {
      email: 'admin@eden.com',
      password: 'admin123', // En producción usar bcrypt
      name: 'Administrador',
      role: 'admin',
    },
  });
  console.log('✅ Usuario admin creado:', adminUser.email);

  // Crear página de inicio si no existe
  const homePage = await prisma.page.upsert({
    where: { slug: '' },
    update: {},
    create: {
      title: 'Inicio',
      slug: '',
      isPublished: true,
      publishedAt: new Date(),
      pageType: 'standard',
      jsonData: JSON.stringify({
        BackgroundColor: { Value: '#ffffff' },
      }),
    },
  });
  console.log('✅ Página de inicio creada:', homePage.title);

  // Crear bloque Hero en la página de inicio
  const heroBlock = await prisma.block.create({
    data: {
      type: 'HeroBlock',
      pageId: homePage.id,
      sortOrder: 0,
      jsonData: JSON.stringify({
        Title: { Value: 'Bienvenido a Eden CMS' },
        TitleColor: { Value: '#ffffff' },
        TitleSize: { Value: '3rem' },
        Subtitle: { Value: 'Tu CMS moderno con Next.js' },
        SubtitleColor: { Value: '#ffffff' },
        SubtitleSize: { Value: '1.25rem' },
        Description: { Value: 'Crea páginas increíbles con bloques dinámicos' },
        Background: { Value: '' },
      }),
    },
  });
  console.log('✅ Bloque Hero creado');

  // Crear bloque de texto
  const textBlock = await prisma.block.create({
    data: {
      type: 'TextBlock',
      pageId: homePage.id,
      sortOrder: 1,
      jsonData: JSON.stringify({
        Title: { Value: 'Características' },
        TitleColor: { Value: '#1e293b' },
        TitleSize: { Value: '2rem' },
        TitleAlignment: { Value: 'center' },
        Body: { Value: 'Eden CMS es un sistema de gestión de contenido moderno, rápido y fácil de usar. Crea páginas con bloques dinámicos como Hero, Texto, Imágenes, Galerías y más.' },
        BodyColor: { Value: '#64748b' },
        BodySize: { Value: '1rem' },
        BodyAlignment: { Value: 'center' },
      }),
    },
  });
  console.log('✅ Bloque de texto creado');

  // Crear configuración del sitio por defecto
  const siteConfig = await prisma.siteConfig.upsert({
    where: { key: 'site' },
    update: {},
    create: {
      key: 'site',
      value: JSON.stringify({
        navbar: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          logo: '',
          logoAltText: 'Eden CMS',
          logoWidth: '150px',
          logoLink: '/',
          isSticky: true,
          hasShadow: true,
          paddingVertical: 'py-3',
          menuItems: [],
        },
        footer: {
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          logo: '',
          logoAltText: 'Eden CMS',
          logoWidth: '150px',
          logoPosition: 'left',
          showPagesColumn: true,
          pagesColumnTitle: 'Páginas',
          pages: [],
          showSocialMediaColumn: true,
          socialMediaColumnTitle: 'Síguenos',
          socialMedia: [],
          showCopyrightRow: true,
          companyName: 'Eden CMS',
          companyNumber: '',
          copyrightText: 'Todos los derechos reservados',
          showHorizontalLine: true,
          paddingVertical: 'py-6',
          columnsGap: 'gap-8',
        },
      }),
    },
  });
  console.log('✅ Configuración del sitio creada');

  console.log('\n🎉 ¡Inicialización completada!');
  console.log('📧 Email: admin@eden.com');
  console.log('🔑 Contraseña: admin123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
