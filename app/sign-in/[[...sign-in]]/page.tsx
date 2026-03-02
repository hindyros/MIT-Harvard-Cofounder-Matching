import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gold">William x John</h1>
        <p className="text-text-tertiary text-sm mt-1">MIT × Harvard Cofounder Matching</p>
      </div>
      <SignIn
        afterSignInUrl="/apply"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'glass !bg-surface !border !border-border',
          },
        }}
      />
    </div>
  );
}
