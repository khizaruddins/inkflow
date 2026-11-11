import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { SettingsPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function DashboardSettingsLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <SettingsPageSkeleton />
    </>
  );
}

