import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
export type { React.ComponentPropsWithoutRef<typeof Skeleton> as SkeletonProps };
// Placeholder file for project structure --- IGNORE ---