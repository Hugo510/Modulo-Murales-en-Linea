import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function HerramientasLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-10 w-64 mb-6" />

      <div className="space-y-6">
        <Skeleton className="h-12 w-full mb-6" />

        <Card className="border-2">
          <CardHeader>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />

              <div className="py-8 flex flex-col items-center">
                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-10 w-48 mt-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
