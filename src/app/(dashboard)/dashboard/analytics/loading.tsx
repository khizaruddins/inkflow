import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { AnalyticsPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function AnalyticsLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <AnalyticsPageSkeleton />
    </>
  );
}

