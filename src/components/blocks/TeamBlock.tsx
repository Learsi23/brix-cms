import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface RawChild {
  id: string;
  type: string;
  jsonData: string | null;
}

interface TeamBlockProps {
  data: BlockData;
  blocks?: RawChild[];
}

export default function TeamBlock({ data, blocks }: TeamBlockProps) {
  const title = getFieldValue(data, 'Title', '');
  const titleColor = getFieldValue(data, 'TitleColor', '#111827');
  const subtitle = getFieldValue(data, 'Subtitle', '');
  const columns = parseInt(getFieldValue(data, 'Columns', '3') || '3', 10);
  const bgColor = getFieldValue(data, 'BackgroundColor', 'transparent');

  const colClass = columns === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const members = (blocks ?? [])
    .filter(b => b.type === 'TeamMemberBlock')
    .map(b => {
      const d: BlockData = b.jsonData ? JSON.parse(b.jsonData) : {};
      return {
        id: b.id,
        photo: getFieldValue(d, 'Photo', ''),
        name: getFieldValue(d, 'Name', ''),
        role: getFieldValue(d, 'Role', ''),
        description: getFieldValue(d, 'Description', ''),
        linkedin: getFieldValue(d, 'LinkedInUrl', ''),
        twitter: getFieldValue(d, 'TwitterUrl', ''),
        email: getFieldValue(d, 'Email', ''),
        cardBg: getFieldValue(d, 'CardBgColor', '#ffffff'),
      };
    });

  return (
    <section style={{ backgroundColor: bgColor, padding: '4rem 0' }}>
      <div className="max-w-6xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 style={{ color: titleColor }} className="text-3xl font-black mb-3">{title}</h2>
            )}
            {subtitle && (
              <p className="text-gray-500 text-lg max-w-xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}

        {members.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No team members — add <strong>TeamMember</strong> blocks inside.
          </div>
        ) : (
          <div className={`grid ${colClass} gap-8`}>
            {members.map(member => (
              <div
                key={member.id}
                className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm text-center"
                style={{ backgroundColor: member.cardBg }}
              >
                {/* Photo */}
                <div className="h-56 bg-gray-100 overflow-hidden">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">
                      <i className="fas fa-user" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {member.name && (
                    <h3 className="font-black text-gray-800 text-lg">{member.name}</h3>
                  )}
                  {member.role && (
                    <p className="text-sm text-blue-600 font-semibold mt-0.5">{member.role}</p>
                  )}
                  {member.description && (
                    <p className="text-sm text-gray-500 mt-3 leading-relaxed">{member.description}</p>
                  )}

                  {/* Social links */}
                  {(member.linkedin || member.twitter || member.email) && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-200 transition-colors">
                          <i className="fab fa-linkedin-in text-sm" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                          <i className="fab fa-x-twitter text-sm" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`}
                          className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 hover:bg-emerald-200 transition-colors">
                          <i className="fas fa-envelope text-sm" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
