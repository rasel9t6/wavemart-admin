import { UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <div>
      <UserButton />
      <h1>This is home page</h1>
    </div>
  );
}
