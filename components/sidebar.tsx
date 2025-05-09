"use client"

import { Button } from "@/components/ui/button"
import { Home, FileText, Calendar, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RolePermissions } from "@/lib/types"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
  scheduleGenerated: boolean
  permissions: RolePermissions | null
}

export function Sidebar({ activeTab, setActiveTab, onLogout, scheduleGenerated, permissions }: SidebarProps) {
  return (
    <div className="h-screen w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-4">
        <h1 className="text-lg font-bold">Prestamos Castillo</h1>
      </div>
      <div className="px-3 py-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className={cn("w-full justify-start", activeTab === "home" && "bg-muted")}
            onClick={() => setActiveTab("home")}
          >
            <Home className="mr-2 h-4 w-4" />
            Inicio
          </Button>
          <Button
            variant="ghost"
            className={cn("w-full justify-start", activeTab === "loan" && "bg-muted")}
            onClick={() => setActiveTab("loan")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Nuevo Préstamo
          </Button>
          <Button
            variant="ghost"
            className={cn("w-full justify-start", activeTab === "loans" && "bg-muted")}
            onClick={() => setActiveTab("loans")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Préstamos
          </Button>
        </div>
      </div>
      <div className="absolute bottom-4 px-3 w-64">
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
