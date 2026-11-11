import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { LibraryPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function LibraryLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <LibraryPageSkeleton />
    </>
  );
}

