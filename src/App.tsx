import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Bell, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export default function App() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Load logs from LocalStorage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('notification_logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error('Failed to parse logs', e);
      }
    }

    // PWA Install Prompt Logic
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Save logs to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notification_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newLog: NotificationLog = {
      id: crypto.randomUUID(),
      title,
      message,
      timestamp: Date.now(),
    };

    setLogs([newLog, ...logs]);
    setTitle('');
    setMessage('');
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      setLogs([]);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Bell size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">NotifyLog</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {deferredPrompt && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Download size={16} />
                Install App
              </button>
            )}
            {logs.length > 0 && (
              <button
                onClick={clearAll}
                className="text-zinc-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Clear all logs"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Add Log Form */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus size={14} />
            New Notification
          </h2>
          <form onSubmit={addLog} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Title (e.g. System Update)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-zinc-50/50"
              />
            </div>
            <div>
              <textarea
                placeholder="Message content..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-zinc-50/50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim() || !message.trim()}
              className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Add to Log
            </button>
          </form>
        </section>

        {/* Logs List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Bell size={14} />
              Recent Logs ({logs.length})
            </h2>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {logs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-300"
                >
                  <div className="bg-zinc-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
                    <Info size={24} />
                  </div>
                  <p className="text-zinc-500">No logs yet. Add one above!</p>
                </motion.div>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-zinc-900">{log.title}</h3>
                        <p className="text-zinc-600 text-sm leading-relaxed">{log.message}</p>
                        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight pt-2">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteLog(log.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Offline Status */}
      <div className="fixed bottom-4 left-4 z-50">
        {!navigator.onLine && (
          <div className="bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg animate-pulse">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            Offline Mode
          </div>
        )}
      </div>
    </div>
  );
}
