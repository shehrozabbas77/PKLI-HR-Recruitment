import React, { useState, useMemo, useEffect } from 'react';
import type { Requisition, RequisitionStatus, StaffingPosition, ApprovalStep, JobDescription, JobAdvertisement } from '../types';
import { Card, CardContent } from '../components/Card';
import { Modal } from '../components/Modal';
import { ApprovalWorkflow } from '../components/ApprovalWorkflow';
import { ApprovalModal } from '../components/ApprovalModal';
import { UserIcon, BuildingIcon, BriefcaseIcon, CheckIcon, XIcon, FilePlusIcon, HistoryIcon, HourglassIcon, EditIcon } from '../components/icons';
import { departmentSections } from '../constants';

interface RequisitionProps {
  requisitions: Requisition[];
  setRequisitions: React.Dispatch<React.SetStateAction<Requisition[]>>;
  staffingPlan: StaffingPosition[];
  jobDescriptions: JobDescription[];
  advertisements: JobAdvertisement[];
}

const ActivityLog: React.FC<{ requisition: Requisition }> = ({ requisition }) => {
    // Combine requested event and history events
    const timeline = [
        {
            status: 'Created' as const,
            role: 'Requester',
            approver: requisition.requestedBy,
            date: requisition.requestedDate,
            comments: `Initial Justification: ${requisition.justification}`,
        },
        ...requisition.approvalHistory
    ];

    const timeSince = (date: string | undefined): string => {
        if (!date) return '';
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div>
            <h4 className="font-semibold text-lg text-gray-800 my-4">Activity Log</h4>
            <div className="border-l-2 border-slate-200 ml-4 pl-8 space-y-8">
                {timeline.map((event, index) => {
                    const isPending = event.status === 'Pending';
                    const previousEventDate = index > 0 ? timeline[index - 1]?.date : requisition.requestedDate;
                    
                    const isReturn = event.status === 'Rejected' && requisition.status !== 'Rejected';

                    let icon;
                    let iconBg;
                    let title;

                    if (isReturn) {
                        icon = <HistoryIcon className="w-5 h-5 text-amber-600" />;
                        iconBg = 'bg-amber-100';
                        title = `Returned by ${event.approver || event.role}`;
                    } else {
                        switch (event.status) {
                            case 'Approved':
                            case 'Reviewed':
                                icon = <CheckIcon className="w-5 h-5 text-green-600" />;
                                iconBg = 'bg-green-100';
                                title = `${event.status} by ${event.approver || event.role}`;
                                break;
                            case 'Created':
                                icon = <CheckIcon className="w-5 h-5 text-green-600" />;
                                iconBg = 'bg-green-100';
                                title = `Request Created by ${event.approver}`;
                                break;
                            case 'Rejected':
                                icon = <XIcon className="w-5 h-5 text-red-600" />;
                                iconBg = 'bg-red-100';
                                title = `Rejected by ${event.approver || event.role}`;
                                break;
                            case 'Pending':
                                icon = <HourglassIcon className="w-5 h-5 text-blue-600" />;
                                iconBg = 'bg-blue-100';
                                title = `Pending ${event.role} Approval`;
                                break;
                            default:
                                icon = null;
                        }
                    }


                    return (
                        <div key={index} className="relative">
                            <div className={`absolute -left-[45px] top-1 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${iconBg}`}>
                                {icon}
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-gray-800">
                                        {title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {event.date ? new Date(event.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                                    </p>
                                </div>
                                {event.comments && (
                                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 border rounded-md italic">
                                        "{event.comments}"
                                    </p>
                                )}
                                {isPending && (
                                    <p className="mt-2 text-sm font-semibold text-blue-700">
                                        Pending for {timeSince(previousEventDate)}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const initialFormData = {
    reqId: '',
    position: '',
    department: '',
    section: '',
    type: 'Replacement' as 'New Position' | 'Replacement',
    qualification: '',
    experience: '',
    requiredSkills: '',
    licenseRequirement: 'No' as 'Yes' | 'No',
    numberOfPositions: 1,
    jobDescription: '',
    requestedBy: '',
    fiscalYear: '2026-2027',
    positionType: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'Visiting',
    budgetedStatus: 'Budgeted' as 'Budgeted' | 'Non-Budgeted',
    replacementFor: '',
    justification: '',
    supervisorName: '',
    supervisorUID: '',
    hodName: '',
    hodUID: '',
};

const RequisitionPage: React.FC<RequisitionProps> = ({ requisitions, setRequisitions, staffingPlan, jobDescriptions, advertisements }) => {
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRequisitionData, setNewRequisitionData] = useState(initialFormData);
  const [formError, setFormError] = useState<string>('');
  const [selectedPositionStaffingInfo, setSelectedPositionStaffingInfo] = useState<{ budgeted: number, onBoard: number; vacant: number } | null>(null);
  const [selectedJobDescription, setSelectedJobDescription] = useState<JobDescription | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [requisitionForHistory, setRequisitionForHistory] = useState<Requisition | null>(null);
  const [editingRequisition, setEditingRequisition] = useState<Requisition | null>(null);


  const approvedJobDescriptions = jobDescriptions.filter(jd => jd.status === 'Approved');

  const advertisementForSelected = selectedRequisition
    ? advertisements.find(ad => ad.positions.some(p => p.reqId === selectedRequisition.id))
    : null;
    
  const departments = useMemo(() => ['All Departments', ...Array.from(new Set(requisitions.map(r => r.department)))], [requisitions]);
  const sections = useMemo(() => {
    const relevantSections = departmentFilter === 'All Departments' 
        ? requisitions
        : requisitions.filter(r => r.department === departmentFilter);
    return ['All Sections', ...Array.from(new Set(relevantSections.map(r => r.section)))];
  }, [requisitions, departmentFilter]);
  const positions = useMemo(() => {
    let relevantRequisitions = requisitions;
    if (departmentFilter !== 'All Departments') {
        relevantRequisitions = relevantRequisitions.filter(r => r.department === departmentFilter);
    }
    if (sectionFilter !== 'All Sections') {
        relevantRequisitions = relevantRequisitions.filter(r => r.section === sectionFilter);
    }
    return ['All Positions', ...Array.from(new Set(relevantRequisitions.map(r => r.position)))];
  }, [requisitions, departmentFilter, sectionFilter]);

  const formDepartments = useMemo(() => [...new Set(staffingPlan.map(p => p.department))].sort(), [staffingPlan]);

  const designationsForSelectedDept = useMemo(() => {
    if (!newRequisitionData.department) return [];
    const departmentPositions = staffingPlan.filter(p => p.department === newRequisitionData.department);
    const designations = new Set(departmentPositions.map(p => p.designation));
    return Array.from(designations).sort();
  }, [staffingPlan, newRequisitionData.department]);

  const availableSections = useMemo(() => departmentSections[newRequisitionData.department] || [], [newRequisitionData.department]);


  const filteredRequisitions = useMemo(() => {
    const pendingStatuses: RequisitionStatus[] = [
      'Pending HOD Approval',
      'Pending Director/Dean Approval',
      'Pending HR Review',
      'Rejected',
      'Needs Revision'
    ];
    const approvedStatuses: RequisitionStatus[] = ['Approved'];
    
    const tabFiltered = requisitions.filter(req => {
        if (activeTab === 'pending') {
            return pendingStatuses.includes(req.status);
        }
        return approvedStatuses.includes(req.status);
    });
    
    return tabFiltered.filter(req => {
        const departmentMatch = departmentFilter === 'All Departments' || req.department === departmentFilter;
        const sectionMatch = sectionFilter === 'All Sections' || req.section === sectionFilter;
        const positionMatch = positionFilter === 'All Positions' || req.position === positionFilter;
        return departmentMatch && sectionMatch && positionMatch;
    });
  }, [requisitions, departmentFilter, sectionFilter, positionFilter, activeTab]);

  const handleViewDetails = (requisition: Requisition) => {
    setSelectedRequisition(requisition);
    setIsDetailsModalOpen(true);
  };
  
  const handleViewHistory = (e: React.MouseEvent, requisition: Requisition) => {
    e.stopPropagation();
    setRequisitionForHistory(requisition);
    setIsHistoryModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingRequisition(null);
    setNewRequisitionData(initialFormData);
    setFormError('');
    setSelectedPositionStaffingInfo(null);
    setSelectedJobDescription(null);
    setIsCreateModalOpen(true);
  }

  const handleEditClick = (e: React.MouseEvent, requisition: Requisition) => {
    e.stopPropagation();
    setEditingRequisition(requisition);

    setNewRequisitionData({
        reqId: requisition.reqId,
        position: requisition.position,
        department: requisition.department,
        section: requisition.section,
        type: requisition.type,
        qualification: requisition.qualification,
        experience: requisition.experience,
        requiredSkills: requisition.requiredSkills,
        licenseRequirement: requisition.licenseRequirement,
        numberOfPositions: requisition.numberOfPositions,
        jobDescription: requisition.jobDescription || '',
        requestedBy: requisition.requestedBy,
        fiscalYear: requisition.fiscalYear,
        positionType: requisition.positionType,
        budgetedStatus: requisition.budgetedStatus,
        replacementFor: requisition.replacementFor || '',
        justification: requisition.justification,
        supervisorName: requisition.supervisorName,
        supervisorUID: requisition.supervisorUID,
        hodName: requisition.hodName,
        hodUID: requisition.hodUID,
    });
    
    const positionInfo = staffingPlan.find(p => p.designation === requisition.position && p.department === requisition.department);
    if (positionInfo) {
        setSelectedPositionStaffingInfo({ budgeted: positionInfo.positions2526, onBoard: positionInfo.onBoard, vacant: positionInfo.vacant });
    } else {
        setSelectedPositionStaffingInfo(null);
    }
    
    const selectedJd = approvedJobDescriptions.find(jd => 
        jd.designation === requisition.position && 
        jd.department === requisition.department
    );
    setSelectedJobDescription(selectedJd || null);

    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    const openModal = () => handleOpenCreateModal();
    window.addEventListener('openCreateRequisitionModal', openModal);
    return () => {
      window.removeEventListener('openCreateRequisitionModal', openModal);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'department') {
        setNewRequisitionData(prev => ({ 
            ...initialFormData,
            department: value 
        }));
        setSelectedPositionStaffingInfo(null);
        setSelectedJobDescription(null);
    } else {
        setNewRequisitionData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleDesignationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDesignation = e.target.value;
    
    const selectedJd = approvedJobDescriptions.find(jd => 
        jd.designation === selectedDesignation && 
        jd.department === newRequisitionData.department
    );
    
    let newData = {
        ...newRequisitionData,
        position: selectedDesignation,
        section: '',
        qualification: '',
        experience: '',
        requiredSkills: '',
        licenseRequirement: 'No' as 'Yes' | 'No',
        jobDescription: '',
    };
    
    setSelectedJobDescription(selectedJd || null);

    if (selectedJd) {
        newData = {
            ...newData,
            section: selectedJd.section,
            qualification: Array.isArray(selectedJd.qualification) ? selectedJd.qualification.join(', ') : selectedJd.qualification,
            experience: selectedJd.experience,
            requiredSkills: Array.isArray(selectedJd.skills) ? selectedJd.skills.join(', ') : selectedJd.skills,
            licenseRequirement: Array.isArray(selectedJd.registrationLicense) && selectedJd.registrationLicense.some(lic => lic.toLowerCase() !== 'n/a') ? 'Yes' : 'No',
            jobDescription: `Internal JD #${selectedJd.id}`,
        };
    }
    
    setNewRequisitionData(newData);

    const positionInfo = staffingPlan.find(p => p.designation === selectedDesignation && p.department === newRequisitionData.department);
    if (positionInfo) {
        setSelectedPositionStaffingInfo({ budgeted: positionInfo.positions2526, onBoard: positionInfo.onBoard, vacant: positionInfo.vacant });
    } else {
        setSelectedPositionStaffingInfo(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newRequisitionData.position) {
        setFormError('Please select a position.');
        return;
    }

    const vacantPositions = selectedPositionStaffingInfo?.vacant ?? 0;

    if (newRequisitionData.numberOfPositions > vacantPositions) {
        setFormError(`Number of positions cannot exceed available vacant posts (${vacantPositions}).`);
        return;
    }
    
    if (editingRequisition) {
        const updatedRequisition: Requisition = {
            ...editingRequisition,
            ...newRequisitionData,
            numberOfPositions: Number(newRequisitionData.numberOfPositions),
        };
        
        if (['Needs Revision', 'Rejected'].includes(updatedRequisition.status)) {
            updatedRequisition.status = 'Pending HOD Approval';
            updatedRequisition.approvalHistory = [{ role: 'HOD', status: 'Pending' }];
            updatedRequisition.completionDate = undefined;
        }

        setRequisitions(prev => prev.map(r => (r.id === editingRequisition.id ? updatedRequisition : r)));
    } else {
        const newId = requisitions.length > 0 ? Math.max(...requisitions.map(r => r.id)) + 1 : 1;

        const newRequisition: Requisition = {
            id: newId,
            reqId: `REQ-${String(newId).padStart(3, '0')}`,
            ...newRequisitionData,
            numberOfPositions: Number(newRequisitionData.numberOfPositions),
            status: 'Pending HOD Approval',
            requestedDate: new Date().toISOString(),
            approvalHistory: [{ role: 'HOD', status: 'Pending' }],
            supervisorName: 'Auto-populated from JD', // These would be set based on login or more complex logic
            supervisorUID: 'JD-UID',
            hodName: 'Auto-populated from JD',
            hodUID: 'JD-UID',
        };
    
        setRequisitions(prev => [newRequisition, ...prev]);
    }
    setIsCreateModalOpen(false);
  };

  const updateRequisitionStatus = (requisitionId: number, action: 'approve' | 'reject' | 'return', remarks: string, signature: string) => {
    const requisition = requisitions.find(r => r.id === requisitionId);
    if (!requisition) return;

    const now = new Date().toISOString();
    let newStatus: RequisitionStatus = requisition.status;
    const newApprovalHistory: ApprovalStep[] = JSON.parse(JSON.stringify(requisition.approvalHistory));
    let completionDate = requisition.completionDate;

    const updateCurrentStep = (finalStatus: 'Approved' | 'Reviewed' | 'Rejected') => {
        const stepIndex = newApprovalHistory.findIndex((s: ApprovalStep) => s.status === 'Pending');
        if (stepIndex > -1) {
            newApprovalHistory[stepIndex].status = finalStatus;
            newApprovalHistory[stepIndex].date = now;
            newApprovalHistory[stepIndex].approver = signature;
            newApprovalHistory[stepIndex].comments = remarks;
        }
    };
    
    if (action === 'approve') {
        if (requisition.status === 'Pending HOD Approval') {
            newStatus = 'Pending Director/Dean Approval';
            updateCurrentStep('Approved');
            newApprovalHistory.push({ role: 'Director/Dean', status: 'Pending' });
        } else if (requisition.status === 'Pending Director/Dean Approval') {
            newStatus = 'Pending HR Review';
            updateCurrentStep('Approved');
            newApprovalHistory.push({ role: 'HR Review', status: 'Pending' });
        } else if (requisition.status === 'Pending HR Review') {
            newStatus = 'Approved';
            updateCurrentStep('Reviewed');
            completionDate = now;
        }
    } else if (action === 'reject') {
        newStatus = 'Rejected';
        updateCurrentStep('Rejected');
    } else if (action === 'return') {
        updateCurrentStep('Rejected'); // Log the return action on the current step

        if (requisition.status === 'Pending HR Review') {
            newStatus = 'Pending Director/Dean Approval';
            newApprovalHistory.push({ role: 'Director/Dean', status: 'Pending' });
        } else if (requisition.status === 'Pending Director/Dean Approval') {
            newStatus = 'Pending HOD Approval';
            newApprovalHistory.push({ role: 'HOD', status: 'Pending' });
        } else { // Default case, e.g., returned by HOD (first step)
            newStatus = 'Needs Revision';
            // No new pending step is added, it goes back to the requester.
        }
    }
    
    const updatedRequisition = { 
        ...requisition, 
        status: newStatus, 
        approvalHistory: newApprovalHistory,
        completionDate: completionDate
    };

    setRequisitions(prev => prev.map(r => r.id === requisitionId ? updatedRequisition : r));
    setSelectedRequisition(updatedRequisition);
};

  const handleApprovalAction = (e: React.MouseEvent, action: 'approve' | 'reject' | 'return') => {
    e.stopPropagation();
    setApprovalAction(action);
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = (remarks: string) => {
    if (selectedRequisition && approvalAction) {
        updateRequisitionStatus(selectedRequisition.id, approvalAction, remarks, "Current User");
    }
    setIsApprovalModalOpen(false);
    setApprovalAction(null);
  };

  const getApprovalStepIndex = (requisition: Requisition | null) => {
    if (!requisition) return -1;
    const { status, approvalHistory } = requisition;
    switch (status) {
        case 'Pending HOD Approval': return 0;
        case 'Pending Director/Dean Approval': return 1;
        case 'Pending HR Review': return 2;
        case 'Approved': return 3;
        case 'Rejected':
        case 'Needs Revision': {
            const history = approvalHistory || [];
            const rejectedStep = history.find(s => s.status === 'Rejected');
            if (rejectedStep?.role.includes('HOD')) return 0;
            if (rejectedStep?.role.includes('Director')) return 1;
            if (rejectedStep?.role.includes('HR')) return 2;
            return history.length > 0 ? history.length - 1 : 0;
        }
        default: return -1;
    }
  };

  const createRequisitionModalTitle = editingRequisition ? (
    <div className="flex items-center">
        <EditIcon className="w-6 h-6 mr-3 text-[#0076b6]" />
        <span>Edit Requisition: {editingRequisition.reqId}</span>
    </div>
  ) : (
    <div className="flex items-center">
        <FilePlusIcon className="w-6 h-6 mr-3 text-[#0076b6]" />
        <span>New Human Resource Requisition</span>
    </div>
  );

  return (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-4 space-y-4">
                <div className="flex border-b">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 text-lg font-semibold border-b-4 transition-colors ${activeTab === 'pending' ? 'border-[#0076b6] text-[#0076b6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`px-4 py-2 text-lg font-semibold border-b-4 transition-colors ${activeTab === 'approved' ? 'border-[#0076b6] text-[#0076b6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Approved Requests
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-end gap-6">
                      <div>
                          <label htmlFor="department-filter" className="text-sm font-medium text-slate-600">Department</label>
                           <div className="relative mt-1">
                                <select id="department-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                           </div>
                      </div>
                      <div>
                          <label htmlFor="section-filter" className="text-sm font-medium text-slate-600">Section</label>
                           <div className="relative mt-1">
                                <select id="section-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                           </div>
                      </div>
                      <div>
                          <label htmlFor="position-filter" className="text-sm font-medium text-slate-600">Position</label>
                           <div className="relative mt-1">
                                <select id="position-filter" value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                           </div>
                      </div>
                  </div>
                </div>
            </CardContent>
        </Card>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 grid grid-cols-12 items-center text-sm text-gray-500 uppercase font-bold tracking-wider border-b bg-gray-50">
                <div className="col-span-3">Position / Dept</div>
                <div className="col-span-4 px-4">Request Details</div>
                <div className="col-span-4 px-4">Status</div>
                <div className="col-span-1 px-4 text-center">Actions</div>
            </div>
            <div>
                {filteredRequisitions.length > 0 ? filteredRequisitions.map(req => (
                    <div key={req.id} className="grid grid-cols-12 items-start hover:bg-gray-50 border-b">
                        <div className="col-span-11 grid grid-cols-11 cursor-pointer" onClick={() => handleViewDetails(req)}>
                            <div className="col-span-3 pr-4 py-6 px-6">
                                <p className="font-extrabold text-xl text-gray-800">{req.position}</p>
                                <p className="text-base text-gray-600">{req.department} / {req.section}</p>
                                <p className="text-sm text-gray-500 mt-1">Req ID: {req.reqId}</p>
                            </div>
                            <div className="col-span-4 px-4 min-w-0 py-6">
                                <p className="font-bold text-base text-gray-800">{req.numberOfPositions} Position(s) - {req.positionType}</p>
                                <p className="text-sm text-gray-600">Requested by {req.requestedBy} on {new Date(req.requestedDate).toLocaleDateString('en-CA')}</p>
                                <p className="text-sm text-gray-600 italic mt-1 truncate" title={req.justification}>"{req.justification}"</p>
                            </div>
                            <div className="col-span-4 px-4 py-6">
                                {(() => {
                                    const timeSince = (date: string | undefined): string => {
                                        if (!date) return '';
                                        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
                                        if (seconds < 60) return `${Math.floor(seconds)}s ago`;
                                        const minutes = seconds / 60;
                                        if (minutes < 60) return `${Math.floor(minutes)}m ago`;
                                        const hours = minutes / 60;
                                        if (hours < 24) return `${Math.floor(hours)}h ago`;
                                        const days = hours / 24;
                                        return `${Math.floor(days)}d ago`;
                                    };

                                    if (req.status === 'Approved' || req.status === 'Rejected' || req.status === 'Needs Revision') {
                                        return (
                                            <span className={`px-3 py-1 text-base font-semibold rounded-full ${
                                                req.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                                req.status === 'Rejected' ? 'bg-[#fde8e9] text-[#c01823]' : 
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {req.status}
                                            </span>
                                        );
                                    } else {
                                        const lastEvent = [...req.approvalHistory].reverse().find(h => h.date);
                                        const pendingSince = lastEvent?.date || req.requestedDate;
                                        const pendingStep = req.approvalHistory.find(h => h.status === 'Pending');
                                        
                                        return (
                                            <div>
                                                <p className="font-semibold text-blue-700">{pendingStep?.role || 'Unknown'} Approval Pending</p>
                                                <p className="text-sm text-gray-500">Waiting for {timeSince(pendingSince)}</p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                         <div className="col-span-1 px-4 flex items-start justify-center h-full pt-6">
                            <div className="flex justify-center items-start space-x-4">
                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={(e) => handleViewHistory(e, req)}
                                        className="text-slate-500 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                                        title="View Approval History"
                                    >
                                        <HistoryIcon className="w-6 h-6" />
                                    </button>
                                    <span className="text-xs text-gray-500 mt-1 text-center">View Approval History</span>
                                </div>
                                {['Pending HOD Approval', 'Needs Revision', 'Rejected'].includes(req.status) && (
                                    <div className="flex flex-col items-center">
                                        <button
                                            onClick={(e) => handleEditClick(e, req)}
                                            className="text-slate-500 hover:text-green-600 p-1 rounded-full hover:bg-green-50 transition-colors"
                                            title="Edit Requisition"
                                        >
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <span className="text-xs text-gray-500 mt-1">Edit</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-12 text-gray-500">
                        <h3 className="text-xl font-semibold">No {activeTab === 'pending' ? 'Pending' : 'Approved'} Requests Found</h3>
                        <p className="mt-2">There are no requisitions that match the current filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
        
      {selectedRequisition && (
        <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Requisition Details: ${selectedRequisition.reqId} - ${selectedRequisition.position}`} maxWidth="max-w-4xl">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg text-gray-800 mb-2">Details</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-base">
                <div><strong>Department:</strong> {selectedRequisition.department}</div>
                <div><strong>Section:</strong> {selectedRequisition.section}</div>
                <div><strong>Requisition Type:</strong> {selectedRequisition.type}</div>
                {selectedRequisition.type === 'Replacement' && <div><strong>Replacement For:</strong> {selectedRequisition.replacementFor}</div>}
                <div><strong>Positions Requested:</strong> {selectedRequisition.numberOfPositions}</div>
                <div><strong>Position Type(s):</strong> {selectedRequisition.positionType}</div>
                <div><strong>Budget Status:</strong> {selectedRequisition.budgetedStatus}</div>
                {selectedRequisition.jobDescription && (
                    <div className="col-span-2">
                        <strong>Job Description:</strong>{' '}
                        <span className="text-gray-800 font-medium">{selectedRequisition.jobDescription}</span>
                    </div>
                )}
                <div className="col-span-2 mt-2 pt-2 border-t"><strong>Justification:</strong> {selectedRequisition.justification}</div>
              </div>
            </div>

            {selectedRequisition.status === 'Approved' && (
                <div className="mt-4">
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">Advertisement Status</h4>
                    {advertisementForSelected ? (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-green-800">
                                This requisition has been published in advertisement: 
                                <span className="font-bold"> "{advertisementForSelected.title}"</span>
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                Status: {advertisementForSelected.status} | Published on: {advertisementForSelected.publishedOn || 'N/A'}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-yellow-800 font-medium">
                                This requisition is approved and ready for advertisement.
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            <ActivityLog requisition={selectedRequisition} />
          </div>
           {selectedRequisition && (selectedRequisition.status !== 'Approved' && selectedRequisition.status !== 'Rejected' && selectedRequisition.status !== 'Needs Revision') && (
              <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                  <button 
                      type="button" 
                      onClick={(e) => handleApprovalAction(e, 'reject')} 
                      className="px-4 py-2 bg-[#c01823] text-white rounded-md hover:bg-[#9a131c] text-base font-semibold transition-colors"
                  >
                      Reject
                  </button>
                  <button 
                      type="button" 
                      onClick={(e) => handleApprovalAction(e, 'return')}
                      className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-base font-semibold transition-colors"
                  >
                      Return with Comments
                  </button>
                  <button 
                      type="button" 
                      onClick={(e) => handleApprovalAction(e, 'approve')} 
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold transition-colors"
                  >
                      Approve
                  </button>
              </div>
          )}
        </Modal>
      )}

      {requisitionForHistory && (
        <Modal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            title={`Approval History for ${requisitionForHistory.reqId}`}
            maxWidth="max-w-4xl"
        >
            <div className="p-4">
                <ActivityLog requisition={requisitionForHistory} />
            </div>
        </Modal>
      )}
      
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={createRequisitionModalTitle} maxWidth="max-w-6xl">
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="department" className="block text-base font-semibold text-gray-600 mb-2">Department</label>
                        <select 
                            id="department" 
                            name="department" 
                            value={newRequisitionData.department} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3"
                        >
                            <option value="">Select a department</option>
                            {formDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="position" className="block text-base font-semibold text-gray-600 mb-2">Position Title</label>
                         <select 
                            id="position" 
                            name="position" 
                            value={newRequisitionData.position}
                            onChange={handleDesignationChange}
                            required 
                            disabled={!newRequisitionData.department}
                            className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3 disabled:bg-gray-100"
                        >
                            <option value="">Select a position from Staffing Plan</option>
                            {designationsForSelectedDept.map(designation => (
                                <option key={designation} value={designation}>
                                    {designation}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="section" className="block text-base font-semibold text-gray-600 mb-2">Section</label>
                            <select 
                                id="section" 
                                name="section" 
                                value={newRequisitionData.section} 
                                onChange={handleInputChange} 
                                required
                                disabled={!newRequisitionData.department}
                                className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3 disabled:bg-gray-100"
                            >
                                <option value="">Select a section</option>
                                {availableSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="fiscalYear" className="block text-base font-semibold text-gray-600 mb-2">Fiscal Year</label>
                            <select id="fiscalYear" name="fiscalYear" value={newRequisitionData.fiscalYear} onChange={handleInputChange} className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3">
                                <option>2026-2027</option>
                                <option>2025-2026</option>
                                <option>2024-2025</option>
                            </select>
                        </div>
                    </div>
                    
                    {selectedPositionStaffingInfo && (
                        <div className="grid grid-cols-3 gap-4 text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Budgeted</p>
                                <p className="text-3xl font-bold text-gray-800">{selectedPositionStaffingInfo.budgeted}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Onboard</p>
                                <p className="text-3xl font-bold text-green-600">{selectedPositionStaffingInfo.onBoard}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Vacant</p>
                                <p className="text-3xl font-bold text-[#c01823]">{selectedPositionStaffingInfo.vacant}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="numberOfPositions" className="block text-base font-semibold text-gray-600 mb-2">No. of Positions</label>
                            <input type="number" name="numberOfPositions" id="numberOfPositions" min="1" value={newRequisitionData.numberOfPositions} onChange={handleInputChange} required className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3" />
                        </div>
                        <div>
                            <label htmlFor="positionType" className="block text-base font-semibold text-gray-600 mb-2">Type of Position</label>
                            <select id="positionType" name="positionType" value={newRequisitionData.positionType} onChange={handleInputChange} className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3">
                                <option>Full-Time</option>
                                <option>Part-Time</option>
                                <option>Visiting</option>
                            </select>
                        </div>
                    </div>
                    {formError && <p className="text-sm text-red-600 -mt-4 ml-1">{formError}</p>}


                    <div>
                        <label htmlFor="type" className="block text-base font-semibold text-gray-600 mb-2">Budgeted Type</label>
                        <select id="type" name="type" value={newRequisitionData.type} onChange={handleInputChange} className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3">
                           <option value="Replacement">Replacement</option>
                           <option value="New Position">New Position</option>
                        </select>
                    </div>

                    {newRequisitionData.type === 'Replacement' && (
                        <div>
                            <label htmlFor="replacementFor" className="block text-base font-semibold text-gray-600 mb-2">Replacement For</label>
                            <input type="text" name="replacementFor" id="replacementFor" value={newRequisitionData.replacementFor} onChange={handleInputChange} placeholder="Name of former employee" className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3" />
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="p-4 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-700">Approved Hiring Criteria</h3>
                        </div>
                        <div className="p-6 min-h-[150px]">
                            {selectedJobDescription ? (
                                <div className="space-y-3 text-base text-gray-700">
                                    <p><strong className="font-semibold text-gray-800">Qualification:</strong> {Array.isArray(selectedJobDescription.qualification) ? selectedJobDescription.qualification.join(', ') : ''}</p>
                                    <p><strong className="font-semibold text-gray-800">Experience:</strong> {selectedJobDescription.experience}</p>
                                    <p><strong className="font-semibold text-gray-800">Skills:</strong> {Array.isArray(selectedJobDescription.skills) ? selectedJobDescription.skills.join(', ') : ''}</p>
                                </div>
                            ) : (
                                <p className="text-base text-gray-500 text-center pt-10">Select a position to view criteria.</p>
                            )}
                        </div>
                    </div>
                     <div className="bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="p-4 border-b border-slate-200">
                           <h3 className="text-lg font-bold text-slate-700">Job Description Summary</h3>
                        </div>
                        <div className="p-6 min-h-[150px]">
                             {selectedJobDescription ? (
                                <p className="text-base text-gray-700 leading-relaxed">{selectedJobDescription.jobSummary}</p>
                            ) : (
                               <p className="text-base text-gray-500 text-center pt-10">Select a position to view summary.</p>
                            )}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="justification" className="block text-base font-semibold text-gray-600 mb-2">Justification of Workload</label>
                        <textarea name="justification" id="justification" value={newRequisitionData.justification} onChange={handleInputChange} rows={5} required className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3"></textarea>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8 space-x-4 border-t mt-8">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-8 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-base font-semibold border border-gray-300 transition-colors">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="px-8 py-3 bg-[#0076b6] text-white rounded-lg hover:bg-[#005a8c] text-base font-semibold shadow-sm hover:shadow-md transition-all"
                >
                    {editingRequisition ? 'Save Changes' : 'Submit Request'}
                </button>
            </div>
        </form>
      </Modal>

      {selectedRequisition && approvalAction && (
        <ApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          onConfirm={handleConfirmApproval}
          action={approvalAction}
          title={`${approvalAction === 'approve' ? 'Approve' : approvalAction === 'return' ? 'Return' : 'Reject'} Requisition`}
        />
      )}
    </div>
  );
};

export default RequisitionPage;