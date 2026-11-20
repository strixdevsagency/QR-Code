import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Layers 
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { QRDesignOptions, BulkQRItem } from '../../types';
import { parseCSVInput, generateSingleQRPNG, batchDownloadZip } from '../../utils/bulkQREngine';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

interface BulkGeneratorProps {
  design: QRDesignOptions;
}

const SAMPLE_CSV = `# Restaurant Table Ordering Example
Table 01 - Patio, https://menu.strixdevs.com/order?table=1
Table 02 - Patio, https://menu.strixdevs.com/order?table=2
Table 03 - Dining Room, https://menu.strixdevs.com/order?table=3
Table 04 - Dining Room, https://menu.strixdevs.com/order?table=4
Table 05 - VIP Lounge, https://menu.strixdevs.com/order?table=5
VIP Wifi - 5GHz, WIFI:S:StrixVIP-5G;T:WPA;P:HighSpeedVIP2026;;
Alex Vance Contact Card, BEGIN:VCARD\\nVERSION:3.0\\nFN:Alex Vance\\nTEL:+18005550199\\nEND:VCARD`;

export const BulkGenerator: React.FC<BulkGeneratorProps> = ({ design }) => {
  const [rawText, setRawText] = useState<string>('');
  const [items, setItems] = useState<BulkQRItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [previewItem, setPreviewItem] = useState<BulkQRItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = (textToParse: string) => {
    const parsed = parseCSVInput(textToParse);
    const newItems: BulkQRItem[] = parsed.map((item, idx) => ({
      id: `bulk_${Date.now()}_${idx}`,
      title: item.title,
      payload: item.payload,
      type: item.payload.startsWith('WIFI:') ? 'wifi' : item.payload.includes('VCARD') ? 'vcard' : 'url',
      status: 'pending',
    }));
    setItems(newItems);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    setRawText(SAMPLE_CSV);
    handleParse(SAMPLE_CSV);
  };

  const clearAll = () => {
    setRawText('');
    setItems([]);
    setProgress(null);
    setPreviewItem(null);
  };

  const handleDownloadSingle = async (item: BulkQRItem) => {
    try {
      const { dataUrl } = await generateSingleQRPNG(item.payload, design);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      link.click();
    } catch {
      alert(`Could not generate single QR for ${item.title}`);
    }
  };

  const handlePreview = async (item: BulkQRItem) => {
    try {
      const { dataUrl } = await generateSingleQRPNG(item.payload, design);
      setPreviewItem({ ...item, dataUrl });
    } catch {
      alert('Could not render preview');
    }
  };

  const handleBatchGenerateAndZip = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: items.length });

    try {
      await batchDownloadZip(items, design, (curr, tot) => {
        setProgress({ current: curr, total: tot });
        // Update item status in UI
        setItems((prev) =>
          prev.map((item, idx) => ({
            ...item,
            status: idx < curr ? 'done' : 'pending',
          }))
        );
      });
      playVictoryFanfare();
    } catch (e) {
      console.error(e);
      alert('Error generating batch zip archive.');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Pro Client-Side Web Worker Batch Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            High-Volume Bulk QR Studio
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Generate dozens or hundreds of custom branded QR codes simultaneously from a CSV or text list. 100% processed in-browser with zero server delays or per-code subscription fees.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="secondary" onClick={() => {
            playTactileClick();
            loadSample();
          }}>
            <Layers className="w-4 h-4 mr-1.5 text-blue-400" />
            Load Sample CSV
          </Button>
          {items.length > 0 && (
            <Button variant="danger" onClick={() => {
              playTactileClick();
              clearAll();
            }}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                CSV Data / Line-by-Line Input
              </label>
              <button
                onClick={() => {
                  playTactileClick();
                  fileInputRef.current?.click();
                }}
                className="text-xs text-white hover:text-zinc-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload CSV File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-zinc-400">
              Format each line as <code className="text-zinc-300 bg-zinc-950 px-1 py-0.5 rounded border border-white/[0.05]">Title, URL or Payload</code> or simply enter raw links line by line.
            </p>

            <textarea
              rows={9}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder={`Table 1, https://menu.cafe/1\nTable 2, https://menu.cafe/2\nTable 3, https://menu.cafe/3`}
              className="w-full font-mono text-xs p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition-all resize-y"
            />

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 font-mono">
              <span>{items.length} items parsed</span>
              <span>Branding: {design.dotsType} / {design.dotsColor}</span>
            </div>
          </div>

          {/* Single Item Preview Modal / Box */}
          {previewItem && previewItem.dataUrl && (
            <div className="p-6 rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-white/[0.12] shadow-2xl space-y-4 animate-pop-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Preview: {previewItem.title}
                </span>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-36 h-36 bg-white p-2 rounded-2xl shadow-xl ring-1 ring-black/10 shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewItem.dataUrl} alt={previewItem.title} className="w-full h-full object-contain" />
                </div>
                <div className="space-y-2 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{previewItem.title}</h4>
                  <p className="text-xs font-mono text-zinc-300 break-all bg-zinc-950/80 p-2.5 rounded-xl border border-white/[0.08]">
                    {previewItem.payload}
                  </p>
                  <Button variant="secondary" onClick={() => handleDownloadSingle(previewItem)}>
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download PNG
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Processing Queue & Action */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/20 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#38bdf8]" />
                Generation Queue ({items.length})
              </h3>

              {items.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] text-xs font-semibold">
                  Ready to Batch Compile
                </span>
              )}
            </div>

            {/* Progress Bar (when running) */}
            {progress && (
              <div className="space-y-2 p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.08] animate-pop-in">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />
                    Compiling Vector High-Res PNGs...
                  </span>
                  <span className="font-bold text-[#38bdf8] font-mono">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-white/[0.05]">
                  <div
                    className="h-full bg-gradient-to-r from-[#38bdf8] to-cyan-400 transition-all duration-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {items.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-zinc-950/60 border border-dashed border-white/[0.1] space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-500">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Paste URLs or upload a CSV on the left to queue your bulk QR generation batch.
                </p>
                <Button variant="secondary" onClick={() => {
                  playTactileClick();
                  loadSample();
                }}>
                  Load Sample Items
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.06] pr-1 rounded-2xl bg-zinc-950/80 p-2 border border-white/[0.08]">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="py-2.5 px-3 flex items-center justify-between gap-3 hover:bg-zinc-800/50 rounded-xl transition-all animate-pop-in"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-zinc-500">#{idx + 1}</span>
                          <span className="text-xs font-bold text-zinc-200 truncate">{item.title}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.05]">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                          {item.payload}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <button
                            onClick={() => {
                              playTactileClick();
                              handlePreview(item);
                            }}
                            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 font-medium transition-colors cursor-pointer"
                          >
                            Preview
                          </button>
                        )}
                        <button
                          onClick={() => {
                            playTactileClick();
                            handleDownloadSingle(item);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Download single PNG"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary Batch Action */}
                <Button
                  variant="primary"
                  fullWidth
                  disabled={isProcessing || items.length === 0}
                  onClick={handleBatchGenerateAndZip}
                  className="py-3 text-sm font-bold shadow-xl shadow-black/40"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Building ZIP Archive...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download All as ZIP Archive (.zip)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
