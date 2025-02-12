import {
  LayoutDashboard,
  Shapes,
  ShoppingBag,
  Tag,
  UsersRound,
} from 'lucide-react';

export const navLinks = [
  {
    url: '/',
    icon: <LayoutDashboard />,
    label: 'Dashboard',
  },
  {
    url: '/categories',
    icon: <Shapes />,
    label: 'Categories',
  },
  {
    url: '/products',
    icon: <Tag />,
    label: 'Products',
  },
  {
    url: '/orders',
    icon: <ShoppingBag />,
    label: 'Orders',
  },
  {
    url: '/customers',
    icon: <UsersRound />,
    label: 'Customers',
  },
];
