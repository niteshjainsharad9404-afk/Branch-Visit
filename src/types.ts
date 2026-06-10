/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BranchDetails {
  id: string;
  timestamp: string;
  bankName: string;
  branchName: string;
  branchCode: string;
  branchIfscCode: string;
  branchManagerName: string;
  branchManagerMobileNo: string;
  branchManagerEmail: string;
  branchRecommendLocation: string;
  bankRoCircleName: string;
  bankRoCircleFiName: string;
  bankRoCircleFiContactNo: string;
}

export type FormMode = 'add' | 'edit' | 'view';
