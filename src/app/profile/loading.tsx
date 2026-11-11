import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { ProfilePageSkeleton } from '@/components/skeletons/page-skeletons';

export default function ProfileLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <ProfilePageSkeleton />
    </>
  );
}

