import { getAllBets } from '@/lib/actions';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const bets = await getAllBets();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">Admin Dashboard</h1>
      <AdminDashboardClient initialBets={bets} />
    </div>
  );
}
