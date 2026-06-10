/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BranchDetails } from './types';

export const POPULAR_BANKS = [
  'State Bank of India (SBI)',
  'Punjab National Bank (PNB)',
  'Bank of Baroda (BoB)',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India (BoI)',
  'Central Bank of India',
  'Indian Bank',
  'UCO Bank',
  'Indian Overseas Bank',
  'Punjab & Sind Bank',
  'Bank of Maharashtra',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'KOTAK Mahindra Bank',
  'Federal Bank',
  'IDFC First Bank',
  'IndusInd Bank',
  'Bandhan Bank',
  'Other Bank'
];

export const SAMPLE_BRANCHES: BranchDetails[] = [
  {
    id: 'sample-1',
    timestamp: '2026-06-10 09:30:15',
    bankName: 'State Bank of India (SBI)',
    branchName: 'Main Branch, Lucknow',
    branchCode: 'SBI0000125',
    branchIfscCode: 'SBIN0000125',
    branchManagerName: 'Rajesh Kumar Singh',
    branchManagerMobileNo: '9876543210',
    branchManagerEmail: 'mgr.lucknow@sbi.co.in',
    branchRecommendLocation: 'Hazratganj Square, Near GPO, Lucknow, UP - 226001',
    bankRoCircleName: 'Lucknow Circle (LHO)',
    bankRoCircleFiName: 'Amit Saxena (AGM FI)',
    bankRoCircleFiContactNo: '9415012345'
  },
  {
    id: 'sample-2',
    timestamp: '2026-06-10 09:41:00',
    bankName: 'Punjab National Bank (PNB)',
    branchName: 'Sadar Bazar, Delhi',
    branchCode: 'PNB0001150',
    branchIfscCode: 'PUNB0115000',
    branchManagerName: 'Sunita Sharma',
    branchManagerMobileNo: '9988776655',
    branchManagerEmail: 'bo1150@pnb.co.in',
    branchRecommendLocation: '124, Sadar Bazar Main Road, Delhi - 110006',
    bankRoCircleName: 'Delhi Central Circle',
    bankRoCircleFiName: 'Sanjay Dutt (Chief Manager FI)',
    bankRoCircleFiContactNo: '9012345678'
  },
  {
    id: 'sample-3',
    timestamp: '2026-06-10 09:45:22',
    bankName: 'Bank of Baroda (BoB)',
    branchName: 'Alkapuri, Vadodara',
    branchCode: 'BOB0002812',
    branchIfscCode: 'BARB0ALKVAD',
    branchManagerName: 'Mahendra Patel',
    branchManagerMobileNo: '9123456789',
    branchManagerEmail: 'alkapu@bankofbaroda.co.in',
    branchRecommendLocation: 'RC Dutt Road, Alkapuri, Vadodara, Gujarat - 390007',
    bankRoCircleName: 'Vadodara Zone / Circle Office',
    bankRoCircleFiName: 'Vikas Shah (FI Coordinator)',
    bankRoCircleFiContactNo: '9825098765'
  }
];
