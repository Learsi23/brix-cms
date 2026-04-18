# Brix - Complete Technical Manual

## Table of Contents

1. [General Architecture](#general-architecture)
2. [Pages and Blocks System](#pages-and-blocks-system)
3. [Container Blocks](#container-blocks)
4. [Content Blocks](#content-blocks)
5. [Media Blocks](#media-blocks)
6. [Ecommerce Blocks](#ecommerce-blocks)
7. [Layout Blocks](#layout-blocks)
8. [Navbar](#navbar)
9. [Footer](#footer)
10. [Page Background Color](#page-background-color)
11. [Guide for Creating Pages](#guide-for-creating-pages)
12. [AI Page Generator](#ai-page-generator)

---

## General Architecture

Brix is a Next.js-based content management system that allows creating dynamic pages through modular blocks.

### Main Components

- **Page**: Database entity containing title, slug, configuration, and references to blocks
- **Block**: Atomic unit of content rendered on the page
- **BlockRenderer**: Component that decides which component to render based on the block type
- **DynamicNavbar/Footer**: Components that read the global site configuration

### Rendering Flow
URL → [[...slug]]/page.tsx
→ Find page by slug in DB
→ Get associated blocks (root + children)
→ Read BackgroundColor from page.jsonData
→ Render BlockRenderer for each block

text

---

## Pages and Blocks System

### Data Structure

**Page (Prisma)**
- `id`: Unique ID
- `title`: Page title
- `slug`: Friendly URL (unique)
- `jsonData`: JSON with configuration (backgroundColor, etc.)
- `isPublished`: Boolean for publishing
- `blocks`: One-to-many relationship with Block

**Block (Prisma)**
- `id`: Unique ID
- `type`: Block type ("HeroBlock", "ColumnBlock", etc.)
- `sortOrder`: Rendering order
- `jsonData`: JSON with block data, format `{ "Field": { "Value": "value" } }`
- `pageId`: Foreign key to Page
- `parentId`: Parent block ID (for nested blocks)

---

## Container Blocks

Container blocks have `isGroup: true` and can contain child blocks (children).

> **IMPORTANT**: Only `ColumnBlock` and `GridColumn` are valid containers for the AI system. The other listed "isGroup" blocks have their own specific child system.

### 1. ColumnBlock (Columns)

**Purpose**: Container that organizes child blocks in responsive columns (flex row). Ideal for 2-4 items side by side.

**Type**: `ColumnBlock`
**Category**: Layout (isGroup: true)

**Configurable Fields**:

| Field | Type | Values | Default | Description |
|-------|------|---------|---------|-------------|
| Gap | select | gap-0, gap-2, gap-4, gap-6, gap-8, gap-12 | gap-6 | Space between columns |

> To control the number of columns, add the desired number of direct children (1-4).

**Typical Usage**:
ColumnBlock (2 columns = 2 direct children)
├── TextBlock (left)
└── ImageBlock (right)

text

---

### 2. GridColumn (Grid Column)

**Purpose**: Responsive CSS grid. Use for 5+ products/cards or large grids with section title.

**Type**: `GridColumn`
**Category**: Layout (isGroup: true)

**Configurable Fields**:

| Field | Type | Values/Placeholder | Default | Description |
|-------|------|---------------------|---------|-------------|
| MaxColumns | string | 1-6 | 3 | Max columns on desktop |
| Gap | string | gap-4, gap-6, gap-8 | gap-6 | Space between items |
| PaddingY | string | 3rem, 48px | 3rem | Vertical padding |
| PaddingX | string | 1.5rem, 24px | 1.5rem | Horizontal padding |
| BackgroundColor | color | - | transparent | Background color |
| BackgroundImage | image | - | - | Background image |
| ItemsAlign | select | start, center, end, stretch | stretch | Item alignment |
| SectionId | string | services | - | Anchor ID (#) |
| TitleSida | string | - | - | Eyebrow (above title) |
| TitleSidaColor | color | - | - | Eyebrow color |
| TitleSidaSize | string | 1rem, 16px | - | Eyebrow size |
| TitleSidaAlign | select | left, center, right | left | Eyebrow alignment |
| Title | string | - | - | Main title |
| TitleColor | color | - | - | Title color |
| TitleSize | string | 2rem, 32px | - | Title size |
| SubTitle | string | - | - | Subtitle |
| SubTitleColor | color | - | - | Subtitle color |
| SubTitleSize | string | 1.1rem, 18px | - | Subtitle size |
| Description | textarea | - | - | Description (below subtitle) |
| DescriptionColor | color | - | - | Description color |
| HeaderTextAlign | select | left, center, right | left | Header alignment |

**Rule for products**: ≤4 products → use `ColumnBlock`; 5+ products → use `GridColumn` with `MaxColumns "2"`.

---

### 3. ProductColumnBlock (Product Column)

**Purpose**: Complete product catalog with category sidebar and product grid. Automatically loads from database.

**Type**: `ProductColumnBlock`
**Category**: Ecommerce (isGroup: true)

**Configurable Fields**:

| Field | Type | Values/Placeholder | Default | Description |
|-------|------|---------------------|---------|-------------|
| Title | string | Our Products | - | Block title |
| TitleColor | color | - | #1e293b | Title color |
| TitleSize | string | 32px | 32px | Title size |
| SubTitle | string | - | - | Subtitle |
| ShowSidebar | bool | true/false | true | Show category sidebar |
| Columns | string | 4 | 4 | Products per row |
| ProductsPerPage | string | 12 | 12 | Products per page |
| BackgroundColor | color | - | #f8fafc | Background color |
| CardBgColor | color | - | #ffffff | Card background |
| AccentColor | color | - | #2563eb | Accent color (buttons) |
| PaddingY | string | 3rem | 3rem | Vertical padding |
| ShowStock | bool | true/false | true | Show stock badge |
| ShowRating | bool | true/false | false | Show rating stars |
| ButtonText | string | Add to cart | Add to cart | Button text |
| FilterCategories | string | Manga, Novel | - | Filter by categories (empty = all) |

**Note**: Use this block when the user wants a complete catalog/store with category filtering. Automatically loads products from DB.

---

### 4. GalleryBlock (Gallery)

**Purpose**: Image gallery in responsive grid. Select multiple images from the media library.

**Type**: `GalleryBlock`
**Category**: Media (isGroup: true)

**Fields**:
- Title, TitleColor, TitleSize
- LayoutType: carousel/grid/masonry
- AutoPlay, AutoPlayInterval (3000ms)
- ShowArrows, ShowDots, InfiniteLoop
- ItemsPerView (3), Gap (16px), ItemHeight (300px)
- BackgroundColor (transparent), Padding (20px), BorderRadius

**Children**: ImageBlock

---

### 5. ProductsGalleryBlock (Products Gallery)

**Purpose**: Automatically renders ALL published products.

**Type**: `ProductsGalleryBlock`
**Category**: Media (isGroup: true)

**Fields**:
- Title, TitleColor, TitleSize
- CardsPerView (3), Gap (16px)
- BackgroundColor, Padding, BorderRadius

---

## Content Blocks

Content blocks are leaf blocks — **they have no children**.

### 6. HeroBlock (Hero Section)

**Purpose**: Full-page main banner with background image, title, and subtitle.

**Type**: `HeroBlock`
**Category**: Content

**Fields**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Title | string | - | Main title |
| TitleColor | color | #ffffff | Title color |
| TitleSize | string | 56px | Size (always in px: 56px, 64px) |
| Subtitle | string | - | Subtitle |
| SubtitleColor | color | #ffffff | Subtitle color |
| SubtitleSize | string | 20px | Size (in px) |
| Description | string | - | Description |
| Background | image | - | Background image |

> **AI Note**: Always use px values for sizes (56px, 64px). Never Tailwind classes (text-5xl).

---

### 7. TextBlock (Text Block)

**Purpose**: Versatile text block with title, subtitle, and body. Full control over typography, colors, alignment, and margins.

**Type**: `TextBlock`
**Category**: Content

**Fields**:

**Position**:
- VerticalPosition: top/middle/bottom
- HorizontalPosition: left/center/right

**Margins** (each side):
- MarginTop, MarginBottom, MarginLeft, MarginRight (e.g., 0, 10px, 1rem)

**Padding** (each side):
- PaddingTop, PaddingBottom, PaddingLeft, PaddingRight

**Title**:
- Title, TitleColor, TitleSize (in px: 32px, 28px), TitleAlignment (left/center/right)

**Subtitle**:
- Subtitle, SubtitleColor, SubtitleSize (in px: 18px), SubtitleAlignment

**Body**:
- Body (textarea), BodyColor, BodySize (in px: 16px), BodyAlignment (includes justify)

---

### 8. ImageBlock (Simple Image)

**Purpose**: Simple image with configurable alt text and size/alignment.

**Type**: `ImageBlock`
**Category**: Content

**Fields**:
- Source: image
- AltText: string (alternative text)

---

### 9. CardBlock (Universal Card)

**Purpose**: Visual card with image, title, description, and button. Supports vertical, horizontal, and overlay layouts. Ideal for service/feature grids.

**Type**: `CardBlock`
**Category**: Content

**Fields**:

**Content**:
- Title, TitleColor (#1f293b), TitleSize (1.5rem)
- Badge (subtitle), BadgeColor, BadgeSize (0.875rem)
- Description, DescriptionColor, DescriptionSize

**Image and Icon**:
- Image, ImageHeight (250px)
- IconClass (FontAwesome: fas fa-rocket)

**Action**:
- TargetUrl, ButtonText (Learn more)
- AccentColor (#3b82f6), ButtonTextColor (#ffffff)
- HoverColor, BorderRadius, Border, Padding
- ButtonPosition: left/center/right

**Layout**:
- LayoutType: vertical/horizontal/overlay
- UseGlassmorphism: Yes/No
- CardBgColor (#ffffff)

---

### 10. IconCardBlock (Icon Card)

**Purpose**: Card with large icon, title, and description. Perfect for listing features, services, or benefits in a 3-4 column grid.

**Type**: `IconCardBlock`
**Category**: Content

**Fields**:

**Container**:
- BackgroundColor, BorderColor
- BorderRadius (12px), BorderWidth (1px), Padding (1.5rem)
- Shadow (0 4px 20px rgba(0,0,0,0.1))

**Layout**:
- IconPosition: top/left/right
- TextAlign: left/center/right

**Left Icon**:
- LeftIcon (image), LeftIconSize (48px)
- LeftIconClass (FontAwesome: fas fa-star), LeftIconColor
- LeftIconFaSize (2rem)

**Right Icon** (decorative):
- RightIcon, RightIconSize (32px)
- RightIconClass, RightIconColor

**Texts**:
- Title, TitleColor, TitleSize (1.25rem)
- Subtitle, SubtitleColor, SubtitleSize (1rem)
- Text, TextColor, TextSize (0.95rem)
- MarkDown, MarkDownColor

**Link (CTA)**:
- LinkUrl (/services or https://...)
- LinkText (See more)
- LinkBgColor, LinkTextColor
- LinkNewTab: true/false

---

### 11. ButtonLinkBlock (Button Link)

**Purpose**: Button or link with styles. Simple CTA, internal or external link.

**Type**: `ButtonLinkBlock`
**Category**: Content

**Fields**:
- Text, Url
- Color (#10b981), HoverColor (#059669)
- TextColor (#ffffff)
- BorderRadius (8px, 9999px)
- Border, Width (200px, auto, 100%)
- Padding (12px 24px)
- ButtonPosition: left/center/right

---

### 12. CTABannerBlock (CTA Banner)

**Purpose**: Call-to-action banner with background color, text, and button. Ideal for closing sections.

**Type**: `CTABannerBlock`
**Category**: Content

**Fields**:
- Title, TitleColor (#ffffff), TitleSize (2rem)
- Subtitle, SubtitleColor (white rgba)
- Btn1Text, Btn1Url, Btn1BgColor, Btn1TextColor
- Btn2Text, Btn2Url, Btn2Color
- BackgroundColor (#10b981), BackgroundColor2 (gradient)
- BackgroundImage
- PaddingY (5rem)
- TextAlign: left/center/right

---

### 13. StatsBlock (Statistics)

**Purpose**: Impactful numerical statistics block (e.g., 500+ clients, 98% satisfaction).

**Type**: `StatsBlock`
**Category**: Content

**Fields**:
- Title, TitleColor (#111827)
- Subtitle, SubtitleColor (#6b7280)
- Stat1Number (e.g., +500), Stat1Label, Stat1Icon (fas fa-users)
- Stat2Number, Stat2Label, Stat2Icon
- Stat3Number, Stat3Label, Stat3Icon
- Stat4Number, Stat4Label, Stat4Icon
- NumberColor (#10b981), LabelColor (#6b7280)
- BackgroundColor (#1e293b), CardBgColor (#ffffff)
- PaddingY (4rem)

---

### 14. MarkdownBlock (Markdown)

**Purpose**: Renders content in Markdown format. Ideal for long texts, documentation, or formatted articles.

**Type**: `MarkdownBlock`
**Category**: Content

**Fields**:
- Content (type markdown: **bold**, ## headings, - lists, etc.)

---

### 15. LogoStripBlock (Logo Strip)

**Purpose**: Horizontal strip of brand/partner logos.

**Type**: `LogoStripBlock`
**Category**: Content

**Fields**:
- Heading, HeadingColor
- Logo1 (image), Logo1Url ... Logo6, Logo6Url
- LogoHeight (48px), Grayscale (true/false)
- BackgroundColor, PaddingY

---

### 16. ContactFormBlock (Contact Form)

**Purpose**: Configurable contact form.

**Type**: `ContactFormBlock`
**Category**: AI/Email

**Fields**:
- Title, RecipientEmail
- Text (button), Color, HoverColor, BorderRadius, Border
- Width, Padding, TextColor
- ButtonPosition (left/center/right)

---

### 17. ChatBlock (Chat)

**Purpose**: AI chat widget.

**Type**: `ChatBlock`
**Category**: AI/Email

**Fields**:
- CustomPrompt, WelcomeMessage
- Logo (image), LogoSize, Ai_Logo (image), Ai_LogoSize
- Title, TitleColor, TitleSize, BackgroundColor

---

## Media Blocks

### 18. VideoBlock (Video)

**Purpose**: Embedded video from YouTube or Vimeo. Only requires the public URL.

**Type**: `VideoBlock`
**Category**: Media

**Fields**:
- VideoUrl (YouTube/Vimeo)
- AspectRatio (16/9, 4/3, 1/1)
- MaxWidth (900px)
- Title, TitleColor, Subtitle, SubtitleColor
- TextAlign: left/center/right
- BackgroundColor, PaddingY (2rem)

---

### 19. MapBlock (Map)

**Purpose**: Embedded map with information card.

**Type**: `MapBlock`
**Category**: Media

**Fields**:
- Address, Zoom (15), MapType (roadmap)
- Title, TitleColor, Subtitle, SubtitleColor
- PlaceName, AddressDisplay, Phone, Email, Hours
- ShowInfoCard (true/false), CardBgColor, CardTextColor
- MapHeight (450px), MaxWidth (100%), BorderRadius (16px)
- BackgroundColor, TextAlign, PaddingY (3rem)

---

### 20. FlexibleImageTextBlock

**Purpose**: Image and text in flexible layout (alternating left/right).

**Type**: `FlexibleImageTextBlock`
**Category**: Media

**Fields**:
- Layout: image-left/image-right
- Image (image), ImageWidth, ImageMaxWidth, ImageBorderRadius (rounded-xl)
- Title, TitleColor, TitleSize, TitleWeight (bold)
- SubTitle, SubTitleColor, SubTitleSize
- Text, TextColor, TextSize
- ButtonText, ButtonLink (URL), ButtonStyle (primary/outline)
- BackgroundColor, PaddingVertical (3rem), PaddingHorizontal (2rem)
- Gap (2rem)

---

### 21. DropdownBlock (Dropdown/FAQ)

**Purpose**: Accordion-style dropdown. Ideal for FAQs or collapsible content. One block per question.

**Type**: `DropdownBlock`
**Category**: Media

**Fields**:
- Title, TitleColor, TitleSize
- BackgroundColor, BackgroundGradient
- Question, QuestionColor, QuestionSize
- Answer, AnswerColor, AnswerSize
- DropdownBackgroundColor (#f8f9fa)
- OpenByDefault: true/false

---

## Ecommerce Blocks

### 22. ProductCardBlock

**Purpose**: Individual product card for e-commerce.

**Type**: `ProductCardBlock`
**Category**: Ecommerce

**Fields**:
- ProductId: **ALWAYS leave empty ""** — the system assigns it automatically
- Name, Description, Price (29.99), Stock (50)
- Image (image)
- ButtonText (Add to cart)
- BackgroundColor (#ffffff)

---

### 23. CatalogItemBlock

**Purpose**: Rich product card with variants, badges, and ratings.

**Type**: `CatalogItemBlock`
**Category**: Ecommerce

**Fields**:
- ProductId: **ALWAYS leave empty ""**
- Name, ShortDescription, LongDescription
- Image (image), Price, OriginalPrice (if on sale), CurrencySymbol (€/$)
- Stock, Category, Tags (new,offer)
- Sizes (S,M,L,XL), Colors (Red,Blue), CustomOptions
- Badge (New/Offer/Bestseller), BadgeColor
- Rating (4.5), ReviewCount (128), ShowRating (true)
- ButtonText (Add to cart), BackgroundColor (#ffffff)

---

### 24. EmailButtonBlock

**Purpose**: Button that opens email client.

**Type**: `EmailButtonBlock`
**Category**: Ecommerce

**Fields**:
- Text, EmailAddress, Subject, Body
- BackgroundColor, HoverColor, TextColor
- BorderRadius (8px), Border, Width, Padding
- Position (center)

---

## Layout Blocks

### 25. SpacerBlock (Spacer)

**Purpose**: Empty configurable height space. Separates sections.

**Type**: `SpacerBlock`
**Category**: Layout

**Fields**:
- Height (3rem)
- BackgroundColor (transparent)

---

### 26. DividerBlock (Divider)

**Purpose**: Horizontal dividing line with configurable styles.

**Type**: `DividerBlock`
**Category**: Layout

**Fields**:
- Style: solid/dashed/dotted/double
- Color (#e2e8f0)
- Thickness (1px)
- Width (100%)
- PaddingY (1.5rem)

---

### 27. TextWithButtonBlock

**Purpose**: Text block with integrated button.

**Type**: `TextWithButtonBlock`
**Category**: Interactive

**Fields**:
- Title, TitleColor, TitleSize
- Subtitle, SubtitleColor, SubtitleSize
- Description, DescriptionColor, DescriptionSize
- ButtonText, ButtonUrl, ButtonColor, ButtonTextColor
- ButtonBorderRadius, ButtonPosition (center)

---

## Navbar

### DynamicNavbar.tsx

Navigation component that reads configuration from `SiteConfig` with key `site`.

**Location**: `src/components/DynamicNavbar.tsx`

**Data read from database**:
```json
{
  "navbar": {
    "backgroundColor": "#ffffff",
    "textColor": "#000000",
    "logo": "Logo URL",
    "logoAltText": "Logo",
    "logoWidth": "150px",
    "logoLink": "/",
    "isSticky": true,
    "hasShadow": true,
    "paddingVertical": "py-3",
    "menuItems": [
      {
        "customText": "Home",
        "customUrl": "",
        "isCustomUrl": false,
        "pageSlug": "home"
      }
    ]
  }
}
Configurable Fields:

Field	Type	Default	Description
backgroundColor	color	#ffffff	Background color
textColor	color	#000000	Text color
logo	string	-	Logo URL
logoAltText	string	Logo	Alternative text
logoWidth	string	150px	Logo width
logoLink	string	/	Click link
isSticky	boolean	true	Stick to top
hasShadow	boolean	true	Show shadow
paddingVertical	string	py-3	Vertical padding
menuItems	array	[]	Menu items
Menu: If no menuItems are configured, automatically shows published pages. If there are menuItems, it uses those.

Fixed Items: After the menu, always shows:

Cart (/cart)

Admin Panel (/admin)

Footer
DynamicFooter.tsx
Footer component that reads configuration from SiteConfig with key site.

Location: src/components/DynamicFooter.tsx

Data read from database:

json
{
  "footer": {
    "backgroundColor": "#1a1a1a",
    "textColor": "#ffffff",
    "logo": "",
    "logoAltText": "Logo",
    "logoWidth": "150px",
    "logoPosition": "left",
    "showPagesColumn": true,
    "pagesColumnTitle": "Pages",
    "pages": [],
    "showSocialMediaColumn": true,
    "socialMediaColumnTitle": "Follow Us",
    "socialMedia": [],
    "showCopyrightRow": true,
    "companyName": "",
    "companyNumber": "",
    "copyrightText": "All rights reserved",
    "showHorizontalLine": true,
    "paddingVertical": "py-6",
    "columnsGap": "gap-8"
  }
}
Supported social networks:

facebook, instagram, twitter, x, linkedin, youtube, tiktok, whatsapp, pinterest, snapchat, reddit, discord, telegram

socialMedia format:

json
{
  "platform": "instagram",
  "url": "https://instagram.com/my_company",
  "iconType": "class",
  "iconClass": "fab fa-instagram"
}
Page Background Color
How to Configure
Each page can have its own background color. It is configured in the jsonData field of the page.

Structure:

json
{
  "BackgroundColor": {
    "Value": "#f8fafc"
  }
}
Reading in Rendering
In [[...slug]]/page.tsx:

typescript
const pageSettings = page.jsonData ? JSON.parse(page.jsonData) : {};
const bgColor = pageSettings.BackgroundColor?.Value ?? '#ffffff';
Applied to the main container:

jsx
<div className="min-h-screen" style={{ backgroundColor: bgColor }}>
Common Colors
Color	Code	Usage
White	#ffffff	Default
Light gray	#f8fafc	Alternative background
Black	#000000	Dark background
Light blue	#eff6ff	Decorative backgrounds
Guide for Creating Pages
Method 1: Visual Editor (Admin)
Go to /admin/pages

Click "New Page"

Configure title and slug

Drag blocks from the side panel

Configure each block

Publish

Method 2: REST API
Create page:

text
POST /api/pages
Body: {
  title: "My Page",
  slug: "my-page",
  jsonData: "{\"BackgroundColor\":{\"Value\":\"#f8fafc\"}}"
}
Add blocks:

text
POST /api/pages/{id}/blocks
Body: {
  type: "HeroBlock",
  jsonData: "{\"Title\":{\"Value\":\"Welcome\"}}"
}
Method 3: AI Page Generator
See AI Page Generator section below.

Common Page Structures
Landing Page
text
HeroBlock (background with image)
TextBlock (welcome, centered)
ColumnBlock → 3x CardBlock or IconCardBlock (services)
StatsBlock (statistics)
CTABannerBlock (call to action)
ContactFormBlock
Services Page
text
HeroBlock
GridColumn (with title "Our Services")
  ├── IconCardBlock (service 1)
  ├── IconCardBlock (service 2)
  └── IconCardBlock (service 3)
StatsBlock
CTABannerBlock
Contact Page
text
HeroBlock
TextBlock (contact info)
MapBlock
ContactFormBlock
Product Catalog (complete)
text
HeroBlock
ProductColumnBlock (with category sidebar)
Product Catalog (manual, 4 products or less)
text
HeroBlock
ColumnBlock → 4x ProductCardBlock
CTABannerBlock
Product Catalog (manual, 5+ products)
text
HeroBlock
GridColumn (MaxColumns "2") → ProductCardBlock x N
CTABannerBlock
FAQ
text
HeroBlock
DropdownBlock (question 1)
DropdownBlock (question 2)
DropdownBlock (question 3)
Content Grid Page
text
HeroBlock
ColumnBlock (2 columns)
  ├── TextBlock
  └── ImageBlock
LogoStripBlock (clients)
CTABannerBlock
AI Page Generator
The AI generator allows creating complete pages through natural language. Supports multiple providers.

Available Providers
Provider	Recommended Model	Speed	Quality
Google Gemini	gemini-2.0-flash	Fast (~15s)	Very good
DeepSeek	deepseek-chat	Medium (~30s)	Excellent
Mistral AI	mistral-large-latest	Medium (~30s)	Good
Ollama (local)	deepseek-r1:14b	Slow (60-120s)	Good
Recommendation: Use Gemini or DeepSeek with saved API key for better results and higher speed.

How to Use
Go to Admin → 🤖 AI Generator

Write the prompt describing the page

The system may ask clarifying questions (step 2)

The page is generated and automatically redirects to the editor

Generation Flow
text
User prompt
  → Analysis (first AI call)
  → If missing data: shows questions → answers → generate page
  → If has data: creates page directly
  → Redirects to editor
Prompt Rules for AI
VALID Blocks — AI can only use these types:

Containers (require children):

ColumnBlock, GridColumn

Leaf blocks (no children):

HeroBlock, TextBlock, MarkdownBlock, ImageBlock

CardBlock, IconCardBlock, StatsBlock, CTABannerBlock

LogoStripBlock, SpacerBlock, DividerBlock

GalleryBlock, ProductsGalleryBlock, FlexibleImageTextBlock

VideoBlock, MapBlock, ButtonLinkBlock, DropdownBlock

TextWithButtonBlock, EmailButtonBlock

ProductCardBlock, CatalogItemBlock, ProductColumnBlock

ContactFormBlock, ChatBlock

INVALID Types (do not exist):

SectionBlock, FormBlock, NavbarBlock, HeaderBlock

TabsBlock, CarouselBlock, AccordionBlock, IconColumn

JSON format for each field: { "Value": "value" } — always string, even numbers and booleans.

Effective Prompt Examples
Example 1: Landing Page
text
Create a home page for a web agency with:

HERO:
- Dark blue background
- White title: "Professional Web Design"
- Subtitle: "We transform your ideas into digital experiences"
- Orange button: "Request Demo"

SERVICES (3 columns with IconCardBlock):
- Icon fas fa-paint-brush, Title "Design", Description "Modern interfaces"
- Icon fas fa-code, Title "Development", Description "Clean and fast code"
- Icon fas fa-mobile-alt, Title "Responsive", Description "Looks great everywhere"

STATISTICS: 500+ clients, 98% satisfaction, 10 years

CONTACT: Form with email and message

Colors: Blue #0047AB, orange #FF6B35, white background
Example 2: Detailed Services Page
text
Create a services page with:

INTRO: Centered title "Our Services" + description

SERVICES (GridColumn 3 columns with IconCardBlock):
- Web Design, Digital Marketing, Consulting
- 24/7 Support, SEO, Maintenance

PROCESS (ColumnBlock 4 columns with CardBlock):
1. Consultation → 2. Proposal → 3. Development → 4. Delivery

CTA: Dark banner with button "Request Quote" → /contact

Colors: Light gray #F5F5F5 background, red accent #E63946
Example 3: Product Catalog (5+ items)
text
Create a category page with 6 clothing products:
- Blue T-shirt - $29.99
- Black Pants - $49.99
- Red Dress - $59.99
- Gray Jacket - $79.99
- Beige Shorts - $35.99
- Green Skirt - $45.99

Use GridColumn with 3 columns and ProductCardBlock.
White background, blue buttons #0047AB.
Tips for Better Results
Be specific about layout: "3 equal columns", "2 columns with left image"

Mention blocks by name if the exact type is important

Colors in hex: #FF6B35, #0047AB (never names like "navy blue")

Font sizes in px: "title 48px", "text 16px"

Limit: Maximum 15 blocks per page to avoid timeouts

Products: For 5+ products, explicitly mention GridColumn

FontAwesome: Use real classes like fas fa-rocket, fas fa-star, fas fa-users

Glossary
Block: Atomic unit of content

isGroup/Container: Block that can contain other child blocks

jsonData: JSON with each block's configuration in format { "Field": { "Value": "value" } }

slug: Page's friendly URL (only lowercase and hyphens)

SiteConfig: Global site configuration (navbar, footer)

BackgroundColor: Page background color

Sticky: Navbar that fixes when scrolling

Glassmorphism: Translucent visual effect

Leaf block: Block without children (non-container)

eyebrow: Small text above the main title (TitleSida in GridColumn)

Brix Next.js Manual
Version: 2.0
Date: April 2026
