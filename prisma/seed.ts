// prisma/seed.ts — Initialization script
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@eden.com' },
    update: {},
    create: {
      email: 'admin@eden.com',
      password: 'admin123', // In production use bcrypt
      name: 'Administrator',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // Create home page if it doesn't exist
  const homePage = await prisma.page.upsert({
    where: { slug: '' },
    update: {},
    create: {
      title: 'Home',
      slug: '',
      isPublished: true,
      publishedAt: new Date(),
      pageType: 'standard',
      jsonData: JSON.stringify({
        BackgroundColor: { Value: '#ffffff' },
      }),
    },
  });
  console.log('✅ Home page created:', homePage.title);

  // Create Hero block on the home page
  const heroBlock = await prisma.block.create({
    data: {
      type: 'HeroBlock',
      pageId: homePage.id,
      sortOrder: 0,
      jsonData: JSON.stringify({
        Title: { Value: 'Welcome to Brix' },
        TitleColor: { Value: '#ffffff' },
        TitleSize: { Value: '3rem' },
        Subtitle: { Value: 'Your modern CMS with Next.js' },
        SubtitleColor: { Value: '#ffffff' },
        SubtitleSize: { Value: '1.25rem' },
        Description: { Value: 'Create amazing pages with dynamic blocks' },
        Background: { Value: '' },
      }),
    },
  });
  console.log('✅ Hero block created');

  // Create text block
  const textBlock = await prisma.block.create({
    data: {
      type: 'TextBlock',
      pageId: homePage.id,
      sortOrder: 1,
      jsonData: JSON.stringify({
        Title: { Value: 'Features' },
        TitleColor: { Value: '#1e293b' },
        TitleSize: { Value: '2rem' },
        TitleAlignment: { Value: 'center' },
        Body: { Value: 'Brix is a modern, fast, and easy-to-use content management system. Create pages with dynamic blocks like Hero, Text, Images, Galleries, and more.' },
        BodyColor: { Value: '#64748b' },
        BodySize: { Value: '1rem' },
        BodyAlignment: { Value: 'center' },
      }),
    },
  });
  console.log('✅ Text block created');

  // Create default site configuration
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
          logoAltText: 'Brix',
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
          logoAltText: 'Brix',
          logoWidth: '150px',
          logoPosition: 'left',
          showPagesColumn: true,
          pagesColumnTitle: 'Pages',
          pages: [],
          showSocialMediaColumn: true,
          socialMediaColumnTitle: 'Follow Us',
          socialMedia: [],
          showCopyrightRow: true,
          companyName: 'Brix',
          companyNumber: '',
          copyrightText: 'All rights reserved',
          showHorizontalLine: true,
          paddingVertical: 'py-6',
          columnsGap: 'gap-8',
        },
      }),
    },
  });
  console.log('✅ Site configuration created');

  console.log('\n🎉 Initialization completed!');
  console.log('📧 Email: admin@eden.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });