'use client';

import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas-pro';
import { Loader2, Printer } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Dictionary } from '../lib/dictionary';
import { getPalletQr } from '../actions';
import { useScanStore } from '../lib/stores';

type PrintPalletLabelProps = {
  dict: Dictionary['scan'];
};

export function PrintPalletLabel({ dict }: PrintPalletLabelProps) {
  const { selectedArticle } = useScanStore();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const generatePrintWindow = (imgData: string, batch: string) => {
    const printWindow = window.open();
    printWindow!.document.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 5mm;
                font-family: Arial, sans-serif;
              }
              .print-window {
                display: flex;
                flex-direction: column;
                align-items: center;
                max-width: 80mm;
              }
              .print-window--image {
                margin: 2mm 0;
              }
              .print-window--image img {
                height: 34mm;
                width: 34mm;
              }
              .print-window--info {
                text-align: center;
                font-size: 9pt;
                line-height: 1.4;
              }
              .print-window--article {
                font-size: 8pt;
                font-weight: bold;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-window">
            <div class="print-window--info">
              ${batch}
            </div>
            <div class="print-window--image">
              <img src="${imgData}" />
            </div>
            <div class="print-window--info">
              <div class="print-window--article">${selectedArticle?.articleNumber || ''} - ${selectedArticle?.articleName || ''}</div>
              ${(selectedArticle?.piecesPerBox || 0) * (selectedArticle?.boxesPerPallet || 0)} pcs
            </div>
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
    if (!selectedArticle) return;

    toast.promise(
      async () => {
        setIsGenerating(true);
        try {
          // Generate unique QR code
          const generatedQr = await getPalletQr(selectedArticle.id);
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
                html2canvas(qrCodeCanvas, { scale: 2, backgroundColor: '#ffffff' }).then(
                  (canvas: HTMLCanvasElement) => {
                    const imgData = canvas.toDataURL('image/png');
                    generatePrintWindow(imgData, batchCode);
                    resolve();
                  },
                ).catch((error) => {
                  reject(error);
                });
              } else {
                reject(new Error('QR code canvas not found'));
              }
            }, 100);
          });

          return dict.labelGenerated || 'Label generated successfully';
        } catch (error) {
          console.error('Error generating pallet QR:', error);
          throw new Error(dict.labelGenerationError || 'Failed to generate label');
        } finally {
          setIsGenerating(false);
        }
      },
      {
        loading: dict.generatingLabel || 'Generating label...',
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );
  };

  if (!selectedArticle) return null;

  return (
    <div>
      <Button 
        variant='outline' 
        onClick={handlePrint}
        disabled={isGenerating}
        className='w-full'
      >
        {isGenerating ? (
          <>
            <Loader2 className='animate-spin' />
            {dict.generatingLabel || 'Generating label...'}
          </>
        ) : (
          <>
            <Printer />
            {dict.printPalletButton || 'Print Pallet Label'}
          </>
        )}
      </Button>
      {qrCode && (
        <div style={{ position: 'absolute', left: '-9999px' }} ref={qrCodeRef}>
          <QRCode value={qrCode} renderAs='canvas' />
        </div>
      )}
    </div>
  );
}