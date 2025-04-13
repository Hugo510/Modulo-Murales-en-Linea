import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CorreosLoading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-10 w-64" />
          </div>

          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
