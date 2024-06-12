import LeftSideBar from '@/components/LeftSideBar';
import TopBar from '@/components/TopBar';

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex text-gray-1 max-lg:flex-col">
      <LeftSideBar />
      <TopBar />
      <div className="flex-1">{children}</div>
    </main>
  );
}
