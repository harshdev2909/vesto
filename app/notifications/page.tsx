"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function NotificationsPage() {
  const { data } = useSWR("/api/mock/events", fetcher)

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-8 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data?.events ?? []).map((e: any, i: number) => (
            <div key={i} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">{e.type}</div>
                <div className="text-sm text-muted-foreground">{e.description}</div>
              </div>
              <div className="text-sm">{e.time}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      </main>
    </div>
  )
}
