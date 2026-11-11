import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { HomePageSkeleton } from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <RouteLoadingSignal />
      <HomePageSkeleton />
    </>
  );
}

