import React, { useState, useMemo, useEffect } from 'react';
import type { Requisition, RequisitionStatus, StaffingPosition, ApprovalStep, JobDescription, JobAdvertisement } from '../types';
import { Card, CardContent } from '../components/Card';
import { Modal } from '../components/Modal';
import { ApprovalWorkflow } from '../components/ApprovalWorkflow';
import { ApprovalModal } from '../components/ApprovalModal';
import { UserIcon, BuildingIcon, BriefcaseIcon, CheckIcon, XIcon, FilePlusIcon } from '../components/icons';

interface RequisitionProps {
  requisitions: Requisition[];
  setRequisitions: React.Dispatch<React.SetStateAction<Requisition[]>>;
  staffingPlan: StaffingPosition[];
  jobDescriptions: JobDescription[];
  advertisements: JobAdvertisement[];
}

const CompactApprovalWorkflow: React.FC<{ status: RequisitionStatus; history: ApprovalStep[] }> = ({ status, history }) => {
    const steps = ['HOD', 'Div. Director', 'HR Review', 'Approved'];
    const icons: { [key: string]: React.ReactNode } = {
        'HOD': <UserIcon className="w-5 h-5" />,
        'Div. Director': <BuildingIcon className="w-5 h-5" />,
        'HR Review': <BriefcaseIcon className="w-5 h-5" />,
        'Approved': <CheckIcon className="w-5 h-5" />,
    };

    let currentStepIndex = 0;
    if (status === 'Pending Director/Dean Approval') currentStepIndex = 1;
    else if (status === 'Pending HR Review') currentStepIndex = 2;
    else if (status === 'Approved') currentStepIndex = 3;
    else if (status === 'Rejected') {
        const rejectedIdx = history.findIndex(h => h.status === 'Rejected');
        currentStepIndex = rejectedIdx !== -1 ? rejectedIdx : 0;
    }
    
    return (
        <div className="flex items-center">
            {steps.map((step, index) => {
                let stepStatus: 'completed' | 'current' | 'pending' | 'rejected' = 'pending';

                if (status === 'Approved') {
                    stepStatus = 'completed';
                } else if (status === 'Rejected') {
                    if (index < currentStepIndex) stepStatus = 'completed';
                    else if (index === currentStepIndex) stepStatus = 'rejected';
                    else stepStatus = 'pending';
                } else {
                    if (index < currentStepIndex) stepStatus = 'completed';
                    else if (index === currentStepIndex) stepStatus = 'current';
                    else stepStatus = 'pending';
                }

                const colors = {
                    completed: { circle: 'bg-green-500 text-white', line: 'bg-green-500', text: 'text-green-600' },
                    current: { circle: 'bg-[#e0f2fe] text-[#0076b6]', line: 'bg-gray-300', text: 'text-[#0076b6]' },
                    pending: { circle: 'bg-gray-200 text-gray-400', line: 'bg-gray-300', text: 'text-gray-500' },
                    rejected: { circle: 'bg-[#c01823] text-white', line: 'bg-gray-300', text: 'text-[#c01823]' }
                };
                
                const style = colors[stepStatus];
                const isCompleted = stepStatus === 'completed';
                const connectorStyle = (index < currentStepIndex && status !== 'Rejected') || status === 'Approved' ? colors.completed.line : colors.pending.line;


                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.circle}`}>
                                {isCompleted ? <CheckIcon className="w-5 h-5" /> : icons[step]}
                            </div>
                            <span className={`mt-2 text-xs font-semibold ${style.text}`}>{step}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${connectorStyle}`}></div>
                        )}
                    </React.Fragment>
                )
            })}
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
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [positionFilter, setPositionFilter] = useState('All Positions');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

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

  const filteredRequisitions = useMemo(() => {
    const pendingStatuses: RequisitionStatus[] = [
      'Pending HOD Approval',
      'Pending Director/Dean Approval',
      'Pending HR Review',
      'Rejected'
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

  const handleOpenCreateModal = () => {
    setNewRequisitionData(initialFormData);
    setFormError('');
    setSelectedPositionStaffingInfo(null);
    setSelectedJobDescription(null);
    setIsCreateModalOpen(true);
  }

  useEffect(() => {
    const openModal = () => handleOpenCreateModal();
    window.addEventListener('openCreateRequisitionModal', openModal);
    return () => {
      window.removeEventListener('openCreateRequisitionModal', openModal);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRequisitionData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jdId = parseInt(e.target.value, 10);
    const selectedJd = approvedJobDescriptions.find(jd => jd.id === jdId);
    
    setSelectedPositionStaffingInfo(null);
    setSelectedJobDescription(selectedJd || null);

    if (selectedJd) {
        setNewRequisitionData(prev => ({
            ...prev,
            position: selectedJd.designation,
            department: selectedJd.department,
            section: selectedJd.section,
            qualification: Array.isArray(selectedJd.qualification) ? selectedJd.qualification.join(', ') : selectedJd.qualification,
            experience: selectedJd.experience,
            requiredSkills: selectedJd.skills,
            licenseRequirement: Array.isArray(selectedJd.registrationLicense) && selectedJd.registrationLicense.some(lic => lic.toLowerCase() !== 'n/a') ? 'Yes' : 'No',
            jobDescription: `Internal JD #${selectedJd.id}`,
        }));

        const positionInfo = staffingPlan.find(p => p.designation === selectedJd.designation);
        if (positionInfo) {
            setSelectedPositionStaffingInfo({ budgeted: positionInfo.positions2526, onBoard: positionInfo.onBoard, vacant: positionInfo.vacant });
        }

    } else {
        setNewRequisitionData(prev => ({
            ...prev,
            ...initialFormData,
        }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newRequisitionData.position) {
        setFormError('Please select a position from an approved Job Description.');
        return;
    }

    const vacantPositions = selectedPositionStaffingInfo?.vacant ?? 0;

    if (newRequisitionData.numberOfPositions > vacantPositions) {
        setFormError(`Number of positions cannot exceed available vacant posts (${vacantPositions}).`);
        return;
    }
    
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
    setIsCreateModalOpen(false);
  };

  const updateRequisitionStatus = (requisitionId: number, approve: boolean, remarks: string, signature: string) => {
    const requisition = requisitions.find(r => r.id === requisitionId);
    if (!requisition) return;

    const now = new Date().toISOString().split('T')[0];
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
    
    if (approve) {
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
    } else { // Reject
        newStatus = 'Rejected';
        updateCurrentStep('Rejected');
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

  const handleApprovalAction = (e: React.MouseEvent, action: 'approve' | 'reject') => {
    e.stopPropagation();
    setApprovalAction(action);
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = (remarks: string, signature: string) => {
    if (selectedRequisition && approvalAction) {
        updateRequisitionStatus(selectedRequisition.id, approvalAction === 'approve', remarks, signature);
    }
    setIsApprovalModalOpen(false);
    setApprovalAction(null);
  };

  const getApprovalStepIndex = (status: RequisitionStatus) => {
    switch (status) {
        case 'Pending HOD Approval': return 0;
        case 'Pending Director/Dean Approval': return 1;
        case 'Pending HR Review': return 2;
        case 'Approved': return 3;
        case 'Rejected': {
            const history = selectedRequisition?.approvalHistory || [];
            const rejectedStep = history.find(s => s.status === 'Rejected');
            if (rejectedStep?.role.includes('HOD')) return 0;
            if (rejectedStep?.role.includes('Director')) return 1;
            if (rejectedStep?.role.includes('HR')) return 2;
            return history.length > 0 ? history.length -1 : 0;
        }
        default: return -1;
    }
  };

  const createRequisitionModalTitle = (
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
                <div className="col-span-5 px-4">Request Details</div>
                <div className="col-span-4 px-4">Status</div>
            </div>
            <div>
                {filteredRequisitions.length > 0 ? filteredRequisitions.map(req => (
                    <div key={req.id} className="px-6 py-6 grid grid-cols-12 items-start hover:bg-gray-50 cursor-pointer border-b" onClick={() => handleViewDetails(req)}>
                        <div className="col-span-3 pr-4">
                            <p className="font-extrabold text-xl text-gray-800">{req.position}</p>
                            <p className="text-base text-gray-600">{req.department} / {req.section}</p>
                            <p className="text-sm text-gray-500 mt-1">Req ID: {req.reqId}</p>
                        </div>
                        <div className="col-span-5 px-4 min-w-0">
                            <p className="font-bold text-base text-gray-800">{req.numberOfPositions} Position(s) - {req.positionType}</p>
                            <p className="text-sm text-gray-600">Requested by {req.requestedBy} on {new Date(req.requestedDate).toLocaleDateString('en-CA')}</p>
                            <p className="text-sm text-gray-600 italic mt-1 truncate" title={req.justification}>"{req.justification}"</p>
                        </div>
                        <div className="col-span-4 px-4">
                            {activeTab === 'approved' || req.status === 'Rejected' ? (
                                 <span className={`px-3 py-1 text-base font-semibold rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-700' : `bg-[#fde8e9] text-[#c01823]`}`}>
                                    {req.status}
                                </span>
                            ) : (
                                <CompactApprovalWorkflow status={req.status} history={req.approvalHistory} />
                            )}
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

            <div>
              <h4 className="font-semibold text-lg text-gray-800 my-4">Approval Workflow</h4>
              <ApprovalWorkflow
                stepNames={['HOD', 'Director/Dean', 'HR Review', 'Approved']}
                currentStepIndex={getApprovalStepIndex(selectedRequisition.status)}
                isCompleted={selectedRequisition.status === 'Approved'}
                isRejected={selectedRequisition.status === 'Rejected'}
                approvalHistory={selectedRequisition.approvalHistory}
                completionDate={selectedRequisition.completionDate}
              />
            </div>
          </div>
           {selectedRequisition && (selectedRequisition.status !== 'Approved' && selectedRequisition.status !== 'Rejected') && (
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
                      onClick={(e) => handleApprovalAction(e, 'approve')} 
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold transition-colors"
                  >
                      Approve
                  </button>
              </div>
          )}
        </Modal>
      )}
      
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={createRequisitionModalTitle} maxWidth="max-w-6xl">
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="position" className="block text-base font-semibold text-gray-600 mb-2">Position Title</label>
                         <select 
                            id="position" 
                            name="position" 
                            value={approvedJobDescriptions.find(jd => jd.designation === newRequisitionData.position)?.id || ''} 
                            onChange={handlePositionChange} 
                            required 
                            className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3"
                        >
                            <option value="">Select an approved Job Description</option>
                            {approvedJobDescriptions.map(jd => (
                                <option key={jd.id} value={jd.id}>
                                    {jd.designation}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="department" className="block text-base font-semibold text-gray-600 mb-2">Department</label>
                            <input type="text" id="department" value={newRequisitionData.department} readOnly className="w-full bg-gray-100 border-gray-300 rounded-lg shadow-sm text-base px-4 py-3" />
                        </div>
                        <div>
                            <label htmlFor="section" className="block text-base font-semibold text-gray-600 mb-2">Section</label>
                            <input type="text" id="section" value={newRequisitionData.section} readOnly className="w-full bg-gray-100 border-gray-300 rounded-lg shadow-sm text-base px-4 py-3" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="fiscalYear" className="block text-base font-semibold text-gray-600 mb-2">Fiscal Year</label>
                        <select id="fiscalYear" name="fiscalYear" value={newRequisitionData.fiscalYear} onChange={handleInputChange} className="w-full bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#93c5fd] focus:border-[#0076b6] text-base px-4 py-3">
                            <option>2026-2027</option>
                            <option>2025-2026</option>
                            <option>2024-2025</option>
                        </select>
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
                                    <p><strong className="font-semibold text-gray-800">Qualification:</strong> {selectedJobDescription.qualification.join(', ')}</p>
                                    <p><strong className="font-semibold text-gray-800">Experience:</strong> {selectedJobDescription.experience}</p>
                                    <p><strong className="font-semibold text-gray-800">Skills:</strong> {selectedJobDescription.skills}</p>
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
                    Submit Request
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
          title={`${approvalAction === 'approve' ? 'Approve' : 'Reject'} Requisition`}
        />
      )}
    </div>
  );
};

export default RequisitionPage;
