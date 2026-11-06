import LoginForm from './LoginForm';

export default function LoginPage() {
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
