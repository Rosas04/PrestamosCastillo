import type { ClientData, LoanData, PaymentScheduleData } from "./types"

// API SIMULADA de RENIEC para búsqueda de personas
// NOTA: Esta es una implementación simulada. En un entorno real, se conectaría con la API oficial de RENIEC
export async function searchReniec(documentNumber: string): Promise<ClientData> {
  // Simular llamada a API con un retraso
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validar que el DNI tenga 8 dígitos
      if (!/^\d{8}$/.test(documentNumber)) {
        reject(new Error("El DNI debe tener 8 dígitos numéricos"))
        return
      }

      // Datos simulados de RENIEC - En un entorno real, estos datos vendrían de la API oficial
      const reniecData: Record<string, ClientData> = {
        "12345678": {
          tipoPersona: "natural",
          nombre: "Juan Carlos Pérez García",
          tipoDocumento: "DNI",
          numeroDocumento: "12345678",
          direccion: "Av. Arequipa 123, Lima",
          correo: "juan.perez@ejemplo.com",
        },
        "87654321": {
          tipoPersona: "natural",
          nombre: "María Rodríguez Vega",
          tipoDocumento: "DNI",
          numeroDocumento: "87654321",
          direccion: "Jr. Huallaga 456, Lima",
          correo: "maria.rodriguez@ejemplo.com",
        },
        "45678912": {
          tipoPersona: "natural",
          nombre: "Pedro Suárez López",
          tipoDocumento: "DNI",
          numeroDocumento: "45678912",
          direccion: "Av. La Marina 789, Lima",
          correo: "pedro.suarez@ejemplo.com",
        },
      }

      // Si el DNI existe en nuestros datos simulados, devolver la información
      if (reniecData[documentNumber]) {
        resolve(reniecData[documentNumber])
      } else {
        // Si no existe, generar datos aleatorios
        const nombres = ["José", "Luis", "Carlos", "Ana", "Rosa", "Sofía", "Miguel", "Eduardo"]
        const apellidos = ["García", "Rodríguez", "López", "Martínez", "Pérez", "Gómez", "Sánchez", "Torres"]

        const nombreAleatorio = nombres[Math.floor(Math.random() * nombres.length)]
        const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)]
        const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)]

        resolve({
          tipoPersona: "natural",
          nombre: `${nombreAleatorio} ${apellido1} ${apellido2}`,
          tipoDocumento: "DNI",
          numeroDocumento: documentNumber,
          direccion: `Calle Principal ${Math.floor(Math.random() * 1000) + 1}, Lima`,
          correo: `${nombreAleatorio.toLowerCase()}.${apellido1.toLowerCase()}@ejemplo.com`,
        })
      }
    }, 1000)
  })
}

// API SIMULADA de SUNAT para búsqueda de empresas
// NOTA: Esta es una implementación simulada. En un entorno real, se conectaría con la API oficial de SUNAT
export async function searchSunat(rucNumber: string): Promise<ClientData> {
  // Simular llamada a API con un retraso
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validar que el RUC tenga 11 dígitos
      if (!/^\d{11}$/.test(rucNumber)) {
        reject(new Error("El RUC debe tener 11 dígitos numéricos"))
        return
      }

      // Datos simulados de SUNAT
      const sunatData: Record<string, ClientData> = {
        "20123456789": {
          tipoPersona: "juridica",
          razonSocial: "Inversiones ABC S.A.C.",
          representanteLegal: "Carlos Mendoza Ríos",
          tipoDocumento: "RUC",
          numeroDocumento: "20123456789",
          direccion: "Av. Javier Prado 456, San Isidro, Lima",
          correo: "contacto@inversionesabc.com",
        },
        "20987654321": {
          tipoPersona: "juridica",
          razonSocial: "Comercial XYZ E.I.R.L.",
          representanteLegal: "Ana Gutiérrez Vargas",
          tipoDocumento: "RUC",
          numeroDocumento: "20987654321",
          direccion: "Av. República de Panamá 3030, San Isidro, Lima",
          correo: "info@comercialxyz.com",
        },
      }

      // Si el RUC existe en nuestros datos simulados, devolver la información
      if (sunatData[rucNumber]) {
        resolve(sunatData[rucNumber])
      } else {
        // Si no existe, generar datos aleatorios
        const tiposEmpresa = ["S.A.C.", "E.I.R.L.", "S.A.", "S.R.L."]
        const nombres = ["Inversiones", "Comercial", "Distribuidora", "Servicios", "Constructora", "Consultora"]
        const apellidos = ["Norte", "Sur", "Este", "Oeste", "Perú", "Lima", "Andina", "Pacífico"]

        const nombreEmpresa = nombres[Math.floor(Math.random() * nombres.length)]
        const apellidoEmpresa = apellidos[Math.floor(Math.random() * apellidos.length)]
        const tipoEmpresa = tiposEmpresa[Math.floor(Math.random() * tiposEmpresa.length)]

        const razonSocial = `${nombreEmpresa} ${apellidoEmpresa} ${tipoEmpresa}`

        resolve({
          tipoPersona: "juridica",
          razonSocial: razonSocial,
          representanteLegal: "Representante Legal",
          tipoDocumento: "RUC",
          numeroDocumento: rucNumber,
          direccion: `Av. Principal ${Math.floor(Math.random() * 1000) + 1}, Lima`,
          correo: `contacto@${nombreEmpresa.toLowerCase()}${apellidoEmpresa.toLowerCase()}.com`,
        })
      }
    }, 1000)
  })
}

// Función para buscar cliente (ahora usa las APIs de RENIEC y SUNAT)
export async function searchClient(tipoPersona: string, documentNumber: string): Promise<ClientData> {
  if (tipoPersona === "natural") {
    return searchReniec(documentNumber)
  } else {
    return searchSunat(documentNumber)
  }
}

// Función simulada para generar PDF
export async function generatePDF(client: ClientData, loan: LoanData, schedule: PaymentScheduleData[]): Promise<void> {
  // Simular generación de PDF con un retraso
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("PDF generado para:", client.tipoPersona === "natural" ? client.nombre : client.razonSocial)
      console.log("Datos del préstamo:", loan)
      console.log("Cronograma:", schedule.length, "cuotas")

      // En un entorno real, aquí se generaría y descargaría el PDF
      // Por ahora solo mostramos un mensaje en consola
      resolve()
    }, 1500)
  })
}

// Servicio de notificaciones por email
export async function sendEmail(
  to: string,
  subject: string,
  content: string,
  attachments?: { name: string; content: string }[],
): Promise<boolean> {
  // Simular envío de email con un retraso
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Email enviado:")
      console.log("Para:", to)
      console.log("Asunto:", subject)
      console.log("Contenido:", content)
      if (attachments) {
        console.log("Adjuntos:", attachments.length)
      }

      // En un entorno real, aquí se conectaría con un servicio de email como SendGrid, Mailgun, etc.
      resolve(true)
    }, 1500)
  })
}

// Función para enviar notificación de préstamo registrado
export async function sendLoanRegistrationEmail(
  client: ClientData,
  loan: LoanData,
  schedule: PaymentScheduleData[],
): Promise<boolean> {
  const clientEmail = client.correo

  if (!clientEmail) {
    throw new Error("El cliente no tiene correo electrónico registrado")
  }

  const clientName = client.tipoPersona === "natural" ? client.nombre : client.razonSocial
  const subject = "Préstamo Registrado - Sistema de Préstamos"

  // Crear contenido del email
  const content = `
    <h2>Estimado(a) ${clientName}</h2>
    <p>Le informamos que se ha registrado un préstamo a su nombre con los siguientes detalles:</p>
    <ul>
      <li><strong>Monto:</strong> S/ ${loan.amount.toFixed(2)}</li>
      <li><strong>Plazo:</strong> ${loan.term} meses</li>
      <li><strong>Tasa de interés anual:</strong> ${loan.annualRate}%</li>
      <li><strong>Fecha de emisión:</strong> ${new Date(loan.startDate).toLocaleDateString("es-PE")}</li>
    </ul>
    <p>Adjunto encontrará el cronograma de pagos correspondiente.</p>
    <p>Gracias por confiar en nosotros.</p>
    <p>Atentamente,<br>Sistema de Préstamos</p>
  `

  // Crear "adjunto" con el cronograma (en un entorno real, esto sería un PDF)
  const scheduleContent = schedule
    .map(
      (payment) =>
        `Cuota ${payment.paymentNumber} - Fecha: ${new Date(payment.paymentDate).toLocaleDateString("es-PE")} - Monto: S/ ${payment.monthlyPayment.toFixed(2)}`,
    )
    .join("\n")

  const attachments = [
    {
      name: "cronograma_pagos.txt",
      content: scheduleContent,
    },
  ]

  return sendEmail(clientEmail, subject, content, attachments)
}

// Función para enviar cronograma de pagos por email
export async function sendPaymentScheduleEmail(
  client: ClientData,
  loan: LoanData,
  schedule: PaymentScheduleData[],
): Promise<boolean> {
  const clientEmail = client.correo

  if (!clientEmail) {
    throw new Error("El cliente no tiene correo electrónico registrado")
  }

  const clientName = client.tipoPersona === "natural" ? client.nombre : client.razonSocial
  const subject = "Cronograma de Pagos - Sistema de Préstamos"

  // Crear contenido del email
  let content = `
    <h2>Estimado(a) ${clientName}</h2>
    <p>Adjunto encontrará el cronograma de pagos de su préstamo:</p>
    <ul>
      <li><strong>Monto:</strong> S/ ${loan.amount.toFixed(2)}</li>
      <li><strong>Plazo:</strong> ${loan.term} meses</li>
      <li><strong>Tasa de interés anual:</strong> ${loan.annualRate}%</li>
      <li><strong>Fecha de emisión:</strong> ${new Date(loan.startDate).toLocaleDateString("es-PE")}</li>
    </ul>
    <p>A continuación se detalla el cronograma de pagos:</p>
    <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>Cuota</th>
        <th>Fecha de Pago</th>
        <th>Cuota Mensual</th>
        <th>Interés</th>
        <th>Amortización</th>
        <th>Saldo</th>
      </tr>
  `

  // Agregar filas de la tabla con el cronograma
  schedule.forEach((payment) => {
    content += `
      <tr>
        <td>${payment.paymentNumber}</td>
        <td>${new Date(payment.paymentDate).toLocaleDateString("es-PE")}</td>
        <td>S/ ${payment.monthlyPayment.toFixed(2)}</td>
        <td>S/ ${payment.interest.toFixed(2)}</td>
        <td>S/ ${payment.principal.toFixed(2)}</td>
        <td>S/ ${payment.remainingBalance.toFixed(2)}</td>
      </tr>
    `
  })

  content += `
    </table>
    <p>Gracias por confiar en nosotros.</p>
    <p>Atentamente,<br>Sistema de Préstamos</p>
  `

  return sendEmail(clientEmail, subject, content)
}
