import { cn } from '@utils/index';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
    return (
        <div className="animate-pulse space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={cn("bg-neutral-200 rounded", className)}
                />
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <div
                            key={colIdx}
                            className="bg-neutral-100 h-8 rounded animate-pulse"
                            style={{ width: `${100 / columns}%` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
