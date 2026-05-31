import DynamicNavbar from '@/components/DynamicNavbar';
import DynamicFooter from '@/components/DynamicFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] ">
      <DynamicNavbar />
      <main className='pt-[78px]'>{children}</main>
      <DynamicFooter />
    </div>
  );
}