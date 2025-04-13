import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SesionesLoading() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Skeleton className="h-10 w-full mb-6" />

        <Card className="border-2 mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-56 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
