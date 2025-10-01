import { getBetsForAdmin } from "@/lib/actions";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const bets = await getBetsForAdmin();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-headline font-bold mb-6 text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-8">
                Manage and confirm all user bets.
            </p>
            <Suspense fallback={<DashboardSkeleton />}>
                <AdminDashboardClient initialBets={bets} />
            </Suspense>
        </div>
    );
}


function DashboardSkeleton() {
    return (
      <div className="border rounded-lg">
        <div className="p-4">
          <Skeleton className="h-8 w-1/4" />
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-6 gap-4 p-4 border-b">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-3/4" />
              ))}
            </div>
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b">
                    {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-5 w-full" />
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  