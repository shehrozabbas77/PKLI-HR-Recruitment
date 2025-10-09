
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { JobDescription, JobDescriptionStatus, StaffingPosition } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Modal } from '../components/Modal';
import { ApprovalWorkflow } from '../components/ApprovalWorkflow';
import { ApprovalModal } from '../components/ApprovalModal';
import { departmentSections, departmentSupervisors } from '../constants';
import { XIcon, DocumentTextIcon, CheckIcon, EyeIcon, EditIcon, HistoryIcon } from '../components/icons';

interface JobDescriptionPageProps {
  jobDescriptions: JobDescription[];
  setJobDescriptions: React.Dispatch<React.SetStateAction<JobDescription[]>>;
  staffingPlan: StaffingPosition[];
}

const statusColorMap: { [key in JobDescriptionStatus]: string } = {
  'Pending HOD Approval': 'bg-yellow-100 text-yellow-800',
  'Pending HR Review': 'bg-orange-100 text-orange-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Needs Revision': 'bg-amber-100 text-amber-800',
};

const initialJdFormData = {
    designation: '',
    department: 'ICT',
    section: '',
    reportsTo: '',
    reportingPositions: '',
    qualification: [] as string[],
    skills: '',
    experience: '',
    registrationLicense: [] as string[],
    jobSummary: '',
    jobFunctions: '',
    preparedBy: departmentSupervisors['ICT'] || '',
};

const FormSection: React.FC<{ title: string, icon?: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="pt-2">
        <h3 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3 mb-4 flex items-center">
            {icon && <span className="text-blue-600 mr-3">{icon}</span>}
            {title}
        </h3>
        {children}
    </div>
);

const DetailItem: React.FC<{ label: string, value: string | string[] | React.ReactNode }> = ({ label, value }) => (
    <div className="py-2">
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        {Array.isArray(value) ? (
            <p className="text-base text-gray-800">{value.join(', ')}</p>
        ) : typeof value === 'string' ? (
             <p className="text-base text-gray-800">{value}</p>
        ) : (
            value
        )}
    </div>
);

const TimelineEvents: React.FC<{ jd: JobDescription }> = ({ jd }) => {
    const events = jd.approvalHistory
        .filter(s => s.status !== 'Pending' && s.date)
        .map(s => {
            const match = s.role.match(/\(([^)]+)\)/);
            const designation = match ? match[1] : s.status;
            return {
                title: s.role.replace(/ *\([^)]*\) */g, ""), // Remove text in parentheses
                status: s.status,
                designation: designation,
                date: new Date(s.date!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
        });
        
    if (jd.status === 'Approved') {
        const lastEvent = events[events.length - 1];
        if (lastEvent) {
             // For the synthetic 'Finalized' event, the designation can be the status itself.
             events.push({ title: 'Finalized', status: 'Approved', designation: 'Approved', date: lastEvent.date });
        }
    }
    
    return (
        <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Timeline Summary</h4>
            <div className="flex space-x-6 overflow-x-auto pb-2">
                {events.map((event, i) => (
                    <div key={i} className="flex-shrink-0">
                        <p className="text-sm font-bold text-gray-700">{event.title}</p>
                        <p className={`text-xs font-semibold ${event.status === 'Rejected' ? 'text-red-600' : 'text-green-600'}`}>{event.designation}</p>
                        <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const MultiSelectDropdown: React.FC<{
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}> = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter(item => item !== option));
  };

  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2 flex items-center justify-between cursor-pointer min-h-[42px]"
      >
        {selected.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selected.map(item => (
              <span key={item} className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full flex items-center">
                {item}
                <button onClick={(e) => { e.stopPropagation(); removeOption(item); }} className="ml-1 text-blue-500 hover:text-blue-700">
                  <XIcon className="w-3 h-3"/>
                </button>
              </span>
            ))}
          </div>
        )}
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <label key={option} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => handleSelect(option)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};


const JobDescriptionPage: React.FC<JobDescriptionPageProps> = ({ jobDescriptions, setJobDescriptions, staffingPlan }) => {
  const [selectedJd, setSelectedJd] = useState<JobDescription | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newJdData, setNewJdData] = useState(initialJdFormData);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [editingJd, setEditingJd] = useState<JobDescription | null>(null);
  
  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<JobDescriptionStatus | 'All'>('All');

  const availableSections = departmentSections[newJdData.department] || [];
  const qualificationsList = ['Matric', 'Intermediate', 'Bachelors', 'Masters', 'PhD', 'Diploma'];
  const licensesList = ['N/A', 'PMDC', 'PEC', 'CompTIA Security+', 'CISSP', 'SHRM-CP', 'PMP'];

  const availableDesignations = useMemo(() => {
    if (!newJdData.department) return [];
    const departmentPositions = staffingPlan.filter(p => p.department === newJdData.department);
    const designations = new Set(departmentPositions.map(p => p.designation));
    return Array.from(designations).sort();
  }, [staffingPlan, newJdData.department]);
  
  // Memoized lists for filters
  const departments = useMemo(() => ['All', ...Array.from(new Set(jobDescriptions.map(jd => jd.department)))], [jobDescriptions]);
  const sections = useMemo(() => {
    if (departmentFilter === 'All') return ['All'];
    const relevantSections = jobDescriptions.filter(jd => jd.department === departmentFilter);
    return ['All', ...Array.from(new Set(relevantSections.map(jd => jd.section)))];
  }, [jobDescriptions, departmentFilter]);
  const designations = useMemo(() => ['All', ...Array.from(new Set(jobDescriptions.map(jd => jd.designation)))], [jobDescriptions]);
  const statuses: Array<JobDescriptionStatus | 'All'> = ['All', 'Pending HOD Approval', 'Pending HR Review', 'Approved', 'Rejected', 'Needs Revision'];

  useEffect(() => {
    setSectionFilter('All');
  }, [departmentFilter]);

  const filteredJobDescriptions = useMemo(() => {
    return jobDescriptions.filter(jd => {
      const departmentMatch = departmentFilter === 'All' || jd.department === departmentFilter;
      const sectionMatch = sectionFilter === 'All' || jd.section === sectionFilter;
      const designationMatch = designationFilter === 'All' || jd.designation === designationFilter;
      const statusMatch = statusFilter === 'All' || jd.status === statusFilter;
      return departmentMatch && sectionMatch && designationMatch && statusMatch;
    });
  }, [jobDescriptions, departmentFilter, sectionFilter, designationFilter, statusFilter]);

  const handleViewDetails = (jd: JobDescription) => {
    setSelectedJd(jd);
    setIsDetailsModalOpen(true);
  };

  const handleViewHistory = (e: React.MouseEvent, jd: JobDescription) => {
    e.stopPropagation();
    setSelectedJd(jd);
    setIsHistoryModalOpen(true);
  };
  
  const handleOpenCreateModal = () => {
    setEditingJd(null);
    setNewJdData(initialJdFormData);
    setIsCreateModalOpen(true);
  }

  const handleEditClick = (e: React.MouseEvent, jd: JobDescription) => {
    e.stopPropagation(); // Prevent modal from opening
    setEditingJd(jd);
    setNewJdData({
        designation: jd.designation,
        department: jd.department,
        section: jd.section,
        reportsTo: jd.reportsTo,
        reportingPositions: jd.reportingPositions,
        qualification: jd.qualification,
        skills: jd.skills,
        experience: jd.experience,
        registrationLicense: jd.registrationLicense,
        jobSummary: jd.jobSummary,
        jobFunctions: jd.jobFunctions.join('\n'), // convert array back to string for textarea
        preparedBy: jd.preparedBy,
    });
    setIsCreateModalOpen(true); // Reuse the create modal
};

  const handleUpdateStatus = (id: number, approve: boolean, remarks: string, signature: string) => {
    const jd = jobDescriptions.find(j => j.id === id);
    if (!jd) return;
    
    let newStatus: JobDescriptionStatus = jd.status;
    const newApprovalHistory = JSON.parse(JSON.stringify(jd.approvalHistory));
    const now = new Date().toISOString().split('T')[0];

    const updateCurrentStep = (status: 'Approved' | 'Reviewed' | 'Rejected') => {
        const stepIndex = newApprovalHistory.findIndex((s: any) => s.status === 'Pending');
        if (stepIndex > -1) {
            newApprovalHistory[stepIndex].status = status;
            newApprovalHistory[stepIndex].date = now;
            newApprovalHistory[stepIndex].approver = signature;
            newApprovalHistory[stepIndex].comments = remarks;
        }
    };

    if (approve) {
        if (jd.status === 'Pending HOD Approval') {
            newStatus = 'Pending HR Review';
            updateCurrentStep('Approved');
            newApprovalHistory.push({ role: 'Reviewed By (HR)', status: 'Pending' });
        } else if (jd.status === 'Pending HR Review') {
            newStatus = 'Approved';
            updateCurrentStep('Reviewed');
        }
    } else { // Return for revision
        newStatus = 'Needs Revision';
        updateCurrentStep('Rejected');
    }

    const updatedJd = { ...jd, status: newStatus, approvalHistory: newApprovalHistory };

    setJobDescriptions(prev => prev.map(j => (j.id === id ? updatedJd : j)));
    setSelectedJd(updatedJd);
  };
  
  const handleApprovalAction = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = (remarks: string) => {
    if (selectedJd && approvalAction) {
        // In a real app, the user's name would be fetched from the session.
        handleUpdateStatus(selectedJd.id, approvalAction === 'approve', remarks, "Current User");
    }
    setIsApprovalModalOpen(false);
    setApprovalAction(null);
  };

  const handleJdInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'department') {
        const supervisor = departmentSupervisors[value] || '';
        setNewJdData(prev => ({
            ...prev,
            department: value,
            section: '',
            designation: '',
            preparedBy: supervisor,
        }));
    } else {
        setNewJdData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleMultiSelectChange = (fieldName: 'qualification' | 'registrationLicense', values: string[]) => {
      setNewJdData(prev => ({ ...prev, [fieldName]: values }));
  };

  const handleJdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJd) {
        // Update logic
        const updatedJd: JobDescription = {
            ...editingJd,
            ...newJdData,
            jobFunctions: newJdData.jobFunctions.split('\n').filter(line => line.trim() !== ''),
        };

        if (updatedJd.status === 'Needs Revision' || updatedJd.status === 'Rejected') {
            updatedJd.status = 'Pending HOD Approval';
            updatedJd.approvalHistory = [
                { role: 'Prepared By (Supervisor)', status: 'Approved', approver: updatedJd.preparedBy, date: updatedJd.preparedDate },
                { role: 'Approved By (HOD)', status: 'Pending' }
            ];
        }

        setJobDescriptions(prev => prev.map(jd => jd.id === editingJd.id ? updatedJd : jd));
    } else {
        // Create logic
        const preparedDate = new Date().toISOString().split('T')[0];
        const newJd: JobDescription = {
            id: jobDescriptions.length > 0 ? Math.max(...jobDescriptions.map(jd => jd.id)) + 1 : 1,
            ...newJdData,
            jobFunctions: newJdData.jobFunctions.split('\n').filter(line => line.trim() !== ''),
            status: 'Pending HOD Approval',
            preparedDate,
            approvalHistory: [
                { role: 'Prepared By (Supervisor)', status: 'Approved', approver: newJdData.preparedBy, date: preparedDate },
                { role: 'Approved By (HOD)', status: 'Pending' }
            ]
        };
        setJobDescriptions(prev => [newJd, ...prev]);
    }

    setIsCreateModalOpen(false);
  };
  
  const getApprovalStepIndex = (status: JobDescriptionStatus, history: any[]) => {
    switch (status) {
        case 'Pending HOD Approval': return 1;
        case 'Pending HR Review': return 2;
        case 'Approved': return 3;
        case 'Rejected': 
        case 'Needs Revision': 
            return history.findIndex(s => s.status === 'Rejected');
        default: return 0;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Job Description Management</CardTitle>
              <CardDescription>Departments create job descriptions for HOD and HR approval.</CardDescription>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base font-semibold transition-colors"
            >
              Create New Job Description
            </button>
          </div>
           <div className="flex items-end gap-6 flex-wrap pt-4 mt-4 border-t">
              <div>
                <label htmlFor="dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                <div className="relative mt-1">
                    <select id="dept-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-56 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
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
                    <select id="sec-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-56 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                      {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                 </div>
              </div>
              <div>
                <label htmlFor="desig-filter" className="text-sm font-medium text-slate-600">Designation</label>
                <div className="relative mt-1">
                    <select id="desig-filter" value={designationFilter} onChange={e => setDesignationFilter(e.target.value)} className="w-56 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                      {designations.map(desig => <option key={desig} value={desig}>{desig}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
              </div>
              <div>
                <label htmlFor="status-filter" className="text-sm font-medium text-slate-600">Status</label>
                <div className="relative mt-1">
                    <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as JobDescriptionStatus | 'All')} className="w-56 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                      {statuses.map(status => <option key={status} value={status}>{status}</option>)}
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
            <table className="w-full text-base text-left text-gray-600">
              <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">JD ID</th>
                  <th scope="col" className="px-6 py-3">Designation</th>
                  <th scope="col" className="px-6 py-3">Department</th>
                  <th scope="col" className="px-6 py-3">Prepared Date</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobDescriptions.map((jd) => (
                  <tr key={jd.id} className="border-b bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">#{jd.id}</td>
                    <td className="px-6 py-4">{jd.designation}</td>
                    <td className="px-6 py-4">{jd.department}</td>
                    <td className="px-6 py-4">{jd.preparedDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-sm font-medium rounded-full ${statusColorMap[jd.status]}`}>
                        {jd.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                        <button
                            onClick={() => handleViewDetails(jd)}
                            className="text-gray-500 hover:text-blue-600 p-1 rounded-full transition-colors inline-block"
                            title="View Details"
                        >
                            <EyeIcon className="w-6 h-6" />
                        </button>
                         <button
                            onClick={(e) => handleViewHistory(e, jd)}
                            className="text-gray-500 hover:text-indigo-600 p-1 rounded-full transition-colors inline-block"
                            title="View Approval History"
                        >
                            <HistoryIcon className="w-6 h-6" />
                        </button>
                        {['Pending HOD Approval', 'Needs Revision', 'Rejected'].includes(jd.status) && (
                            <button
                                onClick={(e) => handleEditClick(e, jd)}
                                className="text-gray-500 hover:text-green-600 p-1 rounded-full transition-colors inline-block"
                                title="Edit Details"
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedJd && (
        <Modal 
          isOpen={isDetailsModalOpen} 
          onClose={() => setIsDetailsModalOpen(false)} 
          title={
            <div className="flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-3 text-blue-600" />
                <span>JD Details: {selectedJd.designation}</span>
            </div>
          } 
          maxWidth="max-w-4xl"
        >
           <div className="space-y-6">
                <TimelineEvents jd={selectedJd} />

                <FormSection title="Job Identification">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <DetailItem label="Designation" value={selectedJd.designation} />
                    <DetailItem label="Department" value={selectedJd.department} />
                    <DetailItem label="Section" value={selectedJd.section} />
                    <DetailItem label="Reports To" value={selectedJd.reportsTo} />
                    <div className="md:col-span-2">
                      <DetailItem label="Reporting Positions" value={selectedJd.reportingPositions} />
                    </div>
                  </div>
                </FormSection>
                
                <FormSection title="Job Specifications">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <div className="md:col-span-2">
                      <DetailItem label="Qualification" value={selectedJd.qualification} />
                    </div>
                    <div className="md:col-span-2">
                      <DetailItem label="Skills" value={selectedJd.skills} />
                    </div>
                    <DetailItem label="Experience" value={selectedJd.experience} />
                    <DetailItem label="Registration/License" value={selectedJd.registrationLicense} />
                  </div>
                </FormSection>

                <FormSection title="Job Summary">
                    <p className="text-base text-gray-700 leading-relaxed">{selectedJd.jobSummary}</p>
                </FormSection>

                <FormSection title="Job Functions">
                    <ul className="list-disc list-inside space-y-2 text-base text-gray-700">
                        {selectedJd.jobFunctions.map((func, index) => <li key={index}>{func}</li>)}
                    </ul>
                </FormSection>

                <div>
                   <h3 className="text-xl font-bold text-gray-800 my-4 border-b-2 border-gray-200 pb-3">
                      Approval Workflow
                  </h3>
                  <ApprovalWorkflow 
                    stepNames={['Supervisor/Line Manager', 'HOD/Divisional Head', 'HR', 'Completed']}
                    currentStepIndex={getApprovalStepIndex(selectedJd.status, selectedJd.approvalHistory)}
                    isCompleted={selectedJd.status === 'Approved'}
                    isRejected={selectedJd.status === 'Rejected' || selectedJd.status === 'Needs Revision'}
                    approvalHistory={selectedJd.approvalHistory}
                  />
                </div>
            </div>
          {(selectedJd.status === 'Pending HOD Approval' || selectedJd.status === 'Pending HR Review') && (
            <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
              <button
                type="button"
                onClick={() => handleApprovalAction('reject')}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-base font-semibold"
              >
                Return for Revision
              </button>
              <button
                type="button"
                onClick={() => handleApprovalAction('approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold"
              >
                {selectedJd.status === 'Pending HOD Approval' ? 'Approve (as HOD)' : 'Approve (as HR)'}
              </button>
            </div>
          )}
        </Modal>
      )}

       {selectedJd && (
            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title={`Approval History for ${selectedJd.designation}`}
                maxWidth="max-w-3xl"
            >
                <div className="p-4">
                    <TimelineEvents jd={selectedJd} />
                    <div className="mt-6">
                        <ApprovalWorkflow 
                            stepNames={['Supervisor/Line Manager', 'HOD/Divisional Head', 'HR', 'Completed']}
                            currentStepIndex={getApprovalStepIndex(selectedJd.status, selectedJd.approvalHistory)}
                            isCompleted={selectedJd.status === 'Approved'}
                            isRejected={selectedJd.status === 'Rejected' || selectedJd.status === 'Needs Revision'}
                            approvalHistory={selectedJd.approvalHistory}
                        />
                    </div>
                </div>
            </Modal>
        )}
      
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={editingJd ? `Edit JD: ${editingJd.designation}` : "Create New Job Description"} maxWidth="max-w-6xl">
        <form onSubmit={handleJdSubmit}>
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-6">Job Identification</h3>
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-3">
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                            <select id="department" name="department" value={newJdData.department} onChange={handleJdInputChange} className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2">
                                {Object.keys(departmentSections).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label htmlFor="designation" className="block text-sm font-medium text-gray-700">Designation</label>
                            <select name="designation" id="designation" value={newJdData.designation} onChange={handleJdInputChange} required className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2">
                                <option value="">Select a designation from Staffing Plan</option>
                                {availableDesignations.map(desig => (
                                    <option key={desig} value={desig}>{desig}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section</label>
                            <select id="section" name="section" value={newJdData.section} onChange={handleJdInputChange} required className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2">
                                <option value="">Select a section</option>
                                {availableSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                            </select>
                        </div>
                         <div className="col-span-3">
                            <label htmlFor="reportsTo" className="block text-sm font-medium text-gray-700">Reports To</label>
                            <input type="text" name="reportsTo" id="reportsTo" value={newJdData.reportsTo} onChange={handleJdInputChange} required className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2" />
                        </div>
                         <div className="col-span-3">
                            <label htmlFor="reportingPositions" className="block text-sm font-medium text-gray-700">Reporting Positions</label>
                            <input type="text" name="reportingPositions" id="reportingPositions" value={newJdData.reportingPositions} onChange={handleJdInputChange} className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-6">Hiring Criteria</h3>
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Education</label>
                            <MultiSelectDropdown options={qualificationsList} selected={newJdData.qualification} onChange={(vals) => handleMultiSelectChange('qualification', vals)} placeholder="Select qualifications"/>
                        </div>
                        <div className="col-span-3">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Certifications / Licenses</label>
                           <MultiSelectDropdown options={licensesList} selected={newJdData.registrationLicense} onChange={(vals) => handleMultiSelectChange('registrationLicense', vals)} placeholder="Select licenses"/>
                        </div>
                         <div className="col-span-3">
                            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Required Experience</label>
                            <input type="text" name="experience" id="experience" placeholder="e.g., 5+ years" value={newJdData.experience} onChange={handleJdInputChange} required className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2" />
                        </div>
                        <div className="col-span-3">
                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Key Skills (comma-separated)</label>
                            <input type="text" name="skills" id="skills" placeholder="e.g., Project Management, SQL" value={newJdData.skills} onChange={handleJdInputChange} required className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2" />
                        </div>
                    </div>
                </div>
                
                 <div>
                    <h3 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-6">Job Summary & Functions</h3>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="jobSummary" className="block text-sm font-medium text-gray-700">Job Description</label>
                            <textarea name="jobSummary" id="jobSummary" rows={4} placeholder="Enter the detailed job description here..." value={newJdData.jobSummary} onChange={handleJdInputChange} required className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2"></textarea>
                        </div>
                        <div>
                            <label htmlFor="jobFunctions" className="block text-sm font-medium text-gray-700">Job Functions</label>
                            <textarea name="jobFunctions" id="jobFunctions" rows={6} placeholder="List the primary functions. Enter one per line." value={newJdData.jobFunctions} onChange={handleJdInputChange} required className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base px-3 py-2"></textarea>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-6">Preparation Details</h3>
                    <div>
                        <label htmlFor="preparedBy" className="block text-sm font-medium text-gray-700">Prepared By (Supervisor/Line Manager)</label>
                        <input 
                            type="text" 
                            name="preparedBy" 
                            id="preparedBy" 
                            value={newJdData.preparedBy} 
                            required 
                            readOnly
                            className="mt-1 w-full max-w-sm bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 focus:ring-0 focus:border-gray-300 text-base px-3 py-2 cursor-not-allowed" 
                        />
                    </div>
                </div>

            </div>

            <div className="flex justify-end pt-6 space-x-3 border-t mt-8">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-base font-semibold border border-gray-300">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base font-semibold"
                >
                    Save Changes
                </button>
            </div>
        </form>
      </Modal>

      {selectedJd && approvalAction && (
        <ApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          onConfirm={handleConfirmApproval}
          action={approvalAction}
          title={`${approvalAction === 'approve' ? 'Approve' : 'Return'} Job Description`}
        />
      )}
    </>
  );
};

export default JobDescriptionPage;
