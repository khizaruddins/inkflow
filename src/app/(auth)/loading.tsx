import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { AuthPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function AuthLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <AuthPageSkeleton />
    </>
  );
}

