"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Clock, DollarSign } from "lucide-react"

interface HomePageProps {
  onNavigate: (tab: string) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const currentDate = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Capitalizar primera letra del día
  const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Inicio</h2>
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Límite Diario por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 5,000.00</div>
            <p className="text-xs text-muted-foreground">Monto máximo diario por cliente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Límite Mensual por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 20,000.00</div>
            <p className="text-xs text-muted-foreground">Monto máximo mensual por cliente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plazo Máximo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60 meses</div>
            <p className="text-xs text-muted-foreground">Plazo máximo de financiamiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Interés</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10%</div>
            <p className="text-xs text-muted-foreground">Tasa efectiva anual fija</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Bienvenido al Sistema de Prestamos Castillo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mt-6">
            <Button onClick={() => onNavigate("loan")} className="w-full max-w-xs">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Préstamo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
