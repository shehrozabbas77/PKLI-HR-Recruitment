import type { Step, StaffingPosition, Requisition, Candidate, PanelMember, SelectionBoard, JobDescription, JobAdvertisement } from './types';
import { PositionStatus } from './types';

export const NAVIGATION_STRUCTURE: Step[] = [
  { id: 1, title: 'PKLI HR Recruitment Dashboard', shortTitle: 'Dashboard', description: 'A hospital-wide overview of key HR metrics and employee statuses.' },
  { 
    id: 100, title: 'Planning', shortTitle: 'Planning', description: '',
    children: [
        { id: 2, title: 'Staffing Plan / HR Budgeting', shortTitle: 'Staffing Plan', description: 'Manage and view budgeted, vacant, and onboard positions for each department.' },
        { id: 3, title: 'Job Description Management', shortTitle: 'Job Descriptions', description: 'Departments upload job descriptions for HR approval before creating requisitions.' },
    ]
  },
  { 
    id: 200, title: 'Recruitment', shortTitle: 'Recruitment', description: '',
    children: [
        { id: 4, title: 'Human Resource Requisition', shortTitle: 'Requisition', description: 'Create and manage requests for new or replacement positions based on approved JDs.' },
        { id: 5, title: 'Job Advertisement', shortTitle: 'Advertisement', description: 'Draft and publish job advertisements based on approved requisitions.' },
    ]
  },
  {
    id: 300, title: 'Applications', shortTitle: 'Applications', description: '',
    children: [
        { id: 6, title: 'Application Data Collection', shortTitle: 'Applications', description: 'View incoming applications and send them for departmental review.' },
        { id: 7, title: 'Departmental Review & Shortlisting', shortTitle: 'Dept Review & Shortlisting', description: 'Candidates are sent to departments for shortlisting recommendations.' },
        { id: 8, title: 'HR Final Shortlisting', shortTitle: 'HR Final Shortlisting', description: 'Finalize shortlist based on departmental review.' },
    ]
  },
   { 
    id: 400, title: 'Interview Process', shortTitle: 'Interview Process', description: '',
    children: [
        { id: 10, title: 'Interview Scheduling & Communication', shortTitle: 'Interview Scheduling', description: 'Schedule interviews, send invites, and manage pre-interview forms for shortlisted candidates.' },
        { id: 9, title: 'Panel Nomination', shortTitle: 'Panel Nomination', description: 'Nominate interview panels for scheduled candidates.' },
        { id: 11, title: 'Candidate Attendance & Verification', shortTitle: 'Attendance', description: 'Mark attendance and verify documents for candidates on the interview day.' },
        { id: 12, title: 'Interview Evaluation', shortTitle: 'Interview Evaluation', description: 'Record evaluation scores and comments from the interview panel.' },
    ]
  },
  {
    id: 450,
    title: 'Comparative of Interviews',
    shortTitle: 'Comparative of Interviews',
    description: 'Compare candidates and finalize hiring.',
    children: [
        { id: 13, title: 'Comparative Sheet', shortTitle: 'Comparative Sheet', description: 'Compare candidates based on interview evaluations to make a hiring decision.' },
        { id: 14, title: 'Salary Approval & Finalization', shortTitle: 'Salary Approval & Finalization', description: 'Calculate salary and process the final hiring approvals.' }
    ]
  },
   { 
    id: 500, title: 'Hiring', shortTitle: 'Hiring', description: '',
    children: [
        { id: 15, title: 'Offer Letter', shortTitle: 'Offer', description: 'Generate and send official offer letters to selected candidates.' },
    ]
  },
  { 
    id: 600, title: 'Onboarding', shortTitle: 'Onboarding', description: '',
    children: [
        { id: 16, title: 'Pre-Employment Screening', shortTitle: 'Medical Screening', description: 'Manage medical screening and fitness alerts for new hires.' },
        { id: 17, title: 'HR Verifications', shortTitle: 'HR Verifications', description: 'Track verification of documents, experience, and references.' },
        { id: 18, title: 'Post-Onboarding Alerts', shortTitle: 'Onboarding', description: 'Monitor and receive alerts for license and document expiry.' },
    ]
  },
  { id: 19, title: 'My Nominations', shortTitle: 'My Nominations', description: 'View and respond to interview nominations, and conduct evaluations.' },
];

export const ALL_STEPS: Step[] = NAVIGATION_STRUCTURE.flatMap(step => step.children ? [step, ...step.children] : [step]);

// FIX: Added missing 'departmentSections' export to resolve import errors in Interviews.tsx and JobDescription.tsx.
export const departmentSections: { [key: string]: string[] } = {
    'ICT': ['Management', 'Infrastructure', 'Software Development', 'Cybersecurity'],
    'Medical Services': ['Internal Medicine', 'General Medicine', 'Nursing', 'Pediatrics', 'Hepatology', 'Emergency', 'Nephrology'],
    'Administration': ['General Administration', 'Housekeeping', 'Patient Relations'],
    'Finance': ['Accounts', 'Audit', 'Procurement'],
    'Human Resource': ['Operations', 'Talent Acquisition', 'Compensation & Benefits']
};

export const mockStaffingPlan: StaffingPosition[] = [
    // ICT Department
    { id: 2, department: 'ICT', section: 'Management', designation: 'Senior Manager', minSalary: 250000, maxSalary: 350000, weightedAvgSalary: 275000, positions2526: 2, onBoard: 1, vacant: 1, positions2627: 2, remarks: '1 Vacancy', status: PositionStatus.Normal },
    { id: 3, department: 'ICT', section: 'Management', designation: 'Manager', minSalary: 180000, maxSalary: 250000, weightedAvgSalary: 197500, positions2526: 3, onBoard: 2, vacant: 0, positions2627: 3, remarks: '1 Resigned', status: PositionStatus.Resigned, date: '2024-08-15' },
    { id: 4, department: 'ICT', section: 'Management', designation: 'Assistant Managers', minSalary: 120000, maxSalary: 180000, weightedAvgSalary: 135000, positions2526: 4, onBoard: 3, vacant: 1, positions2627: 4, remarks: '1 position open for hiring', status: PositionStatus.Normal },
    { id: 6, department: 'ICT', section: 'Infrastructure', designation: 'Sr. Database Administrator', minSalary: 150000, maxSalary: 220000, weightedAvgSalary: 167500, positions2526: 1, onBoard: 0, vacant: 1, positions2627: 1, remarks: 'Critical position vacant', status: PositionStatus.Normal },
    { id: 7, department: 'ICT', section: 'Infrastructure', designation: 'Database Administrator', minSalary: 100000, maxSalary: 150000, weightedAvgSalary: 112500, positions2526: 2, onBoard: 2, vacant: 0, positions2627: 2, remarks: 'Team is full', status: PositionStatus.Normal },
    { id: 8, department: 'ICT', section: 'Software Development', designation: 'Software Engineer', minSalary: 90000, maxSalary: 140000, weightedAvgSalary: 102500, positions2526: 5, onBoard: 3, vacant: 2, positions2627: 5, remarks: 'Reappropriated from Analyst', status: PositionStatus.Created, date: '2024-05-10' },
    { id: 9, department: 'ICT', section: 'Software Development', designation: 'Analyst', minSalary: 80000, maxSalary: 120000, weightedAvgSalary: 90000, positions2526: 2, onBoard: 2, vacant: 0, positions2627: 1, remarks: 'Reappropriated to Software Eng.', status: PositionStatus.Abolished, date: '2024-05-10' },
    { id: 10, department: 'ICT', section: 'Software Development', designation: 'Senior Analyst', minSalary: 100000, maxSalary: 150000, weightedAvgSalary: 112500, positions2526: 2, onBoard: 2, vacant: 0, positions2627: 2, remarks: 'Stable', status: PositionStatus.Normal },
    { id: 11, department: 'ICT', section: 'Infrastructure', designation: 'Network Administrator', minSalary: 95000, maxSalary: 135000, weightedAvgSalary: 105000, positions2526: 3, onBoard: 3, vacant: 0, positions2627: 3, remarks: 'Fully staffed', status: PositionStatus.Normal },
    { id: 12, department: 'ICT', section: 'Infrastructure', designation: 'Network Technician', minSalary: 60000, maxSalary: 90000, weightedAvgSalary: 67500, positions2526: 4, onBoard: 3, vacant: 1, positions2627: 5, remarks: 'New position added', status: PositionStatus.NewAddition, date: '2024-06-01' },
    
    // Medical Services Department
    { id: 13, department: 'Medical Services', section: 'Internal Medicine', designation: 'Consultant Physician', minSalary: 400000, maxSalary: 600000, weightedAvgSalary: 450000, positions2526: 10, onBoard: 8, vacant: 2, positions2627: 12, remarks: 'Hiring for 2 consultants', status: PositionStatus.Normal },
    { id: 14, department: 'Medical Services', section: 'General Medicine', designation: 'Medical Officer', minSalary: 150000, maxSalary: 250000, weightedAvgSalary: 175000, positions2526: 25, onBoard: 20, vacant: 5, positions2627: 25, remarks: '5 vacancies due to turnover', status: PositionStatus.Normal },
    { id: 15, department: 'Medical Services', section: 'Nursing', designation: 'Head Nurse', minSalary: 180000, maxSalary: 280000, weightedAvgSalary: 205000, positions2526: 5, onBoard: 4, vacant: 0, positions2627: 5, remarks: '1 resignation', status: PositionStatus.Resigned, date: '2024-09-01' },
    { id: 16, department: 'Medical Services', section: 'Nursing', designation: 'Charge Nurse', minSalary: 120000, maxSalary: 180000, weightedAvgSalary: 135000, positions2526: 30, onBoard: 28, vacant: 2, positions2627: 30, remarks: '2 positions open', status: PositionStatus.Normal },
    { id: 23, department: 'Medical Services', section: 'Nursing', designation: 'Staff Nurse', minSalary: 80000, maxSalary: 120000, weightedAvgSalary: 90000, positions2526: 100, onBoard: 90, vacant: 10, positions2627: 110, remarks: 'High turnover position, continuous hiring.', status: PositionStatus.Normal },
    
    // Administration Department
    { id: 17, department: 'Administration', section: 'General Administration', designation: 'Admin Director', minSalary: 300000, maxSalary: 450000, weightedAvgSalary: 337500, positions2526: 1, onBoard: 1, vacant: 0, positions2627: 1, remarks: 'Filled', status: PositionStatus.Normal },
    { id: 18, department: 'Administration', section: 'General Administration', designation: 'Admin Manager', minSalary: 150000, maxSalary: 220000, weightedAvgSalary: 167500, positions2526: 3, onBoard: 2, vacant: 1, positions2627: 3, remarks: '1 vacancy', status: PositionStatus.Normal },
    { id: 19, department: 'Administration', section: 'Housekeeping', designation: 'Support Staff', minSalary: 40000, maxSalary: 60000, weightedAvgSalary: 45000, positions2526: 10, onBoard: 10, vacant: 0, positions2627: 12, remarks: '2 new positions in 26-27', status: PositionStatus.NewAddition, date: '2024-07-01' },
    
    // Finance Department
    { id: 20, department: 'Finance', section: 'Accounts', designation: 'Chief Financial Officer', minSalary: 400000, maxSalary: 600000, weightedAvgSalary: 450000, positions2526: 1, onBoard: 1, vacant: 0, positions2627: 1, remarks: 'Filled', status: PositionStatus.Normal },
    { id: 21, department: 'Finance', section: 'Accounts', designation: 'Finance Manager', minSalary: 200000, maxSalary: 300000, weightedAvgSalary: 225000, positions2526: 2, onBoard: 1, vacant: 1, positions2627: 2, remarks: 'Hiring for one manager', status: PositionStatus.Normal },
    { id: 22, department: 'Finance', section: 'Accounts', designation: 'Accountant', minSalary: 80000, maxSalary: 120000, weightedAvgSalary: 90000, positions2526: 5, onBoard: 4, vacant: 1, positions2627: 5, remarks: '1 vacancy due to promotion', status: PositionStatus.Normal },

    // Human Resource Department
    { id: 24, department: 'Human Resource', section: 'Operations', designation: 'Director HR', minSalary: 350000, maxSalary: 500000, weightedAvgSalary: 387500, positions2526: 1, onBoard: 1, vacant: 0, positions2627: 1, remarks: 'Filled', status: PositionStatus.Normal },
    { id: 25, department: 'Human Resource', section: 'Talent Acquisition', designation: 'HR Officer', minSalary: 70000, maxSalary: 110000, weightedAvgSalary: 80000, positions2526: 3, onBoard: 2, vacant: 1, positions2627: 3, remarks: 'Need one more officer for recruitment.', status: PositionStatus.Normal },
];

export const mockJobDescriptions: JobDescription[] = [
  {
    id: 1,
    designation: 'Senior Manager',
    department: 'ICT',
    section: 'Management',
    reportsTo: 'Chief Information Officer',
    reportingPositions: 'Manager (x3), Assistant Manager (x4)',
    qualification: ['MBA', 'Masters in IT'],
    skills: 'Project Management, Budgeting, Team Leadership, Strategic Planning',
    experience: '10+ years in IT leadership with a proven track record.',
    registrationLicense: ['N/A'],
    jobSummary: 'To lead the ICT department, manage technology operations, and implement IT strategies that align with organizational goals.',
    jobFunctions: ['Oversee all technology operations and evaluate them according to established goals.', 'Devise and establish IT policies and systems to support the implementation of strategies set by upper management.', 'Analyze the business requirements of all departments to determine their technology needs.'],
    status: 'Approved',
    preparedBy: 'Mr. Ali (CIO)',
    preparedDate: '2025-09-20',
    approvalHistory: [
      { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'Mr. Ali', date: '2025-09-20' },
      { role: 'Approved By (HOD)', status: 'Approved', approver: 'Mr. Ali', date: '2025-09-21' },
      { role: 'Reviewed By (HR)', status: 'Reviewed', approver: 'HR Department', date: '2025-09-22' }
    ]
  },
  {
    id: 2,
    designation: 'Sr. Database Administrator',
    department: 'ICT',
    section: 'Infrastructure',
    reportsTo: 'Senior Manager',
    reportingPositions: 'Database Administrator (x2)',
    qualification: ['BSCS'],
    skills: 'Database tuning, performance monitoring, backups, recovery, and security.',
    experience: '5+ years of hands-on experience with Oracle and SQL Server.',
    registrationLicense: ['Oracle Certified Professional (OCP)'],
    jobSummary: 'Manage and maintain the hospital\'s critical database systems to ensure high levels of performance, availability, and security.',
    jobFunctions: ['Install, configure, and maintain database management systems.', 'Develop and implement backup and recovery plans.', 'Monitor database performance and tune as necessary.'],
    status: 'Approved',
    preparedBy: 'Senior Manager ICT',
    preparedDate: '2025-09-22',
    approvalHistory: [
      { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'Senior Manager ICT', date: '2025-09-22' },
      { role: 'Approved By (HOD)', status: 'Approved', approver: 'Mr. Ali', date: '2025-09-23' },
      { role: 'Reviewed By (HR)', status: 'Reviewed', approver: 'HR Department', date: '2025-09-24' }
    ]
  },
  {
    id: 3,
    designation: 'Software Engineer',
    department: 'ICT',
    section: 'Software Development',
    reportsTo: 'Manager Software Development',
    reportingPositions: 'None',
    qualification: ["Bachelors in Computer Science"],
    skills: 'React, Node.js, TypeScript, RESTful APIs, Git',
    experience: 'Minimum 2 years of professional experience in web development.',
    registrationLicense: ['N/A'],
    jobSummary: 'Design, develop, and maintain web applications for the hospital\'s internal systems.',
    jobFunctions: ['Write clean, scalable, and well-documented code.', 'Collaborate with cross-functional teams to define, design, and ship new features.', 'Troubleshoot and debug applications.'],
    status: 'Approved',
    preparedBy: 'Manager Software Development',
    preparedDate: '2025-09-24',
    approvalHistory: [
      { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'Manager Software Development', date: '2025-09-24' },
      { role: 'Approved By (HOD)', status: 'Approved', approver: 'Mr. Ali', date: '2025-09-25' },
      { role: 'Reviewed By (HR)', status: 'Reviewed', approver: 'HR Department', date: '2025-09-26' }
    ]
  },
  {
    id: 4,
    designation: 'Cybersecurity Analyst',
    department: 'ICT',
    section: 'Cybersecurity',
    reportsTo: 'Senior Manager',
    reportingPositions: 'None',
    qualification: ['BS in Cybersecurity'],
    experience: '3+ years in a security operations role.',
    skills: 'SIEM, IDS/IPS, Vulnerability Assessment, Incident Response',
    registrationLicense: ['CISSP', 'CompTIA Security+'],
    jobSummary: 'Monitor, detect, and respond to cybersecurity threats to protect the organization\'s digital assets.',
    jobFunctions: ['Monitor security alerts and conduct investigations.', 'Perform vulnerability scans and penetration testing.', 'Develop and maintain security policies and procedures.'],
    status: 'Approved',
    preparedBy: 'Senior Manager ICT',
    preparedDate: '2025-09-14',
    approvalHistory: [
      { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'Senior Manager ICT', date: '2025-09-14' },
      { role: 'Approved By (HOD)', status: 'Approved', approver: 'Mr. Ali', date: '2025-09-14' },
      { role: 'Reviewed By (HR)', status: 'Reviewed', approver: 'HR Department', date: '2025-09-15' }
    ]
  },
    {
    id: 10,
    designation: 'Chief Information Officer',
    department: 'ICT',
    section: 'Management',
    reportsTo: 'CEO',
    reportingPositions: 'All ICT Staff',
    qualification: ['Masters in Information Technology'],
    experience: '15+ years of experience in IT leadership roles.',
    skills: 'IT Strategy, Budget Management, Vendor Management, Cybersecurity oversight',
    registrationLicense: ['N/A'],
    jobSummary: 'Provide vision and leadership for developing and implementing information technology initiatives.',
    jobFunctions: ['Lead IT strategic and operational planning to achieve business goals.', 'Direct the development and implementation of IT policies and procedures.', 'Oversee the management of all IT projects.'],
    status: 'Approved',
    preparedBy: 'CEO Office',
    preparedDate: '2025-01-10',
    approvalHistory: [
      { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'CEO', date: '2025-01-10' },
      { role: 'Approved By (HOD)', status: 'Approved', approver: 'CEO', date: '2025-01-11' },
      { role: 'Reviewed By (HR)', status: 'Reviewed', approver: 'HR Department', date: '2025-01-12' }
    ]
  },
  {
    id: 5,
    designation: 'Medical Officer',
    department: 'Medical Services',
    section: 'General Medicine',
    reportsTo: 'Consultant Incharge',
    reportingPositions: 'None',
    qualification: ['MBBS'],
    skills: 'Patient assessment, clinical diagnosis, basic life support, strong communication skills.',
    experience: 'Completed 1-year house job.',
    registrationLicense: ['PMDC'],
    jobSummary: 'Provide high-quality medical care to patients in the general medicine department under the supervision of a consultant.',
    jobFunctions: ['Conduct patient consultations and physical examinations.', 'Diagnose and treat illnesses.', 'Order and interpret diagnostic tests.'],
    status: 'Pending HOD Approval',
    preparedBy: 'Dr. Ahmad (Supervisor)',
    preparedDate: '2025-09-28',
    approvalHistory: [
      { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'Dr. Ahmad', date: '2025-09-28' },
      { role: 'Approved By (HOD)', status: 'Pending' }
    ]
  },
  {
    id: 8,
    designation: 'Janitorial Supervisor',
    department: 'Administration',
    section: 'Housekeeping',
    reportsTo: 'Admin Manager',
    reportingPositions: 'Janitorial Staff (x10)',
    qualification: ['High School Diploma'],
    experience: '2+ years in a supervisory role',
    skills: 'Team management, cleaning protocols, inventory management',
    registrationLicense: ['N/A'],
    jobSummary: 'To oversee and coordinate the activities of the janitorial staff.',
    jobFunctions: ['Assign tasks to staff and inspect completed work for conformance to standards.', 'Issue supplies and equipment.', 'Train new staff and recommend disciplinary actions.'],
    status: 'Rejected',
    preparedBy: 'Admin Dept.',
    preparedDate: '2025-09-29',
    approvalHistory: [
        { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'Admin Manager', date: '2025-09-29' },
        { role: 'Approved By (HOD)', status: 'Rejected', approver: 'Admin Director', date: '2025-09-30', comments: 'Job functions need to be more detailed.' }
    ]
  },
  {
    id: 9,
    designation: 'HR Manager',
    department: 'Human Resource',
    section: 'Operations',
    reportsTo: 'Director HR',
    reportingPositions: 'HR Officer (x2)',
    qualification: ['MBA in HR'],
    experience: '5+ years of experience in HR operations.',
    skills: 'Employee Relations, Payroll, HRIS, Policy Development',
    registrationLicense: ['SHRM-CP'],
    jobSummary: 'Manage the day-to-day HR operations, including employee relations, compensation, and benefits.',
    jobFunctions: ['Develop and implement HR policies and procedures.', 'Oversee employee relations and resolve workplace issues.', 'Manage payroll and benefits administration.'],
    status: 'Approved',
    preparedBy: 'Director HR',
    preparedDate: '2025-08-19',
    approvalHistory: [
      { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'Director HR', date: '2025-08-19' },
      { role: 'Approved By (HOD)', status: 'Approved', approver: 'Director HR', date: '2025-08-19' },
      { role: 'Reviewed By (HR)', status: 'Reviewed', approver: 'HR Department', date: '2025-08-20' }
    ]
  },
  {
    id: 11,
    designation: 'Staff Nurse',
    department: 'Medical Services',
    section: 'Nursing',
    reportsTo: 'Charge Nurse',
    reportingPositions: 'None',
    qualification: ['BScN', 'Diploma in General Nursing'],
    skills: 'Patient care, medication administration, IV cannulation, vital signs monitoring.',
    experience: '1+ year of clinical experience.',
    registrationLicense: ['PNC'],
    jobSummary: 'Provide direct patient care, administer medications, and collaborate with the healthcare team to ensure optimal patient outcomes.',
    jobFunctions: ['Assess patient health problems and needs.', 'Develop and implement nursing care plans.', 'Maintain medical records.'],
    status: 'Approved',
    preparedBy: 'Nursing Director',
    preparedDate: '2025-10-01',
    approvalHistory: [
      { role: 'Prepared By (Supervisor)', status: 'Approved', approver: 'Nursing Director', date: '2025-10-01' },
      { role: 'Approved By (HOD)', status: 'Approved', approver: 'Nursing Director', date: '2025-10-02' },
      { role: 'Reviewed By (HR)', status: 'Reviewed', approver: 'HR Department', date: '2025-10-03' }
    ]
  },
];

export const mockRequisitions: Requisition[] = [
    { 
        id: 1, 
        reqId: 'REQ-001',
        position: 'Manager',
        department: 'ICT', 
        section: 'Management', 
        type: 'Replacement', 
        qualification: 'MBA or equivalent', 
        experience: '10+ years', 
        requiredSkills: 'Project Management, Budgeting', 
        licenseRequirement: 'No', 
        numberOfPositions: 1, 
        status: 'Pending Director/Dean Approval',
        requestedBy: 'Kahfif Siddiqui',
        requestedDate: '2025-09-18 10:00',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-09-18', approver: 'Mr. Ali' },
            { role: 'Director/Dean', status: 'Pending' }
        ],
        justification: 'Replacement for a resigned employee to manage the department\'s key projects and deliverables. This role is crucial for maintaining project timelines and team coordination.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        replacementFor: 'Mr. Ahmad (Resigned)',
        supervisorName: 'Mr. Ali',
        supervisorUID: 'UID001',
        hodName: 'Mr. Ali',
        hodUID: 'UID001',
    },
    { 
        id: 2, 
        reqId: 'REQ-002',
        position: 'Cybersecurity Analyst', 
        department: 'ICT', 
        section: 'Cybersecurity', 
        type: 'New Position', 
        qualification: 'BSCS or equivalent', 
        experience: '3+ years', 
        requiredSkills: 'SIEM, Threat Hunting', 
        licenseRequirement: 'Yes', 
        numberOfPositions: 1, 
        status: 'Pending HOD Approval',
        requestedBy: 'Kahfif Siddiqui',
        requestedDate: '2025-09-15 14:15',
        approvalHistory: [
            { role: 'HOD', status: 'Pending' }
        ],
        justification: 'Newly approved position in the staffing plan to strengthen our security posture against increasing cyber threats.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        supervisorName: 'Senior Manager',
        supervisorUID: 'UID005',
        hodName: 'Mr. Ali',
        hodUID: 'UID001',
    },
     { 
        id: 3, 
        reqId: 'REQ-003',
        position: 'HR Manager', 
        department: 'Human Resource', 
        section: 'Operations', 
        type: 'New Position', 
        qualification: 'MBA HR', 
        experience: '5 years', 
        requiredSkills: 'Employee Relations, HRIS', 
        licenseRequirement: 'No', 
        numberOfPositions: 1, 
        status: 'Rejected',
        requestedBy: 'Dr. Adnan Gill',
        requestedDate: '2025-08-20 11:30',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-08-21', approver: 'Dr. Adnan Gill' },
            { role: 'Director/Dean', status: 'Rejected', date: '2025-08-22', approver: 'Dr. Khan', comments: 'Budget not available for a new manager role this quarter. Re-evaluate in Q4.' }
        ],
        justification: 'Requesting an additional HR Manager to handle increased workload due to recent expansion and to improve HR service delivery.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Non-Budgeted',
        supervisorName: 'Director HR',
        supervisorUID: 'UID301',
        hodName: 'Dr. Adnan Gill',
        hodUID: 'UID300',
    },
    { 
        id: 4, 
        reqId: 'REQ-004',
        position: 'Software Engineer', 
        department: 'ICT', 
        section: 'Software Development', 
        type: 'Replacement', 
        qualification: 'BSCS', 
        experience: '2 years', 
        requiredSkills: 'React, Node.js', 
        licenseRequirement: 'No', 
        numberOfPositions: 1, 
        status: 'Approved',
        requestedBy: 'Kahfif Siddiqui',
        requestedDate: '2025-08-10 09:00',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-08-11', approver: 'Mr. Ali' },
            { role: 'Director/Dean', status: 'Approved', date: '2025-08-12', approver: 'Dr. Khan' },
            { role: 'HR Review', status: 'Reviewed', date: '2025-08-13', approver: 'HR Team' }
        ],
        completionDate: '2025-08-13',
        justification: 'Backfill for a promoted software engineer to maintain development velocity on the patient portal project.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        replacementFor: 'Ms. Jane Doe (Promoted)',
        supervisorName: 'Manager Software Development',
        supervisorUID: 'UID006',
        hodName: 'Mr. Ali',
        hodUID: 'UID001',
    },
    {
        id: 5,
        reqId: 'REQ-005',
        position: 'Finance Manager',
        department: 'Finance',
        section: 'Accounts',
        type: 'Replacement',
        qualification: 'ACCA/CMA/MBA Finance',
        experience: '5+ years in financial management',
        requiredSkills: 'Financial Reporting, Budgeting, Compliance',
        licenseRequirement: 'No',
        numberOfPositions: 1,
        requestedBy: 'Mr. Ahmed',
        status: 'Approved',
        requestedDate: '2025-10-11 15:00',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-10-12', approver: 'Mr. Ahmed' },
            { role: 'Director/Dean', status: 'Approved', date: '2025-10-13', approver: 'Dr. Khan' },
            { role: 'HR Review', status: 'Reviewed', date: '2025-10-14', approver: 'HR Team' }
        ],
        completionDate: '2025-10-14',
        jobDescription: 'Internal JD #6',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        replacementFor: 'Mr. Khan (Retired)',
        justification: 'Replacement for the retired Finance Manager to oversee financial operations and reporting.',
        supervisorName: 'CFO',
        supervisorUID: 'UID201',
        hodName: 'Mr. Ahmed',
        hodUID: 'UID200',
    },
    {
        id: 6,
        reqId: 'REQ-006',
        position: 'Consultant Nephrology',
        department: 'Medical Services',
        section: 'Nephrology',
        type: 'New Position',
        qualification: 'FCPS (Nephrology) or equivalent',
        experience: '5+ years post-fellowship',
        requiredSkills: 'Dialysis, CRRT, Transplant management',
        licenseRequirement: 'Yes',
        numberOfPositions: 3,
        status: 'Approved',
        requestedBy: 'Dr. Ahmad',
        requestedDate: '2025-11-20 10:00',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-11-20', approver: 'Dr. Ahmad' },
            { role: 'Director/Dean', status: 'Approved', date: '2025-11-21', approver: 'Dr. Khan' },
            { role: 'HR Review', status: 'Reviewed', date: '2025-11-22', approver: 'HR Team' }
        ],
        completionDate: '2025-11-22',
        justification: 'Expanding the nephrology department to meet patient demand.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        supervisorName: 'Medical Director',
        supervisorUID: 'UID401',
        hodName: 'Dr. Ahmad',
        hodUID: 'UID400',
    },
    { 
        id: 7, 
        reqId: 'REQ-007',
        position: 'Staff Nurse', 
        department: 'Medical Services', 
        section: 'Nursing', 
        type: 'Replacement', 
        qualification: 'BScN or Diploma', 
        experience: '1+ year', 
        requiredSkills: 'Patient care, IV cannulation', 
        licenseRequirement: 'Yes', 
        numberOfPositions: 5, 
        status: 'Approved',
        requestedBy: 'Nursing Director',
        requestedDate: '2025-10-05 09:00',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-10-05', approver: 'Nursing Director' },
            { role: 'Director/Dean', status: 'Approved', date: '2025-10-06', approver: 'Medical Director' },
            { role: 'HR Review', status: 'Reviewed', date: '2025-10-07', approver: 'HR Team' }
        ],
        completionDate: '2025-10-07',
        justification: 'Bulk hiring to manage high turnover rate in nursing staff and maintain patient care standards.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        replacementFor: 'Multiple staff',
        supervisorName: 'Nursing Director',
        supervisorUID: 'UID500',
        hodName: 'Nursing Director',
        hodUID: 'UID500',
    },
    {
        id: 8,
        reqId: 'REQ-008',
        position: 'Admin Officer',
        department: 'Administration',
        section: 'General Administration',
        type: 'Replacement',
        qualification: 'Bachelors in Business Administration',
        experience: '2 years',
        requiredSkills: 'MS Office, Communication Skills',
        licenseRequirement: 'No',
        numberOfPositions: 1,
        status: 'Pending HOD Approval',
        requestedBy: 'Mr. Kamran',
        requestedDate: '2025-11-25 12:00',
        approvalHistory: [
            { role: 'HOD', status: 'Pending' }
        ],
        justification: 'Replacement for an employee who has been transferred to another department.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        replacementFor: 'Ms. Sana (Transferred)',
        supervisorName: 'Admin Manager',
        supervisorUID: 'UID601',
        hodName: 'Admin Director',
        hodUID: 'UID600',
    },
    {
        id: 9,
        reqId: 'REQ-009',
        position: 'Charge Nurse',
        department: 'Medical Services',
        section: 'Nursing',
        type: 'Replacement',
        qualification: 'BScN or Diploma',
        experience: '3+ years',
        requiredSkills: 'Patient care, Ward management',
        licenseRequirement: 'Yes',
        numberOfPositions: 2,
        status: 'Approved',
        requestedBy: 'Nursing Director',
        requestedDate: '2025-11-10 11:00',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-11-10', approver: 'Nursing Director' },
            { role: 'Director/Dean', status: 'Approved', date: '2025-11-11', approver: 'Medical Director' },
            { role: 'HR Review', status: 'Reviewed', date: '2025-11-12', approver: 'HR Team' }
        ],
        completionDate: '2025-11-12',
        justification: 'Filling two vacant positions for Charge Nurse to ensure proper shift coverage.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        replacementFor: 'Multiple staff',
        supervisorName: 'Head Nurse',
        supervisorUID: 'UID501',
        hodName: 'Nursing Director',
        hodUID: 'UID500',
    },
    {
        id: 10,
        reqId: 'REQ-010',
        position: 'Network Technician',
        department: 'ICT',
        section: 'Infrastructure',
        type: 'New Position',
        qualification: 'DAE in Electronics/IT',
        experience: '1 year',
        requiredSkills: 'Networking, Hardware Troubleshooting',
        licenseRequirement: 'No',
        numberOfPositions: 1,
        status: 'Pending HR Review',
        requestedBy: 'Kahfif Siddiqui',
        requestedDate: '2025-10-28 16:00',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-10-29', approver: 'Mr. Ali' },
            { role: 'Director/Dean', status: 'Approved', date: '2025-10-30', approver: 'Dr. Khan' },
            { role: 'HR Review', status: 'Pending' }
        ],
        justification: 'New position required to support the expanding network infrastructure and reduce downtime.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        supervisorName: 'Network Administrator',
        supervisorUID: 'UID007',
        hodName: 'Mr. Ali',
        hodUID: 'UID001',
    },
    {
        id: 11,
        reqId: 'REQ-011',
        position: 'Accountant',
        department: 'Finance',
        section: 'Accounts',
        type: 'Replacement',
        qualification: 'B.Com / M.Com',
        experience: '2 years',
        requiredSkills: 'Bookkeeping, Tax filing',
        licenseRequirement: 'No',
        numberOfPositions: 1,
        status: 'Needs Revision',
        requestedBy: 'Mr. Ahmed',
        requestedDate: '2025-11-15 09:30',
        approvalHistory: [
            { role: 'HOD', status: 'Approved', date: '2025-11-15', approver: 'Mr. Ahmed' },
            { role: 'Director/Dean', status: 'Rejected', date: '2025-11-16', approver: 'Dr. Khan', comments: 'Justification is not strong enough. Please provide more details on workload.' }
        ],
        justification: 'Replacement for a resigned employee.',
        fiscalYear: '2025-2026',
        positionType: 'Full-Time',
        budgetedStatus: 'Budgeted',
        replacementFor: 'Mr. Asif (Resigned)',
        supervisorName: 'Finance Manager',
        supervisorUID: 'UID202',
        hodName: 'Mr. Ahmed',
        hodUID: 'UID200',
    }
];

export const mockAdvertisements: JobAdvertisement[] = [
  {
    id: 1,
    title: 'October 2025 - ICT Department Hiring',
    status: 'Published',
    positions: [
      {
        reqId: 1,
        position: 'Senior Manager',
        qualification: 'MBA or equivalent',
        experience: '10+ years in IT leadership',
        numberOfPositions: 1,
        department: 'ICT',
        section: 'Management',
      },
      {
        reqId: 2,
        position: 'Sr. Database Administrator',
        qualification: 'BSCS or equivalent',
        experience: '5+ years in Oracle/SQL Server',
        numberOfPositions: 1,
        department: 'ICT',
        section: 'Infrastructure',
      },
      {
        reqId: 4,
        position: 'Software Engineer',
        qualification: 'BSCS',
        experience: '2 years in web development',
        numberOfPositions: 2,
        department: 'ICT',
        section: 'Development',
      },
    ],
    applicationFeeDoctors: 3000,
    applicationFeeOthers: 1000,
    deadline: '2025-10-31',
    notes: [
      'Only ONLINE applications will be entertained.',
      'Employees from Government Institutes must send their application along with fresh NOC, issued by the concerned department.',
      'Applications after the due date will not be entertained.',
      'The age limit is 18 to 62 Years, except staff nurses.',
      'The age limit for Staff Nurses is 18 to 50 Years.',
      'The applicants who have applied earlier need to apply again.',
      'The candidates who do not fulfil the required eligibility criteria can be cancelled at any stage during the process of selection or subsequently.',
      'PKLI&RC is an \'Equal Opportunity Employer\'.',
    ],
    publishedOn: '2025-10-10',
  },
  {
    id: 2,
    title: 'Urgent Medical Staff Vacancies',
    status: 'Published',
    positions: [
      {
        reqId: 105, // Mock reqId
        position: 'Medical Officer',
        qualification: 'MBBS or equivalent medical degree.',
        experience: 'Completed 1-year house job and holds a valid PMDC registration.',
        numberOfPositions: 5,
        department: 'Medical Services',
        section: 'General Medicine',
      },
      {
        reqId: 6,
        position: 'Consultant Nephrology',
        qualification: 'FCPS in Internal Medicine or equivalent',
        experience: '3+ years post-fellowship experience',
        numberOfPositions: 2,
        department: 'Medical Services',
        section: 'Nephrology',
      },
      {
        reqId: 7,
        position: 'Staff Nurse',
        qualification: 'BScN or Diploma in Nursing',
        experience: '1+ year experience',
        numberOfPositions: 10,
        department: 'Medical Services',
        section: 'Nursing',
      }
    ],
    applicationFeeDoctors: 3000,
    applicationFeeOthers: 1000,
    deadline: '2025-11-15',
    publishedOn: '2025-11-01',
    notes: [
      'Only ONLINE applications will be entertained.',
      'Employees from Government Institutes must send their application along with fresh NOC, issued by the concerned department.',
    ],
  },
  {
    id: 3,
    title: 'Medical Staff Hiring - Spring 2025',
    status: 'Published',
    positions: [
      {
        reqId: 101, // Mock reqId
        position: 'Charge Nurse',
        qualification: 'BScN or equivalent',
        experience: '3+ years in a hospital setting',
        numberOfPositions: 5,
        department: 'Medical Services',
        section: 'Nursing',
      },
    ],
    applicationFeeDoctors: 3000,
    applicationFeeOthers: 1000,
    deadline: '2025-04-30', // Past date
    notes: [
      'This advertisement has expired.',
      'Only ONLINE applications were entertained.',
    ],
    publishedOn: '2025-04-01',
  },
  {
    id: 4,
    title: 'Administration Department Vacancies - Q1 2025',
    status: 'Published',
    positions: [
       {
        reqId: 102, // Mock reqId
        position: 'Admin Officer',
        qualification: 'Bachelors in Business Administration',
        experience: '2 years of relevant experience',
        numberOfPositions: 2,
        department: 'Administration',
        section: 'General Administration',
      },
      {
        reqId: 5,
        position: 'Finance Manager',
        qualification: 'ACCA/CMA/MBA Finance',
        experience: '5+ years',
        numberOfPositions: 1,
        department: 'Finance',
        section: 'Accounts',
      }
    ],
    applicationFeeDoctors: 3000,
    applicationFeeOthers: 1000,
    deadline: '2025-03-15', // Past date
    notes: [
      'Applications for this post are closed.',
      'PKLI&RC is an \'Equal Opportunity Employer\'.',
    ],
    publishedOn: '2025-02-15',
  },
];

export const MOCK_PANELISTS: PanelMember[] = [
    { name: 'Dr. Aisha Latif', role: 'Director HR', status: 'Pending', notified: false },
    { name: 'Mr. Khalid Mehmood', role: 'Head of Department ICT', status: 'Pending', notified: false },
    { name: 'Ms. Fatima Ali', role: 'Senior Manager (Technical)', status: 'Pending', notified: false },
    { name: 'Mr. Usman Ghani', role: 'External Subject Matter Expert', status: 'Pending', notified: false },
    { name: 'Mr. Bilal Chaudhry', role: 'Lead Software Architect', status: 'Pending', notified: false },
];

// FIX: Added missing 'SELECTION_BOARDS' export to resolve import error in App.tsx.
export const SELECTION_BOARDS: SelectionBoard[] = [
  {
    title: 'SPECIAL SELECTION BOARD (Appointed by SHC & ME)',
    subtitle: 'FOR SELECTION OF DEAN & DIRECTORS',
    description: 'The special selection Board shall select & recommend candidates for appointment of top five management positions to the Board of Governors, PKLI & RC.',
    members: [
      { role: 'Chairman of BOG PKLI & RC', position: 'Chairperson' },
      { role: 'Representative of Secretary of SH&ME', position: 'Member' },
      { role: 'Representative of Regulations wing', position: 'Member' },
      { role: 'Subject Specialist', position: 'Member' },
      { role: 'Co-opted member', position: 'Member' },
    ],
  },
  {
    title: 'SUB SELECTION BOARD # 1',
    subtitle: 'FOR SELECTION OF CONSULTANTS / FACULTY STAFF',
    members: [
      { role: 'Chairman of BOG PKLI & RC', position: 'Chairperson' },
      { role: 'Representative of Secretary of SH&ME', position: 'Member' },
      { role: 'Representative of Regulations wing', position: 'Member' },
      { role: 'Dean PKLI & RC', position: 'Member' },
      { role: 'Medical Director PKLI & RC', position: 'Member' },
      { role: 'Chairman of the Concerned Department', position: 'Member' },
      { role: 'Co-opted Subject Specialist', position: 'Member' },
    ],
  },
  {
    title: 'SUB SELECTION BOARD # 2',
    subtitle: 'FOR SELECTION OF NON-CLINICAL SENIOR LEVEL STAFF (above managerial positions)',
    members: [
        { role: 'Member of BOG', position: 'Member' },
        { role: 'Hospital Director', position: 'Chairperson' },
        { role: 'Head of the Concerned Department', position: 'Member' },
        { role: 'Representative of SHC & ME', position: 'Member' },
        { role: 'Representative of Regulations Wing', position: 'Member' },
    ]
  },
  {
      title: 'SUB SELECTION BOARD # 3',
      subtitle: 'FOR SELECTION OF SRS, REGISTRARS & MEDICAL OFFICERS / RESIDENTS',
      members: [
          { role: 'Medical Director / Representative', position: 'Chairperson' },
          { role: 'Chairman of Department', position: 'Member' },
          { role: 'One (1) Consultant', position: 'Member' },
          { role: 'Representative of SHC & ME', position: 'Member' },
      ]
  },
  {
      title: 'SUB SELECTION BOARD # 4',
      subtitle: 'FOR SELECTION OF ALL NON-CLINICAL / PARA MEDICAL MANAGER & BELOW POSITIONS',
      members: [
          { role: 'Hospital Director / Representative', position: 'Chairperson' },
          { role: 'HOD of Concerned Department', position: 'Member' },
          { role: 'Immediate Supervisor of Concerned Position', position: 'Member' },
          { role: 'Representative of SHC & ME Department', position: 'Member' },
      ]
  },
  {
      title: 'SUB SELECTION BOARD # 5',
      subtitle: 'FOR SELECTION OF NURSING / PARA MEDICAL STAFF (MANAGER & BELOW LEVEL)',
      members: [
          { role: 'Nursing Director / Representative', position: 'Chairperson' },
          { role: 'Hospital Director / Representative', position: 'Member' },
          { role: 'HOD of Concerned Nursing Department', position: 'Member' },
          { role: 'Chairman of the Concerned Clinical department', position: 'Member' },
      ]
  }
];

export const mockCandidates: Candidate[] = [
    // --- Stage 6: Application Data Collection ---
    // Status: New
    { id: 1, name: 'Ali Khan', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35202-1234567-1', qualification: 'MBBS', experienceYears: 2, organization: 'General Hospital', contact: '0300-1112233', city: 'Lahore', remarks: 'Meets basic criteria.', status: 'New', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-02' },
    { id: 2, name: 'Sana Javed', positionAppliedFor: 'Finance Manager', department: 'Finance', section: 'Accounts', cnic: '35202-2345678-2', qualification: 'ACCA', experienceYears: 5.5, organization: 'Audit Firm', contact: '0321-2223344', city: 'Lahore', remarks: 'Application just received.', status: 'New', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-4', appliedDate: '2025-02-20' },
    { id: 3, name: 'Kashif Mehmood', positionAppliedFor: 'Software Engineer', department: 'ICT', section: 'Software Development', cnic: '35201-3456789-3', qualification: 'BSCS', experienceYears: 1, organization: 'Internship at DevCo', contact: '0333-3334455', city: 'Karachi', remarks: 'Fresh graduate, good portfolio.', status: 'New', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-15' },
    { id: 4, name: 'Nida Yasir', positionAppliedFor: 'HR Officer', department: 'Human Resource', section: 'Talent Acquisition', cnic: '35201-4567890-4', qualification: 'BBA HR', experienceYears: 2, organization: 'Textile Group', contact: '0345-4445566', city: 'Faisalabad', remarks: 'Relevant experience.', status: 'New', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-18' },
    // Status: Under Review
    { id: 5, name: 'Usman Malik', positionAppliedFor: 'Senior Manager', department: 'ICT', section: 'Management', cnic: '35202-5678901-5', qualification: 'MBA IT', experienceYears: 9, organization: 'Telecom Co.', contact: '0312-5556677', city: 'Islamabad', remarks: 'HR is currently reviewing the CV against the JD.', status: 'Under Review', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-12' },
    { id: 6, name: 'Ayesha Khan', positionAppliedFor: 'Charge Nurse', department: 'Medical Services', section: 'Nursing', cnic: '35202-6789012-6', qualification: 'BScN', experienceYears: 4, organization: 'City Hospital', contact: '0313-6667788', city: 'Lahore', remarks: 'Experience looks solid, pending HR verification call.', status: 'Under Review', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-3', appliedDate: '2025-04-10' },
    // Status: Rejected (at collection stage)
    { id: 7, name: 'Imran Abbas', positionAppliedFor: 'Consultant Physician', department: 'Medical Services', section: 'Internal Medicine', cnic: '35202-7890123-7', qualification: 'MBBS', experienceYears: 3, organization: 'Private Clinic', contact: '0322-7778899', city: 'Lahore', remarks: 'Initial screening failed.', status: 'Rejected', rejectionRemarks: 'Candidate does not have the required FCPS qualification for a consultant role.', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-03' },
    { id: 8, name: 'Sadia Noreen', positionAppliedFor: 'Software Engineer', department: 'ICT', section: 'Software Development', cnic: '35202-8901234-8', qualification: 'BS English', experienceYears: 2, organization: 'Content Firm', contact: '0334-8889900', city: 'Karachi', remarks: 'CV does not match job requirements.', status: 'Rejected', rejectionRemarks: 'Irrelevant educational background for a technical role.', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-21' },
    
    // --- Stage 7: Departmental Review ---
    // Status: Sent to Department
    { id: 9, name: 'Fahad Butt', positionAppliedFor: 'Sr. Database Administrator', department: 'ICT', section: 'Infrastructure', cnic: '35202-9012345-9', qualification: 'MCS', experienceYears: 6, organization: 'Data Corp', contact: '0301-9990011', city: 'Islamabad', remarks: 'CV passed HR screening, sent to ICT for technical review.', status: 'Sent to Department', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-14' },
    { id: 10, name: 'Hina Riaz', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35202-0123456-0', qualification: 'MBBS', experienceYears: 1, organization: 'Jinnah Hospital', contact: '0346-0001122', city: 'Lahore', remarks: 'Forwarded to Dr. Ahmed for evaluation.', status: 'Sent to Department', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-05' },
    { id: 11, name: 'Zainab Qayyum', positionAppliedFor: 'Accountant', department: 'Finance', section: 'Accounts', cnic: '35202-1122334-1', qualification: 'ACCA', experienceYears: 4, organization: 'Multinational Inc.', contact: '0321-1122334', city: 'Lahore', remarks: 'Awaiting feedback from Finance department.', status: 'Sent to Department', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-4', appliedDate: '2025-02-28' },
    { id: 12, name: 'Bilal Lashari', positionAppliedFor: 'Network Administrator', department: 'ICT', section: 'Infrastructure', cnic: '35202-2233445-2', qualification: 'BS IT', experienceYears: 5, organization: 'ISP Provider', contact: '0300-2233445', city: 'Lahore', remarks: 'Pending review from Infrastructure head.', status: 'Sent to Department', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-25' },
    { id: 13, name: 'Maria Wasti', positionAppliedFor: 'HR Manager', department: 'Human Resource', section: 'Operations', cnic: '35202-3344556-3', qualification: 'MPA', experienceYears: 6, organization: 'FMCG Company', contact: '0321-3344556', city: 'Sialkot', remarks: 'Sent to Director HR for review.', status: 'Sent to Department', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-26' },

    // --- Stage 8: Final Shortlisting ---
    // Status: Recommended by Department
    { id: 14, name: 'Ahmed Ali', positionAppliedFor: 'Sr. Database Administrator', department: 'ICT', section: 'Infrastructure', cnic: '35202-4455667-4', qualification: 'MS IT', experienceYears: 8, organization: 'Tech Solutions Inc.', contact: '0333-4455667', city: 'Karachi', remarks: 'Dept head: "Strong candidate, recommend shortlisting".', status: 'Recommended by Department', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-13' },
    { id: 15, name: 'Saima Noor', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35202-5566778-5', qualification: 'MBBS', experienceYears: 2, organization: 'Services Hospital', contact: '0345-5566778', city: 'Lahore', remarks: 'Recommended by clinical department head.', status: 'Recommended by Department', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-04' },
    { id: 16, name: 'Waqas Younis', positionAppliedFor: 'Finance Manager', department: 'Finance', section: 'Accounts', cnic: '35202-6677889-6', qualification: 'CMA', experienceYears: 7.2, organization: 'Manufacturing Co.', contact: '0312-6677889', city: 'Gujranwala', remarks: 'Finance Director has approved for shortlisting.', status: 'Recommended by Department', panelNominationStatus: 'Pending Nomination', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-4', appliedDate: '2025-03-01' },
    
    // --- Stage 9: Interview Process ---
    // Status: Shortlisted for Interview (Pending Panel Nomination)
    { id: 19, name: 'Fawad Khan', positionAppliedFor: 'Senior Manager', department: 'ICT', section: 'Management', cnic: '35202-9900112-9', qualification: 'MBA', experienceYears: 12, organization: 'Consulting Firm', contact: '0333-9900112', city: 'Lahore', remarks: 'Fee verified. Ready for panel nomination.', status: 'Shortlisted for Interview', panelNominationStatus: 'Pending Nomination', interviewPanel: [], shortlistingRemarks: 'Excellent profile with strong leadership experience. Top priority candidate.', preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-11' },
    { id: 20, name: 'Saba Qamar', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35202-1011223-0', qualification: 'MBBS', experienceYears: 3, organization: 'DHQ Hospital', contact: '0345-1011223', city: 'Lahore', remarks: 'Fee verified. Pending panel.', status: 'Shortlisted for Interview', panelNominationStatus: 'Pending Nomination', interviewPanel: [], shortlistingRemarks: 'Good clinical experience for an MO role. Recommended by department.', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-07' },
    { id: 21, name: 'Shaan Shahid', positionAppliedFor: 'Finance Manager', department: 'Finance', section: 'Accounts', cnic: '35202-2122334-1', qualification: 'MBA Finance', experienceYears: 8, organization: 'Bank', contact: '0300-2122334', city: 'Karachi', remarks: 'Awaiting panel assignment.', status: 'Shortlisted for Interview', panelNominationStatus: 'Pending Nomination', interviewPanel: [], shortlistingRemarks: 'Solid financial background. Fee verified.', preInterviewFormSent: false, adReference: 'AD-4', appliedDate: '2025-03-05' },
    { id: 22, name: 'Mehwish Hayat', positionAppliedFor: 'Software Engineer', department: 'ICT', section: 'Software Development', cnic: '35202-3233445-2', qualification: 'BSCS', experienceYears: 4, organization: 'Game Studio', contact: '0321-3233445', city: 'Lahore', remarks: 'Candidate shortlisted. Needs panel.', status: 'Shortlisted for Interview', panelNominationStatus: 'Pending Nomination', interviewPanel: [], shortlistingRemarks: 'Strong technical skills in required stack. Fee verified.', preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-20' },
    
    // Status: Shortlisted for Interview (Panel Nominated)
    { id: 23, name: 'Humayun Saeed', positionAppliedFor: 'Senior Manager', department: 'ICT', section: 'Management', cnic: '35202-4344556-3', qualification: 'MS Management', experienceYears: 11, organization: 'IT Services Co.', contact: '0313-4344556', city: 'Islamabad', remarks: 'Panel nominated. Ready for scheduling.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Dr. Aisha Latif', role: 'Director HR', status: 'Pending', notified: false }, { name: 'Mr. Khalid Mehmood', role: 'Head of Department ICT', status: 'Pending', notified: false }], interviewStatus: 'Scheduled', interviewTime: '2025-11-29T11:00', preInterviewFormSent: true, preInterviewFormSubmitted: false, adReference: 'AD-1', appliedDate: '2025-10-22', attendanceStatus: 'Pending', documentChecklist: {} },
    { id: 24, name: 'Sohail Ahmed', positionAppliedFor: 'Registrar', department: 'Medical Services', section: 'Internal Medicine', cnic: '35202-5455667-4', qualification: 'FCPS', experienceYears: 6, organization: 'Shaukat Khanum', contact: '0322-5455667', city: 'Lahore', remarks: 'Medical board assigned. Scheduling in progress.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Medical Director / Representative', role: 'Chairperson', status: 'Available', notified: true }, { name: 'Chairman of Department', role: 'Member', status: 'Pending', notified: false }], interviewTime: '2025-11-28T10:00', interviewStatus: 'Scheduled', preInterviewFormSent: true, preInterviewFormSubmitted: true, preInterviewFormData: { '1st Prof Marks': '650 / 800', '2nd Prof Marks': '680 / 800', '3rd Prof Marks': '710 / 800', '4th Prof Marks': '700 / 800', '5th Prof Marks': '720 / 800', '1st Prof Attempts': 1, '2nd Prof Attempts': 1, '3rd Prof Attempts': 1, '4th Prof Attempts': 2, '5th Prof Attempts': 1, 'IMM Exam': 'Yes', 'IMM Exam Date': '2024-03-15', 'Graduating Institute': 'King Edward Medical University', 'House Job Hospital': 'Mayo Hospital, Lahore', 'Is Govt Teaching Institute': 'Yes', 'Is attached to Graduating Institute': 'Yes', 'University Positions': ['1. Gold Medal in Physiology'], 'Research Papers': ['1. "Effects of... " - Journal of Medicine, 2023'], }, adReference: 'AD-2', appliedDate: '2025-11-08', attendanceStatus: 'Pending', documentChecklist: {} },
    // FIX: Changed comments from string to object to align with new PanelEvaluation type.
    { id: 25, name: 'Bushra Ansari', positionAppliedFor: 'HR Manager', department: 'Human Resource', section: 'Operations', cnic: '35202-6566778-5', qualification: 'MBA HR', experienceYears: 7, organization: 'University', contact: '0300-6566778', city: 'Lahore', remarks: 'Panel is set.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Hospital Director / Representative', role: 'Chairperson', status: 'Available', notified: true }, { name: 'HOD of Concerned Department', role: 'Member', status: 'Available', notified: true }], interviewStatus: 'Completed', evaluation: [{ panelMemberName: 'Hospital Director / Representative', scores: { 'Leadership': 9, 'HR Knowledge': 8, 'Communication': 9 }, comments: { 'General': 'Very strong candidate.'}}, { panelMemberName: 'HOD of Concerned Department', scores: { 'Leadership': 8, 'HR Knowledge': 9, 'Communication': 8 }, comments: { 'General': 'Excellent fit for the role.'}}], preInterviewFormSent: false, currentSalary: 250000, expectedSalary: 300000, adReference: 'AD-1', appliedDate: '2025-10-28' },

    // --- Stage 10 & Beyond ---
    { id: 26, name: 'Zahid Mehmood', positionAppliedFor: 'Senior Manager', department: 'ICT', section: 'Management', cnic: '35202-6789012-6', qualification: 'MBA', experienceYears: 8, organization: 'Corporate Firm', contact: '0313-6667788', city: 'Lahore', remarks: 'Top performer in interview.', status: 'Recommended for Hire', panelNominationStatus: 'Panel Nominated', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-29', currentSalary: 380000, expectedSalary: 450000 },
    { id: 27, name: 'Resham', positionAppliedFor: 'Admin Manager', department: 'Administration', section: 'Patient Relations', cnic: '35202-1212121-1', qualification: 'Masters in Public Relations', experienceYears: 10, organization: 'Hotel Group', contact: '0300-1212121', city: 'Lahore', remarks: 'Strong candidate for patient-facing role.', status: 'Recommended for Hire', panelNominationStatus: 'Panel Nominated', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-4', appliedDate: '2025-03-10', currentSalary: 180000, expectedSalary: 220000 },
    { id: 201, name: 'Dr. Imran Farooq', positionAppliedFor: 'Consultant Nephrology', department: 'Medical Services', section: 'Nephrology', cnic: '35201-1112223-1', qualification: 'FCPS', experienceYears: 7, organization: 'Shifa International', contact: '0300-1234567', city: 'Islamabad', remarks: 'Highly recommended by the panel for his expertise in transplant nephrology.', status: 'Recommended for Hire', panelNominationStatus: 'Panel Nominated', interviewPanel: [], interviewStatus: 'Completed', currentSalary: 500000, expectedSalary: 600000 },
    { id: 202, name: 'Asad Ali', positionAppliedFor: 'Finance Manager', department: 'Finance', section: 'Accounts', cnic: '35201-2223334-2', qualification: 'ACCA', experienceYears: 6.7, organization: 'EY Ford Rhodes', contact: '0321-7654321', city: 'Lahore', remarks: 'Strong financial acumen demonstrated in the interview.', status: 'Recommended for Hire', panelNominationStatus: 'Panel Nominated', interviewPanel: [], interviewStatus: 'Completed', currentSalary: 280000, expectedSalary: 350000 },
    { id: 203, name: 'Sana Bilal', positionAppliedFor: 'HR Officer', department: 'Human Resource', section: 'Talent Acquisition', cnic: '35201-3334445-3', qualification: 'BBA HR', experienceYears: 2.2, organization: 'Local Firm', contact: '0333-1122334', city: 'Karachi', remarks: 'Good potential, fits the team well.', status: 'Recommended for Hire', panelNominationStatus: 'Panel Nominated', interviewPanel: [], interviewStatus: 'Completed', currentSalary: 60000, expectedSalary: 75000 },
    { id: 28, name: 'Adnan Siddiqui', positionAppliedFor: 'Consultant Physician', department: 'Medical Services', section: 'Internal Medicine', cnic: '35202-7890123-7', qualification: 'FCPS', experienceYears: 5, organization: 'City Hospital', contact: '0322-7778899', city: 'Lahore', remarks: 'Final approval received.', status: 'Approved for Hire', panelNominationStatus: 'Panel Nominated', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-09', finalSalary: 480000 },
    { id: 29, name: 'Samiya Mumtaz', positionAppliedFor: 'Software Engineer', department: 'ICT', section: 'Software Development', cnic: '35202-8901234-8', qualification: 'BSCS', experienceYears: 3, organization: 'Startup Hub', contact: '0334-8889900', city: 'Karachi', remarks: 'Offer sent, awaiting response.', status: 'Offer Sent', panelNominationStatus: 'Panel Nominated', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-23', finalSalary: 110000 },
    { id: 30, name: 'Nauman Ijaz', positionAppliedFor: 'Finance Manager', department: 'Finance', section: 'Accounts', cnic: '35202-9012345-9', qualification: 'ACCA', experienceYears: 6, organization: 'Audit Firm', contact: '0301-9990011', city: 'Islamabad', remarks: 'Offer accepted, medical pending.', status: 'Offer Accepted', panelNominationStatus: 'Panel Nominated', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-4', appliedDate: '2025-03-11', finalSalary: 320000 },
    { id: 31, name: 'Irfan Khoosat', positionAppliedFor: 'HR Officer', department: 'Human Resource', section: 'Talent Acquisition', cnic: '35202-0123456-0', qualification: 'BBA', experienceYears: 2.8, organization: 'Recruitment Agency', contact: '0346-0001122', city: 'Lahore', remarks: 'Medically fit, verification pending.', status: 'Pending Verification', panelNominationStatus: 'Panel Nominated', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-24' },
    { id: 32, name: 'Sania Saeed', positionAppliedFor: 'Charge Nurse', department: 'Medical Services', section: 'Nursing', cnic: '35202-1122334-1', qualification: 'BScN', experienceYears: 5, organization: 'Private Clinic', contact: '0321-1122334', city: 'Lahore', remarks: 'Fully onboarded.', status: 'Hired', panelNominationStatus: 'Panel Nominated', interviewPanel: [], preInterviewFormSent: false, adReference: 'AD-3', appliedDate: '2025-04-15' },
    // New Medical Candidates for Form Testing
    { id: 33, name: 'Dr. Amna Khan', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35201-1111111-1', qualification: 'MBBS', experienceYears: 2, organization: 'City Hospital', contact: '0301-1234567', city: 'Lahore', remarks: 'Ready for scheduling', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Medical Director / Representative', role: 'Chairperson', status: 'Pending', notified: false }], interviewStatus: 'Pending Schedule', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-10' },
    { id: 34, name: 'Dr. Bilal Ahmed', positionAppliedFor: 'Registrar', department: 'Medical Services', section: 'Internal Medicine', cnic: '35201-2222222-2', qualification: 'MBBS, FCPS Part 1', experienceYears: 4, organization: 'National Hospital', contact: '0302-2345678', city: 'Lahore', remarks: 'Panel set, ready for interview.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Medical Director / Representative', role: 'Chairperson', status: 'Available', notified: true }, { name: 'Chairman of Department', role: 'Member', status: 'Available', notified: true }], interviewStatus: 'Completed', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-11' },
    { id: 35, name: 'Dr. Sana Javed', positionAppliedFor: 'Senior Registrar', department: 'Medical Services', section: 'Pediatrics', cnic: '35201-3333333-3', qualification: 'MBBS, FCPS', experienceYears: 6, organization: 'Children Hospital', contact: '0303-3456789', city: 'Lahore', remarks: 'Awaiting schedule confirmation.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Medical Director / Representative', role: 'Chairperson', status: 'Pending', notified: false }], interviewStatus: 'Pending Schedule', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-12' },
    { id: 36, name: 'Dr. Omar Farooq', positionAppliedFor: 'Clinical Fellow', department: 'Medical Services', section: 'Hepatology', cnic: '35201-4444444-4', qualification: 'MBBS, FCPS', experienceYears: 5, organization: 'PKLI & RC', contact: '0304-4567890', city: 'Lahore', remarks: 'Internal candidate.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Medical Director / Representative', role: 'Chairperson', status: 'Available', notified: true }], interviewStatus: 'Scheduled', interviewTime: '2025-12-02T11:00', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-13', attendanceStatus: 'Pending', documentChecklist: {} },
    { id: 37, name: 'Dr. Hina Riaz', positionAppliedFor: 'Post Graduate Resident', department: 'Medical Services', section: 'General Medicine', cnic: '35201-5555555-5', qualification: 'MBBS', experienceYears: 1, organization: 'House Job Completed', contact: '0305-5678901', city: 'Lahore', remarks: 'Fresh candidate for residency.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Dr. Aisha Latif', role: 'Director HR', status: 'Pending', notified: true }], interviewStatus: 'Completed', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-14' },
    // FIX: Corrected the malformed final candidate object which was causing a type error.
    { id: 38, name: 'Dr. Kashif Mehmood', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'Emergency', cnic: '35201-6666666-6', qualification: 'MBBS', experienceYears: 3, organization: 'Services Hospital', contact: '0306-6667788', city: 'Lahore', remarks: 'Experienced in emergency medicine.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Medical Director / Representative', role: 'Chairperson', status: 'Pending', notified: false }], interviewStatus: 'Pending Schedule', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-15' },
    // New Candidates for Evaluation Forms
    { id: 39, name: 'Dr. Zoya Ali', positionAppliedFor: 'Director Medical Services', department: 'Administration', section: 'Management', cnic: '35201-7777777-7', qualification: 'MBBS, MBA', experienceYears: 15, organization: 'National Hospital', contact: '0307-7778899', city: 'Lahore', remarks: 'Highly experienced candidate.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Dean PKLI-HCS', role: 'Chairperson', status: 'Available', notified: true }, { name: 'Hospital Director', role: 'Member', status: 'Available', notified: true }], interviewStatus: 'Completed', preInterviewFormSent: false, currentSalary: 500000, expectedSalary: 600000, evaluation: [{ panelMemberName: 'Dean PKLI-HCS', scores: { 'leadership': 13, 'work_experience': 9, 'governance': 12, 'knowledge': 14, 'finance': 11, 'resource': 13, 'appearance': 12 }, comments: {}},{ panelMemberName: 'Hospital Director', scores: { 'leadership': 14, 'work_experience': 8, 'governance': 13, 'knowledge': 13, 'finance': 12, 'resource': 12, 'appearance': 14 }, comments: {}}], adReference: 'AD-2', appliedDate: '2025-11-01' },
    { id: 40, name: 'Dr. Fatima Iqbal', positionAppliedFor: 'Consultant', department: 'Medical Services', section: 'Hepatology', cnic: '35201-8888888-8', qualification: 'FCPS Hepatology', experienceYears: 7, organization: 'PKLI', contact: '0308-8889900', city: 'Lahore', remarks: 'Internal candidate, strong performer.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Dean PKLI-HCS', role: 'Chairperson', status: 'Available', notified: true }, { name: 'Medical Director', role: 'Member', status: 'Available', notified: true }], interviewStatus: 'Completed', preInterviewFormSent: false, currentSalary: 350000, expectedSalary: 420000, evaluation: [{ panelMemberName: 'Dean PKLI-HCS', scores: { 'clinical_skills': 18, 'knowledge': 4, 'work_experience': 5, 'governance': 4, 'appearance': 5 }, comments: {}},{ panelMemberName: 'Medical Director', scores: { 'clinical_skills': 17, 'knowledge': 5, 'work_experience': 4, 'governance': 5, 'appearance': 4 }, comments: {}}], adReference: 'AD-2', appliedDate: '2025-11-02' },
    { id: 41, name: 'Asif Raza', positionAppliedFor: 'Admin Officer', department: 'Administration', section: 'General Administration', cnic: '35201-9999999-9', qualification: 'MPA', experienceYears: 5, organization: 'Govt. Sector', contact: '0309-9990011', city: 'Lahore', remarks: 'Solid administrative background.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Hospital Director', role: 'Chairperson', status: 'Available', notified: true }, { name: 'Director HR', role: 'Member', status: 'Available', notified: true }], interviewStatus: 'Completed', preInterviewFormSent: false, currentSalary: 120000, expectedSalary: 150000, evaluation: [{ panelMemberName: 'Hospital Director', scores: { 'qualification': 4, 'work_experience': 5, 'technical_knowledge': 4, 'communication': 5, 'personality': 4 }, comments: {}},{ panelMemberName: 'Director HR', scores: { 'qualification': 5, 'work_experience': 4, 'technical_knowledge': 4, 'communication': 4, 'personality': 5 }, comments: {}}], adReference: 'AD-4', appliedDate: '2025-03-12' },
    
    // --- Additional candidates for "My Nominations" ---
    { id: 42, name: 'Bilal Ashraf', positionAppliedFor: 'Senior Manager', department: 'ICT', section: 'Management', cnic: '35202-1231231-1', qualification: 'MBA', experienceYears: 10, organization: 'Tech Innovations', contact: '0301-1231231', city: 'Lahore', remarks: 'Panel nominated.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Dr. Aisha Latif', role: 'Director HR', status: 'Pending', notified: false }, { name: 'Mr. Khalid Mehmood', role: 'Head of Department ICT', status: 'Pending', notified: false }], interviewStatus: 'Scheduled', interviewTime: '2025-11-29T11:00', preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-23', attendanceStatus: 'Pending', documentChecklist: {} },
    { id: 43, name: 'Imran Abbas Naqvi', positionAppliedFor: 'Senior Manager', department: 'ICT', section: 'Management', cnic: '35202-2342342-2', qualification: 'MS Project Management', experienceYears: 13, organization: 'Global Solutions', contact: '0302-2342342', city: 'Karachi', remarks: 'Panel nominated.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Dr. Aisha Latif', role: 'Director HR', status: 'Pending', notified: false }, { name: 'Mr. Khalid Mehmood', role: 'Head of Department ICT', status: 'Pending', notified: false }], interviewStatus: 'Scheduled', interviewTime: '2025-11-29T11:00', preInterviewFormSent: false, adReference: 'AD-1', appliedDate: '2025-10-24', attendanceStatus: 'Pending', documentChecklist: {} },
    { id: 44, name: 'Feroze Khan', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35202-3453453-3', qualification: 'MBBS', experienceYears: 4, organization: 'Lahore General Hospital', contact: '0303-3453453', city: 'Lahore', remarks: 'Panel nominated.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Dr. Aisha Latif', role: 'Director HR', status: 'Pending', notified: true }], interviewStatus: 'Scheduled', interviewTime: '2025-12-01T10:00', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-16', attendanceStatus: 'Pending', documentChecklist: {} },
    { id: 45, name: 'Danish Taimoor', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35202-4564564-4', qualification: 'MBBS', experienceYears: 2, organization: 'Jinnah Hospital', contact: '0304-4564564', city: 'Lahore', remarks: 'Panel nominated.', status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Dr. Aisha Latif', role: 'Director HR', status: 'Pending', notified: true }], interviewStatus: 'Scheduled', interviewTime: '2025-12-01T10:00', preInterviewFormSent: false, adReference: 'AD-2', appliedDate: '2025-11-17', attendanceStatus: 'Pending', documentChecklist: {} },

    // --- Candidates for Candidate Comparison Screen ---
    {
        id: 101, name: 'Dr. Ali Raza', cnic: '35201-1234567-1', positionAppliedFor: 'Consultant Nephrology', department: 'Medical Services', section: 'Nephrology',
        qualification: 'FCPS (Nephrology)', experienceYears: 5, status: 'Shortlisted for Interview',
        keySkills: ['Dialysis', 'CRRT', 'Transplant'],
        expectedSalary: 450000,
        interviewPanel: [
            { name: 'Dr. Panelist A', role: 'Member', status: 'Available', notified: true },
            { name: 'Dr. Panelist B', role: 'Member', status: 'Available', notified: true },
            { name: 'Dr. Panelist C', role: 'Member', status: 'Available', notified: true },
        ],
        evaluation: [
            { panelMemberName: 'Dr. Panelist A', scores: { 'clinical_skills': 15, 'knowledge': 4, 'work_experience': 5, 'governance': 4, 'appearance': 5 }, comments: {} },
            { panelMemberName: 'Dr. Panelist B', scores: { 'clinical_skills': 16, 'knowledge': 5, 'work_experience': 4, 'governance': 4, 'appearance': 5 }, comments: {} },
            { panelMemberName: 'Dr. Panelist C', scores: { 'clinical_skills': 15, 'knowledge': 4, 'work_experience': 5, 'governance': 5, 'appearance': 4 }, comments: {} },
        ],
        organization: 'City Hospital', contact: '0300-0000001', city: 'Lahore', remarks: '', panelNominationStatus: 'Panel Nominated', interviewStatus: 'Completed',
        currentSalary: 400000, recommendedDesignation: 'Consultant'
    },
    {
        id: 102, name: 'Dr. Sana Hamid', cnic: '35201-2345678-2', positionAppliedFor: 'Consultant Nephrology', department: 'Medical Services', section: 'Nephrology',
        qualification: 'MD (Nephrology)', experienceYears: 7, status: 'Offer Sent',
        keySkills: ['Glomerular diseases', 'Hypertension'],
        expectedSalary: 500000,
        interviewPanel: [
            { name: 'Dr. Panelist A', role: 'Member', status: 'Available', notified: true },
            { name: 'Dr. Panelist B', role: 'Member', status: 'Available', notified: true },
            { name: 'Dr. Panelist C', role: 'Member', status: 'Available', notified: true },
        ],
        evaluation: [
            { panelMemberName: 'Dr. Panelist A', scores: { 'clinical_skills': 17, 'knowledge': 5, 'work_experience': 5, 'governance': 4, 'appearance': 5 }, comments: {} },
            { panelMemberName: 'Dr. Panelist B', scores: { 'clinical_skills': 18, 'knowledge': 5, 'work_experience': 5, 'governance': 5, 'appearance': 4 }, comments: {} },
            { panelMemberName: 'Dr. Panelist C', scores: { 'clinical_skills': 18, 'knowledge': 4, 'work_experience': 5, 'governance': 5, 'appearance': 5 }, comments: {} },
        ],
        organization: 'National Hospital', contact: '0300-0000002', city: 'Lahore', remarks: '', panelNominationStatus: 'Panel Nominated', interviewStatus: 'Completed',
        currentSalary: 450000, recommendedDesignation: 'Consultant'
    },
    {
        id: 103, name: 'Dr. Omar Farooq', cnic: '35201-3456789-3', positionAppliedFor: 'Consultant Nephrology', department: 'Medical Services', section: 'Nephrology',
        qualification: 'FCPS (Nephrology)', experienceYears: 4, status: 'Shortlisted for Interview',
        keySkills: ['Dialysis', 'Renal Biopsy'],
        expectedSalary: 420000,
        interviewPanel: [
            { name: 'Dr. Panelist A', role: 'Member', status: 'Available', notified: true },
            { name: 'Dr. Panelist B', role: 'Member', status: 'Available', notified: true },
            { name: 'Dr. Panelist C', role: 'Member', status: 'Available', notified: true },
        ],
        evaluation: [
            { panelMemberName: 'Dr. Panelist A', scores: { 'clinical_skills': 14, 'knowledge': 4, 'work_experience': 4, 'governance': 4, 'appearance': 4 }, comments: {} },
            { panelMemberName: 'Dr. Panelist B', scores: { 'clinical_skills': 15, 'knowledge': 4, 'work_experience': 5, 'governance': 3, 'appearance': 4 }, comments: {} },
            { panelMemberName: 'Dr. Panelist C', scores: { 'clinical_skills': 13, 'knowledge': 5, 'work_experience': 4, 'governance': 4, 'appearance': 3 }, comments: {} },
        ],
        organization: 'General Hospital', contact: '0300-0000003', city: 'Lahore', remarks: '', panelNominationStatus: 'Panel Nominated', interviewStatus: 'Completed',
        currentSalary: 380000, recommendedDesignation: 'Associate Consultant'
    },
     {
        id: 104, name: 'Zain Malik', cnic: '35201-4567890-4', positionAppliedFor: 'Software Engineer', department: 'ICT', section: 'Software Development',
        qualification: 'BSCS', experienceYears: 3, status: 'Recommended for Hire',
        keySkills: ['React', 'Node.js', 'AWS'],
        expectedSalary: 120000,
        interviewPanel: [
            { name: 'Mr. Khalid Mehmood', role: 'Member', status: 'Available', notified: true },
            { name: 'Mr. Bilal Chaudhry', role: 'Member', status: 'Available', notified: true },
        ],
        evaluation: [
            { panelMemberName: 'Mr. Khalid Mehmood', scores: { 'qualification': 5, 'work_experience': 4, 'technical_knowledge': 5, 'communication': 4, 'personality': 4 }, comments: {} },
            { panelMemberName: 'Mr. Bilal Chaudhry', scores: { 'qualification': 4, 'work_experience': 5, 'technical_knowledge': 5, 'communication': 5, 'personality': 4 }, comments: {} },
        ],
        organization: 'Systems Limited', contact: '0300-0000004', city: 'Lahore', remarks: 'Strong technical skills.', panelNominationStatus: 'Panel Nominated', interviewStatus: 'Completed',
        currentSalary: 100000, recommendedDesignation: 'Software Engineer'
    },
    {
        id: 105, name: 'Fatima Ali', cnic: '35201-5678901-5', positionAppliedFor: 'Software Engineer', department: 'ICT', section: 'Software Development',
        qualification: 'BSSE', experienceYears: 2, status: 'Rejected', interviewStatus: 'Completed',
        keySkills: ['Angular', 'Python', 'Azure'],
        expectedSalary: 110000,
        interviewPanel: [
            { name: 'Mr. Khalid Mehmood', role: 'Member', status: 'Available', notified: true },
            { name: 'Mr. Bilal Chaudhry', role: 'Member', status: 'Available', notified: true },
        ],
        evaluation: [
            { panelMemberName: 'Mr. Khalid Mehmood', scores: { 'qualification': 4, 'work_experience': 3, 'technical_knowledge': 3, 'communication': 4, 'personality': 4 }, comments: {} },
            { panelMemberName: 'Mr. Bilal Chaudhry', scores: { 'qualification': 4, 'work_experience': 3, 'technical_knowledge': 4, 'communication': 3, 'personality': 3 }, comments: {} },
        ],
        organization: 'Contour Software', contact: '0300-0000005', city: 'Karachi', remarks: 'Lacks experience in our core tech stack.', panelNominationStatus: 'Panel Nominated',
        currentSalary: 90000, recommendedDesignation: 'Software Engineer'
    },
     // --- Additional candidates for later stages ---
    { id: 204, name: 'Hamza Abbasi', positionAppliedFor: 'Accountant', department: 'Finance', section: 'Accounts', cnic: '35201-4445556-4', qualification: 'B.Com', experienceYears: 3.5, organization: 'Local Retailer', contact: '0344-1122334', city: 'Lahore', remarks: 'Approved by hiring manager.', status: 'Approved for Hire', panelNominationStatus: 'Panel Nominated', interviewPanel: [], finalSalary: 95000 },
    { id: 205, name: 'Maya Ali', positionAppliedFor: 'Staff Nurse', department: 'Medical Services', section: 'Nursing', cnic: '35201-5556667-5', qualification: 'Diploma in Nursing', experienceYears: 4, organization: 'Fatima Memorial', contact: '0315-2233445', city: 'Lahore', remarks: 'Offer letter sent.', status: 'Offer Sent', panelNominationStatus: 'Panel Nominated', interviewPanel: [], finalSalary: 105000 },
    // FIX: Completed the malformed final candidate object which was causing a syntax and type error.
    { id: 206, name: 'Osman Khalid Butt', positionAppliedFor: 'Staff Nurse', department: 'Medical Services', section: 'Nursing', cnic: '35201-6667778-6', qualification: 'BScN', experienceYears: 2, organization: 'Shalamar Hospital', contact: '0300-6667788', city: 'Lahore', remarks: 'Medically fit, verification pending.', status: 'Pending Verification', panelNominationStatus: 'Panel Nominated', interviewPanel: [] },
    // New candidates for Attendance Page
    { 
        id: 50, name: 'Amina Sheikh', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35201-1111111-9', qualification: 'MBBS', experienceYears: 2, organization: 'Lahore General Hospital', contact: '0300-1111119', city: 'Lahore', remarks: 'Scheduled for interview.', 
        status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Medical Director', role: 'Chairperson', status: 'Available', notified: true }],
        interviewStatus: 'Scheduled', interviewTime: `${new Date().toISOString().split('T')[0]}T10:00`,
        attendanceStatus: 'Pending', documentChecklist: {}
    },
    { 
        id: 51, name: 'Fahad Mustafa', positionAppliedFor: 'Software Engineer', department: 'ICT', section: 'Software Development', cnic: '35201-2222222-9', qualification: 'BSCS', experienceYears: 3, organization: 'NetSol', contact: '0300-2222229', city: 'Lahore', remarks: 'Scheduled for interview.', 
        status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Mr. Khalid Mehmood', role: 'Head of Department ICT', status: 'Available', notified: true }],
        interviewStatus: 'Scheduled', interviewTime: `${new Date().toISOString().split('T')[0]}T11:30`,
        attendanceStatus: 'Pending', documentChecklist: {}
    },
    { 
        id: 52, name: 'Sajal Aly', positionAppliedFor: 'Staff Nurse', department: 'Medical Services', section: 'Nursing', cnic: '35201-3333333-9', qualification: 'BScN', experienceYears: 4, organization: 'Shalamar Hospital', contact: '0300-3333339', city: 'Lahore', remarks: 'Scheduled for interview.', 
        status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Nursing Director', role: 'Chairperson', status: 'Available', notified: true }],
        interviewStatus: 'Scheduled', interviewTime: `${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}T09:00`,
        attendanceStatus: 'Pending', documentChecklist: {}
    },
    { 
        id: 53, name: 'Ahsan Khan', positionAppliedFor: 'Admin Officer', department: 'Administration', section: 'General Administration', cnic: '35201-4444444-9', qualification: 'BBA', experienceYears: 5, organization: 'Packages Mall', contact: '0300-4444449', city: 'Lahore', remarks: 'Scheduled for interview.', 
        status: 'Shortlisted for Interview', panelNominationStatus: 'Panel Nominated', interviewPanel: [{ name: 'Hospital Director', role: 'Chairperson', status: 'Available', notified: true }],
        interviewStatus: 'Scheduled', interviewTime: `${new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}T14:00`,
        attendanceStatus: 'Present', documentChecklist: { 'Original CNIC': true, 'Updated CV / Resume (x2)': true }
    }
];