import FigmaImporter from '@/components/admin/FigmaImporter';

export default function FigmaPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Figma Import</h1>
        <p className="text-gray-400 text-sm">
          Connect a Figma file, select frames, and let AI recreate them as Eden CMS pages.
        </p>
      </div>
      <FigmaImporter />
    </div>
  );
}
