import { redirect } from 'next/navigation';
import { isAdmin } from '@/app/lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main className="login-page">
      <div className="login-box">
        <img className="logo" src="/img/logo-full-black.svg" alt="株式会社山﨑工業" />
        <h1>管理画面ログイン</h1>
        <LoginForm />
      </div>
    </main>
  );
}
