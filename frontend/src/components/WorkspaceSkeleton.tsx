export function WorkspaceSkeleton() {
  return <div className="panel space-y-5 p-6" role="status" aria-label="Loading lab" aria-busy="true">
    <span className="sr-only">Loading lab...</span>
    <div className="skeleton h-5 w-40" aria-hidden="true" />
    <div className="skeleton h-3 w-3/4" aria-hidden="true" />
    <div className="skeleton h-36 w-full" aria-hidden="true" />
    <div className="skeleton h-10 w-40" aria-hidden="true" />
  </div>;
}
