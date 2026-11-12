import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { ApplicationsPageSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApplicationsLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="w-64 h-8 rounded-lg" />
          <Skeleton className="w-80 h-4" />
        </div>
        <ApplicationsPageSkeleton />
      </div>
    </>
  );
}

