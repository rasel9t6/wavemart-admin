'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

import { navLinks } from '@/lib/constant';

export default function LeftSideBar() {
  const pathname = usePathname();
  return (
    <aside className="sticky left-0 top-0 flex h-screen flex-col gap-16 bg-blue-2 p-10 shadow-xl max-lg:hidden">
      <Image src="/logo.png" alt="logo" width={150} height={70} />

      <div className="flex flex-col gap-12">
        {navLinks.map((link) => (
          <Link
            href={link.url}
            key={link.label}
            className={`flex items-center gap-4 text-body-medium ${
              pathname === link.url ? 'text-blue-1' : 'text-gray-1'
            }`}
          >
            {link.icon} <p>{link.label}</p>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 text-body-medium">
        <UserButton />
        <p>Edit Profile</p>
      </div>
    </aside>
  );
}
