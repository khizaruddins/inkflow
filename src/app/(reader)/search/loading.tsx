import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { SearchPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function SearchLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <SearchPageSkeleton />
    </>
  );
}

