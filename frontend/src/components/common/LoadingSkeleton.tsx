export function PostSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-300 rounded w-20" />
        </div>
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-gray-300" />

      {/* Content */}
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );
}

export function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 animate-pulse">
      <div className="w-12 h-12 bg-gray-300 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-300 rounded w-24" />
      </div>
    </div>
  );
}
