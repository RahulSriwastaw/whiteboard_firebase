import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { ScannedPage } from '../types';
import { Loader2, CheckCircle2, AlertCircle, Edit2, Copy, Save, X, Check, RefreshCw, FileText } from 'lucide-react';

// KaTeX CSS is loaded via CDN in index.html

interface ProcessingListProps {
  pages: ScannedPage[];
  onUpdateText: (id: string, newText: string) => void;
  onRetry: (id: string) => void;
  onToggleSelection: (id: string) => void;
  includeImages: boolean;
}

const ProcessingList: React.FC<ProcessingListProps> = ({ pages, onUpdateText, onRetry, onToggleSelection, includeImages }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (pages.length === 0) return null;

  const handleEditClick = (page: ScannedPage) => {
    if (page.extractedText) {
      setEditingId(page.id);
      setEditText(page.extractedText);
    }
  };

  const handleSave = (id: string) => {
    onUpdateText(id, editText);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-8">
      {pages.map((page) => (
        <div 
            key={page.id} 
            className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row h-auto min-h-[200px] md:min-h-[250px] transition-all duration-200 ${
                page.isSelected ? 'border-slate-300 ring-1 ring-slate-100' : 'border-slate-200 opacity-90'
            }`}
        >
          
          {/* Image Side */}
          <div 
            className="w-full md:w-1/4 bg-slate-50 relative group border-b md:border-b-0 md:border-r border-slate-200 cursor-pointer"
            onClick={() => onToggleSelection(page.id)}
          >
            <img 
              src={page.imageUrl} 
              alt={`Page ${page.pageNumber}`} 
              className="w-full h-full object-contain p-3 transition-opacity group-hover:opacity-90" 
            />
            
            {/* Bounding Box Overlays */}
            {includeImages && page.status === 'done' && page.elements && page.elements.map((el) => (
                el.type === 'image' && el.bbox && (
                    <div 
                        key={`overlay-${el.id}`}
                        className="absolute border-2 border-slate-800 bg-slate-800/10 pointer-events-none"
                        style={{
                            top: `${(el.bbox.ymin / 1000) * 100}%`,
                            left: `${(el.bbox.xmin / 1000) * 100}%`,
                            width: `${((el.bbox.xmax - el.bbox.xmin) / 1000) * 100}%`,
                            height: `${((el.bbox.ymax - el.bbox.ymin) / 1000) * 100}%`,
                        }}
                    >
                        <span className="absolute -top-4 left-0 bg-slate-800 text-white text-[8px] px-1 rounded font-semibold">Image</span>
                    </div>
                )
            ))}

            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    page.isSelected 
                        ? 'bg-slate-800 border-slate-800 text-white' 
                        : 'bg-white/90 border-slate-300 hover:border-slate-500'
                }`}>
                    {page.isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
            </div>

            <div className="absolute top-2 left-9 bg-slate-900/60 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-sm">
                Page {page.pageNumber}
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
               {page.status === 'processing' && (
                 <span className="bg-slate-800/90 backdrop-blur text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                   <Loader2 className="w-3 h-3 animate-spin" /> Processing
                 </span>
               )}
               {page.status === 'done' && (
                 <span className="bg-emerald-600/90 backdrop-blur text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                   <CheckCircle2 className="w-3 h-3" /> Done
                 </span>
               )}
               {page.status === 'error' && (
                 <span className="bg-rose-600/90 backdrop-blur text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                   <AlertCircle className="w-3 h-3" /> Failed
                 </span>
               )}
            </div>
          </div>

          {/* Text/Editor Side */}
          <div className="w-full md:w-3/4 flex flex-col h-[300px] md:h-auto">
            {/* Toolbar */}
            <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {editingId === page.id ? "Edit Mode" : "Content"}
                </span>
                
                {page.status === 'done' && page.extractedText && (
                    <div className="flex gap-1.5">
                        {editingId === page.id ? (
                            <>
                                <button 
                                    onClick={() => handleSave(page.id)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    <Save className="w-3 h-3" /> Save
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold rounded hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => handleEditClick(page)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold rounded hover:bg-slate-50 transition-colors shadow-sm"
                                    title="Edit Text"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleCopy(page.id, page.extractedText || '')}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold rounded hover:bg-slate-50 transition-colors shadow-sm"
                                    title="Copy to Clipboard"
                                >
                                    {copiedId === page.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    {copiedId === page.id ? "Copied" : "Copy"}
                                </button>
                                <button 
                                    onClick={() => handleCopy(page.id, `\`\`\`markdown\n${page.extractedText || ''}\n\`\`\``)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold rounded hover:bg-slate-50 transition-colors shadow-sm"
                                    title="Copy as Markdown Code"
                                >
                                    <FileText className="w-3 h-3" /> MD
                                </button>
                                <button 
                                    onClick={() => onRetry(page.id)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] font-semibold rounded hover:bg-slate-100 transition-colors shadow-sm"
                                    title="Regenerate Page"
                                >
                                    <RefreshCw className="w-3 h-3" /> Regenerate
                                </button>
                            </>
                        )}
                    </div>
                )}
                
                {page.status === 'error' && (
                    <div className="flex gap-1.5">
                        <button 
                            onClick={() => onRetry(page.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-semibold rounded hover:bg-rose-700 transition-colors shadow-sm"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-white p-0 relative">
               {editingId === page.id ? (
                   <textarea
                     value={editText}
                     onChange={(e) => setEditText(e.target.value)}
                     className="w-full h-full p-4 text-xs font-mono text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-100 leading-relaxed bg-slate-50/30"
                     spellCheck={false}
                   />
               ) : (
                    <div className="w-full h-full p-4 overflow-auto">
                        {page.elements && page.elements.length > 0 ? (
                            <div className="space-y-4">
                                {page.elements.filter(el => includeImages || el.type !== 'image').map((el) => (
                                    <div key={el.id} className="relative group p-2 -mx-2 rounded-lg hover:bg-slate-50/50 transition-colors">
                                        {el.content && (
                                            <button
                                                onClick={() => handleCopy(el.id, el.content || '')}
                                                className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 rounded-md text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-slate-50 hover:text-slate-700 z-10"
                                                title="Copy Content"
                                            >
                                                {copiedId === el.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        )}
                                        {el.type === 'text' || el.type === 'table' ? (
                                            <div className="flex flex-col gap-1.5 pr-8">
                                                <div className="markdown-body prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkMath, remarkGfm]} 
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {el.content || ''}
                                                    </ReactMarkdown>
                                                </div>
                                                {el.type === 'table' && el.imageB64 && (
                                                    <div className="mt-1.5 p-1.5 border border-slate-100 rounded bg-slate-50/50">
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Original Table Source</div>
                                                        <img src={el.imageB64} className="max-w-full h-auto rounded opacity-80 hover:opacity-100 transition-opacity" alt="Original table" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (el.type === 'image' || el.type === 'table') && el.imageB64 ? (
                                            <div className="flex flex-col gap-1.5 pr-8">
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Detected Image</div>
                                                <img 
                                                    src={el.imageB64} 
                                                    alt="Extracted region" 
                                                    className="max-w-full h-auto rounded border border-slate-200 shadow-sm bg-slate-50"
                                                />
                                                {el.content && <p className="text-[10px] text-slate-500 italic">{el.content}</p>}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ) : page.extractedText ? (
                            <div className="markdown-body prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkMath, remarkGfm]} 
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {page.extractedText || ''}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                                <span className="italic flex items-center gap-1.5">
                                    {page.status === 'pending' && 'Waiting to process...'} 
                                    {page.status === 'processing' && (
                                       <>
                                         <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                                         <span className="text-slate-800 font-medium">Extracting text...</span>
                                       </>
                                    )} 
                                    {page.status === 'error' && (
                                       <span className="text-rose-600 flex items-center gap-1.5">
                                          <AlertCircle className="w-3.5 h-3.5" /> Extraction failed.
                                       </span>
                                    )}
                                    {page.status === 'done' && !page.extractedText && 'No text found.'}
                                </span>

                                {page.status === 'error' && (
                                    <button 
                                        onClick={() => onRetry(page.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all shadow-sm text-[10px] font-semibold"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Retry Page
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProcessingList;