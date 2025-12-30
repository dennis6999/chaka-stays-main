import { Skeleton } from "@/components/ui/skeleton"

export function PropertyDetailSkeleton() {
    return (
        <div className="min-h-screen flex flex-col bg-background animate-in fade-in">
            <div className="chaka-container pb-16 pt-24">

                {/* Header Section */}
                <div className="mb-6 space-y-4">
                    <Skeleton className="h-10 w-2/3 md:w-1/3 rounded-lg" />
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                {/* Image Grid Skeleton */}
                <div className="hidden lg:flex gap-2 rounded-2xl overflow-hidden h-[60vh] mb-12">
                    <Skeleton className="w-1/2 h-full" />
                    <div className="grid grid-rows-2 gap-2 h-full w-1/2">
                        <Skeleton className="w-full h-full" />
                        <Skeleton className="w-full h-full" />
                    </div>
                </div>
                {/* Mobile Image Skeleton */}
                <div className="lg:hidden h-[40vh] w-full mb-8 rounded-xl overflow-hidden">
                    <Skeleton className="w-full h-full" />
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Content */}
                    <div className="lg:w-2/3 space-y-10">
                        {/* Quick Summary */}
                        <div className="flex gap-4 py-8 border-b border-border">
                            <Skeleton className="h-10 w-24 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                        </div>

                        {/* Host Info */}
                        <div className="flex items-center gap-4 py-4 border-b border-border">
                            <Skeleton className="h-14 w-14 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-48 mb-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>

                        {/* Amenities */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden lg:block lg:w-1/3">
                        <div className="sticky top-24">
                            <Skeleton className="h-[400px] w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
