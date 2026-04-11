import DynamicNavbar from '@/components/DynamicNavbar';
import DynamicFooter from '@/components/DynamicFooter';
import ChatButton from '@/components/ChatButton';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DynamicNavbar />
      <div className="flex-1">
        <main>{children}</main>
        <ChatButton />
      </div>
      <DynamicFooter />
    </>
  );
}
