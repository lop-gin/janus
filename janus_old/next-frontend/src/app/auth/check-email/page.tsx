// src/app/auth/check-email/page.tsx
export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
      <p className="text-gray-600 text-center mb-6">
        We’ve sent a verification link to your email. Please click the link to confirm your account.
      </p>
      <p className="text-sm text-gray-500">
        Didn’t receive it? Check your spam folder or try signing up again.
      </p>
    </div>
  );
}