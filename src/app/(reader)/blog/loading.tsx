import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { BlogPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function BlogLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <BlogPageSkeleton />
    </>
  );
}

