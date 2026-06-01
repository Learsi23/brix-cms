// prisma/seed.ts — Seeds 3 showcase pages matching BrixCMS.Open
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Brand palette ─────────────────────────────────────────────────────────────
const BG       = '#0A0A0B';
const SURFACE  = '#111113';
const SURFACE2 = '#18181C';
const ACCENT   = '#5B6EF5';
const SUCCESS  = '#22C55E';
const WARNING  = '#F59E0B';
const TEXT     = '#F0F0F5';
const TEXT2    = '#9696A6';
const BORDER   = '#2A2A30';

// ── Category accent colours (for block-library headings) ─────────────────────
const CAT_LAYOUT      = '#7C3AED';   // purple
const CAT_CONTENT     = ACCENT;      // indigo
const CAT_MEDIA       = '#0EA5E9';   // sky
const CAT_INTERACTIVE = WARNING;     // amber
const CAT_AI          = SUCCESS;     // green
const CAT_COMMERCE    = '#EC4899';   // pink

// ── Helpers ───────────────────────────────────────────────────────────────────
const v = (value: string) => ({ Value: value });
function b(data: Record<string, { Value: string }>) { return JSON.stringify(data); }

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE 1 — HOME  (slug: "")
// ══════════════════════════════════════════════════════════════════════════════

async function seedHomePage() {
  let page = await prisma.page.findFirst({ where: { slug: '', parentId: null } });
  if (page) {
    await prisma.block.deleteMany({ where: { pageId: page.id } });
    page = await prisma.page.update({
      where:  { id: page.id },
      data:   { title: 'Home', isPublished: true, publishedAt: new Date(), pageType: 'standard', isSeed: true, jsonData: JSON.stringify({ BackgroundColor: v(BG) }) },
    });
  } else {
    page = await prisma.page.create({
      data: {
        title:       'Home',
        slug:        '',
        description: 'BrixCMS.Open — free, self-hosted, open-source Next.js 16 CMS. 50+ blocks, Ollama AI chatbot, SQLite, MIT license.',
        isPublished:  true,
        publishedAt:  new Date(),
        sortOrder:    0,
        pageType:    'standard',
        isSeed:       true,
        jsonData:    JSON.stringify({ BackgroundColor: v(BG) }),
      },
    });
  }

  const pid = page!.id;
  await prisma.block.deleteMany({ where: { pageId: pid } });
  let sort = 0;

  // ── Announcement bar ──────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'BannerBlock', pageId: pid, sortOrder: sort++,
    jsonData: b({
      Icon:            v('✦'),
      Text:            v('These pages are built 100% with BrixCMS — visual editor, zero custom code.'),
      LinkText:        v('Watch on YouTube →'),
      LinkUrl:         v('https://www.youtube.com/@BrixCMS'),
      BackgroundColor: v(ACCENT),
      TextColor:       v('#ffffff'),
      Closeable:       v('true'),
    }),
  }});

  // ── Hero ──────────────────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'HeroBlock', pageId: pid, sortOrder: sort++,
    jsonData: b({
      Title:           v('50+ blocks. Zero config.'),
      TitleColor:      v(TEXT),
      TitleSize:       v('3.25rem'),
      Subtitle:        v('Every block in BrixCMS.Open — visual editor, live preview, and AI chatbot (Ollama local or Gemini cloud) built in.'),
      SubtitleColor:   v(TEXT2),
      BackgroundColor: v(BG),
      OverlayOpacity:  v('0.0'),
      Height:          v('compact'),
      PaddingTop:      v('calc(3rem + 64px)'),
      TextAlign:       v('center'),
      ButtonText:      v('Open Admin →'),
      ButtonUrl:       v('/admin'),
      ButtonColor:     v(ACCENT),
      ButtonTextColor: v('#ffffff'),
    }),
  }});

  // ── AI Section ────────────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'TextBlock', pageId: pid, sortOrder: sort++,
    jsonData: b({
      Title:           v('AI — Ollama (local, free) + Gemini (cloud)'),
      TitleColor:      v(TEXT),
      TitleSize:       v('1.9rem'),
      TitleWeight:     v('800'),
      TitleAlignment:  v('left'),
      BackgroundColor: v(BG),
      Padding:         v('4rem 1.5rem 0.5rem'),
    }),
  }});

  const aiGrid = await prisma.block.create({ data: {
    type: 'GridColumn', pageId: page.id, sortOrder: sort++,
    jsonData: b({ MaxColumns: v('2'), Gap: v('gap-5'), PaddingY: v('1rem'), PaddingX: v('1.5rem'), BackgroundColor: v(BG) }),
  }});

  await prisma.block.create({ data: {
    type: 'IconCardBlock', pageId: page.id, parentId: aiGrid.id, sortOrder: 0,
    jsonData: b({
      LeftIconClass: v('fas fa-robot'), LeftIconColor: v(SUCCESS), LeftIconFaSize: v('1.75rem'),
      IconPosition: v('left'), TextAlign: v('left'),
      Title: v('ChatBlock — inline AI chat'), TitleColor: v(TEXT), TitleSize: v('1.05rem'),
      Text: v('Drop ChatBlock anywhere on a page for a fully functional inline chat. Choose Ollama (local, free, 100% private) or Gemini (Google cloud — paste your API key in Admin → Chatbot). Responds in the user\'s own language.'),
      TextColor: v(TEXT2), BackgroundColor: v(SURFACE), BorderColor: v(BORDER), BorderWidth: v('1px'), BorderRadius: v('12px'), Padding: v('1.5rem'),
    }),
  }});

  await prisma.block.create({ data: {
    type: 'IconCardBlock', pageId: page.id, parentId: aiGrid.id, sortOrder: 1,
    jsonData: b({
      LeftIconClass: v('fas fa-comment-dots'), LeftIconColor: v(ACCENT), LeftIconFaSize: v('1.75rem'),
      IconPosition: v('left'), TextAlign: v('left'),
      Title: v('FloatingChatBlock — site-wide bubble'), TitleColor: v(TEXT), TitleSize: v('1.05rem'),
      Text: v('Add FloatingChatBlock once in your layout and it appears on every page as a persistent bubble. Configure the model, system prompt and appearance in Admin → Chatbot. Works with Ollama (local, free) and Gemini (Google cloud).'),
      TextColor: v(TEXT2), BackgroundColor: v(SURFACE), BorderColor: v(BORDER), BorderWidth: v('1px'), BorderRadius: v('12px'), Padding: v('1.5rem'),
    }),
  }});

  // ── Block library heading ─────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'TextBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Title:           v('Block library — 50+ blocks'),
      TitleColor:      v(TEXT),
      TitleSize:       v('1.9rem'),
      TitleWeight:     v('800'),
      TitleAlignment:  v('left'),
      Subtitle:        v('Organised by category. Every block is configurable from the visual editor — no code needed.'),
      SubtitleColor:   v(TEXT2),
      SubtitleAlignment:v('left'),
      BackgroundColor: v(BG),
      Padding:         v('3.5rem 1.5rem 1rem'),
    }),
  }});

  console.log('✅ Home page seeded');
  return page;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE 2 — FEATURES  (slug: "features")
// ══════════════════════════════════════════════════════════════════════════════

async function seedFeaturesPage() {
  let page = await prisma.page.findFirst({ where: { slug: 'features', parentId: null } });
  if (page) {
    await prisma.block.deleteMany({ where: { pageId: page.id } });
    page = await prisma.page.update({
      where:  { id: page.id },
      data:   { title: 'Features', isPublished: true, publishedAt: new Date(), pageType: 'standard', isSeed: true, jsonData: JSON.stringify({ BackgroundColor: v(BG) }) },
    });
  } else {
    page = await prisma.page.create({
      data: {
        title:       'Features',
        slug:        'features',
        description: 'BrixCMS.Open features — 50+ blocks, Ollama AI chatbot, visual page editor, SQLite, MIT license.',
        isPublished:  true,
        publishedAt:  new Date(),
        sortOrder:    1,
        pageType:    'standard',
        isSeed:       true,
        jsonData:    JSON.stringify({ BackgroundColor: v(BG) }),
      },
    });
  }

  const pid = page!.id;
  await prisma.block.deleteMany({ where: { pageId: pid } });
  let sort = 0;

  // ── Hero ──────────────────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'HeroBlock', pageId: pid, sortOrder: sort++,
    jsonData: b({
      Title:           v('50+ blocks. Zero config.'),
      TitleColor:      v(TEXT),
      TitleSize:       v('3.25rem'),
      Subtitle:        v('Every block in BrixCMS.Open — visual editor, live preview, and AI chatbot (Ollama local or Gemini cloud) built in.'),
      SubtitleColor:   v(TEXT2),
      BackgroundColor: v(BG),
      OverlayOpacity:  v('0.0'),
      Height:          v('compact'),
      PaddingTop:      v('calc(3rem + 64px)'),
      TextAlign:       v('center'),
      ButtonText:      v('Open Admin →'),
      ButtonUrl:       v('/admin'),
      ButtonColor:     v(ACCENT),
      ButtonTextColor: v('#ffffff'),
    }),
  }});

  // ── AI Section ────────────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'TextBlock', pageId: pid, sortOrder: sort++,
    jsonData: b({
      Title:           v('AI — Ollama (local, free) + Gemini (cloud)'),
      TitleColor:      v(TEXT),
      TitleSize:       v('1.9rem'),
      TitleWeight:     v('800'),
      TitleAlignment:  v('left'),
      BackgroundColor: v(BG),
      Padding:         v('4rem 1.5rem 0.5rem'),
    }),
  }});

  const aiGrid = await prisma.block.create({ data: {
    type: 'GridColumn', pageId: pid, sortOrder: sort++,
    jsonData: b({ MaxColumns: v('2'), Gap: v('gap-5'), PaddingY: v('1rem'), PaddingX: v('1.5rem'), BackgroundColor: v(BG) }),
  }});

  await prisma.block.create({ data: {
    type: 'IconCardBlock', pageId: pid, parentId: aiGrid.id, sortOrder: 0,
    jsonData: b({
      LeftIconClass: v('fas fa-robot'), LeftIconColor: v(SUCCESS), LeftIconFaSize: v('1.75rem'),
      IconPosition: v('left'), TextAlign: v('left'),
      Title: v('ChatBlock — inline AI chat'), TitleColor: v(TEXT), TitleSize: v('1.05rem'),
      Text: v('Drop ChatBlock anywhere on a page for a fully functional inline chat. Choose Ollama (local, free, 100% private) or Gemini (Google cloud — paste your API key in Admin → Chatbot). Responds in the user\'s own language.'),
      TextColor: v(TEXT2), BackgroundColor: v(SURFACE), BorderColor: v(BORDER), BorderWidth: v('1px'), BorderRadius: v('12px'), Padding: v('1.5rem'),
    }),
  }});

  await prisma.block.create({ data: {
    type: 'IconCardBlock', pageId: pid, parentId: aiGrid.id, sortOrder: 1,
    jsonData: b({
      LeftIconClass: v('fas fa-comment-dots'), LeftIconColor: v(ACCENT), LeftIconFaSize: v('1.75rem'),
      IconPosition: v('left'), TextAlign: v('left'),
      Title: v('FloatingChatBlock — site-wide bubble'), TitleColor: v(TEXT), TitleSize: v('1.05rem'),
      Text: v('Add FloatingChatBlock once in your layout and it appears on every page as a persistent bubble. Configure the model, system prompt and appearance in Admin → Chatbot. Works with Ollama (local, free) and Gemini (Google cloud).'),
      TextColor: v(TEXT2), BackgroundColor: v(SURFACE), BorderColor: v(BORDER), BorderWidth: v('1px'), BorderRadius: v('12px'), Padding: v('1.5rem'),
    }),
  }});

  // ── Block library heading ─────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'TextBlock', pageId: pid, sortOrder: sort++,
    jsonData: b({
      Title:           v('Block library — 50+ blocks'),
      TitleColor:      v(TEXT),
      TitleSize:       v('1.9rem'),
      TitleWeight:     v('800'),
      TitleAlignment:  v('left'),
      Subtitle:        v('Organised by category. Every block is configurable from the visual editor — no code needed.'),
      SubtitleColor:   v(TEXT2),
      SubtitleAlignment:v('left'),
      BackgroundColor: v(BG),
      Padding:         v('3.5rem 1.5rem 1rem'),
    }),
  }});

  // ── Helper: category heading ──────────────────────────────────────────────
  async function catHeading(label: string, color: string, s: number) {
    await prisma.block.create({ data: {
      type: 'TextBlock', pageId: pid, sortOrder: s,
      jsonData: b({
        Title:           v(label),
        TitleColor:      v(color),
        TitleSize:       v('0.7rem'),
        TitleWeight:     v('700'),
        TitleAlignment:  v('left'),
        BackgroundColor: v(BG),
        Padding:         v('2rem 1.5rem 0.4rem'),
      }),
    }});
  }

  // ── Helper: block grid ────────────────────────────────────────────────────
  async function blockGrid(blocks: readonly (readonly [string, string, string])[], s: number) {
    const grid = await prisma.block.create({ data: {
      type: 'GridColumn', pageId: pid, sortOrder: s,
      jsonData: b({ MaxColumns: v('4'), Gap: v('gap-3'), PaddingY: v('0.25rem'), PaddingX: v('1.5rem'), BackgroundColor: v(BG) }),
    }});
    for (let i = 0; i < blocks.length; i++) {
      const [icon, name, desc] = blocks[i];
      await prisma.block.create({ data: {
        type: 'IconCardBlock', pageId: pid, parentId: grid.id, sortOrder: i,
        jsonData: b({
          LeftIconClass: v(icon), LeftIconColor: v(ACCENT), LeftIconFaSize: v('1rem'),
          IconPosition: v('top'), TextAlign: v('left'),
          Title: v(name), TitleColor: v(TEXT), TitleSize: v('0.82rem'), TitleWeight: v('600'),
          Text: v(desc), TextColor: v(TEXT2), TextSize: v('0.75rem'),
          BackgroundColor: v(SURFACE), BorderColor: v(BORDER), BorderWidth: v('1px'), BorderRadius: v('10px'), Padding: v('1rem'),
        }),
      }});
    }
  }

  // ── LAYOUT ────────────────────────────────────────────────────────────────
  await catHeading('LAYOUT', CAT_LAYOUT, sort++);
  await blockGrid([
    ['fas fa-columns',      'GridColumnBlock',   'Responsive grid container — 2 to 4 columns'],
    ['fas fa-grip-lines',   'SpacerBlock',       'Vertical spacing between sections'],
    ['fas fa-minus',        'DividerBlock',      'Styled horizontal rule with width and colour options'],
    ['fas fa-bullhorn',     'BannerBlock',       'Top announcement bar with icon, text and CTA link'],
    ['fas fa-expand',       'FullColumnBlock',   'Full-width padded content wrapper'],
  ] as const, sort++);

  // ── CONTENT ───────────────────────────────────────────────────────────────
  await catHeading('CONTENT', CAT_CONTENT, sort++);
  await blockGrid([
    ['fas fa-image',            'HeroBlock',          'Full-screen hero with badge, CTA buttons and social proof'],
    ['fas fa-font',             'TextBlock',          'Title + subtitle + body with full padding control'],
    ['fas fa-photo-video',      'ImageBlock',         'Responsive image with caption and optional link'],
    ['fab fa-markdown',         'MarkdownBlock',      'Markdown-rendered content block'],
    ['fas fa-id-card',          'CardBlock',          'Card with image, title and body text'],
    ['fas fa-th-large',         'IconCardBlock',      'Card with FontAwesome icon, title and text'],
    ['fas fa-chart-bar',        'StatsBlock',         '4 key metrics with icons and labels'],
    ['fas fa-bullseye',         'CTABannerBlock',     'Call-to-action banner with 2 buttons'],
    ['fas fa-building',         'LogoStripBlock',     'Scrolling or static client logo band'],
    ['fas fa-trophy',           'SocialProofBlock',   'Review count + average score + trust logos'],
    ['fas fa-star',             'TestimonialsBlock',  'Review carousel with avatars and star ratings'],
    ['fas fa-users',            'TeamBlock',          'Team grid with photo, name & role'],
    ['fas fa-tags',             'PricingBlock',       'Pricing cards container with popular badge'],
    ['fas fa-stream',           'TimelineBlock',      'Step-by-step process or company history'],
    ['fas fa-bars',             'MenuBlock',          'Navigation / link list block'],
    ['fas fa-clock',            'OpeningHoursBlock',  'Business hours table with open/closed indicator'],
    ['fas fa-list-check',       'FeatureListBlock',   'Icon bullet list of features or benefits'],
    ['fas fa-grip',             'FeatureGridBlock',   'Inline feature grid — no child blocks needed'],
    ['fas fa-table',            'TableBlock',         'Data table — pipe-separated, striped, bordered or minimal'],
    ['fas fa-code',             'CodeBlock',          'Syntax-highlighted code block with copy button'],
  ] as const, sort++);

  // ── MEDIA ─────────────────────────────────────────────────────────────────
  await catHeading('MEDIA', CAT_MEDIA, sort++);
  await blockGrid([
    ['fas fa-images',         'GalleryBlock',           'Image gallery with lightbox viewer'],
    ['fas fa-columns',        'FlexibleImageTextBlock', 'Image + text side by side — left or right'],
    ['fas fa-play-circle',    'VideoBlock',             'YouTube / Vimeo / self-hosted video embed'],
    ['fas fa-map-marker-alt', 'MapBlock',               'Embedded Google or OpenStreetMap'],
    ['fas fa-magic',          'LottieBlock',            'Lottie JSON animations — auto-play, loop, speed'],
    ['fas fa-exchange-alt',   'BeforeAfterBlock',       'Before / after image comparison slider'],
    ['fas fa-music',          'AudioBlock',             'Audio player — minimal, card or full style'],
    ['fas fa-qrcode',         'QRCodeBlock',            'QR generator — URL, WiFi, vCard, Email'],
  ] as const, sort++);

  // ── INTERACTIVE ───────────────────────────────────────────────────────────
  await catHeading('INTERACTIVE', CAT_INTERACTIVE, sort++);
  await blockGrid([
    ['fas fa-layer-group',  'AccordionBlock',     'Expandable accordion sections with smooth animation'],
    ['fas fa-folder-open',  'TabsBlock',          'Tabbed content panels — switch without page reload'],
    ['fas fa-chevron-down', 'DropdownBlock',      'Select dropdown with configurable options'],
    ['fas fa-mouse-pointer','ButtonLinkBlock',    'Standalone call-to-action button'],
    ['fas fa-align-center', 'TextWithButtonBlock','Text + inline button side by side'],
    ['fas fa-hourglass',    'CountdownBlock',     'Live countdown timer to a target date'],
    ['fas fa-envelope',     'EmailButtonBlock',   'mailto button — pre-fills subject and body'],
    ['fas fa-paper-plane',  'ContactFormBlock',   'Full contact form with validation and email'],
    ['fas fa-question',     'FAQBlock',           'Accordion FAQ — cards, bordered or list style'],
    ['fas fa-cookie-bite',  'CookieBannerBlock',  'GDPR-compliant cookie consent banner'],
    ['fas fa-at',           'NewsletterBlock',    'Email signup form with configurable endpoint'],
  ] as const, sort++);

  // ── AI ────────────────────────────────────────────────────────────────────
  await catHeading('AI', CAT_AI, sort++);
  await blockGrid([
    ['fas fa-robot',       'ChatBlock',         'Inline AI chat — Ollama (local, free) or Gemini (Google cloud)'],
    ['fas fa-comment-alt', 'FloatingChatBlock', 'Persistent floating chat bubble — Ollama or Gemini, zero config'],
  ] as const, sort++);

  // ── COMMERCE ─────────────────────────────────────────────────────────────
  await catHeading('COMMERCE', CAT_COMMERCE, sort++);
  await blockGrid([
    ['fas fa-shield-check', 'TrustBadgesBlock',      'Payment & trust badge strip — Visa, PayPal and more'],
    ['fas fa-box',          'ProductCardBlock',       'Individual product card with price and buy button'],
    ['fas fa-store',        'ExistingProductsBlock',  'Display products from your Admin catalogue'],
    ['fas fa-shopping-bag', 'ProductsGalleryBlock',   'Full product grid with category filters'],
  ] as const, sort++);

  // ── Quick start ───────────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'TextBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Title:           v('Get started in seconds'),
      TitleColor:      v(TEXT),
      TitleSize:       v('1.9rem'),
      TitleWeight:     v('800'),
      TitleAlignment:  v('center'),
      BackgroundColor: v(SURFACE),
      Padding:         v('4rem 1.5rem 1rem'),
    }),
  }});

  await prisma.block.create({ data: {
    type: 'CodeBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      code:            v('# 1. Clone the repo\ngit clone https://github.com/Learsi23/brix-cms\ncd brix-cms\n\n# 2. Install & setup (creates SQLite DB + seeds pages)\nnpm install\nnpm run setup\n\n# 3. Run\nnpm run dev\n# → http://localhost:3000\n# → Admin: /admin  (admin@brix.com / admin123)'),
      language:        v('bash'),
      title:           v('Quick start'),
      showLineNumbers: v('false'),
      showCopyButton:  v('true'),
      fontSize:        v('14px'),
      borderRadius:    v('12px'),
    }),
  }});

  await prisma.block.create({ data: {
    type: 'SpacerBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({ Height: v('2rem'), BackgroundColor: v(SURFACE) }),
  }});

  await prisma.block.create({ data: {
    type: 'CTABannerBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Title:           v('Want the full platform?'),
      TitleColor:      v(TEXT),
      TitleSize:       v('2rem'),
      Subtitle:        v('Multi-tenant · White label · BYOK AI (Gemini, OpenAI, Claude, DeepSeek, Mistral, Groq, Ollama) · Stripe e-commerce · Figma import'),
      SubtitleColor:   v(TEXT2),
      Btn1Text:        v('See BrixCMS Pro →'),
      Btn1Url:         v('https://brix-cms.com'),
      Btn1BgColor:     v(ACCENT),
      Btn1TextColor:   v('#ffffff'),
      Btn2Text:        v('View on GitHub'),
      Btn2Url:         v('https://github.com/Learsi23/brix-cms'),
      Btn2Color:       v(BORDER),
      BackgroundColor: v(SURFACE),
      BackgroundColor2:v(BG),
      PaddingY:        v('5rem'),
      TextAlign:       v('center'),
    }),
  }});

  console.log('✅ Features page seeded');
  return page;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE 3 — PRO  (slug: "pro")  —  Coming Soon
// ══════════════════════════════════════════════════════════════════════════════

async function seedProPage() {
  let page = await prisma.page.findFirst({ where: { slug: 'pro', parentId: null } });
  if (page) {
    await prisma.block.deleteMany({ where: { pageId: page.id } });
    page = await prisma.page.update({
      where:  { id: page.id },
      data:   { title: 'BrixCMS Pro', isPublished: true, publishedAt: new Date(), pageType: 'standard', isSeed: true, jsonData: JSON.stringify({ BackgroundColor: v(BG) }) },
    });
  } else {
    page = await prisma.page.create({
      data: {
        title:       'BrixCMS Pro',
        slug:        'pro',
        description: 'BrixCMS Pro — coming soon. Multi-tenant, white label, BYOK AI (Gemini, OpenAI, Claude, DeepSeek, Mistral, Groq, Ollama), Stripe e-commerce, Figma import.',
        isPublished:  true,
        publishedAt:  new Date(),
        sortOrder:    2,
        pageType:    'standard',
        isSeed:       true,
        jsonData:    JSON.stringify({ BackgroundColor: v(BG) }),
      },
    });
  }

  await prisma.block.deleteMany({ where: { pageId: page.id } });
  let sort = 0;

  // ── Announcement bar ──────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'BannerBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Icon:            v('🚀'),
      Text:            v('BrixCMS Pro is launching soon — the full platform for agencies.'),
      LinkText:        v('Get early access →'),
      LinkUrl:         v('mailto:israel231075@gmail.com?subject=BrixCMS Pro — Early Access'),
      BackgroundColor: v(ACCENT),
      TextColor:       v('#ffffff'),
      Closeable:       v('true'),
    }),
  }});

  // ── Hero ──────────────────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'HeroBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Title:              v('BrixCMS Pro'),
      TitleColor:         v(TEXT),
      TitleSize:          v('clamp(3rem, 7vw, 5rem)'),
      TitleWeight:        v('900'),
      Subtitle:           v('The complete CMS platform for agencies and professional developers.\nMulti-tenant · White label · 7 AI providers · Stripe · Figma import.'),
      SubtitleColor:      v(TEXT2),
      SubtitleSize:       v('1.15rem'),
      Description:        v(''),
      BackgroundColor:    v(BG),
      BackgroundGradient: v('radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,110,245,0.14) 0%, transparent 65%)'),
      Height:             v('half-screen'),
      PaddingTop:         v('calc(4rem + 64px)'),
      TextAlign:          v('center'),
      ButtonText:         v('Get early access →'),
      ButtonUrl:          v('mailto:israel231075@gmail.com?subject=BrixCMS Pro — Early Access'),
      ButtonColor:        v(ACCENT),
      ButtonTextColor:    v('#ffffff'),
      Button2Text:        v('Try Open for free →'),
      Button2Url:         v('https://github.com/Learsi23/brix-cms'),
      Button2Color:       v('transparent'),
      Button2TextColor:   v(TEXT),
      Button2BorderColor: v(BORDER),
      ShowSocialProof:    v('true'),
      SocialProofItems:   v('🚀 Launching soon,Multi-tenant,White label,7 AI providers'),
      SocialProofColor:   v(TEXT2),
      SocialProofIconColor: v(ACCENT),
    }),
  }});

  // ── Stats ─────────────────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'StatsBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Title: v(''), Subtitle: v(''),
      Stat1Number: v('7'),      Stat1Label: v('AI providers — BYOK'),           Stat1Icon: v('fas fa-brain'),
      Stat2Number: v('∞'),      Stat2Label: v('Client sites — multi-tenant'),   Stat2Icon: v('fas fa-sitemap'),
      Stat3Number: v('1%'),     Stat3Label: v('Transaction fee — Stripe'),       Stat3Icon: v('fas fa-shopping-cart'),
      Stat4Number: v('White'),  Stat4Label: v('Label — your brand'),             Stat4Icon: v('fas fa-tag'),
      NumberColor:     v(ACCENT),
      LabelColor:      v(TEXT2),
      BackgroundColor: v(SURFACE),
      CardBgColor:     v(SURFACE2),
      PaddingY:        v('3rem'),
    }),
  }});

  // ── "Everything in Open, plus:" ───────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'TextBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Title:             v('Everything in Open, plus:'),
      TitleColor:        v(TEXT),
      TitleSize:         v('2rem'),
      TitleWeight:       v('800'),
      TitleAlignment:    v('center'),
      Subtitle:          v('All the blocks, editor and AI you know — with the agency tools you need.'),
      SubtitleColor:     v(TEXT2),
      SubtitleAlignment: v('center'),
      BackgroundColor:   v(BG),
      Padding:           v('4rem 1.5rem 1.5rem'),
    }),
  }});

  // ── Pro feature cards (2 cols) ────────────────────────────────────────────
  const proGrid = await prisma.block.create({ data: {
    type: 'GridColumn', pageId: page.id, sortOrder: sort++,
    jsonData: b({ MaxColumns: v('2'), Gap: v('gap-5'), PaddingY: v('0.5rem'), PaddingX: v('1.5rem'), BackgroundColor: v(BG) }),
  }});

  const proFeatures = [
    ['fas fa-sitemap',       SUCCESS,   'Multi-tenant panel',           'Manage unlimited client websites from one admin. Each site has its own pages, blocks, media and settings — fully isolated.'],
    ['fas fa-tag',           ACCENT,    'White label',                  'Your logo, your domain, your colours. Clients see your CMS, not ours.'],
    ['fas fa-key',           WARNING,   'BYOK — 7 AI providers',        'Ollama (local, free) + Gemini, OpenAI, Claude, DeepSeek, Mistral and Groq with your own keys. Zero AI markup.'],
    ['fab fa-figma',         '#7C5CBF', 'Figma → CMS import',          'AI reads your Figma frames and builds the blocks automatically. Pixel-perfect with exact colours and typography.'],
    ['fas fa-shopping-cart', SUCCESS,   'Stripe e-commerce — 1% fee',  'Sell products from any page via Stripe Connect. Full cart, checkout and order management. Just 1% per transaction.'],
    ['fas fa-headset',       ACCENT,    'Priority support + SLA',       'Direct channel to the BrixCMS team. Guaranteed response times and an on-boarding call on signup.'],
  ] as const;

  for (let i = 0; i < proFeatures.length; i++) {
    const [icon, color, title, text] = proFeatures[i];
    await prisma.block.create({ data: {
      type: 'IconCardBlock', pageId: page.id, parentId: proGrid.id, sortOrder: i,
      jsonData: b({
        LeftIconClass: v(icon), LeftIconColor: v(color), LeftIconFaSize: v('1.75rem'),
        IconPosition: v('left'), TextAlign: v('left'),
        Title: v(title), TitleColor: v(TEXT), TitleSize: v('1rem'),
        Text: v(text), TextColor: v(TEXT2), TextSize: v('0.875rem'),
        BackgroundColor: v(SURFACE), BorderColor: v(BORDER), BorderWidth: v('1px'), BorderRadius: v('12px'), Padding: v('1.5rem'),
      }),
    }});
  }

  // ── AI Providers heading ──────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'TextBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Title:             v('BYOK — Bring Your Own Key'),
      TitleColor:        v(TEXT),
      TitleSize:         v('1.9rem'),
      TitleWeight:       v('800'),
      TitleAlignment:    v('center'),
      Subtitle:          v('Connect your own API keys. Pay providers directly at their published rates. Zero markup from BrixCMS.'),
      SubtitleColor:     v(TEXT2),
      SubtitleAlignment: v('center'),
      BackgroundColor:   v(SURFACE),
      Padding:           v('4rem 1.5rem 1.5rem'),
    }),
  }});

  // ── AI provider cards (4 cols) ────────────────────────────────────────────
  const aiGrid = await prisma.block.create({ data: {
    type: 'GridColumn', pageId: page.id, sortOrder: sort++,
    jsonData: b({ MaxColumns: v('4'), Gap: v('gap-3'), PaddingY: v('0.5rem'), PaddingX: v('1.5rem'), BackgroundColor: v(SURFACE) }),
  }});

  const aiProviders = [
    ['fas fa-robot',       '#4285F4', 'Gemini',            'Google — free tier available. Best for multimodal tasks.'],
    ['fas fa-comment-alt', '#10A37F', 'OpenAI · ChatGPT',  'GPT-4o and o-series models. Industry standard.'],
    ['fas fa-brain',       '#D97706', 'Claude · Anthropic','Long context, precise reasoning, safe outputs.'],
    ['fas fa-microchip',   '#3B82F6', 'DeepSeek',          'Open-weights model. Strong at code and reasoning.'],
    ['fas fa-wind',        '#8B5CF6', 'Mistral',           'European, lightweight, fast and open.'],
    ['fas fa-bolt',        '#F59E0B', 'Groq',              'Ultra-fast inference. Same models, 10× speed.'],
    ['fas fa-server',      SUCCESS,   'Ollama · local',    'Run any model on your own server. Free, private, offline.'],
  ] as const;

  for (let i = 0; i < aiProviders.length; i++) {
    const [icon, color, title, text] = aiProviders[i];
    await prisma.block.create({ data: {
      type: 'IconCardBlock', pageId: page.id, parentId: aiGrid.id, sortOrder: i,
      jsonData: b({
        LeftIconClass: v(icon), LeftIconColor: v(color), LeftIconFaSize: v('1rem'),
        IconPosition: v('top'), TextAlign: v('left'),
        Title: v(title), TitleColor: v(TEXT), TitleSize: v('0.875rem'), TitleWeight: v('700'),
        Text: v(text), TextColor: v(TEXT2), TextSize: v('0.78rem'),
        BackgroundColor: v(SURFACE2), BorderColor: v(BORDER), BorderWidth: v('1px'), BorderRadius: v('10px'), Padding: v('1rem'),
      }),
    }});
  }

  // ── Final CTA ─────────────────────────────────────────────────────────────
  await prisma.block.create({ data: {
    type: 'CTABannerBlock', pageId: page.id, sortOrder: sort++,
    jsonData: b({
      Title:           v('Already need a CMS today?'),
      TitleColor:      v(TEXT),
      TitleSize:       v('2.25rem'),
      Subtitle:        v('BrixCMS Open is free, MIT licensed and ready to use right now. No subscriptions, no vendor lock-in.'),
      SubtitleColor:   v(TEXT2),
      Btn1Text:        v('Try Open for free →'),
      Btn1Url:         v('https://github.com/Learsi23/brix-cms'),
      Btn1BgColor:     v(ACCENT),
      Btn1TextColor:   v('#ffffff'),
      Btn2Text:        v('Get early access to Pro'),
      Btn2Url:         v('mailto:israel231075@gmail.com?subject=BrixCMS Pro — Early Access'),
      Btn2Color:       v(BORDER),
      BackgroundColor: v(SURFACE),
      BackgroundColor2:v(BG),
      PaddingY:        v('6rem'),
      TextAlign:       v('center'),
    }),
  }});

  console.log('✅ Pro page (coming soon) seeded');
  return page;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SITE CONFIG — dark navbar + footer
// ══════════════════════════════════════════════════════════════════════════════

async function seedSiteConfig() {
  const config = JSON.stringify({
    navbar: {
      backgroundColor:  BG,
      textColor:        TEXT,
      logo:             '/images/logo-menu.png',
      logoAltText:      'BrixCMS',
      logoWidth:        '120px',
      logoLink:         '/',
      isSticky:         true,
      hasShadow:        false,
      paddingVertical:  'py-3',
      menuItems: [
        { customText: 'Features', customUrl: '/features',                           isCustomUrl: true, pageSlug: '', openInNewTab: false, iconClass: '', iconAriaLabel: '' },
        { customText: 'Pro',      customUrl: '/pro',                                isCustomUrl: true, pageSlug: '', openInNewTab: false, iconClass: '', iconAriaLabel: '' },
        { customText: '',         customUrl: 'https://github.com/Learsi23/BrixCMS', isCustomUrl: true, pageSlug: '', openInNewTab: true,  iconClass: 'fab fa-github',  iconAriaLabel: 'BrixCMS on GitHub'  },
        { customText: '',         customUrl: 'https://www.youtube.com/@BrixCMS',    isCustomUrl: true, pageSlug: '', openInNewTab: true,  iconClass: 'fab fa-youtube', iconAriaLabel: 'BrixCMS on YouTube' },
      ],
    },
    footer: {
      backgroundColor:        SURFACE,
      textColor:              TEXT2,
      logo:                   '/images/logo-menu.png',
      logoAltText:            'BrixCMS',
      logoWidth:              '100px',
      logoPosition:           'left',
      showPagesColumn:        false,
      pagesColumnTitle:       'Pages',
      pages:                  [],
      showSocialMediaColumn:  true,
      socialMediaColumnTitle: 'Links',
      socialMedia: [
        { platform: 'github',  url: 'https://github.com/Learsi23/BrixCMS', iconClass: 'fab fa-github'  },
        { platform: 'youtube', url: 'https://www.youtube.com/@BrixCMS',    iconClass: 'fab fa-youtube' },
      ],
      showCopyrightRow:   true,
      companyName:        'BrixCMS',
      companyNumber:      '',
      copyrightText:      'MIT License — free forever',
      showHorizontalLine: true,
      paddingVertical:    'py-8',
      columnsGap:         'gap-8',
    },
  });

  await prisma.siteConfig.upsert({
    where:  { key: 'site' },
    update: { value: config },
    create: { key: 'site', value: config },
  });
  console.log('✅ Site config (dark navbar + footer)');
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
  // Admin user
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@brix.com' },
    update: {},
    create: { email: 'admin@brix.com', password: 'admin123', name: 'Administrator', role: 'owner' },
  });
  console.log('✅ Admin user:', admin.email);

  // Only seed pages if the DB is empty (or force flag passed)
  const forceReseed = process.argv.includes('--force');
  const pageCount   = await prisma.page.count();

  if (pageCount === 0 || forceReseed) {
    if (forceReseed) console.log('🔄  Force reseed — rebuilding all pages...');
    await seedHomePage();
    await seedFeaturesPage();
    await seedProPage();
  } else {
    console.log(`ℹ️  ${pageCount} pages already exist — skipping page seed (pass --force to reseed)`);
  }

  // Always update site config so navbar/footer stay current
  await seedSiteConfig();

  console.log('\n🎉 BrixCMS initialized!');
  console.log('📧 Email:    admin@brix.com');
  console.log('🔑 Password: admin123');
  console.log('🌐 Home:     http://localhost:3000');
  console.log('🔧 Admin:    http://localhost:3000/admin');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
