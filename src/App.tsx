/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Layers, 
  Sparkles,
  RefreshCcw,
  Plus, 
  HelpCircle, 
  CheckCircle, 
  Trash2,
  ListFilter,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { BranchDetails, FormMode } from './types';
import { SAMPLE_BRANCHES } from './constants';
import BranchForm from './components/BranchForm';
import BranchTable from './components/BranchTable';

const LOCAL_STORAGE_KEY = 'bank_branch_collection_records';

export default function App() {
  const [branches, setBranches] = useState<BranchDetails[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [selectedBranch, setSelectedBranch] = useState<BranchDetails | null>(null);
  
  // Custom interactive system toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  // Server backup state logs
  const [backupStatus, setBackupStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [backupInfo, setBackupInfo] = useState<{
    excelAvailable: boolean;
    csvAvailable: boolean;
    excelSize: number;
    csvSize: number;
    lastUpdated: string | null;
    recordCount: number;
  } | null>(null);

  // Toast triggers
  const triggerToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Pull backup summary from server
  const fetchBackupInfo = () => {
    fetch('/api/backup-info')
      .then(res => res.json())
      .then(data => {
        setBackupInfo(data);
      })
      .catch(err => console.error('[Backup Monitor Error] Unable to check server metadata:', err));
  };

  // Compile excel sheet in backend background asynchronously
  const triggerBackendBackup = async (list: BranchDetails[]) => {
    setBackupStatus('syncing');
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branches: list }),
      });
      const data = await response.json();
      if (data.success) {
        setBackupStatus('success');
        fetchBackupInfo();
      } else {
        setBackupStatus('error');
      }
    } catch (err) {
      console.error('[Backup Sync Error] Failed to upload state to server:', err);
      setBackupStatus('error');
    }
  };

  // Load collected branches from LocalStorage or auto-restore server backup on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && JSON.parse(stored).length > 0) {
      try {
        const parsed = JSON.parse(stored);
        setBranches(parsed);
        // Sync local storage state to the server to make sure it exists
        triggerBackendBackup(parsed);
      } catch (err) {
        console.error('Failed to parse branch database logs', err);
        setBranches([]);
      }
    } else {
      // If local storage is empty, look up the backend server backup
      fetch('/api/load-backup')
        .then(res => res.json())
        .then(data => {
          if (data.available && data.branches && data.branches.length > 0) {
            setBranches(data.branches);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.branches));
            triggerToast('Restored latest Excel spreadsheet backup from server database state!', 'success');
          }
        })
        .catch(err => {
          console.error('[Boot Restore] Unable to connect to backend backup storage:', err);
        });
    }
    fetchBackupInfo();
  }, []);

  // Save changes to LocalStorage and compile Excel/CSV backup in background
  const updateBranchesList = (newList: BranchDetails[]) => {
    setBranches(newList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));
    triggerBackendBackup(newList);
  };

  // Safe manual input saver callback
  const handleSaveBranch = (formData: Omit<BranchDetails, 'id' | 'timestamp'>) => {
    const currentUTC = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (formMode === 'add') {
      const newBranch: BranchDetails = {
        ...formData,
        id: 'branch_' + Math.random().toString(36).substring(2, 11),
        timestamp: currentUTC
      };
      
      const updated = [newBranch, ...branches];
      updateBranchesList(updated);
      triggerToast(`Branch "${formData.branchName}" registered successfully!`);
    } else if (formMode === 'edit' && selectedBranch) {
      const updated = branches.map(b => {
        if (b.id === selectedBranch.id) {
          return {
            ...b,
            ...formData,
            timestamp: currentUTC // Update timestamp to reflect modifications
          };
        }
        return b;
      });
      updateBranchesList(updated);
      triggerToast(`Branch blueprint "${selectedBranch.branchIfscCode}" updated successfully!`);
    }

    // Return to dashboard
    setIsFormOpen(false);
    setSelectedBranch(null);
  };

  const handleEditClick = (branch: BranchDetails) => {
    setSelectedBranch(branch);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleViewClick = (branch: BranchDetails) => {
    setSelectedBranch(branch);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const targetBranch = branches.find(b => b.id === id);
    const updated = branches.filter(b => b.id !== id);
    updateBranchesList(updated);
    triggerToast(`Branch record ${targetBranch?.branchIfscCode || ''} deleted successfully.`, 'danger');
  };

  // One-click demo seed loader
  const handleLoadDemoData = () => {
    updateBranchesList(SAMPLE_BRANCHES);
    triggerToast('Loaded 3 realistic pre-validated Demonstration Bank Branches!', 'info');
  };

  // Hard reset database
  const handleClearAll = () => {
    if (confirm('Are you absolutely sure you want to delete all branch records? This operation is irreversible.')) {
      updateBranchesList([]);
      triggerToast('Cleansed entire local registry database.', 'danger');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfa] text-slate-800 font-sans" id="webform-root-panel">
      
      {/* Toast Notification element */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium bg-slate-900 border-slate-800 text-white max-w-md"
          >
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
              toast.type === 'danger' ? 'bg-red-500 animate-ping' :
              toast.type === 'info' ? 'bg-orange-500 animate-ping' : 'bg-emerald-500 animate-ping'
            }`} />
            <p className="flex-1 text-xs sm:text-sm">{toast.message}</p>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-slate-850 rounded">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main navigation header */}
      <header className="sticky top-0 z-40 bg-white border-b border-emerald-100/50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 shrink-0">
              <Building2 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm md:text-base font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-1 sm:gap-1.5">
                <span>Bank Branch Details Portal</span>
                <span className="text-[10px] bg-orange-50 text-orange-650 px-2 py-0.5 rounded-full font-extrabold border border-orange-100 uppercase tracking-wider scale-95 origin-left">
                  FI Audit
                </span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 hidden xs:block">
                Comprehensive data registry for Indian financial inclusion profiling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFormOpen ? (
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setSelectedBranch(null);
                }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 active:scale-95 rounded-lg text-[11px] sm:text-xs font-bold bg-white transition-all flex items-center gap-1 cursor-pointer"
              >
                Back to Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  setFormMode('add');
                  setSelectedBranch(null);
                  setIsFormOpen(true);
                }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-850 text-white font-extrabold active:scale-95 rounded-lg text-[11.5px] sm:text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-600/10"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3.5]" />
                <span className="hidden xxs:inline">Add Branch Data</span>
                <span className="xxs:hidden">New</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Header intro banner */}
      <div className="bg-gradient-to-b from-white via-[#fafbfa] to-[#fbfcf9] border-b border-slate-200/40 py-8 md:py-10" id="portal-hero-splash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200/40 uppercase tracking-widest leading-none mb-3">
                Branch Collection and Mapping Registry
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Webform for Collecting Bank Branch Details
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                यह वेबफॉर्म विभिन्न सरकारी एवं वित्तीय समावेशन योजनाओं के सुचारू संचालन हेतु महत्वपूर्ण बैंक शाखाओं के विवरण एकत्रित करने के लिए बनाया गया है।
              </p>
            </div>

            <div className="bg-white border border-slate-200/60 p-4 rounded-xl flex items-center gap-3 max-w-sm shadow-xs shrink-0 self-stretch md:self-auto">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0 border border-orange-100/40">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-slate-800">Export-Ready Reports</p>
                <p className="text-slate-400 mt-0.5 leading-normal">Collect branches dynamically, then perform an audit check or export to Excel/CSV for reporting circles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {isFormOpen ? (
            <motion.div
              key="form-workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <BranchForm
                mode={formMode}
                initialData={selectedBranch}
                onSave={handleSaveBranch}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedBranch(null);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="table-workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <BranchTable
                branches={branches}
                onAddClick={() => {
                  setFormMode('add');
                  setSelectedBranch(null);
                  setIsFormOpen(true);
                }}
                onEditClick={handleEditClick}
                onViewClick={handleViewClick}
                onDeleteClick={handleDeleteClick}
                onLoadDemoData={handleLoadDemoData}
                onClearAll={handleClearAll}
                backupStatus={backupStatus}
                backupInfo={backupInfo}
                onForceSync={() => {
                  triggerBackendBackup(branches);
                  triggerToast('Manual synchronization and Excel compilation triggered on the server.', 'info');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Portal footer */}
      <footer className="bg-white border-t border-slate-200/60 py-10 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Active Submitted Data ledger in Footer */}
          <div className="border-b border-emerald-100/40 pb-8" id="footer-data-ledger">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-slate-900 tracking-tight text-sm uppercase">
                  Data Submitted Registry Ledger
                </h3>
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-black text-[10.5px] border border-emerald-150">
                  {branches.length} Record{branches.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live monitoring of all submitted bank branches in this session.
              </p>
            </div>

            {branches.length === 0 ? (
              <div className="bg-slate-50/50 rounded-xl p-6 text-center border border-dashed border-slate-200">
                <p className="font-semibold text-slate-600 text-xs">No active submissions found</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fill in the branch webform or click "Load Demo Entries" on the dashboard to register financial inclusion profiles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {branches.map((b) => (
                  <div 
                    key={`footer_ledger_${b.id}`} 
                    className="bg-[#fafbfa] border border-[#e4e9e1] rounded-xl p-3 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition-colors text-left"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-slate-800 text-[11px] truncate" title={b.bankName}>
                          {b.bankName}
                        </span>
                        <span className="font-mono text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-100 font-extrabold shrink-0">
                          {b.branchIfscCode}
                        </span>
                      </div>
                      <p className="font-bold text-slate-605 text-[11px] mt-1 truncate" title={b.branchName}>
                        {b.branchName}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#e2e8f0]/40 pt-2 mt-2.5 text-[9.5px]">
                      <span className="text-slate-400 font-mono" title="Submission Timestamp">
                        {b.timestamp}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedBranch(b);
                          setFormMode('view');
                          setIsFormOpen(true);
                          // Scroll smoothly to top form container
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="text-emerald-600 hover:text-emerald-850 font-bold underline bg-none border-none p-0 cursor-pointer"
                      >
                        Inspect info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standard footer details */}
          <div className="text-center space-y-2 pt-2">
            <p className="font-extrabold text-slate-800">Bank Branch Details Collection Form Portal</p>
            <p className="max-w-2xl mx-auto leading-relaxed text-slate-400">
              Standardizing financial inclusion (FI) networking parameters and regional mapping frameworks. This platform is optimized for seamless deployment circles and regional audit checklists.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-2 pt-3 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Mode: Local Sandbox Client</span>
              <span>•</span>
              <span className="text-slate-500">All data entries are persistently saved locally</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
