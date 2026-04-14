import DynamicNavbar from '@/components/DynamicNavbar';
import DynamicFooter from '@/components/DynamicFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DynamicNavbar />
      <main>{children}</main>
      <DynamicFooter />
    </>
  );
}
