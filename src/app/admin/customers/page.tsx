
'use client';
import AdminCustomersClientPage from './customers-client-page';

// This is now a simple client component wrapper.
// Data fetching is handled client-side in AdminCustomersClientPage.
export default function AdminCustomersPage() {
  return <AdminCustomersClientPage />;
}
