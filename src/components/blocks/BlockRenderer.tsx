import type { BlockData } from '@/lib/blocks/types';

import HeroBlock from './HeroBlock';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import MarkdownBlock from './MarkdownBlock';
import ButtonLinkBlock from './ButtonLinkBlock';
import ColumnBlock from './ColumnBlock';
import GalleryBlock from './GalleryBlock';
import DropdownBlock from './DropdownBlock';
import EmailButtonBlock from './EmailButtonBlock';
import ProductCardBlock from './ProductCardBlock';
import ProductsGalleryBlock from './ProductsGalleryBlock';
import GridColumn from './GridColumn';
import FlexibleImageTextBlock from './FlexibleImageTextBlock';
import TextWithButtonBlock from './TextWithButtonBlock';
import ChatBlock from './ChatBlock';
import FloatingChatBlock from './FloatingChatBlock';
import CardBlock from './CardBlock';
import IconCardBlock from './IconCardBlock';
import IconColumn from './IconColumn';
import ContactFormBlock from './ContactFormBlock';
import CTABannerBlock from './CTABannerBlock';
import StatsBlock from './StatsBlock';
import VideoBlock from './VideoBlock';
import SpacerBlock from './SpacerBlock';
import DividerBlock from './DividerBlock';
import LogoStripBlock from './LogoStripBlock';
import MapBlock from './MapBlock';
import CatalogItemBlock from './CatalogItemBlock';
import ProductColumnBlock from './ProductColumnBlock';
import AccordionBlock from './AccordionBlock';
import BannerBlock from './BannerBlock';
import CountdownBlock from './CountdownBlock';
import PricingBlock from './PricingBlock';
import SocialProofBlock from './SocialProofBlock';
import TabsBlock from './TabsBlock';
import TeamBlock from './TeamBlock';
import TestimonialsBlock from './TestimonialsBlock';
import TimelineBlock from './TimelineBlock';
import ExistingProductsBlock from './ExistingProductsBlock';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface BlockRendererProps {
  type: string;
  data: BlockData;
  blocks?: RawChild[];
}

function renderChildren(blocks: RawChild[] | undefined) {
  return (blocks ?? []).map(child => {
    const childData: BlockData = child.jsonData ? JSON.parse(child.jsonData) : {};
    return <BlockRenderer key={child.id} type={child.type} data={childData} />;
  });
}

export default function BlockRenderer({ type, data, blocks }: BlockRendererProps) {
  switch (type) {
    case 'HeroBlock':
      return <HeroBlock data={data} />;

    case 'TextBlock':
      return <TextBlock data={data} />;

    case 'ImageBlock':
      return <ImageBlock data={data} />;

    case 'MarkdownBlock':
      return <MarkdownBlock data={data} />;

    case 'ButtonLinkBlock':
      return <ButtonLinkBlock data={data} />;

    case 'DropdownBlock':
      return <DropdownBlock data={data} />;

    case 'EmailButtonBlock':
      return <EmailButtonBlock data={data} />;

    case 'ProductCardBlock':
      return <ProductCardBlock data={data} />;

    case 'FlexibleImageTextBlock':
      return <FlexibleImageTextBlock data={data} />;

    case 'TextWithButtonBlock':
      return <TextWithButtonBlock data={data} />;

    case 'ChatBlock':
      return <ChatBlock data={data} />;

    case 'FloatingChatBlock':
      return <FloatingChatBlock data={data} />;

    case 'ColumnBlock': {
      const renderedChildren = renderChildren(blocks);
      return <ColumnBlock data={data} renderedChildren={renderedChildren} />;
    }

    case 'GridColumn': {
      const renderedChildren = renderChildren(blocks);
      return <GridColumn data={data} renderedChildren={renderedChildren} />;
    }

    case 'GalleryBlock':
      return <GalleryBlock data={data} blocks={blocks} />;

    case 'ProductsGalleryBlock':
      return <ProductsGalleryBlock data={data} blocks={blocks} />;

    case 'CardBlock':
      return <CardBlock data={data} />;

    case 'IconCardBlock':
      return <IconCardBlock data={data} />;

    case 'IconColumn': {
      const renderedChildren = renderChildren(blocks);
      return <IconColumn data={data} renderedChildren={renderedChildren} />;
    }

    case 'ContactFormBlock':
      return <ContactFormBlock data={data} />;

    case 'CTABannerBlock':
      return <CTABannerBlock data={data} />;

    case 'StatsBlock':
      return <StatsBlock data={data} />;

    case 'VideoBlock':
      return <VideoBlock data={data} />;

    case 'SpacerBlock':
      return <SpacerBlock data={data} />;

    case 'DividerBlock':
      return <DividerBlock data={data} />;

    case 'LogoStripBlock':
      return <LogoStripBlock data={data} />;

    case 'MapBlock':
      return <MapBlock data={data} />;

    case 'CatalogItemBlock':
      return <CatalogItemBlock data={data} />;

    case 'ProductColumnBlock':
      return <ProductColumnBlock data={data} blocks={blocks} />;

    case 'AccordionBlock':
      return <AccordionBlock data={data} blocks={blocks} />;

    case 'BannerBlock':
      return <BannerBlock data={data} />;

    case 'CountdownBlock':
      return <CountdownBlock data={data} />;

    case 'PricingBlock':
      return <PricingBlock data={data} blocks={blocks} />;

    case 'SocialProofBlock':
      return <SocialProofBlock data={data} />;

    case 'TabsBlock':
      return <TabsBlock data={data} blocks={blocks} />;

    case 'TeamBlock':
      return <TeamBlock data={data} blocks={blocks} />;

    case 'TestimonialsBlock':
      return <TestimonialsBlock data={data} blocks={blocks} />;

    case 'TimelineBlock':
      return <TimelineBlock data={data} blocks={blocks} />;

    case 'ExistingProductsBlock':
      return <ExistingProductsBlock data={data} />;

    default:
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          Unknown block: <strong>{type}</strong>
        </div>
      );
  }
}
