import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect root to the login page so authentication is the first screen
  redirect('/login');
}
