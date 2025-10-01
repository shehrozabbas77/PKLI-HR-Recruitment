
import React, { useState, useMemo } from 'react';
import type { Candidate, CandidateStatus, JobAdvertisement } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Modal } from '../components/Modal';
import { ApplicationIcon, ScreenIcon } from '../components/icons';
import { RejectModal } from '../components/RejectModal';
import { ShortlistModal } from '../components/ShortlistModal';

interface ApplicationsProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  stage: 'collection' | 'department-review' | 'final-shortlisting';
  advertisements: JobAdvertisement[];
}

const statusColorMap: { [key in CandidateStatus]: string } = {
    'New': 'bg-[#e0f2fe] text-[#005a8c]',
    'Under Review': 'bg-indigo-100 text-indigo-800',
    'Sent to Department': 'bg-fuchsia-100 text-fuchsia-800',
    'Recommended by Department': 'bg-lime-100 text-lime-800',
    'Rejected': 'bg-[#fde8e9] text-[#c01823]',
    'Shortlisted for Interview': 'bg-purple-100 text-purple-800',
    'Recommended for Hire': 'bg-teal-100 text-teal-800',
    'Approved for Hire': 'bg-green-100 text-green-800',
    'Offer Sent': 'bg-yellow-100 text-yellow-800',
    'Offer Accepted': 'bg-sky-100 text-sky-800',
    'Pending Verification': 'bg-pink-100 text-pink-800',
    'Hired': 'bg-emerald-100 text-emerald-800',
};

const stageConfig = {
    collection: {
        title: 'Application Data Collection',
        description: 'A comprehensive view of all candidates from initial application through final shortlisting.',
        filters: ['All', 'New', 'Under Review', 'Sent to Dept', 'Dept. Recommended', 'Rejected'],
        initialFilter: 'All',
        statuses: ['New', 'Under Review', 'Sent to Department', 'Recommended by Department'],
    },
    'department-review': {
        title: 'Departmental Review & Shortlisting',
        description: 'Review candidates sent by HR and provide shortlisting recommendations.',
        filters: ['All', 'Pending Review', 'Recommended', 'Rejected'],
        initialFilter: 'Pending Review',
        // Show candidates sent to the dept and those they have recommended or rejected at this stage.
        statuses: ['Sent to Department', 'Recommended by Department'],
    },
    'final-shortlisting': {
        title: 'HR Final Shortlisting',
        description: 'Finalize shortlist based on departmental review.',
        filters: ['All', 'Ready to Finalize', 'Shortlisted', 'Rejected'],
        initialFilter: 'Ready to Finalize',
        statuses: ['Recommended by Department', 'Shortlisted for Interview'],
    },
};


const Applications: React.FC<ApplicationsProps> = ({ candidates, setCandidates, stage, advertisements }) => {
    const config = stageConfig[stage];
    const [filter, setFilter] = useState<string>(config.initialFilter);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(null);
    const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
    const [candidateToShortlist, setCandidateToShortlist] = useState<Candidate | null>(null);
    
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [positionFilter, setPositionFilter] = useState('All');
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    const handleGetData = () => {
        setIsFetching(true);
        setTimeout(() => {
            const maxId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) : 0;
            const newPortalCandidates: Omit<Candidate, 'id'>[] = [
                { name: 'Zohaib Hassan', positionAppliedFor: 'Sr. Database Administrator', department: 'ICT', section: 'Infrastructure', cnic: '35202-1112233-1', qualification: 'MCS', experienceYears: 7, organization: 'TechLogix', contact: '0300-9876543', city: 'Lahore', remarks: 'Fetched from portal.', status: 'New', panelNominationStatus: 'Pending Nomination', interviewPanel: [], appliedDate: new Date().toISOString().split('T')[0], adReference: 'AD-1', preInterviewFormSent: false },
                { name: 'Amina Sheikh', positionAppliedFor: 'Medical Officer', department: 'Medical Services', section: 'General Medicine', cnic: '35201-2223344-2', qualification: 'MBBS', experienceYears: 2, organization: 'Shalamar Hospital', contact: '0321-8765432', city: 'Lahore', remarks: 'Fetched from portal.', status: 'New', panelNominationStatus: 'Pending Nomination', interviewPanel: [], appliedDate: new Date().toISOString().split('T')[0], adReference: 'AD-2', preInterviewFormSent: false },
                { name: 'Faisal Qureshi', positionAppliedFor: 'Admin Officer', department: 'Administration', section: 'General Administration', cnic: '35201-3334455-3', qualification: 'BBA', experienceYears: 3, organization: 'Services Hospital', contact: '0333-7654321', city: 'Karachi', remarks: 'Fetched from portal.', status: 'New', panelNominationStatus: 'Pending Nomination', interviewPanel: [], appliedDate: new Date().toISOString().split('T')[0], adReference: 'AD-4', preInterviewFormSent: false },
            ];

            const candidatesToAdd = newPortalCandidates.map((c, index) => ({
                ...c,
                id: maxId + 1 + index,
            }));

            setCandidates(prev => [...candidatesToAdd, ...prev]);
            setIsFetching(false);
            alert(`${candidatesToAdd.length} new applications have been successfully fetched from the portal.`);
        }, 1500);
    };

    const stageCandidates = useMemo(() => {
        return candidates.filter(c => {
            const preInterviewStatuses: CandidateStatus[] = [
                'New', 'Under Review', 'Sent to Department',
                'Recommended by Department', 'Rejected'
            ];

            if (stage === 'collection') {
                return preInterviewStatuses.includes(c.status);
            }
            if (stage === 'department-review') {
                return config.statuses.includes(c.status) || c.status === 'Sent to Department' || (c.status === 'Rejected' && c.rejectionRemarks?.includes('department'));
            }
            if (stage === 'final-shortlisting') {
                return config.statuses.includes(c.status) || (c.status === 'Rejected' && !c.rejectionRemarks?.includes('department'));
            }
            return false;
        });
    }, [candidates, stage, config.statuses]);

    const departments = useMemo(() => {
        const uniqueDepts = new Set(stageCandidates.map(c => c.department));
        return ['All', ...Array.from(uniqueDepts)];
    }, [stageCandidates]);

    const sections = useMemo(() => {
        if (departmentFilter === 'All') return ['All'];
        const relevantCandidates = stageCandidates.filter(c => c.department === departmentFilter);
        return ['All', ...Array.from(new Set(relevantCandidates.map(c => c.section)))];
    }, [stageCandidates, departmentFilter]);

    const positionsAppliedFor = useMemo(() => {
        const uniquePositions = new Set(stageCandidates.map(c => c.positionAppliedFor));
        return ['All', ...Array.from(uniquePositions)];
    }, [stageCandidates]);

    const handleStatusChange = (id: number, status: CandidateStatus) => {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    };

    const handleViewDetails = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsDetailsModalOpen(true);
    };

    const handleRejectClick = (candidate: Candidate) => {
        setCandidateToReject(candidate);
        setIsRejectModalOpen(true);
    };

    const handleRejectConfirm = (remarks: string) => {
        if (!candidateToReject) return;
        setCandidates(prev => prev.map(c => 
            c.id === candidateToReject.id 
            ? { ...c, status: 'Rejected', rejectionRemarks: remarks }
            : c
        ));
        setIsRejectModalOpen(false);
        setCandidateToReject(null);
    };

    const handleShortlistClick = (candidate: Candidate) => {
        setCandidateToShortlist(candidate);
        setIsShortlistModalOpen(true);
    };

    const handleShortlistConfirm = (remarks: string) => {
        if (!candidateToShortlist) return;
        setCandidates(prev => prev.map(c =>
            c.id === candidateToShortlist.id
            ? { ...c, status: 'Shortlisted for Interview', shortlistingRemarks: remarks }
            : c
        ));
        setIsShortlistModalOpen(false);
        setCandidateToShortlist(null);
    };

    const filteredCandidates = useMemo(() => {
        return stageCandidates.filter(c => {
            const checkFilter = () => {
                if (filter === 'All') return true;
                if (filter === 'New') return c.status === 'New';
                if (filter === 'Under Review') return c.status === 'Under Review';
                if (filter === 'Sent to Dept') return c.status === 'Sent to Department';
                if (filter === 'Dept. Recommended') return c.status === 'Recommended by Department';
                if (filter === 'Rejected') return c.status === 'Rejected';
                
                if (filter === 'Pending Review') return c.status === 'Sent to Department';
                if (filter === 'Recommended') return c.status === 'Recommended by Department';
                if (filter === 'Ready to Finalize') return c.status === 'Recommended by Department';
                if (filter === 'Shortlisted') return c.status === 'Shortlisted for Interview';
                return true;
            };
            
            const checkSearch = () => {
                if (searchTerm.trim() === '') return true;
                const lowercasedSearch = searchTerm.toLowerCase();
                return c.name.toLowerCase().includes(lowercasedSearch);
            };
            
            const checkDepartment = (departmentFilter === 'All' || c.department === departmentFilter);
            const checkSection = (sectionFilter === 'All' || c.section === sectionFilter);
            const checkPosition = (positionFilter === 'All' || c.positionAppliedFor === positionFilter);

            return checkFilter() && checkSearch() && checkDepartment && checkSection && checkPosition;
        });

    }, [stageCandidates, filter, searchTerm, departmentFilter, sectionFilter, positionFilter]);

    const selectableCandidates = useMemo(() => {
        if (stage === 'collection') {
            return filteredCandidates.filter(c => c.status !== 'Rejected');
        }
        if (stage === 'department-review') {
            return filteredCandidates.filter(c => c.status === 'Sent to Department');
        }
        if (stage === 'final-shortlisting') {
            return filteredCandidates.filter(c => c.status === 'Recommended by Department');
        }
        return [];
    }, [filteredCandidates, stage]);

    const handleIndividualSelect = (candidateId: number) => {
        setSelectedCandidateIds(prev => 
            prev.includes(candidateId) 
                ? prev.filter(id => id !== candidateId)
                : [...prev, candidateId]
        );
    };

    const handleSendSelected = () => {
        setCandidates(prev => 
            prev.map(c => 
                selectedCandidateIds.includes(c.id) 
                    ? { ...c, status: 'Sent to Department' } 
                    : c
            )
        );
        setSelectedCandidateIds([]);
    };

    const handleRecommendSelected = () => {
        setCandidates(prev =>
            prev.map(c =>
                selectedCandidateIds.includes(c.id)
                    ? { ...c, status: 'Recommended by Department' }
                    : c
            )
        );
        setSelectedCandidateIds([]);
    };

    const handleDontRecommendSelected = () => {
        const remarks = 'Not recommended by department during bulk review.';
        setCandidates(prev =>
            prev.map(c =>
                selectedCandidateIds.includes(c.id)
                    ? { ...c, status: 'Rejected', rejectionRemarks: remarks }
                    : c
            )
        );
        setSelectedCandidateIds([]);
    };

    const handleShortlistSelected = () => {
        const remarks = 'Shortlisted via bulk action.';
        setCandidates(prev =>
            prev.map(c =>
                selectedCandidateIds.includes(c.id)
                    ? { ...c, status: 'Shortlisted for Interview', shortlistingRemarks: remarks }
                    : c
            )
        );
        setSelectedCandidateIds([]);
    };

    const handleRejectSelected = () => {
        const remarks = 'Rejected during final shortlisting bulk review.';
        setCandidates(prev =>
            prev.map(c =>
                selectedCandidateIds.includes(c.id)
                    ? { ...c, status: 'Rejected', rejectionRemarks: remarks }
                    : c
            )
        );
        setSelectedCandidateIds([]);
    };


    const renderActions = (candidate: Candidate) => {
        const actionButtonClass = "px-3 py-1 text-sm font-semibold text-white rounded-md transition-colors";
        
        if (stage === 'collection') {
            if (['New', 'Under Review'].includes(candidate.status)) {
                return (
                    <>
                        <button onClick={() => handleStatusChange(candidate.id, 'Sent to Department')} className={`${actionButtonClass} bg-[#0076b6] hover:bg-[#005a8c]`}>Send to Dept</button>
                        <button onClick={() => handleRejectClick(candidate)} className={`${actionButtonClass} bg-[#c01823] hover:bg-[#9a131c]`}>Reject</button>
                    </>
                );
            }
        } else if (stage === 'department-review') {
             if (candidate.status === 'Sent to Department') {
                return (
                    <>
                        <button onClick={() => handleStatusChange(candidate.id, 'Recommended by Department')} className={`${actionButtonClass} bg-green-500 hover:bg-green-600`}>Recommend</button>
                        <button onClick={() => handleRejectClick(candidate)} className={`${actionButtonClass} bg-orange-500 hover:bg-orange-600`}>Don't Recommend</button>
                    </>
                );
            }
        } else if (stage === 'final-shortlisting') {
            if (candidate.status === 'Recommended by Department') {
                return (
                    <>
                        <button onClick={() => handleShortlistClick(candidate)} className={`${actionButtonClass} bg-purple-500 hover:bg-purple-600`}>Shortlist for Interview</button>
                        <button onClick={() => handleRejectClick(candidate)} className={`${actionButtonClass} bg-[#c01823] hover:bg-[#9a131c]`}>Reject</button>
                    </>
                )
            }
        }
        return null;
    };
    
    const renderFilterControls = (
         <div className="flex items-end gap-6 flex-wrap">
            <div>
                <label htmlFor="department-filter" className="text-sm font-medium text-slate-600">Department</label>
                <div className="relative mt-1">
                    <select id="department-filter" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                        <option value="All">All Departments</option>
                        {departments.filter(d => d !== 'All').map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="section-filter" className="text-sm font-medium text-slate-600">Section</label>
                <div className="relative mt-1">
                    <select id="section-filter" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                        <option value="All">All Sections</option>
                        {sections.filter(s => s !== 'All').map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="position-filter" className="text-sm font-medium text-slate-600">Position</label>
                <div className="relative mt-1">
                    <select id="position-filter" value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                        <option value="All">All Positions</option>
                        {positionsAppliedFor.filter(p => p !== 'All').map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="search-filter" className="text-sm font-medium text-slate-600">Search by Name</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ScreenIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="search-filter"
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 bg-white border border-slate-300 rounded-md shadow-sm pl-10 pr-3 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{config.title}</CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2 flex-wrap justify-end">
                            {stage === 'collection' && (
                                <button
                                    onClick={handleGetData}
                                    disabled={isFetching}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isFetching ? 'Fetching...' : 'Get Data from Portal'}
                                </button>
                            )}
                            {config.filters.map(option => (
                                <button 
                                    key={option} 
                                    onClick={() => setFilter(option)}
                                    className={`px-3 py-1 text-base font-medium rounded-md whitespace-nowrap ${filter === option ? 'bg-[#0076b6] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                    {(stage === 'collection' || stage === 'department-review' || stage === 'final-shortlisting') && (
                        <div className="border-t mt-4 pt-4">
                           {renderFilterControls}
                            {stage === 'collection' && (
                                <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                                    <button onClick={() => setSelectedCandidateIds(selectableCandidates.map(c => c.id))} className="px-3 py-1 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700">Select All</button>
                                    <button onClick={() => setSelectedCandidateIds([])} className="px-3 py-1 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700">Deselect All</button>
                                    <button onClick={handleSendSelected} disabled={selectedCandidateIds.length === 0} className="px-3 py-1 text-sm font-semibold text-white bg-[#0076b6] rounded-md hover:bg-[#005a8c] disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        Send Selected ({selectedCandidateIds.length}) to Department
                                    </button>
                                </div>
                            )}
                            {stage === 'department-review' && (
                                <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                                    <button onClick={() => setSelectedCandidateIds(selectableCandidates.map(c => c.id))} className="px-3 py-1 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700">Select All</button>
                                    <button onClick={() => setSelectedCandidateIds([])} className="px-3 py-1 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700">Deselect All</button>
                                    <button onClick={handleRecommendSelected} disabled={selectedCandidateIds.length === 0} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        Recommend Selected ({selectedCandidateIds.length})
                                    </button>
                                    <button onClick={handleDontRecommendSelected} disabled={selectedCandidateIds.length === 0} className="px-3 py-1 text-sm font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        Don't Recommend Selected ({selectedCandidateIds.length})
                                    </button>
                                </div>
                            )}
                            {stage === 'final-shortlisting' && (
                                <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                                    <button onClick={() => setSelectedCandidateIds(selectableCandidates.map(c => c.id))} className="px-3 py-1 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700">Select All</button>
                                    <button onClick={() => setSelectedCandidateIds([])} className="px-3 py-1 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700">Deselect All</button>
                                    <button onClick={handleShortlistSelected} disabled={selectedCandidateIds.length === 0} className="px-3 py-1 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        Shortlist Selected ({selectedCandidateIds.length})
                                    </button>
                                    <button onClick={handleRejectSelected} disabled={selectedCandidateIds.length === 0} className="px-3 py-1 text-sm font-semibold text-white bg-[#c01823] rounded-md hover:bg-[#9a131c] disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        Reject Selected ({selectedCandidateIds.length})
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-base text-left text-gray-600">
                            <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    {(stage === 'collection' || stage === 'department-review' || stage === 'final-shortlisting') && (
                                        <th scope="col" className="px-6 py-3 w-12">
                                            <span className="sr-only">Select</span>
                                        </th>
                                    )}
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Position</th>
                                    <th scope="col" className="px-6 py-3">Ad Ref.</th>
                                    <th scope="col" className="px-6 py-3">Applied</th>
                                    <th scope="col" className="px-6 py-3">Opening</th>
                                    <th scope="col" className="px-6 py-3">Closing</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.map((candidate) => {
                                    const adId = candidate.adReference ? parseInt(candidate.adReference.replace('AD-', '')) : -1;
                                    const ad = advertisements.find(a => a.id === adId);
                                    return (
                                    <tr key={candidate.id} className="border-b bg-white hover:bg-gray-50">
                                        {(stage === 'collection' || stage === 'department-review' || stage === 'final-shortlisting') && (
                                            <td className="px-6 py-4">
                                                {selectableCandidates.some(c => c.id === candidate.id) && (
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedCandidateIds.includes(candidate.id)}
                                                        onChange={() => handleIndividualSelect(candidate.id)}
                                                        className="h-4 w-4 text-[#0076b6] border-gray-300 rounded focus:ring-[#0076b6]"
                                                    />
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{candidate.name}</div>
                                            <div className="text-sm text-gray-500">{candidate.city}</div>
                                        </td>
                                        <td className="px-6 py-4">{candidate.positionAppliedFor}</td>
                                        <td className="px-6 py-4">{candidate.adReference || 'N/A'}</td>
                                        <td className="px-6 py-4">{candidate.appliedDate || 'N/A'}</td>
                                        <td className="px-6 py-4">{ad?.publishedOn || 'N/A'}</td>
                                        <td className="px-6 py-4">{ad?.deadline || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-sm font-medium rounded-full ${statusColorMap[candidate.status]}`}>
                                                {candidate.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            {renderActions(candidate)}
                                            <button onClick={() => handleViewDetails(candidate)} className="font-medium text-[#0076b6] hover:underline text-sm">View Details</button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {selectedCandidate && (
                <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Details for ${selectedCandidate.name}`}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-base">
                            <div><strong>Position:</strong> {selectedCandidate.positionAppliedFor}</div>
                            <div><strong>CNIC:</strong> {selectedCandidate.cnic}</div>
                            <div><strong>Qualification:</strong> {selectedCandidate.qualification}</div>
                            <div><strong>Experience:</strong> {selectedCandidate.experienceYears} years</div>
                            <div><strong>Last Organization:</strong> {selectedCandidate.organization}</div>
                            <div><strong>Contact:</strong> {selectedCandidate.contact}</div>
                            <div className="col-span-2"><strong>HR Remarks:</strong> {selectedCandidate.remarks}</div>
                             {selectedCandidate.rejectionRemarks && (
                                <div className="col-span-2 mt-2 pt-2 border-t text-red-700">
                                    <strong>Rejection Reason:</strong> {selectedCandidate.rejectionRemarks}
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Attachments</h4>
                             <div className="space-y-2">
                                <a href="#" className="flex items-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <ApplicationIcon className="w-5 h-5 mr-3 text-gray-500"/>
                                    <span className="font-medium text-[#0076b6]">CV_Zahid_Mehmood.pdf</span>
                                </a>
                                 <a href="#" className="flex items-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <ApplicationIcon className="w-5 h-5 mr-3 text-gray-500"/>
                                    <span className="font-medium text-[#0076b6]">Degree_MBA.pdf</span>
                                </a>
                                 <a href="#" className="flex items-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <ApplicationIcon className="w-5 h-5 mr-3 text-gray-500"/>
                                    <span className="font-medium text-[#0076b6]">Experience_Letter_TechCorp.pdf</span>
                                </a>
                             </div>
                        </div>
                    </div>
                </Modal>
            )}

            {candidateToReject && (
                <RejectModal
                    isOpen={isRejectModalOpen}
                    onClose={() => setIsRejectModalOpen(false)}
                    onConfirm={handleRejectConfirm}
                    title={`Reject Candidate: ${candidateToReject.name}`}
                />
            )}
            
            {candidateToShortlist && (
                <ShortlistModal
                    isOpen={isShortlistModalOpen}
                    onClose={() => setIsShortlistModalOpen(false)}
                    onConfirm={handleShortlistConfirm}
                    title={`Shortlist for Interview: ${candidateToShortlist.name}`}
                />
            )}
        </>
    );
};

export default Applications;