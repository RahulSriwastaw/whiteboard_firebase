import React from 'react';
import { Clock, Trash2, FileText, ChevronRight, Download, Copy } from 'lucide-react';
import { HistoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  history, 
  onSelectItem, 
  onDeleteItem, 
  onClearAll,
  isOpen, 
  onClose 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">History</h2>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all history?")) {
                        onClearAll();
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Clear All"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <Clock className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-medium">No history yet</p>
                </div>
              ) : (
                history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map((item) => {
                  const elements = item.elements || [];
                  const fullText = elements
                    .map(el => el.type === 'text' || el.type === 'table' ? (el.content || '') : `[Image: ${el.content || ''}]`)
                    .join('\n\n');
                  const previewText = fullText.replace(/\n/g, ' ').substring(0, 50) + (fullText.length > 50 ? '...' : '');

                  return (
                    <motion.div
                      layout
                      key={item.id}
                      className="group p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer relative"
                      onClick={() => onSelectItem(item)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-slate-800 line-clamp-1 text-sm">{item.fileName}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(item.timestamp).toLocaleDateString()} • {item.pagesCount} pages
                            </p>
                            {previewText && (
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                                "{previewText}"
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(fullText)
                                .then(() => alert("Text copied to clipboard!"))
                                .catch(err => console.error("Failed to copy text:", err));
                            }}
                            className="p-1.5 text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all"
                            title="Copy Text"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item.id);
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400 text-center">
                History is saved locally on your device.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;
