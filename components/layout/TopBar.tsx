'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';

import { navLinks } from '@/lib/constant';
import { usePathname } from 'next/navigation';

export default function TopBar() {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-20 flex w-full items-center justify-between bg-blue-2 px-8 py-4 shadow-xl lg:hidden">
      <Image src="/logo.png" alt="Wave Mart Logo" width={60} height={70} />
      <div className="flex gap-8 max-md:hidden">
        {navLinks.map((item, i) => (
          <Link
            href={item.url}
            key={i}
            className={`flex gap-4 text-body-medium ${
              pathname === item.url ? 'text-blue-1' : 'text-gray-1'
            }`}
          >
            <p>{item.label}</p>
          </Link>
        ))}
      </div>
      <div className="relative flex items-center gap-4">
        <Menu
          className="cursor-pointer md:hidden"
          onClick={() => setDropdownMenu((prev) => !prev)}
        />
        {dropdownMenu && (
          <div className="absolute right-6 top-10 flex flex-col gap-8 rounded-lg bg-white p-5 shadow-xl">
            {navLinks.map((item, i) => (
              <Link
                href={item.url}
                key={i}
                className={`flex items-center gap-4 text-body-medium ${
                  pathname === item.url ? 'text-blue-1' : 'text-gray-1'
                }`}
              >
                {item.icon}
                <p>{item.label}</p>
              </Link>
            ))}
          </div>
        )}
        <UserButton />
      </div>
    </div>
  );
}
