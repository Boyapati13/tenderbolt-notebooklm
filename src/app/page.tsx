import { redirect } from 'next/navigation';

export default function Home() {
  // For this example, we're redirecting to the dashboard.
  // In a real-world scenario, you might want to show a landing page.
  redirect('/dashboard');
}
