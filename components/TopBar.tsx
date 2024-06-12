'use client';
import { navLinks } from '@/lib/constant';
import { UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function TopBar() {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  return (
    <div className="sticky top-0 z-20 flex w-full items-center justify-between bg-blue-2 px-8 py-4 shadow-xl lg:hidden"></div>
  );
}
