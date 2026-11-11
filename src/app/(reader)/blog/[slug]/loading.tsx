import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { ArticlePageSkeleton } from '@/components/skeletons/page-skeletons';

export default function ArticleLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <ArticlePageSkeleton />
    </>
  );
}

