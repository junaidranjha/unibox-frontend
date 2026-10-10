export default function AuthLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Unibox</h1>
          <p className="text-sm text-muted-foreground">Team inbox for WhatsApp Business</p>
        </div>
        {children}
      </div>
    </div>
  );
}
