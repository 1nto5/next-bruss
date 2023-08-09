import { useRef, useTransition, useEffect, useState } from 'react'
import { useAppSelector } from '@/lib/redux/pro/hooks'
import QRCode from 'qrcode.react'
import html2canvas from 'html2canvas'
import Button from './Button'
import { getPalletQr } from '../actions'
import toast from 'react-hot-toast'

const PrintPalletLabel = () => {
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const articleNumber = useAppSelector((state) => state.article.articleNumber)
  const articleName = useAppSelector((state) => state.article.articleName)
  const quantity = useAppSelector((state) => state.workplace.onPallet)
  const boxSize = useAppSelector((state) => state.workplace.boxSize)
  const quantityOnPallet = quantity! * boxSize!

  const [palletQr, setPalletQr] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (articleNumber && quantity) {
      startTransition(async () => {
        toast.loading('Generowanie QR...', { id: 'loadingQr' })
        const qr = await getPalletQr(articleNumber, quantityOnPallet)
        setPalletQr(qr)
        toast.dismiss('loadingQr')
      })
    }
  }, [articleNumber, quantity, quantityOnPallet])

  const generatePrintWindow = (imgData: string) => {
    const printWindow = window.open()
    printWindow!.document.write(`
      <html>
        <head>
          <style>
            @media print {
              .print-window {
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .print-window--image img {
                height: 50mm;
              }
              .print-window--table {
                border-collapse: collapse;
                border: 1px solid black;
                margin-top: 5mm;
              }
              .print-window--table th, .print-window--table td {
                border: 1px solid black;
                padding: 8px;
                text-align: left;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-window">
            <div class="print-window--image">
              <img src="${imgData}" />
            </div>
            <table class="print-window--table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${articleNumber}</td>
                  <td>${articleName}</td> 
                  <td>${quantityOnPallet}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `)
    printWindow!.document.close()
    printWindow!.focus()
    setTimeout(() => {
      printWindow!.print()
      printWindow!.close()
    }, 1500)
  }

  const handlePrint = () => {
    const qrCodeCanvas = qrCodeRef.current!.querySelector('canvas')
    html2canvas(qrCodeCanvas!, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        generatePrintWindow(imgData)
      })
      .catch((error) => {
        console.error('Error generating canvas from QR code:', error)
      })
  }

  return (
    <div className="mt-8 flex flex-col items-center justify-center">
      <Button text="wydruk QR" onClick={handlePrint} />
      <div style={{ opacity: 0 }} ref={qrCodeRef}>
        <QRCode value={palletQr!} />
      </div>
    </div>
  )
}

export default PrintPalletLabel
