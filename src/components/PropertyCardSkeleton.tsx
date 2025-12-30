import { Skeleton } from "@/components/ui/skeleton"

export function PropertyCardSkeleton() {
    return (
        <div className="flex flex-col h-full bg-card rounded-2xl border border-border/60 overflow-hidden">
            {/* Image Skeleton */}
            <Skeleton className="aspect-[4/3] md:aspect-[3/2] w-full" />

            {/* Content Skeleton */}
            <div className="flex flex-col gap-2 p-4">
                {/* Title and Badge */}
                <div className="flex justify-between items-start gap-4">
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>

                {/* Location */}
                <Skeleton className="h-4 w-1/2 rounded-md" />

                {/* Footer: Price */}
                <div className="mt-4 flex items-baseline gap-2">
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                </div>
            </div>
        </div>
    )
}
