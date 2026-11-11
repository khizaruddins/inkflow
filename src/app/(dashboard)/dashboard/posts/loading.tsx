import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { DashboardOverviewSkeleton } from '@/components/skeletons/page-skeletons';

export default function DashboardPostsLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <DashboardOverviewSkeleton />
    </>
  );
}

