// src/app/page.js - Redirect to auth or dashboard
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to auth page (users will be redirected to dashboard after login)
  redirect('/auth');
}
