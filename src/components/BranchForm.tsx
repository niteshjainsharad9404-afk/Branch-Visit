/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Code, 
  Compass, 
  Network, 
  Contact, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { BranchDetails, FormMode } from '../types';
import { POPULAR_BANKS } from '../constants';

interface BranchFormProps {
  mode: FormMode;
  initialData?: BranchDetails | null;
  onSave: (data: Omit<BranchDetails, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

export default function BranchForm({ mode, initialData, onSave, onCancel }: BranchFormProps) {
  const [bankName, setBankName] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchIfscCode, setBranchIfscCode] = useState('');
  const [branchManagerName, setBranchManagerName] = useState('');
  const [branchManagerMobileNo, setBranchManagerMobileNo] = useState('');
  const [branchManagerEmail, setBranchManagerEmail] = useState('');
  const [branchRecommendLocation, setBranchRecommendLocation] = useState('');
  const [bankRoCircleName, setBankRoCircleName] = useState('');
  const [bankRoCircleFiName, setBankRoCircleFiName] = useState('');
  const [bankRoCircleFiContactNo, setBankRoCircleFiContactNo] = useState('');

  // Form errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sync initialData when editing or viewing
  useEffect(() => {
    if (initialData) {
      const isCustomBank = !POPULAR_BANKS.includes(initialData.bankName);
      if (isCustomBank) {
        setBankName('Other Bank');
        setCustomBankName(initialData.bankName);
      } else {
        setBankName(initialData.bankName);
        setCustomBankName('');
      }
      setBranchName(initialData.branchName);
      setBranchCode(initialData.branchCode);
      setBranchIfscCode(initialData.branchIfscCode);
      setBranchManagerName(initialData.branchManagerName);
      setBranchManagerMobileNo(initialData.branchManagerMobileNo);
      setBranchManagerEmail(initialData.branchManagerEmail);
      setBranchRecommendLocation(initialData.branchRecommendLocation || '');
      setBankRoCircleName(initialData.bankRoCircleName);
      setBankRoCircleFiName(initialData.bankRoCircleFiName);
      setBankRoCircleFiContactNo(initialData.bankRoCircleFiContactNo);
    } else {
      // Clear for a brand new form
      setBankName('');
      setCustomBankName('');
      setBranchName('');
      setBranchCode('');
      setBranchIfscCode('');
      setBranchManagerName('');
      setBranchManagerMobileNo('');
      setBranchManagerEmail('');
      setBranchRecommendLocation('');
      setBankRoCircleName('');
      setBankRoCircleFiName('');
      setBankRoCircleFiContactNo('');
    }
    setErrors({});
  }, [initialData, mode]);

  const isViewMode = mode === 'view';

  // Real-time and submission validation helper
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Bank Name
    const activeBankName = bankName === 'Other Bank' ? customBankName : bankName;
    if (!activeBankName || activeBankName.trim() === '') {
      newErrors.bankName = 'Bank Name is required';
    }

    // Branch Name
    if (!branchName || branchName.trim() === '') {
      newErrors.branchName = 'Branch Name is required';
    }

    // Branch Code
    if (!branchCode || branchCode.trim() === '') {
      newErrors.branchCode = 'Branch Code is required';
    }

    // IFSC Code: Alphanumeric, exactly 11 characters. First 4 characters alphabets, fifth is 0.
    const ifscReg = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!branchIfscCode || branchIfscCode.trim() === '') {
      newErrors.branchIfscCode = 'IFSC Code is required (e.g. SBIN0000125)';
    } else if (!ifscReg.test(branchIfscCode.trim().toUpperCase())) {
      newErrors.branchIfscCode = 'Invalid IFSC format. Must be 11 characters, start with 4 letters, 5th character 0, e.g., SBIN0000125';
    }

    // Branch Manager Name
    if (!branchManagerName || branchManagerName.trim() === '') {
      newErrors.branchManagerName = 'Branch Manager Name is required';
    }

    // Manager Mobile: Indian mobile number format (normally 10 digits)
    const mobileReg = /^[6-9]\d{9}$/;
    if (!branchManagerMobileNo || branchManagerMobileNo.trim() === '') {
      newErrors.branchManagerMobileNo = 'Manager Mobile Number is required';
    } else if (!mobileReg.test(branchManagerMobileNo.trim())) {
      newErrors.branchManagerMobileNo = 'Invalid Mobile. Must be 10 digits starting with 6-9';
    }

    // Manager Email
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!branchManagerEmail || branchManagerEmail.trim() === '') {
      newErrors.branchManagerEmail = 'Manager Email is required';
    } else if (!emailReg.test(branchManagerEmail.trim())) {
      newErrors.branchManagerEmail = 'Invalid Email address format';
    }

    // Bank Circle RO Name
    if (!bankRoCircleName || bankRoCircleName.trim() === '') {
      newErrors.bankRoCircleName = 'Bank RO / Circle Name is required';
    }

    // FI Name
    if (!bankRoCircleFiName || bankRoCircleFiName.trim() === '') {
      newErrors.bankRoCircleFiName = 'FI Coordinator Name is required';
    }

    // FI Contact No
    if (!bankRoCircleFiContactNo || bankRoCircleFiContactNo.trim() === '') {
      newErrors.bankRoCircleFiContactNo = 'FI Contact Number is required';
    } else if (!mobileReg.test(bankRoCircleFiContactNo.trim()) && !/^\d{5,12}$/.test(bankRoCircleFiContactNo.trim())) {
      newErrors.bankRoCircleFiContactNo = 'Invalid FI contact number (must be 5-12 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) return;

    if (validateForm()) {
      const finalBankName = bankName === 'Other Bank' ? customBankName.trim() : bankName;
      onSave({
        bankName: finalBankName,
        branchName: branchName.trim(),
        branchCode: branchCode.trim(),
        branchIfscCode: branchIfscCode.trim().toUpperCase(),
        branchManagerName: branchManagerName.trim(),
        branchManagerMobileNo: branchManagerMobileNo.trim(),
        branchManagerEmail: branchManagerEmail.trim().toLowerCase(),
        branchRecommendLocation: branchRecommendLocation.trim(),
        bankRoCircleName: bankRoCircleName.trim(),
        bankRoCircleFiName: bankRoCircleFiName.trim(),
        bankRoCircleFiContactNo: bankRoCircleFiContactNo.trim()
      });
    } else {
      // Focus on the first error element
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const element = document.getElementsByName(firstErrorKey)[0];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-[#e4e9e1] shadow-xs overflow-hidden max-w-4xl mx-auto"
      id="branch-details-form-container"
    >
      {/* Header */}
      <div className="bg-[#fbfcfa] px-6 py-5 flex items-center justify-between border-b border-[#e4e9e1]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-150">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
              {mode === 'add' && 'Add Bank Branch Details'}
              {mode === 'edit' && 'Edit Branch Blueprint'}
              {mode === 'view' && 'Branch Blueprint Inspection'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium leading-none">
              {mode === 'add' && 'Create a new digital branch record with manager details'}
              {mode === 'edit' && `Modifying record: ${initialData?.branchIfscCode}`}
              {mode === 'view' && `Viewing full structural audit of branch: ${initialData?.branchName}`}
            </p>
          </div>
        </div>
        
        {initialData?.timestamp && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white rounded-md text-xs text-slate-550 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Submitted: {initialData.timestamp}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        
        {/* SECTION 1: Core Bank Architecture */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 after:content-[''] after:h-[1px] after:flex-1 after:bg-slate-200/80">
            <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="font-extrabold text-emerald-700 text-[11px] tracking-wider uppercase whitespace-nowrap">1. Core Branched Bank Structure</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bank Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="bankName"
                  disabled={isViewMode}
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    if (errors.bankName) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.bankName;
                        return next;
                      });
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 bg-[#fcfcfd] text-sm focus:bg-white focus:outline-none transition-all ${
                    errors.bankName ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } disabled:opacity-75 disabled:bg-slate-50 text-slate-800`}
                >
                  <option value="">-- Choose/Select Bank --</option>
                  {POPULAR_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              {errors.bankName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium font-sans">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.bankName}
                </p>
              )}
            </div>

            {/* Custom Bank Name Input if "Other Bank" selected */}
            {bankName === 'Other Bank' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Specify Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customBankName"
                  readOnly={isViewMode}
                  placeholder="Enter Bank Name (Standard Official Name)"
                  value={customBankName}
                  onChange={(e) => {
                    setCustomBankName(e.target.value);
                    if (errors.bankName) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.bankName;
                        return next;
                      });
                    }
                  }}
                  className="w-full rounded-lg border border-[#e4e9e1] px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800 bg-[#fcfcfd] focus:bg-white"
                />
              </motion.div>
            )}

            {/* Branch Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="branchName"
                readOnly={isViewMode}
                placeholder="e.g. Hazratganj Main Branch, Lucknow"
                value={branchName}
                onChange={(e) => {
                  setBranchName(e.target.value);
                  if (errors.branchName) setErrors(prev => ({ ...prev, branchName: '' }));
                }}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                  errors.branchName ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                } read-only:bg-slate-50 read-only:text-slate-600`}
              />
              {errors.branchName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.branchName}
                </p>
              )}
            </div>

            {/* Branch Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                Branch Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-450">
                  <Code className="w-4.5 h-4.5 text-slate-450" />
                </span>
                <input
                  type="text"
                  name="branchCode"
                  readOnly={isViewMode}
                  placeholder="e.g. SBI0000125 or 0125"
                  value={branchCode}
                  onChange={(e) => {
                    setBranchCode(e.target.value);
                    if (errors.branchCode) setErrors(prev => ({ ...prev, branchCode: '' }));
                  }}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                    errors.branchCode ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } read-only:bg-slate-50 read-only:text-slate-600`}
                />
              </div>
              {errors.branchCode && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.branchCode}
                </p>
              )}
            </div>

            {/* Branch IFSC Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                Branch IFSC Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Compass className="w-4.5 h-4.5 text-slate-400" />
                </span>
                <input
                  type="text"
                  name="branchIfscCode"
                  readOnly={isViewMode}
                  placeholder="e.g. SBIN0000125"
                  value={branchIfscCode}
                  onChange={(e) => {
                    setBranchIfscCode(e.target.value.toUpperCase());
                    if (errors.branchIfscCode) setErrors(prev => ({ ...prev, branchIfscCode: '' }));
                  }}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm uppercase tracking-wider font-mono focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                    errors.branchIfscCode ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } read-only:bg-slate-50 read-only:text-slate-600`}
                />
              </div>
              {errors.branchIfscCode && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.branchIfscCode}
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-1.5 font-sans leading-relaxed">
                Must be an 11-digit IFSC, e.g. SBIN0000125 (First 4 letters, 5th char is zero).
              </p>
            </div>
          </div>
        </div>


        {/* SECTION 2: Branch Manager Contact Profile */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 after:content-[''] after:h-[1px] after:flex-1 after:bg-slate-200/80">
            <User className="w-5 h-5 text-orange-600 shrink-0" />
            <h4 className="font-extrabold text-orange-650 text-[11px] tracking-wider uppercase whitespace-nowrap">2. Branch Manager contact profile</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Manager Name */}
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Branch Manager Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="branchManagerName"
                  readOnly={isViewMode}
                  placeholder="Manager Full Name"
                  value={branchManagerName}
                  onChange={(e) => {
                    setBranchManagerName(e.target.value);
                    if (errors.branchManagerName) setErrors(prev => ({ ...prev, branchManagerName: '' }));
                  }}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                    errors.branchManagerName ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } read-only:bg-slate-50 read-only:text-slate-600`}
                />
              </div>
              {errors.branchManagerName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.branchManagerName}
                </p>
              )}
            </div>

            {/* Manager Mobile */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Branch Manager Mobile No <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="branchManagerMobileNo"
                  readOnly={isViewMode}
                  placeholder="10-digit Mobile No."
                  maxLength={10}
                  value={branchManagerMobileNo}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setBranchManagerMobileNo(cleaned);
                    if (errors.branchManagerMobileNo) setErrors(prev => ({ ...prev, branchManagerMobileNo: '' }));
                  }}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm font-mono focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                    errors.branchManagerMobileNo ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } read-only:bg-slate-50 read-only:text-slate-600`}
                />
              </div>
              {errors.branchManagerMobileNo && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.branchManagerMobileNo}
                </p>
              )}
            </div>

            {/* Manager Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Branch Manager Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="branchManagerEmail"
                  readOnly={isViewMode}
                  placeholder="manager@bank.com"
                  value={branchManagerEmail}
                  onChange={(e) => {
                    setBranchManagerEmail(e.target.value);
                    if (errors.branchManagerEmail) setErrors(prev => ({ ...prev, branchManagerEmail: '' }));
                  }}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                    errors.branchManagerEmail ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } read-only:bg-slate-50 read-only:text-slate-600`}
                />
              </div>
              {errors.branchManagerEmail && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.branchManagerEmail}
                </p>
              )}
            </div>
          </div>
        </div>


        {/* SECTION 3: Recommend Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 after:content-[''] after:h-[1px] after:flex-1 after:bg-slate-200/80">
            <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
            <h4 className="font-extrabold text-orange-650 text-[11px] tracking-wider uppercase whitespace-nowrap">3. Branch Recommend Location</h4>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Recommend Location Details (Physical Landmarks / Geo-coordination space)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <textarea
                name="branchRecommendLocation"
                readOnly={isViewMode}
                rows={3}
                placeholder="Give exact building tags, commercial location space, latitude/longitude, or nearby physical details helpful for branch verification and mapping audits."
                value={branchRecommendLocation}
                onChange={(e) => setBranchRecommendLocation(e.target.value)}
                className="w-full rounded-lg border border-[#e4e9e1] pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800 bg-[#fcfcfd] focus:bg-white read-only:bg-slate-50 read-only:text-slate-600 resize-none"
              />
            </div>
            
            {/* Sleek Alert Info-box styled as required in details */}
            <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-lg text-xs text-orange-850 leading-normal mt-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">On-Site Verification Alert:</span> Ensure recommended space physical markers match regional administrative lines and circle grid files before committing coordinates.
              </div>
            </div>
          </div>
        </div>


        {/* SECTION 4: RO & Circle FI Coordination */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 after:content-[''] after:h-[1px] after:flex-1 after:bg-slate-200/80">
            <Network className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="font-extrabold text-emerald-700 text-[11px] tracking-wider uppercase whitespace-nowrap">4. Circle Office / Regional Office and FI coordination</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bank RO/Circle Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Bank RO / Circle Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Network className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="bankRoCircleName"
                  readOnly={isViewMode}
                  placeholder="e.g. Lucknow Circle LHO"
                  value={bankRoCircleName}
                  onChange={(e) => {
                    setBankRoCircleName(e.target.value);
                    if (errors.bankRoCircleName) setErrors(prev => ({ ...prev, bankRoCircleName: '' }));
                  }}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                    errors.bankRoCircleName ? 'border-[#e4e9e1] ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } read-only:bg-slate-50 read-only:text-slate-600`}
                />
              </div>
              {errors.bankRoCircleName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.bankRoCircleName}
                </p>
              )}
            </div>

            {/* Bank RO/Circle FI Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                RO / Circle FI Officer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Contact className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="bankRoCircleFiName"
                  readOnly={isViewMode}
                  placeholder="Name of Regional FI Coordinator"
                  value={bankRoCircleFiName}
                  onChange={(e) => {
                    setBankRoCircleFiName(e.target.value);
                    if (errors.bankRoCircleFiName) setErrors(prev => ({ ...prev, bankRoCircleFiName: '' }));
                  }}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                    errors.bankRoCircleFiName ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } read-only:bg-slate-50 read-only:text-slate-600`}
                />
              </div>
              {errors.bankRoCircleFiName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.bankRoCircleFiName}
                </p>
              )}
            </div>

            {/* FI Contact Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex flex-col">
                <span className="flex items-center gap-1">
                  RO / Circle FI Contact No <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="bankRoCircleFiContactNo"
                  readOnly={isViewMode}
                  placeholder="Official mobile / desk phone"
                  maxLength={12}
                  value={bankRoCircleFiContactNo}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d+]/g, '');
                    setBankRoCircleFiContactNo(cleaned);
                    if (errors.bankRoCircleFiContactNo) setErrors(prev => ({ ...prev, bankRoCircleFiContactNo: '' }));
                  }}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm font-mono focus:outline-none transition-all bg-[#fcfcfd] focus:bg-white ${
                    errors.bankRoCircleFiContactNo ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  } read-only:bg-slate-50 read-only:text-slate-600`}
                />
              </div>
              {errors.bankRoCircleFiContactNo && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.bankRoCircleFiContactNo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200/80">
          <p className="text-[11px] text-slate-500 w-full sm:w-auto">
            Fields marked with an asterisk (<span className="text-red-500">*</span>) are mandatory for registry validation rules.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              {isViewMode ? 'Go Back to Registry' : 'Cancel'}
            </button>
            
            {!isViewMode && (
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/25 active:scale-95 border-none"
              >
                <Save className="w-4 h-4 text-emerald-200" />
                {mode === 'edit' ? 'Update Blueprint' : 'Save Branch Blueprint'}
              </button>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
}
