import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import SignInPage from './(auth)/sign-in/page';

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  }

  return <SignInPage />;
}
