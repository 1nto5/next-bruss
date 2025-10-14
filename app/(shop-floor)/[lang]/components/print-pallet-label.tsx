'use client';

import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas-pro';
import { Loader2, Printer } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type PrintPalletLabelProps = {
  article: string;
  articleName: string;
  totalQuantity: number;
  buttonText?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  getPalletQrFn: () => Promise<string | null>;
};

export function PrintPalletLabel({
  article,
  articleName,
  totalQuantity,
  buttonText = 'Print Pallet Label',
  loadingText = 'Generating label...',
  successText = 'Label generated successfully',
  errorText = 'Failed to generate label',
  getPalletQrFn,
}: PrintPalletLabelProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const generatePrintWindow = (imgData: string, batch: string) => {
    const printWindow = window.open();
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    // Format current date as DD.MM.YYYY HH:MM
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    printWindow.document.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              .print-window {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 130mm;
                height: 130mm;
              }
              .print-window--batch {
                text-align: center;
                font-size: 24pt;
                font-weight: bold;
                margin-bottom: 2mm;
              }
              .print-window--image {
                margin: 1mm 0;
              }
              .print-window--image img {
                height: 80mm;
                width: 80mm;
              }
              .print-window--info {
                text-align: center;
                margin-top: 2mm;
              }
              .print-window--article {
                font-size: 16pt;
                font-weight: bold;
                margin-bottom: 2mm;
              }
              .print-window--quantity {
                font-size: 14pt;
              }
              .print-window--date {
                font-size: 9pt;
                margin-top: 3mm;
                color: #666;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-window">
            <div class="print-window--batch">
              ${batch}
            </div>
            <div class="print-window--image">
              <img src="${imgData}" />
            </div>
            <div class="print-window--info">
              <div class="print-window--article">${article} - ${articleName}</div>
              <div class="print-window--quantity">${totalQuantity} pcs</div>
              <div class="print-window--date">${formattedDate}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1500);
  };

  const handlePrint = () => {
    toast.promise(
      async () => {
        setIsGenerating(true);
        try {
          // Generate unique QR code using the provided function
          const generatedQr = await getPalletQrFn();
          if (!generatedQr) {
            throw new Error('Failed to generate QR code');
          }
          setQrCode(generatedQr);

          // Extract batch code from QR string
          const batchMatch = generatedQr.match(/B:([^|]+)/);
          const batchCode = batchMatch ? batchMatch[1] : '';

          // Wait for React to render the QR code and generate canvas
          await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              if (!qrCodeRef.current) {
                reject(new Error('QR code element not found'));
                return;
              }

              const qrCodeCanvas = qrCodeRef.current.querySelector('canvas');
              if (qrCodeCanvas) {
                html2canvas(qrCodeCanvas, {
                  scale: 2,
                  backgroundColor: '#ffffff',
                })
                  .then((canvas: HTMLCanvasElement) => {
                    const imgData = canvas.toDataURL('image/png');
                    generatePrintWindow(imgData, batchCode);
                    resolve();
                  })
                  .catch((error) => {
                    reject(error);
                  });
              } else {
                reject(new Error('QR code canvas not found'));
              }
            }, 100);
          });

          return successText;
        } catch (error) {
          console.error('Error generating pallet QR:', error);
          throw new Error(errorText);
        } finally {
          setIsGenerating(false);
        }
      },
      {
        loading: loadingText,
        success: (msg) => msg,
        error: (err) => err.message,
      },
    );
  };

  return (
    <div>
      <Button
        onClick={handlePrint}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? <Loader2 className='animate-spin' /> : <Printer />}
        {buttonText}
      </Button>
      {qrCode && (
        <div style={{ position: 'absolute', left: '-9999px' }} ref={qrCodeRef}>
          <QRCode value={qrCode} renderAs='canvas' />
        </div>
      )}
    </div>
  );
}
