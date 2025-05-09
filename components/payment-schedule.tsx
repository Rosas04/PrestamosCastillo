"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
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
import type { ClientData, LoanData, PaymentScheduleData } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Mail, Printer } from "lucide-react"
import { sendEmail } from "@/lib/api"

interface PaymentScheduleProps {
  clientData: ClientData
  loanData: LoanData
  paymentSchedule: PaymentScheduleData[]
}

export function PaymentSchedule({ clientData, loanData, paymentSchedule }: PaymentScheduleProps) {
  const [isSending, setIsSending] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [emailAddress, setEmailAddress] = useState(clientData.correo || "")
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)

  const handleSendEmail = async () => {
    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      toast({
        title: "Error",
        description: "Por favor ingrese un correo electrónico válido",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      // Actualizar el correo en los datos del cliente
      const updatedClientData = { ...clientData, correo: emailAddress }

      await sendEmail(updatedClientData, loanData, paymentSchedule)
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

  // Add print styles to the page
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

  return (
    <Card className="w-full print-content">
      <CardHeader className="print-header">
        <CardTitle>Cronograma de Pagos</CardTitle>
        <CardDescription>
          {clientData.tipoPersona === "natural" ? (
            <span>Cliente: {clientData.nombre}</span>
          ) : (
            <span>Empresa: {clientData.razonSocial}</span>
          )}
          <span className="block">
            Préstamo de S/ {formatCurrency(loanData.amount)} a {loanData.term} meses con tasa anual del{" "}
            {loanData.annualRate}%
          </span>
          <span className="block">
            Monto total a pagar: S/{" "}
            {formatCurrency(paymentSchedule.reduce((total, payment) => total + payment.monthlyPayment, 0))}
          </span>
          <span className="block">
            Total intereses: S/{" "}
            {formatCurrency(paymentSchedule.reduce((total, payment) => total + payment.interest, 0))}
          </span>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentSchedule.map((payment) => (
                <TableRow key={payment.paymentNumber}>
                  <TableCell>{payment.paymentNumber}</TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>S/ {formatCurrency(payment.monthlyPayment)}</TableCell>
                  <TableCell>S/ {formatCurrency(payment.interest)}</TableCell>
                  <TableCell>S/ {formatCurrency(payment.principal)}</TableCell>
                  <TableCell>S/ {formatCurrency(payment.remainingBalance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handlePrint} disabled={isPrinting} className="no-print">
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? "Imprimiendo..." : "Imprimir"}
        </Button>
      </CardFooter>
    </Card>
  )
}
