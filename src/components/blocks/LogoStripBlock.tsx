import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function LogoStripBlock({ data }: { data: BlockData }) {
  const heading = getFieldValue(data, 'Heading');
  const headingColor = getFieldValue(data, 'HeadingColor', '#9ca3af');
  const logoHeight = getFieldValue(data, 'LogoHeight', '40px');
  const grayscale = getFieldValue(data, 'Grayscale', 'true') === 'true';
  const bgColor = getFieldValue(data, 'BackgroundColor', '#f9fafb');
  const paddingY = getFieldValue(data, 'PaddingY', '2.5rem');

  const logos = [1, 2, 3, 4, 5, 6].map(n => ({
    src: getFieldValue(data, `Logo${n}`),
    url: getFieldValue(data, `Logo${n}Url`),
  })).filter(l => l.src);

  if (logos.length === 0 && !heading) return null;

  return (
    <section style={{ backgroundColor: bgColor, paddingTop: paddingY, paddingBottom: paddingY }}>
      <div className="max-w-6xl mx-auto px-6">
        {heading && (
          <p style={{ color: headingColor }} className="text-center text-sm font-semibold uppercase tracking-wider mb-8">
            {heading}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo, i) => {
            const img = (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={logo.src!}
                alt={`Partner logo ${i + 1}`}
                style={{
                  height: logoHeight,
                  objectFit: 'contain',
                  filter: grayscale ? 'grayscale(100%)' : undefined,
                  opacity: grayscale ? 0.6 : 1,
                  transition: 'filter 0.2s, opacity 0.2s',
                }}
                className="hover:grayscale-0 hover:opacity-100"
              />
            );
            return logo.url ? (
              <a key={i} href={logo.url} target="_blank" rel="noopener noreferrer">{img}</a>
            ) : img;
          })}
        </div>
      </div>
    </section>
  );
}
