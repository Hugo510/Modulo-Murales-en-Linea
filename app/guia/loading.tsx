import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Skeleton className="h-12 w-[300px] mx-auto mb-4" />
          <Skeleton className="h-6 w-[500px] mx-auto" />
        </div>

        <Skeleton className="h-12 w-full mb-8" />

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>

          <Skeleton className="h-[250px] w-full rounded-lg" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>

          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
