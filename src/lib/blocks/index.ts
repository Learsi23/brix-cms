// ====================================================================
// BRIX CMS - BLOCK REGISTRY
// ====================================================================

// Layout
import './definitions/column-block';
import './definitions/grid-column-block';
import './definitions/icon-column-block';
import './definitions/spacer-block';
import './definitions/divider-block';
import './definitions/banner-block';
import './definitions/full-column-block';

// Content
import './definitions/hero-block';
import './definitions/text-block';
import './definitions/image-block';
import './definitions/markdown-block';
import './definitions/card-block';
import './definitions/icon-card-block';
import './definitions/stats-block';
import './definitions/cta-banner-block';
import './definitions/logo-strip-block';
import './definitions/social-proof-block';
import './definitions/team-block';
import './definitions/team-member-block';
import './definitions/testimonials-block';
import './definitions/testimonial-item-block';
import './definitions/pricing-block';
import './definitions/pricing-card-block';
import './definitions/timeline-block';
import './definitions/timeline-item-block';
import './definitions/menu-block';
import './definitions/opening-hours-block';
import './definitions/feature-list-block';
import './definitions/feature-grid-block';
import './definitions/table-block';
import './definitions/code-block';
import './definitions/brix-grid-demo-block';

// Media
import './definitions/gallery-block';
import './definitions/flexible-image-text-block';
import './definitions/video-block';
import './definitions/map-block';
import './definitions/lottie-block';
import './definitions/before-after-block';
import './definitions/audio-block';
import './definitions/qrcode-block';

// Interactive
import './definitions/dropdown-block';
import './definitions/button-link-block';
import './definitions/text-with-button-block';
import './definitions/accordion-block';
import './definitions/accordion-item-block';
import './definitions/tabs-block';
import './definitions/tab-item-block';
import './definitions/countdown-block';
import './definitions/email-button-block';
import './definitions/contact-form-block';
import './definitions/faq-block';
import './definitions/cookie-banner-block';
import './definitions/newsletter-block';

// AI (Chatbot)
import './definitions/chat-block';
import './definitions/floating-chat-block';

// Commerce
import './definitions/trust-badges-block';
import './definitions/product-card-block';
import './definitions/existing-products-block';
import './definitions/products-gallery-block';

// Re-export utilities
export {
  registerBlock,
  getBlockDefinition,
  getAllBlockDefinitions,
  getBlocksByCategory,
  isBlockRegistered,
  getRegisteredBlockTypes,
} from './registry';

export type {
  BlockDefinition,
  FieldDefinition,
  FieldType,
  SelectOption,
  BlockData,
  BlockDto,
  FieldValue,
  PublishBlockDto,
  PublishPageDto,
} from './types';

export { getFieldValue, createDefaultData } from './types';
