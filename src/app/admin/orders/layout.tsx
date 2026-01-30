// Force dynamic so /admin/orders is not prerendered (useSearchParams in page)
export const dynamic = 'force-dynamic';

export default function AdminOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
