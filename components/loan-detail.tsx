"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Mail, Printer, ArrowLeft } from "lucide-react"
import { sendPaymentScheduleEmail } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { hasPermission } from "@/lib/auth"
import type { StoredLoan, User, RolePermissions } from "@/lib/types"

interface LoanDetailProps {
  loan: StoredLoan
  onBack: () => void
  currentUser: User | null
  permissions: RolePermissions | null
}

export function LoanDetail({ loan, onBack, currentUser, permissions }: LoanDetailProps) {
  const [isSending, setIsSending] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [emailAddress, setEmailAddress] = useState(loan.clientData.correo || "")
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)

  const canManageLoans = hasPermission(permissions, "loans", "manage")

  // Obtener las cuotas pagadas
  const paidInstallments = loan.paidInstallments || []

  // Calcular el monto total a pagar (capital + intereses)
  const totalAmount = loan.schedule.reduce((total, payment) => total + payment.monthlyPayment, 0)
  const totalInterest = loan.schedule.reduce((total, payment) => total + payment.interest, 0)

  const handleSendEmail = async () => {
    // Usar un correo predeterminado o solicitar uno nuevo
    const emailToUse = "cliente@ejemplo.com" // Correo predeterminado para todos los clientes

    setIsSending(true)
    try {
      // Actualizar el correo en los datos del cliente
      const updatedClientData = { ...loan.clientData, correo: emailToUse }

      await sendPaymentScheduleEmail(updatedClientData, loan.loanData, loan.schedule)
      toast({
        title: "Éxito",
        description: "El cronograma ha sido enviado al correo correctamente",
      })
      setIsEmailDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el cronograma por correo",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handlePrint = () => {
    setIsPrinting(true)
    try {
      window.print()
      toast({
        title: "Impresión",
        description: "El documento ha sido enviado a la impresora",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo imprimir el documento",
        variant: "destructive",
      })
    } finally {
      setIsPrinting(false)
    }
  }

  const getLoanStatusBadge = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <Badge variant="outline">Saldado</Badge>
    }

    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "approved":
        return <Badge variant="default">Activo</Badge>
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getInstallmentStatus = (installmentNumber: number) => {
    if (paidInstallments.includes(installmentNumber)) {
      return (
        <Badge variant="outline" className="bg-green-100">
          Pagada
        </Badge>
      )
    }
    return <Badge variant="secondary">Pendiente</Badge>
  }

  return (
    <div className="space-y-6 print-content">
      <div className="flex items-center justify-between no-print">
        <Button variant="outline" onClick={onBack} className="no-print">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex space-x-2 no-print">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Enviar por Correo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Enviar Cronograma por Correo</DialogTitle>
                <DialogDescription>
                  Ingrese el correo electrónico donde desea recibir el cronograma de pagos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="col-span-4">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="col-span-4"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSendEmail} disabled={isSending}>
                  {isSending ? "Enviando..." : "Enviar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "Imprimiendo..." : "Imprimir"}
          </Button>
        </div>
      </div>

      <Card className="no-print">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Detalles del Préstamo</CardTitle>
              <CardDescription>Información general del préstamo</CardDescription>
            </div>
            <div>{getLoanStatusBadge(loan.status, loan.isCompleted)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Datos del Cliente</h3>
              {loan.clientData.tipoPersona === "natural" ? (
                <p>
                  <strong>Nombre:</strong> {loan.clientData.nombre}
                </p>
              ) : (
                <>
                  <p>
                    <strong>Razón Social:</strong> {loan.clientData.razonSocial}
                  </p>
                  <p>
                    <strong>Representante Legal:</strong> {loan.clientData.representanteLegal}
                  </p>
                </>
              )}
              <p>
                <strong>Documento:</strong> {loan.clientData.tipoDocumento}: {loan.clientData.numeroDocumento}
              </p>
              {loan.clientData.direccion && (
                <p>
                  <strong>Dirección:</strong> {loan.clientData.direccion}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Datos del Préstamo</h3>
              <p>
                <strong>Monto del Capital:</strong> S/ {formatCurrency(loan.loanData.amount)}
              </p>
              <p>
                <strong>Plazo:</strong> {loan.loanData.term} meses
              </p>
              <p>
                <strong>Tasa Anual:</strong> {loan.loanData.annualRate}%
              </p>
              <p>
                <strong>Fecha de Emisión:</strong> {formatDate(new Date(loan.loanData.startDate))}
              </p>
              <p>
                <strong>Total Intereses:</strong> S/ {formatCurrency(totalInterest)}
              </p>
              <p className="font-semibold text-primary">
                <strong>Monto Total a Pagar:</strong> S/ {formatCurrency(totalAmount)}
              </p>
              <p>
                <strong>Estado:</strong> {loan.isCompleted ? "Saldado" : "Activo"}
              </p>
              <p>
                <strong>Cuotas Pagadas:</strong> {paidInstallments.length} de {loan.schedule.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Versión para impresión */}
      <div className="client-info print-only" style={{ display: "none" }}>
        <h2>CRONOGRAMA DE PAGOS</h2>
        <h3>Datos del Cliente</h3>
        {loan.clientData.tipoPersona === "natural" ? (
          <p>
            <strong>Nombre:</strong> {loan.clientData.nombre}
          </p>
        ) : (
          <>
            <p>
              <strong>Razón Social:</strong> {loan.clientData.razonSocial}
            </p>
            <p>
              <strong>Representante Legal:</strong> {loan.clientData.representanteLegal}
            </p>
          </>
        )}
        <p>
          <strong>Documento:</strong> {loan.clientData.tipoDocumento}: {loan.clientData.numeroDocumento}
        </p>
        {loan.clientData.direccion && (
          <p>
            <strong>Dirección:</strong> {loan.clientData.direccion}
          </p>
        )}
      </div>

      <div className="loan-summary print-only" style={{ display: "none" }}>
        <h3>Datos del Préstamo</h3>
        <p>
          <strong>Monto del Capital:</strong> S/ {formatCurrency(loan.loanData.amount)}
        </p>
        <p>
          <strong>Plazo:</strong> {loan.loanData.term} meses
        </p>
        <p>
          <strong>Tasa Anual:</strong> {loan.loanData.annualRate}%
        </p>
        <p>
          <strong>Fecha de Emisión:</strong> {formatDate(new Date(loan.loanData.startDate))}
        </p>
        <p>
          <strong>Total Intereses:</strong> S/ {formatCurrency(totalInterest)}
        </p>
        <p>
          <strong>Monto Total a Pagar:</strong> S/ {formatCurrency(totalAmount)}
        </p>
      </div>

      <Card id="schedule-card">
        <CardHeader className="print-header">
          <CardTitle>Cronograma de Pagos</CardTitle>
          <CardDescription>
            {loan.clientData.tipoPersona === "natural" ? (
              <span>Cliente: {loan.clientData.nombre}</span>
            ) : (
              <span>Empresa: {loan.clientData.razonSocial}</span>
            )}
            <span className="block">
              Préstamo de S/ {formatCurrency(loan.loanData.amount)} a {loan.loanData.term} meses con tasa anual del{" "}
              {loan.loanData.annualRate}%
            </span>
            <span className="block">Fecha de emisión: {formatDate(new Date(loan.loanData.startDate))}</span>
            <span className="block">
              <strong>Monto total a pagar: S/ {formatCurrency(totalAmount)}</strong>
            </span>
            <span className="block">Total intereses: S/ {formatCurrency(totalInterest)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border print-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">N° Cuota</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead>Cuota Mensual</TableHead>
                  <TableHead>Interés</TableHead>
                  <TableHead>Amortización</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead className="no-print">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loan.schedule.map((payment) => (
                  <TableRow key={payment.paymentNumber}>
                    <TableCell>{payment.paymentNumber}</TableCell>
                    <TableCell>{formatDate(new Date(payment.paymentDate))}</TableCell>
                    <TableCell>S/ {formatCurrency(payment.monthlyPayment)}</TableCell>
                    <TableCell>S/ {formatCurrency(payment.interest)}</TableCell>
                    <TableCell>S/ {formatCurrency(payment.principal)}</TableCell>
                    <TableCell>S/ {formatCurrency(payment.remainingBalance)}</TableCell>
                    <TableCell className="no-print">{getInstallmentStatus(payment.paymentNumber)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="loan-totals print-only" style={{ display: "none" }}>
            <p>
              <strong>Monto Total a Pagar: S/ {formatCurrency(totalAmount)}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
