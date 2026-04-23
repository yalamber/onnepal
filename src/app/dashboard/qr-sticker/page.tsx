'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useActiveBusiness } from '../layout';
import { Download, Printer, Loader2 } from 'lucide-react';

export default function QRStickerPage() {
  const { business } = useActiveBusiness();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<'minimal' | 'branded' | 'full'>('branded');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const siteUrl = business ? `https://${business.subdomain}.onnepal.com` : '';

  const generateQR = useCallback(async () => {
    if (!siteUrl) return;
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(siteUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(url);
    } catch (e) {
      console.error('QR generation failed:', e);
    }
  }, [siteUrl]);

  useEffect(() => { generateQR(); }, [generateQR]);

  const downloadSticker = () => {
    const canvas = canvasRef.current;
    if (!canvas || !business || !qrDataUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 600;
    const h = style === 'minimal' ? 680 : style === 'branded' ? 780 : 880;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    const img = new Image();
    img.onload = () => {
      const qrSize = 320;
      const qrX = (w - qrSize) / 2;
      let y = 40;

      if (style === 'full') {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN TO VISIT', w / 2, y + 14);
        y += 40;
      }

      ctx.drawImage(img, qrX, y, qrSize, qrSize);
      y += qrSize + 30;

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(business.businessName, w / 2, y);
      y += 8;

      if (style !== 'minimal' && business.businessCategory) {
        y += 22;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillText(business.businessCategory, w / 2, y);
      }

      y += 30;
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px monospace';
      ctx.fillText(`${business.subdomain}.onnepal.com`, w / 2, y);

      if (style === 'full') {
        y += 40;
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(40, y, w - 80, 1);
        y += 25;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.fillText('Powered by OnNepal', w / 2, y);
      }

      const link = document.createElement('a');
      link.download = `${business.subdomain}-qr-sticker.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = qrDataUrl;
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open('', '', 'width=400,height=600');
    if (!w) return;
    w.document.write(`
      <html><head><title>QR Sticker</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; padding: 20px; }
        .sticker { border: 1px solid #e5e7eb; padding: 32px; text-align: center; max-width: 300px; }
        .sticker img { width: 200px; height: 200px; }
        .name { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 16px; }
        .category { font-size: 12px; color: #9ca3af; margin-top: 4px; }
        .url { font-size: 13px; color: #6b7280; font-family: monospace; margin-top: 12px; }
        .scan { font-size: 11px; color: #0f172a; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .footer { font-size: 10px; color: #9ca3af; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
        @media print { body { padding: 0; } .sticker { border: 1px dashed #ccc; } }
      </style></head><body>
      <div class="sticker">
        ${style === 'full' ? '<p class="scan">Scan to visit</p>' : ''}
        <img src="${qrDataUrl}" alt="QR Code" />
        <p class="name">${business?.businessName}</p>
        ${style !== 'minimal' && business?.businessCategory ? `<p class="category">${business.businessCategory}</p>` : ''}
        <p class="url">${business?.subdomain}.onnepal.com</p>
        ${style === 'full' ? '<p class="footer">Powered by OnNepal</p>' : ''}
      </div></body></html>
    `);
    w.document.close();
    w.print();
  };

  if (!business) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-gray-400">Select a business to generate a QR sticker.</p>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">QR Sticker</h1>
        <p className="mt-1 text-gray-400">Generate a printable QR code sticker for your business.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Preview */}
        <div className="flex-1">
          <div ref={printRef} className="border border-gray-200 rounded-lg p-8 bg-white max-w-xs mx-auto text-center">
            {style === 'full' && (
              <p className="text-[11px] font-bold text-gray-950 uppercase tracking-[3px] mb-4">Scan to visit</p>
            )}
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            <p className="text-lg font-bold text-gray-950 mt-4">{business.businessName}</p>
            {style !== 'minimal' && business.businessCategory && (
              <p className="text-xs text-gray-400 mt-1">{business.businessCategory}</p>
            )}
            <p className="text-sm text-gray-500 font-mono mt-3">{business.subdomain}.onnepal.com</p>
            {style === 'full' && (
              <p className="text-[10px] text-gray-300 mt-4 pt-3 border-t border-gray-100">Powered by OnNepal</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="lg:w-64 space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-950 mb-3">Style</p>
            <div className="space-y-1.5">
              {([
                { value: 'minimal' as const, label: 'Minimal', desc: 'QR + name + URL' },
                { value: 'branded' as const, label: 'Branded', desc: 'Adds category' },
                { value: 'full' as const, label: 'Full', desc: 'Adds header + footer' },
              ]).map((opt) => (
                <button key={opt.value} onClick={() => setStyle(opt.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    style === opt.value ? 'bg-gray-100 text-gray-950' : 'text-gray-500 hover:text-gray-950'
                  }`}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <button onClick={downloadSticker}
              className="w-full flex items-center justify-center gap-2 h-10 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
              <Download className="h-4 w-4" /> Download PNG
            </button>
            <button onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 h-10 border border-gray-200 text-gray-950 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Tip: Print on adhesive paper for stickers.</p>
            <p>Works great on business cards, shop windows, menus, and packaging.</p>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
