/**
 * OPTIMIZED PROMPT EXAMPLES
 * ==========================
 *
 * Use these prompts directly in the AI generator.
 * They are designed to use ONLY the blocks you have available.
 *
 * Available blocks:
 * - HeroBlock, TextBlock, CardBlock, ImageBlock, ColumnBlock, GridColumn
 * - ContactFormBlock, GalleryBlock, ProductsGalleryBlock, ButtonLinkBlock
 * - MarkdownBlock, FlexibleImageTextBlock, IconCardBlock, DropdownBlock
 */

// ============================================
// EXAMPLE 1: Landing Page (Startup)
// ============================================
export const PROMPT_LANDING_PAGE = `Create a landing page for a software startup:

HERO:
- Dark background image
- Large white title: "Innovative Software Solutions"
- Subtitle: "For businesses that want to grow"
- Blue button: "Get Started Free"

FEATURES (3 columns):
- Column 1: Icon "⚡", Title "Fast", Description "Processes data in milliseconds"
- Column 2: Icon "🔒", Title "Secure", Description "Enterprise-level encryption"
- Column 3: Icon "📊", Title "Scalable", Description "Grow without limits"

HOW IT WORKS (2 columns):
- Left: Image
- Right: Numbered steps 1, 2, 3

TESTIMONIALS (2 card columns):
- Card 1: Text "Increased sales by 300%", Client "Juan García, CEO TechCorp"
- Card 2: Text "Best investment we made", Client "María López, Founder Startup"

CONTACT:
- Form with Email and Message fields

Colors: White background, blue accent #0047AB, dark gray text #1A1A1A
`;

// ============================================
// EXAMPLE 2: Services Page (Agency)
// ============================================
export const PROMPT_SERVICES_PAGE = `Create a services page for a digital marketing agency:

HEADER:
- Colorful gradient background (blue to purple)
- Title: "Our Services"
- Description: "Complete solutions for your digital business"

SERVICES (2x3 grid):

Service 1:
- Icon "📱"
- Title: "Web Design"
- Description: "Modern, responsive, and fast websites"

Service 2:
- Icon "📊"
- Title: "Digital Marketing"
- Description: "SEO, SEM, and Social Media strategies"

Service 3:
- Icon "🎨"
- Title: "Graphic Design"
- Description: "Professional branding and visual identity"

Service 4:
- Icon "📹"
- Title: "Video Content"
- Description: "Promotional video production"

Service 5:
- Icon "💻"
- Title: "Development"
- Description: "Custom web and mobile apps"

Service 6:
- Icon "📧"
- Title: "Email Marketing"
- Description: "Effective email campaigns"

WORK GALLERY:
- Gallery with 6 projects

FINAL CTA:
- Large orange button: "Quote Project"
- Secondary button: "See More Work"

Colors: White background, orange accent #FF6B35 and blue #0047AB
`;

// ============================================
// EXAMPLE 3: Blog or News Article
// ============================================
export const PROMPT_BLOG_PAGE = `Create an article page for a tech blog:

HEADLINE:
- Large cover image (70% width)
- Title: "How to Increase Productivity with AI"
- Date: "March 31, 2026"
- Author: "Juan Martínez"

INTRODUCTION:
- Introductory paragraph with key text

CONTENT IN 2 COLUMNS:
- Left: Long text with 3 important sections
- Right: Sidebar with relevant information

TABLE OF CONTENTS:
- Internal links to sections

CONCLUSION:
- Final paragraph with call to action

AUTHOR BIO:
- Photo + name + description

RELATED ARTICLES:
- 3 article cards

Colors: White background, green accent #10B981, gray text #4B5563
`;

// ============================================
// EXAMPLE 4: Store / Ecommerce
// ============================================
export const PROMPT_ECOMMERCE_PAGE = `Create a product category page:

HERO:
- Background with product images
- Title: "Our Premium Products"
- Filters: Dropdown to filter by category

PRODUCTS (4-column grid):
- 8 product cards with:
  * Image
  * Name
  * Price
  * "Add to Cart" button

FEATURES:
- 3 columns: "Free Shipping", "1-Year Warranty", "Easy Returns"

NEWSLETTER:
- Text: "Subscribe for special discounts"
- Email input
- Button: "Subscribe"

FOOTER INFO:
- 2 columns with contact and information

Colors: Light gray background #F5F5F5, red accent #E63946, green buttons #10B981
`;

// ============================================
// EXAMPLE 5: About Us / Company Page
// ============================================
export const PROMPT_ABOUT_PAGE = `Create an "About Us" page:

HERO:
- Dark background
- Large white title: "Our Story"
- Subtitle: "Transforming businesses since 2018"

HISTORY (2 columns):
- Left: Historical image
- Right: Text about the company

MISSION (3 card columns):
- Mission, Vision, Values

TEAM (4-column grid):
- 4 team members with photo, name, and role

NUMBERS (4-column grid):
- "500+ Clients"
- "2000+ Projects"
- "50+ Employees"
- "15 Years Experience"

CLIENTS (Gallery):
- Logos of main clients

CONTACT:
- Contact form + location

Colors: White background, blue accent #0047AB, gray text #333333
`;

// ============================================
// EXAMPLE 6: Portfolio / Professional Portfolio
// ============================================
export const PROMPT_PORTFOLIO_PAGE = `Create a designer portfolio page:

PROFILE (2 columns):
- Left: Large profile photo + name + description
- Right: Skills and experience summary

SKILLS (3-column grid):
- Graphic Design
- Web Development
- Motion Graphics

FEATURED PROJECTS (2x3 grid):
- 6 cards with image, title, and description

WORK PROCESS (4 columns):
1. Discovery
2. Design
3. Development
4. Delivery

TESTIMONIALS (Carousel / 2-column list):
- 2-3 client testimonials

BLOG/ARTICLES (3-column grid):
- 3 recent articles

CONTACT:
- Contact form
- Social media links

Colors: Dark background #1A1A1A, gold accent #FFD700, light text #FFFFFF
`;

// USAGE:
// 1. Copy the prompt you need
// 2. Go to /admin/ai-generator
// 3. Paste into the textarea
// 4. Select model (recommended: deepseek-r1:14b)
// 5. Select media folder (Logos or Product Images)
// 6. Click "🚀 Generate Page"
// 7. Wait 30-60 seconds
// 8. Your page will be ready to edit!

console.log("Prompt examples available in this file");