import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { BecomeCreatorPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function BecomeCreatorLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <BecomeCreatorPageSkeleton />
    </>
  );
}

