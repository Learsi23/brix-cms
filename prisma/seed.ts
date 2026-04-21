// prisma/seed.ts — Initialization script
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Helper: shorthand for block jsonData field ───────────────────────────────
const v = (value: string) => ({ Value: value });
const b = (data: Record<string, { Value: string }>) => JSON.stringify(data);

async function main() {
  // ── Admin user ───────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where:  { email: 'admin@brix.com' },
    update: {},
    create: {
      email:    'admin@brix.com',
      password: 'admin123',  // Change this after first login
      name:     'Administrator',
      role:     'admin',
    },
  });
  console.log('✅ Admin user:', adminUser.email);

  // ── Home page ────────────────────────────────────────────────────────────────
  const homePage = await prisma.page.upsert({
    where:  { slug: '' },
    update: {},
    create: {
      title:       'Home',
      slug:        '',
      description: 'Brix — open-source block-based CMS. Build pages visually, ship anywhere.',
      isPublished:  true,
      publishedAt:  new Date(),
      pageType:    'standard',
      jsonData:    JSON.stringify({ BackgroundColor: v('#ffffff') }),
    },
  });
  console.log('✅ Home page created');

  // ── Block 1: Hero ─────────────────────────────────────────────────────────────
  await prisma.block.create({
    data: {
      type:      'HeroBlock',
      pageId:    homePage.id,
      sortOrder: 0,
      jsonData:  b({
        Title:          v('Build pages visually. Ship in minutes.'),
        TitleColor:     v('#ffffff'),
        TitleSize:      v('3.75rem'),
        Subtitle:       v('Open-source block-based CMS — 38 blocks, headless REST API, one-command setup.'),
        SubtitleColor:  v('#94a3b8'),
        SubtitleSize:   v('1.2rem'),
        Description:    v(''),
        Background:     v('/images/HeroBrix.png'),
        BackgroundColor:v('#0f172a'),
        OverlayColor:   v('#0f172a'),
        OverlayOpacity: v('0.78'),
        Height:         v('half-screen'),
        TextAlign:      v('center'),
        ButtonText:     v('Open Admin →'),
        ButtonUrl:      v('/admin'),
        ButtonColor:    v('#10b981'),
        ButtonTextColor:v('#ffffff'),
      }),
    },
  });
  console.log('✅ Block 1: HeroBlock');

  // ── Block 2: Stats ────────────────────────────────────────────────────────────
  await prisma.block.create({
    data: {
      type:      'StatsBlock',
      pageId:    homePage.id,
      sortOrder: 1,
      jsonData:  b({
        Title:        v(''),
        Subtitle:     v(''),
        Stat1Number:  v('38'),
        Stat1Label:   v('Pre-built blocks'),
        Stat1Icon:    v('fas fa-th-large'),
        Stat2Number:  v('MIT'),
        Stat2Label:   v('Open source license'),
        Stat2Icon:    v('fas fa-code-branch'),
        Stat3Number:  v('1 cmd'),
        Stat3Label:   v('Setup (npm run setup)'),
        Stat3Icon:    v('fas fa-bolt'),
        Stat4Number:  v('0'),
        Stat4Label:   v('Config files needed'),
        Stat4Icon:    v('fas fa-leaf'),
        NumberColor:  v('#10b981'),
        LabelColor:   v('#94a3b8'),
        BackgroundColor: v('#0f172a'),
        CardBgColor:  v('#1e293b'),
        PaddingY:     v('4rem'),
      }),
    },
  });
  console.log('✅ Block 2: StatsBlock');

  // ── Block 3: Section heading ──────────────────────────────────────────────────
  await prisma.block.create({
    data: {
      type:      'TextBlock',
      pageId:    homePage.id,
      sortOrder: 2,
      jsonData:  b({
        Title:          v('Everything you need to build fast'),
        TitleColor:     v('#0f172a'),
        TitleSize:      v('2.25rem'),
        TitleWeight:    v('800'),
        TitleAlignment: v('center'),
        Subtitle:       v('No vendor lock-in. Your data, your server, your rules.'),
        SubtitleColor:  v('#64748b'),
        SubtitleSize:   v('1.1rem'),
        SubtitleAlignment: v('center'),
        Body:           v(''),
        PaddingTop:     v('4rem'),
        PaddingBottom:  v('0.5rem'),
        PaddingLeft:    v('1.5rem'),
        PaddingRight:   v('1.5rem'),
      }),
    },
  });
  console.log('✅ Block 3: TextBlock (heading)');

  // ── Block 4: ColumnBlock (3 cols) ─────────────────────────────────────────────
  const featuresColumn = await prisma.block.create({
    data: {
      type:      'ColumnBlock',
      pageId:    homePage.id,
      sortOrder: 3,
      jsonData:  b({
        Columns: v('3'),
        Gap:     v('gap-6'),
      }),
    },
  });
  console.log('✅ Block 4: ColumnBlock (features)');

  // ── Block 4.1: Feature card — Blocks ─────────────────────────────────────────
  await prisma.block.create({
    data: {
      type:      'IconCardBlock',
      pageId:    homePage.id,
      parentId:  featuresColumn.id,
      sortOrder: 0,
      jsonData:  b({
        LeftIconClass:    v('fas fa-th-large'),
        LeftIconColor:    v('#10b981'),
        LeftIconFaSize:   v('2rem'),
        IconPosition:     v('top'),
        TextAlign:        v('left'),
        Title:            v('38 pre-built blocks'),
        TitleColor:       v('#0f172a'),
        TitleSize:        v('1.15rem'),
        Text:             v('Hero, Pricing, Testimonials, Team, Gallery, Map, Countdown, Timeline, Accordion, Tabs — and more. Add your own in minutes.'),
        TextColor:        v('#64748b'),
        TextSize:         v('0.95rem'),
        BackgroundColor:  v('#f8fafc'),
        BorderColor:      v('#e2e8f0'),
        BorderWidth:      v('1px'),
        BorderRadius:     v('16px'),
        Padding:          v('1.75rem'),
        Shadow:           v('0 1px 4px rgba(0,0,0,0.06)'),
      }),
    },
  });

  // ── Block 4.2: Feature card — API ────────────────────────────────────────────
  await prisma.block.create({
    data: {
      type:      'IconCardBlock',
      pageId:    homePage.id,
      parentId:  featuresColumn.id,
      sortOrder: 1,
      jsonData:  b({
        LeftIconClass:    v('fas fa-plug'),
        LeftIconColor:    v('#6366f1'),
        LeftIconFaSize:   v('2rem'),
        IconPosition:     v('top'),
        TextAlign:        v('left'),
        Title:            v('Headless REST API'),
        TitleColor:       v('#0f172a'),
        TitleSize:        v('1.15rem'),
        Text:             v('Every page and block accessible via REST. Pair with Next.js, Astro, SvelteKit, React Native, or any HTTP client.'),
        TextColor:        v('#64748b'),
        TextSize:         v('0.95rem'),
        BackgroundColor:  v('#f8fafc'),
        BorderColor:      v('#e2e8f0'),
        BorderWidth:      v('1px'),
        BorderRadius:     v('16px'),
        Padding:          v('1.75rem'),
        Shadow:           v('0 1px 4px rgba(0,0,0,0.06)'),
      }),
    },
  });

  // ── Block 4.3: Feature card — Deploy ─────────────────────────────────────────
  await prisma.block.create({
    data: {
      type:      'IconCardBlock',
      pageId:    homePage.id,
      parentId:  featuresColumn.id,
      sortOrder: 2,
      jsonData:  b({
        LeftIconClass:    v('fas fa-rocket'),
        LeftIconColor:    v('#f59e0b'),
        LeftIconFaSize:   v('2rem'),
        IconPosition:     v('top'),
        TextAlign:        v('left'),
        Title:            v('Deploy anywhere'),
        TitleColor:       v('#0f172a'),
        TitleSize:        v('1.15rem'),
        Text:             v('Vercel in one click. Railway, Render, or any VPS. SQLite by default — zero database config needed.'),
        TextColor:        v('#64748b'),
        TextSize:         v('0.95rem'),
        BackgroundColor:  v('#f8fafc'),
        BorderColor:      v('#e2e8f0'),
        BorderWidth:      v('1px'),
        BorderRadius:     v('16px'),
        Padding:          v('1.75rem'),
        Shadow:           v('0 1px 4px rgba(0,0,0,0.06)'),
      }),
    },
  });
  console.log('✅ Blocks 4.1–4.3: Feature IconCardBlocks');

  // ── Block 5: Spacer ───────────────────────────────────────────────────────────
  await prisma.block.create({
    data: {
      type:      'SpacerBlock',
      pageId:    homePage.id,
      sortOrder: 4,
      jsonData:  b({ Height: v('3rem'), BackgroundColor: v('#ffffff') }),
    },
  });

  // ── Block 6: CTA Banner ───────────────────────────────────────────────────────
  await prisma.block.create({
    data: {
      type:      'CTABannerBlock',
      pageId:    homePage.id,
      sortOrder: 5,
      jsonData:  b({
        Title:           v('Ready to build?'),
        TitleColor:      v('#ffffff'),
        TitleSize:       v('2.5rem'),
        Subtitle:        v('Clone the repo, run npm run setup, and you\'re live in under 2 minutes.'),
        SubtitleColor:   v('rgba(255,255,255,0.7)'),
        Btn1Text:        v('View on GitHub'),
        Btn1Url:         v('https://github.com/Learsi23/brix-cms'),
        Btn1BgColor:     v('#10b981'),
        Btn1TextColor:   v('#ffffff'),
        Btn2Text:        v('Open Admin Panel'),
        Btn2Url:         v('/admin'),
        Btn2Color:       v('rgba(255,255,255,0.3)'),
        BackgroundColor: v('#0f172a'),
        BackgroundColor2:v('#1e293b'),
        PaddingY:        v('6rem'),
        TextAlign:       v('center'),
      }),
    },
  });
  console.log('✅ Block 5–6: Spacer + CTABannerBlock');

  // ── Site configuration (navbar + footer) ──────────────────────────────────────
  await prisma.siteConfig.upsert({
    where:  { key: 'site' },
    update: {},
    create: {
      key:   'site',
      value: JSON.stringify({
        navbar: {
          backgroundColor:  '#ffffff',
          textColor:        '#0f172a',
          logo:             '/images/logo-menu.png',
          logoAltText:      'Brix CMS',
          logoWidth:        '120px',
          logoLink:         '/',
          isSticky:         true,
          hasShadow:        true,
          paddingVertical:  'py-3',
          menuItems: [
            { customText: 'GitHub',  customUrl: 'https://github.com/Learsi23/brix-cms', isCustomUrl: true, pageSlug: '' },
            { customText: 'Admin',   customUrl: '/admin',  isCustomUrl: true, pageSlug: '' },
          ],
        },
        footer: {
          backgroundColor:        '#0f172a',
          textColor:              '#94a3b8',
          logo:                   '/images/logo-menu.png',
          logoAltText:            'Brix CMS',
          logoWidth:              '100px',
          logoPosition:           'left',
          showPagesColumn:        false,
          pagesColumnTitle:       'Pages',
          pages:                  [],
          showSocialMediaColumn:  true,
          socialMediaColumnTitle: 'Links',
          socialMedia: [
            { platform: 'github',   url: 'https://github.com/Learsi23/brix-cms', iconClass: 'fab fa-github' },
            { platform: 'npm',      url: 'https://www.npmjs.com/package/brix-cms', iconClass: 'fab fa-npm' },
          ],
          showCopyrightRow:       true,
          companyName:            'Brix CMS',
          companyNumber:          '',
          copyrightText:          'MIT License — free forever',
          showHorizontalLine:     true,
          paddingVertical:        'py-8',
          columnsGap:             'gap-8',
        },
      }),
    },
  });
  console.log('✅ Site config (navbar + footer)');

  console.log('\n🎉 Brix CMS initialized!');
  console.log('📧 Email:    admin@brix.com');
  console.log('🔑 Password: admin123');
  console.log('🌐 Home:     http://localhost:3000');
  console.log('🔧 Admin:    http://localhost:3000/admin');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
