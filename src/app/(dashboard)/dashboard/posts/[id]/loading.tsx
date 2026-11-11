import { RouteLoadingSignal } from '@/components/ui/top-page-loader';
import { EditorPageSkeleton } from '@/components/skeletons/page-skeletons';

export default function EditPostLoading() {
  return (
    <>
      <RouteLoadingSignal />
      <EditorPageSkeleton />
    </>
  );
}

