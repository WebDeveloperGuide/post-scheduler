interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_auto_1fr] grid-rows-[auto_auto_auto] md:grid-rows-1 bg-white rounded-xl shadow-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}
