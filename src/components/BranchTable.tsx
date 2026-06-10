/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  SlidersHorizontal, 
  Plus, 
  FileCheck, 
  Building2, 
  RefreshCcw, 
  User, 
  Navigation, 
  Compass, 
  ArrowUpDown,
  Upload,
  AlertTriangle,
  Map,
  X,
  Globe,
  MapPin,
  CornerDownRight,
  FileSpreadsheet
} from 'lucide-react';
import { BranchDetails } from '../types';
import { POPULAR_BANKS } from '../constants';

interface BranchTableProps {
  branches: BranchDetails[];
  onAddClick: () => void;
  onEditClick: (branch: BranchDetails) => void;
  onViewClick: (branch: BranchDetails) => void;
  onDeleteClick: (id: string) => void;
  onLoadDemoData: () => void;
  onClearAll: () => void;
  backupStatus?: 'idle' | 'syncing' | 'success' | 'error';
  backupInfo?: {
    excelAvailable: boolean;
    csvAvailable: boolean;
    excelSize: number;
    csvSize: number;
    lastUpdated: string | null;
    recordCount: number;
  } | null;
  onForceSync?: () => void;
}

type SortField = 'timestamp' | 'bankName' | 'branchName' | 'branchIfscCode';
type SortOrder = 'asc' | 'desc';

export default function BranchTable({
  branches,
  onAddClick,
  onEditClick,
  onViewClick,
  onDeleteClick,
  onLoadDemoData,
  onClearAll,
  backupStatus = 'idle',
  backupInfo = null,
  onForceSync
}: BranchTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedMapBranch, setSelectedMapBranch] = useState<BranchDetails | null>(null);

  // Sorting columns toggler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Search logic
  const filteredBranches = branches.filter(val => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      val.bankName.toLowerCase().includes(term) ||
      val.branchName.toLowerCase().includes(term) ||
      val.branchCode.toLowerCase().includes(term) ||
      val.branchIfscCode.toLowerCase().includes(term) ||
      val.branchManagerName.toLowerCase().includes(term) ||
      val.bankRoCircleName.toLowerCase().includes(term) ||
      val.bankRoCircleFiName.toLowerCase().includes(term);

    const matchesBank = bankFilter === '' || val.bankName === bankFilter;

    return matchesSearch && matchesBank;
  });

  // Sort logic
  const sortedBranches = [...filteredBranches].sort((a, b) => {
    let fieldA = a[sortField].toLowerCase();
    let fieldB = b[sortField].toLowerCase();

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Safe CSV exporter
  const exportToCSV = () => {
    if (branches.length === 0) return;

    // Define columns requested by user
    const headers = [
      'Timestamp',
      'Bank Name',
      'Branch Name',
      'Branch Code',
      'Branch IFSC Code',
      'Branch Manager Name',
      'Branch Manager Mobile No',
      'Branch Manager Email',
      'Branch Recommend Location',
      'Bank RO / Circle Name',
      'Bank RO / Circle FI Name',
      'Bank RO / Circle FI Contact No'
    ];

    const csvRows = [];
    csvRows.push(headers.join(',')); // headers row

    branches.forEach(b => {
      const values = [
        b.timestamp,
        b.bankName,
        b.branchName,
        b.branchCode,
        b.branchIfscCode,
        b.branchManagerName,
        b.branchManagerMobileNo,
        b.branchManagerEmail,
        b.branchRecommendLocation || '',
        b.bankRoCircleName,
        b.bankRoCircleFiName,
        b.bankRoCircleFiContactNo
      ].map(field => {
        // Double quotes wrapping to prevent CSV breaking with commas
        const escaped = ('' + field).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Formatting filename with date
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Bank_Branch_Details_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueBanksPresent = Array.from(new Set(branches.map(b => b.bankName))).sort();

  return (
    <div className="space-y-6" id="branches-registry-workspace">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/65 shadow-xs flex items-center gap-4 hover:border-emerald-300 transition-all">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100/40">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Recorded Branches</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{branches.length}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/65 shadow-xs flex items-center gap-4 hover:border-orange-300 transition-all">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0 border border-orange-100/40">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Active Banks</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">{uniqueBanksPresent.length}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/65 shadow-xs flex items-center gap-4 hover:border-red-300 transition-all">
          <div className="p-3 bg-red-50 text-red-650 rounded-lg shrink-0 border border-red-100/40">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">RO Circles</p>
            <h4 className="text-2xl font-black text-slate-800 mt-1">
              {Array.from(new Set(branches.map(b => b.bankRoCircleName.trim().toLowerCase()).filter(Boolean))).length}
            </h4>
          </div>
        </div>

        {/* Action Controls Card */}
        <div className="bg-[#0f2e1e] border border-emerald-900 p-4 rounded-xl shadow-xs text-white flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Quick Register Console</span>
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          </div>
          <button
            onClick={onAddClick}
            className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 text-white cursor-pointer border-none"
          >
            <Plus className="w-4 h-4 text-white stroke-[3]" />
            New Branch Input
          </button>
        </div>
      </div>

      {/* Automated Server Excel Backup Status & Recovery Panel */}
      <div className="bg-[#f5faf6] border border-emerald-200/80 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs" id="automatic-backup-status-panel">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 border border-[#e5edd6] text-emerald-600 rounded-xl shrink-0 mt-0.5">
            <div className="relative">
              <FileSpreadsheet className="w-6 h-6 stroke-[2]" />
              <span className={`absolute -top-1 -right-1 flex h-3 w-3 rounded-full border border-white ${
                backupStatus === 'syncing' ? 'bg-orange-500 animate-pulse' :
                backupStatus === 'error' ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight leading-none">
                Automated Backend Excel Backup
              </h3>
              
              {backupStatus === 'syncing' && (
                <span className="bg-orange-50 text-orange-750 px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase border border-orange-200 animate-pulse flex items-center gap-1">
                  <RefreshCcw className="w-2.5 h-2.5 animate-spin" />
                  Compiling...
                </span>
              )}
              {backupStatus === 'success' && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase border border-emerald-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Synced
                </span>
              )}
              {backupStatus === 'error' && (
                <span className="bg-red-550 text-white px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase flex items-center gap-1">
                  Offline Sync Alert
                </span>
              )}
              {backupStatus === 'idle' && backupInfo?.lastUpdated && (
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase border border-slate-200 flex items-center gap-1">
                  Standby
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Every submitted, modified or deleted bank branch writes a new backup spreadsheet directly to our node file server. Use this console to review compiled assets or recover table state.
            </p>
            
            {backupInfo && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-medium text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  Workbook: <strong className="text-slate-600">{(backupInfo.excelSize / 1024).toFixed(2)} KB</strong>
                </span>
                <span className="hidden xs:inline text-slate-300">•</span>
                <span>
                  Records Compiled: <strong className="text-slate-600">{backupInfo.recordCount} records</strong>
                </span>
                {backupInfo.lastUpdated && (
                  <>
                    <span className="hidden xs:inline text-slate-300">•</span>
                    <span>
                      Compile Time: <strong className="text-slate-600">{new Date(backupInfo.lastUpdated).toLocaleTimeString()}</strong>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action downloads from server */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 border-t border-emerald-100/40 pt-3 md:pt-0 md:border-none self-stretch md:self-auto justify-end">
          {onForceSync && (
            <button
              onClick={onForceSync}
              className="p-2 border border-[#e4e9e1] hover:border-emerald-300 bg-white hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Manually force full spreadsheet sync"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${backupStatus === 'syncing' ? 'animate-spin text-emerald-650' : ''}`} />
              <span className="md:hidden lg:inline">Sync database</span>
            </button>
          )}

          <a
            href="/api/download/excel"
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-850 text-white font-extrabold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-500/10"
            title="Download Excel spreadsheet compiled by servers"
          >
            <Download className="w-4 h-4 text-emerald-100" />
            Download Excel Spreadsheet (.xlsx)
          </a>
          
          <a
            href="/api/download/csv"
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-305 text-slate-700 font-extrabold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#e4e9e1]"
            title="Download plain comma-separated values backup"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Plain CSV
          </a>
        </div>
      </div>

      {/* Control center & search bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-3 md:space-y-0 md:flex items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-3.5 text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by Bank, Branch, IFSC, Manager, Circle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
          />
        </div>

        {/* Dynamic Filters & Exports */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Bank Dropdown Filter */}
          <div className="flex items-center gap-1.5 min-w-[200px]">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Filter Bank:</span>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 py-2 px-2.5 rounded-lg focus:outline-none focus:border-emerald-500 hover:bg-slate-100 transition-all text-slate-800"
            >
              <option value="">-- All Banks ({uniqueBanksPresent.length}) --</option>
              {uniqueBanksPresent.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          {/* Export to CSV */}
          <button
            onClick={exportToCSV}
            disabled={branches.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 active:bg-orange-800 text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer border-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            title="Download complete database as Excel CSV"
          >
            <Download className="w-4 h-4 text-orange-200" />
            Excel Export (CSV)
          </button>

          {/* More Actions Toggle */}
          {branches.length === 0 ? (
            <button
              onClick={onLoadDemoData}
              className="px-3.5 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Load Demo Entries
            </button>
          ) : (
            <button
              onClick={onClearAll}
              className="px-3 py-2 border border-red-200 text-red-600 bg-red-50/20 hover:bg-red-50 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Main Table and Empty States */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        {sortedBranches.length === 0 ? (
          /* Empty / fallback state */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            {searchTerm || bankFilter ? (
              <>
                <h5 className="font-semibold text-slate-800 text-base">No filtered matches found</h5>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  We could not find any branch matching your exact filter parameters. Clear your text query or search criteria to view records.
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setBankFilter(''); }}
                  className="mt-4 px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md transition-all cursor-pointer border border-emerald-200/55"
                >
                  Clear Active Filters
                </button>
              </>
            ) : (
              <>
                <h5 className="font-semibold text-slate-800 text-base">No branch blueprints registered yet</h5>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Your local registry space is empty. Use the input webform to insert custom branch records or trigger the realistic demonstration entries.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                  <button
                    onClick={onAddClick}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/10 hover:bg-emerald-700 transition-all cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    Fill Branch Webform
                  </button>
                  <button
                    onClick={onLoadDemoData}
                    className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 text-slate-500" />
                    Load Demo Entries
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Dual Responsive Layout: Desktop Tabular and Mobile Card Deck view */
          <>
            {/* Desktop View - ONLY visible on medium screen sizes and above */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-sans">
                    <th 
                      onClick={() => handleSort('bankName')}
                      className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-all text-slate-700"
                    >
                      <div className="flex items-center gap-1.5">
                        Bank Name / Info
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('branchName')}
                      className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-all text-slate-700"
                    >
                      <div className="flex items-center gap-1.5">
                        Branch Core
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('branchIfscCode')}
                      className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-all text-slate-700"
                    >
                      <div className="flex items-center gap-1.5">
                        IFSC / Code
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-650">
                      Branch Manager Info
                    </th>
                    <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-650">
                      RO Circle / FI Contact Details
                    </th>
                    <th 
                      onClick={() => handleSort('timestamp')}
                      className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-all text-slate-650"
                    >
                      <div className="flex items-center gap-1.5">
                        Timestamp
                        <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-[11px] font-extrabold uppercase tracking-wider text-right text-slate-650">
                      Audit Controls
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <AnimatePresence>
                    {sortedBranches.map((b) => (
                      <motion.tr 
                        key={b.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        {/* Bank Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xs shrink-0 border border-emerald-100">
                              {b.bankName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 tracking-tight leading-tight">{b.bankName}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {b.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Branch Core Info */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">{b.branchName}</p>
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-slate-505 bg-slate-100/90 px-1.5 py-0.5 rounded font-mono border border-slate-200/40">
                              Code: <span className="font-semibold text-slate-750">{b.branchCode}</span>
                            </span>
                          </div>
                        </td>

                        {/* IFSC Code */}
                        <td className="py-4 px-4">
                          <div className="font-mono text-xs font-bold text-orange-750 bg-orange-50 border border-orange-100/80 px-2 py-1  rounded w-fit tracking-wider">
                            {b.branchIfscCode}
                          </div>
                        </td>

                        {/* Branch Manager Info */}
                        <td className="py-4 px-4">
                          <div className="text-xs space-y-0.5">
                            <p className="font-semibold text-slate-800 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-405" />
                              {b.branchManagerName}
                            </p>
                            <p className="text-slate-650 font-mono font-medium">{b.branchManagerMobileNo}</p>
                            <p className="text-slate-500 lowercase underline hover:text-emerald-600 transition-all font-medium">{b.branchManagerEmail}</p>
                          </div>
                        </td>

                        {/* Circle / FI Contact */}
                        <td className="py-4 px-4">
                          <div className="text-xs space-y-0.5">
                            <p className="font-bold text-slate-800 leading-tight">
                              {b.bankRoCircleName}
                            </p>
                            <p className="text-slate-500">
                              FI Contact: <span className="font-semibold text-slate-700">{b.bankRoCircleFiName}</span>
                            </p>
                            <p className="text-slate-550 font-mono">
                              Ph: <span className="font-bold text-slate-700">{b.bankRoCircleFiContactNo}</span>
                            </p>
                          </div>
                        </td>

                        {/* Submission Timestamp */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="text-xs text-slate-500 font-mono">{b.timestamp}</p>
                        </td>

                        {/* Action Controls */}
                        <td className="py-4 px-4 text-right">
                          {confirmDeleteId === b.id ? (
                            /* Active interactive delete safety verification */
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[10px] text-red-650 font-extrabold flex items-center gap-0.5 animate-pulse mr-1">
                                <AlertTriangle className="w-3 h-3" />
                                Save delete?
                              </span>
                              <button
                                onClick={() => {
                                  onDeleteClick(b.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="p-1 text-red-700 hover:bg-red-100 rounded text-xs font-black cursor-pointer border-none bg-none"
                                title="Yes, delete"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1 text-slate-500 hover:bg-slate-100 rounded text-xs font-bold cursor-pointer border-none bg-none"
                                title="Cancel delete"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            /* Standard commands custom-colored to match requested palette */
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedMapBranch(b)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer border-none"
                                title="Show on map"
                              >
                                <Map className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onViewClick(b)}
                                className="p-1.5 text-slate-450 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer border-none"
                                title="View full audit inspection"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEditClick(b)}
                                className="p-1.5 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all cursor-pointer border-none"
                                title="Edit branch details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(b.id)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer border-none"
                                title="Delete branch record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Stunning Mobile Cards View - ONLY visible on phone (< md) screen sizes */}
            <div className="block md:hidden p-3 space-y-4 bg-[#fafbfa]" id="portal-mobile-card-deck">
              <AnimatePresence>
                {sortedBranches.map((b) => (
                  <motion.div
                    key={'mobile_card_index_' + b.id}
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-xl border border-[#e4e9e1] p-4 shadow-xs space-y-3 hover:border-emerald-250 transition-all"
                  >
                    {/* Header: Bank initials badge and ID details */}
                    <div className="flex items-center justify-between gap-3 border-b border-emerald-50 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xs shrink-0 border border-emerald-100">
                          {b.bankName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 tracking-tight leading-tight text-xs sm:text-sm">{b.bankName}</h4>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {b.id.slice(0, 8)}</p>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono shrink-0 text-right">
                        <span>{b.timestamp.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Core metrics: Name / IFSC Identifier */}
                    <div className="grid grid-cols-2 gap-3.5 text-xs">
                      <div>
                        <p className="text-[9px] text-[#556250] font-extrabold uppercase tracking-wider">Branch Core</p>
                        <p className="font-bold text-slate-800 mt-0.5 leading-tight">{b.branchName}</p>
                        <span className="inline-block mt-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-205/60">
                          Code: {b.branchCode}
                        </span>
                      </div>

                      <div>
                        <p className="text-[9px] text-[#556250] font-extrabold uppercase tracking-wider">IFSC Identifier</p>
                        <div className="mt-1 font-mono text-xs font-black text-orange-750 bg-orange-50 border border-orange-100/70 px-2.5 py-1 rounded w-fit tracking-wider">
                          {b.branchIfscCode}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible profile box for Contact/FI coordinates */}
                    <div className="p-3 bg-emerald-50/20 rounded-lg border border-emerald-50 divide-y divide-emerald-50 text-xs space-y-2.5">
                      {/* Branch Manager profile */}
                      <div className="space-y-0.5 pb-2">
                        <p className="text-[9px] text-emerald-700/80 font-extrabold uppercase tracking-widest leading-none">Branch Manager</p>
                        <div className="flex items-center justify-between font-bold text-slate-800 mt-1">
                          <span>{b.branchManagerName}</span>
                          <span className="font-mono text-[11px] text-slate-600">{b.branchManagerMobileNo}</span>
                        </div>
                        <p className="text-slate-505 text-[11px] font-mono lowercase truncate mt-0.5">{b.branchManagerEmail}</p>
                      </div>

                      {/* Circle Office coordination */}
                      <div className="space-y-0.5 pt-2">
                        <p className="text-[9px] text-emerald-700/80 font-extrabold uppercase tracking-widest leading-none">RO Circle & FI Coordination</p>
                        <p className="font-bold text-slate-850 mt-1 leading-tight">{b.bankRoCircleName}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-505 gap-0.5 mt-1">
                          <span>FI Officer: <strong className="text-slate-700">{b.bankRoCircleFiName}</strong></span>
                          <span className="font-mono text-slate-600">Ph: {b.bankRoCircleFiContactNo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Action Controls for Mobile (44px target touch friendly height items) */}
                    <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Audit Actions</span>
                      
                      {confirmDeleteId === b.id ? (
                        <div className="flex items-center gap-1.5 bg-red-50 p-1.5 rounded-lg border border-red-200">
                          <span className="text-[10px] text-red-600 font-extrabold animate-pulse">Save delete?</span>
                          <button
                            onClick={() => {
                              onDeleteClick(b.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded cursor-pointer border-none"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer border-none"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {/* Map Pin touch button - themed green */}
                          <button
                            onClick={() => setSelectedMapBranch(b)}
                            className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg border border-emerald-100 transition-all cursor-pointer flex items-center gap-1 text-[10.5px] font-extrabold"
                            title="Show Map coordinates"
                          >
                            <Map className="w-3.5 h-3.5" />
                            <span>Map</span>
                          </button>
                          
                          {/* Inspect Detail button */}
                          <button
                            onClick={() => onViewClick(b)}
                            className="p-2 sm:p-2.5 bg-slate-55 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center gap-1 text-[10.5px] font-bold"
                            title="View audit parameters"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          
                          {/* Edit Details button - themed orange */}
                          <button
                            onClick={() => onEditClick(b)}
                            className="p-2 sm:p-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg border border-orange-100/80 transition-all cursor-pointer flex items-center gap-1 text-[10.5px] font-bold"
                            title="Edit details webform"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          
                          {/* Trash button - themed red */}
                          <button
                            onClick={() => setConfirmDeleteId(b.id)}
                            className="p-2 sm:p-2.5 bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg border border-red-100 transition-all cursor-pointer"
                            title="Delete this branch record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Map modal visualization overlay */}
      <AnimatePresence>
        {selectedMapBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden w-full max-w-2xl flex flex-col"
              id="branch-recommend-map-modal"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xs shrink-0 border border-emerald-100">
                    <Map className="w-5 h-5 text-emerald-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                      Recommend Location Map
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {selectedMapBranch.bankName} — {selectedMapBranch.branchName} ({selectedMapBranch.branchIfscCode})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMapBranch(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                  title="Close Map Overlay"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Map Placeholder Body */}
              <div className="p-6 space-y-5">
                <div className="relative w-full h-[260px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-4 font-mono group">
                  {/* Subtle Grid overlay lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
                  
                  {/* Map Topology lines simulating terrain */}
                  <svg className="absolute inset-0 w-full h-full opacity-10 stroke-teal-405 fill-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M -50 120 C 100 80, 200 240, 350 140 C 450 100, 520 280, 700 190" strokeWidth="1.5" />
                    <path d="M -50 160 C 110 120, 220 280, 370 180 C 470 140, 550 320, 720 230" strokeWidth="1" />
                    <path d="M -50 80 C 80 40, 180 200, 330 100 C 430 60, 500 240, 680 150" strokeWidth="1" />
                    <circle cx="280" cy="150" r="110" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx="280" cy="150" r="160" strokeWidth="0.75" />
                  </svg>

                  {/* Corner Coordinates readout HUD */}
                  <div className="relative flex justify-between items-start text-[10px] text-teal-400 select-none z-10">
                    <div className="space-y-0.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-805">
                      <p className="font-semibold text-slate-350">SYS: OFF-SITE GPS SENSOR</p>
                      <p>WGS-84 REF: <span className="text-emerald-400">26.{selectedMapBranch.branchCode.slice(-3) || '8467'}° N, 80.{selectedMapBranch.branchIfscCode.slice(-4) || '9462'}° E</span></p>
                    </div>
                    <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-805 text-right space-y-0.5">
                      <p>ZOOM: <span className="text-yellow-400">18.5x DETAIL</span></p>
                      <p>IFSC BLOCK: {selectedMapBranch.branchIfscCode}</p>
                    </div>
                  </div>

                  {/* Dynamic center locator and floating pin with shadow */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                    {/* Ring pings */}
                    <div className="absolute w-24 h-24 bg-emerald-500/10 rounded-full animate-ping pointer-events-none" />
                    <div className="absolute w-12 h-12 bg-emerald-500/20 rounded-full animate-pulse border border-emerald-500/40 pointer-events-none" />
                    
                    {/* Floating Map Pin marker */}
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="relative z-20 flex flex-col items-center cursor-pointer"
                    >
                      <MapPin className="w-9 h-9 text-emerald-500 fill-emerald-100 filter drop-shadow-md" />
                      <div className="px-2 py-0.5 bg-emerald-950/90 border border-emerald-500 rounded text-[9px] text-emerald-300 font-bold whitespace-nowrap mt-1 tracking-wider uppercase">
                        {selectedMapBranch.branchName} Verified Space
                      </div>
                    </motion.div>
                    
                    {/* Ripple/Shadow indicator of the floating pin */}
                    <div className="w-3 h-1 bg-slate-950 border border-slate-900 rounded-full opacity-60 mt-1 scale-x-125 blur-[1px]" />
                  </div>

                  {/* Scale HUD bar & indicator details */}
                  <div className="relative flex justify-between items-end text-[10px] text-teal-400 select-none z-10">
                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-805">
                      <Compass className="w-3.5 h-3.5 text-teal-400 animate-spin" style={{ animationDuration: '15s' }} />
                      <span>HEADING: NORTH / CIRCLE GRID</span>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 font-sans">
                      <div className="h-1 w-20 bg-emerald-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-2/3" />
                      </div>
                      <span className="font-mono text-[9px]">SCALE: 1:5000 (100 METRES)</span>
                    </div>
                  </div>
                </div>

                {/* Recommendation description Details panel */}
                <div className="bg-[#fbfcfa] border border-[#e4e9e1] p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                      <CornerDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Branch Recommend Location Coordinates & Physical Landmarks
                      </h4>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1">
                        {selectedMapBranch.branchRecommendLocation ? (
                          selectedMapBranch.branchRecommendLocation
                        ) : (
                          <span className="text-slate-400 italic">
                            No precise physical coordinates or building landmark tags were defined for this branch. Regional FI team coordinates should be added using the Branch Edit form configuration.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-205 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Circle FI Officer</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{selectedMapBranch.bankRoCircleFiName}</p>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">Ph: {selectedMapBranch.bankRoCircleFiContactNo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Branch Manager</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{selectedMapBranch.branchManagerName}</p>
                      <p className="text-slate-550 font-mono text-[11px] mt-0.5">Mobile: {selectedMapBranch.branchManagerMobileNo}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action bar and Close controls */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  Simulated satellite GPS locator locking complete.
                </span>
                
                <button
                  type="button"
                  onClick={() => setSelectedMapBranch(null)}
                  className="w-full sm:w-auto px-5 py-2 hover:bg-slate-200 active:bg-slate-300 transition-all font-semibold rounded-lg bg-slate-100 text-slate-700 text-center cursor-pointer"
                >
                  Close map view
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
