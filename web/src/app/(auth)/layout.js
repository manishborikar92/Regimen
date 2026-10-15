/**
 * Layout for authentication routes (login, etc.)
 * Minimal layout without BottomNav, styled with semantic canvas tokens.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-canvas text-main transition-colors">
      {children}
    </div>
  );
}
