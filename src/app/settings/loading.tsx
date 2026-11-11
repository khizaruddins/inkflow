import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { SettingsPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function SettingsLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <SettingsPageSkeleton />
    </>
  );
}

