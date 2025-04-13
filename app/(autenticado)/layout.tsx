import type React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function AutenticadoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
