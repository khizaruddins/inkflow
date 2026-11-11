import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { StaticPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function PrivacyLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <StaticPageSkeleton />
    </>
  );
}

