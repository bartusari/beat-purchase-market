export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
      <div className="bg-bgCard p-6 rounded-xl shadow-soft w-[420px]">
        {children}
      </div>
    </div>
  );
}
