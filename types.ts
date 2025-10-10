
export interface Step {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  children?: Step[];
}

export enum PositionStatus {
  Normal = 'Normal',
  Abolished = 'Abolished',
  Created = 'Created',
  NewAddition = 'NewAddition',
  Resigned = 'Resigned',
}

export interface StaffingPosition {
  id: number;
  department: string;
  section: string;
  designation: string;
  minSalary: number;
  maxSalary: number;
  weightedAvgSalary: number;
  positions2526: number;
  onBoard: number;
  vacant: number;
  positions2627: number;
  remarks: string;
  status: PositionStatus;
  date?: string;
}

export interface ApprovalStep {
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Reviewed';
  date?: string;
  approver?: string;
  comments?: string;
}

export type RequisitionStatus =
  | 'Pending HOD Approval'
  | 'Pending Director/Dean Approval'
  | 'Pending HR Review'
  | 'Approved'
  | 'Rejected'
  | 'Needs Revision';

export interface Requisition {
  id: number;
  reqId: string;
  position: string;
  department: string;
  section: string;
  type: 'New Position' | 'Replacement';
  qualification: string;
  experience: string;
  requiredSkills: string;
  licenseRequirement: 'Yes' | 'No';
  numberOfPositions: number;
  status: RequisitionStatus;
  approvalHistory: ApprovalStep[];
  completionDate?: string;
  jobDescription?: string;
  requestedBy: string;
  requestedDate: string;

  // New fields from the form
  fiscalYear: string;
  positionType: 'Full-Time' | 'Part-Time' | 'Visiting';
  budgetedStatus: 'Budgeted' | 'Non-Budgeted';
  replacementFor?: string;
  justification: string;
  supervisorName: string;
  supervisorUID: string;
  hodName: string;
  hodUID: string;
}

export type CandidateStatus =
  | 'New'
  | 'Under Review'
  | 'Sent to Department'
  | 'Recommended by Department'
  | 'Rejected'
  | 'Shortlisted for Interview'
  | 'Recommended for Hire'
  | 'Approved for Hire'
  | 'Offer Sent'
  | 'Offer Accepted'
  | 'Pending Verification'
  | 'Hired';

export type PanelNominationStatus = 'Pending Nomination' | 'Panel Nominated';
export type PanelMemberStatus = 'Pending' | 'Available' | 'Unavailable' | 'Representative Nominated';

export interface PanelMember {
    name: string;
    role: string;
    status: PanelMemberStatus;
    notified: boolean;
    representative?: {
        name: string;
        role: string;
    };
}

export type InterviewStatus = 'Pending Schedule' | 'Scheduled' | 'Completed';

export interface PanelEvaluation {
    panelMemberName: string;
    scores: { [criteria: string]: number };
    // FIX: Changed 'comments' to an object to match its usage in evaluation forms.
    comments: { [criteria: string]: string };
}

export interface Candidate {
    id: number;
    name: string;
    positionAppliedFor: string;
    department: string;
    section: string;
    cnic: string;
    qualification: string;
    experienceYears: number;
    organization: string;
    contact: string;
    city: string;
    remarks: string;
    status: CandidateStatus;
    panelNominationStatus: PanelNominationStatus;
    interviewPanel: PanelMember[];
    rejectionRemarks?: string;
    shortlistingRemarks?: string;
    interviewTime?: string;
    interviewStatus?: InterviewStatus;
    evaluation?: PanelEvaluation[];
    preInterviewFormSent?: boolean;
    preInterviewFormSubmitted?: boolean;
    preInterviewFormData?: Record<string, string | number | string[]>;
    currentSalary?: number;
    expectedSalary?: number;
    recommendedDesignation?: string;
    adReference?: string;
    appliedDate?: string;
    keySkills?: string[];
    finalApprovalHistory?: ApprovalStep[];
    finalSalary?: number;
    salaryRemarks?: string;
    attendanceStatus?: 'Pending' | 'Present' | 'Absent';
    documentChecklist?: Record<string, boolean>;
    offerEvidence?: string;
}

export interface AdvertisedPositionInfo {
  reqId: number;
  position: string;
  qualification: string;
  experience: string;
  numberOfPositions: number;
  department: string;
  section: string;
}

export interface JobAdvertisement {
  id: number;
  title: string;
  status: 'Draft' | 'Published';
  positions: AdvertisedPositionInfo[];
  applicationFeeDoctors: number;
  applicationFeeOthers: number;
  deadline: string;
  notes: string[];
  publishedOn?: string;
}

export interface BoardMember {
  role: string;
  position: 'Chairperson' | 'Member';
}

export interface SelectionBoard {
  title: string;
  subtitle: string;
  description?: string;
  members: BoardMember[];
}

export interface JobDescriptionApprovalStep {
  role: string; // 'Prepared by Supervisor', 'Approved by HOD', 'Reviewed by HR'
  status: 'Pending' | 'Approved' | 'Reviewed' | 'Rejected';
  date?: string;
  approver?: string;
  comments?: string;
}

export type JobDescriptionStatus =
  | 'Pending HOD Approval'
  | 'Pending HR Review'
  | 'Approved'
  | 'Rejected'
  | 'Needs Revision';

export interface JobDescription {
  id: number;
  
  // Job Identification
  designation: string;
  department: string;
  section: string;
  reportsTo: string[];
  reportingPositions: string[];

  // Job Specifications
  qualification: string[];
  skills: string[];
  experience: string; // e.g., "5 Years"
  registrationLicense: string[];
  
  // Job Summary & Functions
  jobSummary: string;
  jobFunctions: string[];

  // Metadata & Status
  status: JobDescriptionStatus;
  approvalHistory: JobDescriptionApprovalStep[];
  
  // Meta fields from form
  preparedBy: string; // Name of Supervisor/Line Manager
  preparedDate: string;
}

export interface Notification {
    type: 'success' | 'error' | 'info';
    message: string;
}
