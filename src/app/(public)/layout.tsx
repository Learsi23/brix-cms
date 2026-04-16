import DynamicNavbar from '@/components/DynamicNavbar';
import DynamicFooter from '@/components/DynamicFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DynamicNavbar />
      <main className="pt-16">{children}</main>
      <DynamicFooter />
    </>
  );
}
