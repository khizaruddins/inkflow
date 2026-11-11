import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { CategoryPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function CategoryLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <CategoryPageSkeleton />
    </>
  );
}

