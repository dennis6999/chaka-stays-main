import { Skeleton } from "@/components/ui/skeleton"

export function AdminDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar Skeleton */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50 bg-slate-900/95 p-6 space-y-8">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded bg-slate-800" />
                    <Skeleton className="h-6 w-32 bg-slate-800" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full rounded bg-slate-800" />
                    <Skeleton className="h-10 w-full rounded bg-slate-800" />
                    <Skeleton className="h-10 w-full rounded bg-slate-800" />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 h-screen overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-8 rounded" />
                                </div>
                                <Skeleton className="h-10 w-32" />
                            </div>
                        ))}
                    </div>

                    {/* List/Table Skeleton */}
                    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-4 items-center py-2 border-b last:border-0 border-slate-100">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
