import { Skeleton } from '../ui/Skeleton';

export const VideoPreviewSkeleton = () => (
  <div className="card animate-fade-in mb-6">
    <div className="flex flex-col md:flex-row gap-6">
      <Skeleton className="w-full md:w-64 h-36" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  </div>
);
