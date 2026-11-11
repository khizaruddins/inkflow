import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { ReviewQueuePageSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReviewLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="w-56 h-8 rounded-lg" />
          <Skeleton className="w-80 h-4" />
        </div>
        <ReviewQueuePageSkeleton />
      </div>
    </>
  );
}

