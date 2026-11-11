import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { ListDetailPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function ListDetailLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <ListDetailPageSkeleton />
    </>
  );
}

