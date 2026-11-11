import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { NotificationsPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function NotificationsLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <NotificationsPageSkeleton />
    </>
  );
}

