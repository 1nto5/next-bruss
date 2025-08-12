'use client';

import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas-pro';
import { Loader2, Printer } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useRef, useState } from 'react';
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

  const handlePrint = async () => {
    if (!selectedArticle) return;

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

      // Wait for React to render the QR code
      setTimeout(() => {
        if (!qrCodeRef.current) {
          setIsGenerating(false);
          return;
        }

        const qrCodeCanvas = qrCodeRef.current.querySelector('canvas');
        if (qrCodeCanvas) {
          html2canvas(qrCodeCanvas, { scale: 2, backgroundColor: '#ffffff' }).then(
            (canvas: HTMLCanvasElement) => {
              const imgData = canvas.toDataURL('image/png');
              generatePrintWindow(imgData, batchCode);
              setIsGenerating(false);
            },
          ).catch(() => {
            setIsGenerating(false);
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error generating pallet QR:', error);
      setIsGenerating(false);
    }
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
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            {dict.generatingLabel || 'Generating label...'}
          </>
        ) : (
          <>
            <Printer className='mr-2 h-5 w-5' />
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