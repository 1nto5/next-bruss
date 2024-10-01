'use client';

import QRCode from 'qrcode.react';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

type PrintPalletLabelProps = {
  cDict: any;
  articleNumber: string;
  articleName: string;
  piecesPerPallet: number;
  qrCode: string;
};

export function PrintPalletLabel({
  cDict,
  articleNumber,
  articleName,
  piecesPerPallet,
  qrCode,
}: PrintPalletLabelProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const generatePrintWindow = (imgData: string) => {
    const printWindow = window.open();
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
                                height: 30mm;
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
                                    <td>${piecesPerPallet}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
        `);
    printWindow!.document.close();
    printWindow!.focus();
    setTimeout(() => {
      printWindow!.print();
      printWindow!.close();
    }, 1500);
  };

  const handlePrint = () => {
    if (!qrCodeRef.current) return; // Zabezpieczenie dla początkowego stanu ref

    const qrCodeCanvas = qrCodeRef.current.querySelector('canvas');
    html2canvas(qrCodeCanvas!, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      generatePrintWindow(imgData);
    });
  };

  return (
    <div className='mt-16 flex flex-col items-center justify-center'>
      <Button variant='destructive' onClick={handlePrint}>
        <Printer className='h-4 w-4' /> {cDict.printPalletButton}
      </Button>
      <div style={{ opacity: 0 }} ref={qrCodeRef}>
        <QRCode value={qrCode!} />
      </div>
    </div>
  );
}
