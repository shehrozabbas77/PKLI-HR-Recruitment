
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { CheckIcon, HourglassIcon } from '../components/icons';
import type { Candidate, ApprovalStep as ApprovalStepType, CandidateStatus } from '../types';
import { ApprovalModal } from '../components/ApprovalModal';

interface ApprovalForHireProps {
    candidates: Candidate[];
    setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
}

// --- Helper to determine candidate level ---
const getCandidateLevel = (position: string): 'associate' | 'manager' | 'senior' => {
    const lowerPos = position.toLowerCase();
    if (lowerPos.includes('consultant') || lowerPos.includes('senior manager') || lowerPos.includes('director') || lowerPos.includes('chief')) {
        return 'senior';
    }
    if (lowerPos.includes('manager')) {
        return 'manager';
    }
    return 'associate';
};


// --- Salary Fixation Committee Component ---
const SalaryFixationCommittee: React.FC<{
  onSalaryUpdate: (salary: number, remarks: string) => void;
}> = ({ onSalaryUpdate }) => {
    const committeeMembers = [
        'Dean',
        'Hospital Director',
        'Medical Director',
        'Finance Director',
        'HR Director',
        'Respective HOD'
    ];
    const [salary, setSalary] = useState('');
    const [remarks, setRemarks] = useState('');

    const handleApply = () => {
        const salaryNum = parseInt(salary, 10);
        if (!isNaN(salaryNum) && salaryNum > 0) {
            onSalaryUpdate(salaryNum, remarks);
        } else {
            alert('Please enter a valid salary amount.');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Salary Fixation Committee</CardTitle>
                <CardDescription>For Consultants, Senior Manager and above, salary is determined by the committee.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Committee Members</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {committeeMembers.map(member => <li key={member}>{member}</li>)}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="approvedSalary" className="block text-sm font-medium text-gray-700">Final Approved Salary (PKR)</label>
                            <input
                                type="number"
                                id="approvedSalary"
                                value={salary}
                                onChange={e => setSalary(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 550000"
                            />
                        </div>
                        <div>
                            <label htmlFor="committeeRemarks" className="block text-sm font-medium text-gray-700">Committee Remarks / Meeting Minutes</label>
                            <textarea
                                id="committeeRemarks"
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                rows={4}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter any notes or decisions from the committee meeting."
                            />
                        </div>
                        <div className="text-right">
                             <button onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                                Set Approved Salary
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


// --- Salary Slab Calculator Component (Display Only) ---
const SalarySlabCalculator: React.FC<{
    level: 'manager' | 'associate';
    experience: number;
    finalSalary: number | null;
}> = ({ level, experience, finalSalary }) => {
  
  const years = Math.floor(experience);
  const months = Math.round((experience - years) * 12);
  
  const managerSlabs = [
    { years: 4, min: 287500, max: 414000, incremental: 42167 },
    { years: 5, min: 329667, max: 0, incremental: 0 },
    { years: 6, min: 371833, max: 0, incremental: 0 },
    { years: 7, min: 414000, max: 0, incremental: 0 },
  ];

  const associateSlabs = [
    { years: 5, min: 113850, max: 145475, incremental: 15813 },
    { years: 6, min: 129663, max: 0, incremental: 0 },
    { years: 7, min: 145475, max: 0, incremental: 0 },
  ];
  
  const slabs = level === 'manager' ? managerSlabs : associateSlabs;
  const roundedExp = Math.round(experience);
  
  const relevantSlab = useMemo(() => {
    const bestMatch = [...slabs].reverse().find(s => roundedExp >= s.years);
    if (bestMatch) {
      return bestMatch;
    }
    if (slabs.length > 0) {
        return slabs.reduce((lowest, current) => (current.years < lowest.years ? current : lowest), slabs[0]);
    }
    return undefined;
  }, [slabs, roundedExp]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Calculator</CardTitle>
        <CardDescription>
          Using the <span className="font-semibold">{level === 'manager' ? '4-slab structure for Manager level' : '3-slab structure for Associate Manager level'}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 items-center mb-4 p-4 bg-gray-50 rounded-lg border">
          <div>
            <label className="block text-sm font-medium text-gray-700">Candidate's Experience</label>
            <p className="text-2xl font-bold text-gray-800">{years} years</p>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Months</label>
            <p className="text-2xl font-bold text-gray-800">{months} months</p>
          </div>
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700">Calculated Salary</label>
            <p className="text-2xl font-bold text-green-600">PKR {finalSalary ? finalSalary.toLocaleString() : '...'}</p>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 mb-4 italic">
            Note: As per guidelines, experience is rounded to the nearest full year. Experience of six months or more is rounded up to the next year.
        </p>

        <table className="w-full text-base text-left text-gray-600 mt-4">
          <thead className="text-sm text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-2">Years of Exp.</th>
              <th className="px-4 py-2">Min Salary</th>
              <th className="px-4 py-2">Max Salary</th>
              <th className="px-4 py-2">Difference</th>
              <th className="px-4 py-2">Incremental Amount</th>
            </tr>
          </thead>
          <tbody>
            {slabs.map(slab => (
              <tr key={slab.years} className={`border-b ${relevantSlab?.years === slab.years ? 'bg-blue-50 font-semibold' : ''}`}>
                <td className="px-4 py-2">{slab.years}</td>
                <td className="px-4 py-2">{slab.min.toLocaleString('en-US')}</td>
                <td className="px-4 py-2">{slab.max > 0 ? slab.max.toLocaleString('en-US') : '-'}</td>
                <td className="px-4 py-2">{slab.max > 0 ? (slab.max - slab.min).toLocaleString('en-US') : '-'}</td>
                <td className="px-4 py-2">{slab.incremental > 0 ? slab.incremental.toLocaleString('en-US') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

// --- New Approval Logic ---
const getApprovalWorkflowForCandidate = (candidate: Candidate): string[] => {
    const workflow: string[] = [];
    workflow.push('Director HR'); // First Reviewer

    const { department, section } = candidate;

    if (section === 'Nursing') {
        workflow.push('Nursing Director');
    } else if (department === 'Medical Services') {
        workflow.push('Medical Director');
    } else if (department === 'Finance') {
        workflow.push('Finance Director');
    } else if (department === 'Human Resource') {
        // HR Director is the same as Director HR, already added
    } else if (department === 'Marketing') { // Placeholder for future department
        workflow.push('Marketing Director');
    } else if (department === 'QA') { // Placeholder for future department
        workflow.push('QA Director');
    } else {
        // For all other non-medical positions (e.g., ICT, Administration)
        workflow.push('Hospital Director');
    }

    workflow.push('Dean'); // Final Approval
    
    return [...new Set(workflow)]; // Return unique roles
};


// --- Approval Sheet Component ---
const ApprovalSheet: React.FC<{
    candidate: Candidate;
    finalSalary: number | null;
    remarks: string;
    onApprove: () => void;
    onReject: () => void;
}> = ({ candidate, finalSalary, remarks, onApprove, onReject }) => {
    const workflowRoles = useMemo(() => getApprovalWorkflowForCandidate(candidate), [candidate]);

    const workflowSteps = useMemo(() => {
        if (candidate.finalApprovalHistory && candidate.finalApprovalHistory.length > 0) {
            return candidate.finalApprovalHistory;
        }
        return workflowRoles.map(role => ({
            role,
            status: 'Pending' as 'Pending',
        }));
    }, [candidate.finalApprovalHistory, workflowRoles]);
    
    const currentStepIndex = workflowSteps.findIndex(s => s.status === 'Pending');
    const isCompleted = candidate.status === 'Approved for Hire';
    const isRejected = candidate.status === 'Rejected' && workflowSteps.some(s => s.status === 'Rejected');


    return (
        <Card>
            <CardHeader>
                <CardTitle>Approval Sheet</CardTitle>
                <CardDescription>Final approval workflow for the selected candidate.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4">
                   <h3 className="font-bold text-center text-xl">Approval of the Hiring of ({candidate.positionAppliedFor}) at PKLI & RC</h3>
                   <table className="w-full text-base my-4">
                      <thead>
                        <tr className="bg-gray-100">
                           <th className="px-4 py-2 text-left">Name</th>
                           <th className="px-4 py-2 text-left">Designation</th>
                           <th className="px-4 py-2 text-left">Final Salary (PKR)</th>
                           <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                            <td className="px-4 py-2 border-b">{candidate.name}</td>
                            <td className="px-4 py-2 border-b">{candidate.recommendedDesignation || candidate.positionAppliedFor}</td>
                            <td className="px-4 py-2 border-b font-bold text-green-700">{finalSalary ? finalSalary.toLocaleString() : 'Not Set'}</td>
                            <td className="px-4 py-2 border-b text-green-600 font-semibold">Recommended for Hire</td>
                        </tr>
                        {remarks && (
                            <tr>
                                <td colSpan={4} className="px-4 py-2 border-b text-sm text-gray-600 italic">
                                    <strong>Remarks:</strong> {remarks}
                                </td>
                            </tr>
                        )}
                      </tbody>
                   </table>

                   <div className="flex items-start w-full pt-8 justify-center">
                      {workflowSteps.map((step, index) => {
                          const isLastStep = index === workflowSteps.length - 1;

                          let visualStatus: 'approved' | 'current' | 'future' | 'rejected';
                          if (isCompleted) {
                              visualStatus = 'approved';
                          } else if (isRejected) {
                              const rejectedIndex = workflowSteps.findIndex(s => s.status === 'Rejected');
                              if (index < rejectedIndex) visualStatus = 'approved';
                              else if (index === rejectedIndex) visualStatus = 'rejected';
                              else visualStatus = 'future';
                          } else {
                              if (index < currentStepIndex) visualStatus = 'approved';
                              else if (index === currentStepIndex) visualStatus = 'current';
                              else visualStatus = 'future';
                          }
                          
                          const StepComponent = 'div';
                          const iconClasses = {
                              approved: 'bg-green-100 border-green-500 text-green-600',
                              current: 'bg-blue-600 border-blue-700 text-white',
                              future: 'bg-gray-100 border-gray-300 text-gray-400',
                              rejected: 'bg-red-100 border-red-500 text-red-600'
                          };
                          const labelClasses = {
                              approved: 'text-gray-800',
                              current: 'text-blue-600',
                              future: 'text-gray-500',
                              rejected: 'text-red-600'
                          };
                          const icons = {
                              approved: <CheckIcon className="w-6 h-6" />,
                              current: <HourglassIcon className="w-6 h-6" />,
                              future: <div className="w-3 h-3 bg-gray-400 rounded-full" />,
                              rejected: <CheckIcon className="w-6 h-6" /> // Or an X icon if preferred
                          };

                          return (
                              <React.Fragment key={index}>
                                  <div className="flex flex-col items-center text-center w-48 shrink-0">
                                      <StepComponent className={`flex flex-col items-center w-full`}>
                                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${iconClasses[visualStatus]}`}>
                                              {icons[visualStatus]}
                                          </div>
                                          <p className={`mt-2 font-semibold text-sm h-10 flex items-center justify-center ${labelClasses[visualStatus]}`}>
                                              {step.role}
                                          </p>
                                      </StepComponent>
                                      <div className="text-xs text-gray-500 mt-1 h-12 space-y-0.5">
                                          {step.status === 'Approved' && step.approver && (
                                              <>
                                                  <p className="font-semibold">{step.approver}</p>
                                                  <p>{step.date}</p>
                                              </>
                                          )}
                                      </div>
                                  </div>

                                  {!isLastStep && (
                                      <div className={`flex-1 h-0.5 mt-6 ${visualStatus === 'approved' && index < currentStepIndex && !isRejected ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  )}
                              </React.Fragment>
                          );
                      })}
                   </div>
                </div>

                {candidate.status === 'Recommended for Hire' && !isRejected && !isCompleted && (
                    <div className="flex justify-end items-center pt-6 space-x-3 border-t mt-6">
                        {!finalSalary && <p className="text-sm text-yellow-700 font-semibold mr-auto">Please set a final salary before approving.</p>}
                        <button 
                            onClick={onReject}
                            disabled={!finalSalary}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-base font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Reject
                        </button>
                        <button 
                            onClick={onApprove}
                            disabled={!finalSalary}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Approve
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// --- Main Component ---
const ApprovalForHire: React.FC<ApprovalForHireProps> = ({ candidates, setCandidates }) => {
    // Filter states
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [jobFilter, setJobFilter] = useState('All');
    
    // Selected candidate state
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    
    // Approval Modal State
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

    // Memoized options for filters
    const departments = useMemo(() => ['All', ...Array.from(new Set(candidates.map(c => c.department)))], [candidates]);
    
    const sections = useMemo(() => {
        if (departmentFilter === 'All') return ['All'];
        const relevantSections = candidates.filter(c => c.department === departmentFilter);
        return ['All', ...Array.from(new Set(relevantSections.map(c => c.section)))];
    }, [candidates, departmentFilter]);

    const jobs = useMemo(() => {
        let relevantJobs = candidates;
        if (departmentFilter !== 'All') {
            relevantJobs = relevantJobs.filter(c => c.department === departmentFilter);
        }
        if (sectionFilter !== 'All') {
            relevantJobs = relevantJobs.filter(c => c.section === sectionFilter);
        }
        return ['All', ...Array.from(new Set(relevantJobs.map(c => c.positionAppliedFor)))];
    }, [candidates, departmentFilter, sectionFilter]);

    // Reset subordinate filters when a parent filter changes
    useEffect(() => {
        setSectionFilter('All');
    }, [departmentFilter]);

    useEffect(() => {
        setJobFilter('All');
    }, [sectionFilter, departmentFilter]);

    // Memoized filtered candidates list
    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const deptMatch = departmentFilter === 'All' || c.department === departmentFilter;
            const sectionMatch = sectionFilter === 'All' || c.section === sectionFilter;
            const jobMatch = jobFilter === 'All' || c.positionAppliedFor === jobFilter;
            return deptMatch && sectionMatch && jobMatch;
        });
    }, [candidates, departmentFilter, sectionFilter, jobFilter]);

    // Effect to manage selected candidate when filters change
    useEffect(() => {
        const isCurrentSelectedVisible = selectedCandidate && filteredCandidates.some(c => c.id === selectedCandidate.id);
        
        if (isCurrentSelectedVisible) {
            return;
        }

        if (filteredCandidates.length > 0) {
            setSelectedCandidate(filteredCandidates[0]);
        } else {
            setSelectedCandidate(null);
        }
    }, [filteredCandidates, selectedCandidate]);
    
    // Effect to calculate and persist salary for non-senior roles if not already set
    useEffect(() => {
        if (!selectedCandidate || selectedCandidate.finalSalary) {
            return;
        }

        const level = getCandidateLevel(selectedCandidate.positionAppliedFor);

        if (level === 'senior') {
            return; // Senior roles require manual input
        }
        
        // Salary calculation logic for non-senior roles
        const managerSlabs = [
            { years: 4, min: 287500, max: 414000, incremental: 42167 },
            { years: 5, min: 329667, max: 0, incremental: 0 },
            { years: 6, min: 371833, max: 0, incremental: 0 },
            { years: 7, min: 414000, max: 0, incremental: 0 },
        ];
        const associateSlabs = [
            { years: 5, min: 113850, max: 145475, incremental: 15813 },
            { years: 6, min: 129663, max: 0, incremental: 0 },
            { years: 7, min: 145475, max: 0, incremental: 0 },
        ];
        const slabs = level === 'manager' ? managerSlabs : associateSlabs;
        const experience = selectedCandidate.experienceYears;
        const roundedExp = Math.round(experience);
        
        const bestMatch = [...slabs].reverse().find(s => roundedExp >= s.years);
        let relevantSlab;
        if (bestMatch) {
          relevantSlab = bestMatch;
        } else if (slabs.length > 0) {
            relevantSlab = slabs.reduce((lowest, current) => (current.years < lowest.years ? current : lowest), slabs[0]);
        }
        
        const calculatedSalary = relevantSlab?.min || 0;

        if (calculatedSalary > 0) {
            const remarks = `Calculated based on ${level} level with ${experience} (rounded to ${roundedExp}) years of experience.`;
            const updatedCandidate = {
                ...selectedCandidate,
                finalSalary: calculatedSalary,
                salaryRemarks: remarks
            };
            setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? updatedCandidate : c));
            setSelectedCandidate(updatedCandidate); // Update local state for immediate re-render
        }
    }, [selectedCandidate, setCandidates]);

    const handleSalaryUpdate = (salary: number, remarks: string) => {
        if (!selectedCandidate) return;

        const updatedCandidate = {
            ...selectedCandidate,
            finalSalary: salary,
            salaryRemarks: remarks
        };

        setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? updatedCandidate : c));
        setSelectedCandidate(updatedCandidate);
    };

    const handleApprovalAction = (action: 'approve' | 'reject') => {
        if (!selectedCandidate) return;
        setApprovalAction(action);
        setIsApprovalModalOpen(true);
    };

    const handleConfirmApproval = (remarks: string) => {
        if (!selectedCandidate || !approvalAction) return;
    
        // In a real app, the user's name would be fetched from the session.
        const signature = "Current User";
    
        const workflowRoles = getApprovalWorkflowForCandidate(selectedCandidate);
        
        let currentHistory: ApprovalStepType[];
        if (selectedCandidate.finalApprovalHistory && selectedCandidate.finalApprovalHistory.length > 0) {
            currentHistory = JSON.parse(JSON.stringify(selectedCandidate.finalApprovalHistory));
        } else {
            currentHistory = workflowRoles.map(role => ({ role, status: 'Pending' as 'Pending' }));
        }
    
        const currentStepIndex = currentHistory.findIndex((s) => s.status === 'Pending');
    
        if (currentStepIndex === -1) {
            setIsApprovalModalOpen(false);
            setApprovalAction(null);
            return;
        }
    
        let newStatus: CandidateStatus = selectedCandidate.status;
        const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
        if (approvalAction === 'approve') {
            currentHistory[currentStepIndex].status = 'Approved';
            if (currentStepIndex === currentHistory.length - 1) {
                newStatus = 'Approved for Hire';
            }
        } else { // 'reject'
            currentHistory[currentStepIndex].status = 'Rejected';
            newStatus = 'Rejected';
        }
    
        currentHistory[currentStepIndex].date = now;
        currentHistory[currentStepIndex].approver = signature;
        currentHistory[currentStepIndex].comments = remarks;
        
        const updatedCandidate = {
            ...selectedCandidate,
            status: newStatus,
            finalApprovalHistory: currentHistory,
        };
    
        setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? updatedCandidate : c));
        setSelectedCandidate(updatedCandidate);
    
        setIsApprovalModalOpen(false);
        setApprovalAction(null);
    };


    if (candidates.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700">No Candidates for Approval</h3>
                    <p className="text-gray-500 mt-2">There are currently no candidates who have been recommended for hire.</p>
                </CardContent>
            </Card>
        );
    }
    
    const candidateLevel = selectedCandidate ? getCandidateLevel(selectedCandidate.positionAppliedFor) : null;
    const finalSalary = selectedCandidate?.finalSalary ?? null;
    const salaryRemarks = selectedCandidate?.salaryRemarks ?? '';
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Candidates Recommended for Hire</CardTitle>
                    <CardDescription>Select a candidate to proceed with salary calculation and final approval.</CardDescription>
                    <div className="mt-4 pt-4 border-t flex items-end gap-6">
                        <div>
                            <label htmlFor="dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                            <div className="relative mt-1">
                                <select id="dept-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
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
                            <label htmlFor="sec-filter" className="text-sm font-medium text-slate-600">Section</label>
                            <div className="relative mt-1">
                                <select id="sec-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base" disabled={departmentFilter === 'All'}>
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
                            <label htmlFor="job-filter" className="text-sm font-medium text-slate-600">Job</label>
                            <div className="relative mt-1">
                                <select id="job-filter" value={jobFilter} onChange={e => setJobFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                    {jobs.map(j => <option key={j} value={j}>{j}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-base">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">Name</th>
                                    <th className="px-6 py-3 text-left">Position</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.length > 0 ? (
                                    filteredCandidates.map(candidate => (
                                        <tr 
                                            key={candidate.id} 
                                            onClick={() => setSelectedCandidate(candidate)}
                                            className={`cursor-pointer border-b ${selectedCandidate?.id === candidate.id ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4 font-semibold">{candidate.name}</td>
                                            <td className="px-6 py-4">{candidate.positionAppliedFor}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="text-center py-8 text-gray-500">
                                            No recommended candidates match the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            
            {selectedCandidate && (
                <>
                    {candidateLevel === 'senior' ? (
                        <SalaryFixationCommittee 
                            key={selectedCandidate.id} // Ensures component state resets on candidate change
                            onSalaryUpdate={handleSalaryUpdate} 
                        />
                    ) : candidateLevel ? (
                        <SalarySlabCalculator 
                            level={candidateLevel}
                            experience={selectedCandidate.experienceYears}
                            finalSalary={finalSalary}
                        />
                    ) : null}

                    <ApprovalSheet 
                        candidate={selectedCandidate} 
                        finalSalary={finalSalary}
                        remarks={salaryRemarks}
                        onApprove={() => handleApprovalAction('approve')}
                        onReject={() => handleApprovalAction('reject')}
                    />
                </>
            )}

            {selectedCandidate && approvalAction && (
                <ApprovalModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    onConfirm={handleConfirmApproval}
                    action={approvalAction}
                    title={`${approvalAction === 'approve' ? 'Approve' : 'Reject'} Hiring`}
                />
            )}
        </div>
    );
};

export default ApprovalForHire;
