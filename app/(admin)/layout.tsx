import LeftSideBar from '@/components/layout/LeftSideBar';
import TopBar from '@/components/layout/TopBar';
import ToasterProvider from '@/lib/ToasterProvider';
import React from 'react';

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <main className="flex text-gray-1 max-lg:flex-col">
      <ToasterProvider />
      <LeftSideBar />
      <TopBar />
      
      <div className="flex-1 px-8 py-10">{children}</div>
    </main>
  );
}
