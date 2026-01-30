// Force dynamic so /auth/callback is not prerendered (useSearchParams in page)
export const dynamic = 'force-dynamic';

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
