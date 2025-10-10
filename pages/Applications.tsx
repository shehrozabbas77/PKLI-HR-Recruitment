import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Candidate, CandidateStatus, JobAdvertisement } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Modal } from '../components/Modal';
import { ApplicationIcon, ScreenIcon, PrinterIcon, CheckIcon } from '../components/icons';
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
    const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
    const [dataFetchedForAd, setDataFetchedForAd] = useState<number | null>(null);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    // State for the new summary tab in 'final-shortlisting'
    const [finalShortlistingTab, setFinalShortlistingTab] = useState<'review' | 'summary'>('review');
    const [summaryDepartmentFilter, setSummaryDepartmentFilter] = useState('All');
    const [summarySectionFilter, setSummarySectionFilter] = useState('All');
    const [summaryPositionFilter, setSummaryPositionFilter] = useState('All');
    const [showSentConfirmation, setShowSentConfirmation] = useState(false);
    const [summarySelectedIds, setSummarySelectedIds] = useState<number[]>([]);
    const summaryHeaderCheckboxRef = useRef<HTMLInputElement>(null);
    
    const summaryCandidates = useMemo(() => candidates.filter(c => 
        c.status === 'Recommended by Department' ||
        c.status === 'Shortlisted for Interview' || 
        (c.status === 'Rejected' && !c.rejectionRemarks?.includes('department'))
    ), [candidates]);

    const summaryDepartments = useMemo(() => {
        return ['All', ...Array.from(new Set(summaryCandidates.map(c => c.department)))];
    }, [summaryCandidates]);

    const summarySections = useMemo(() => {
        if (summaryDepartmentFilter === 'All') return ['All'];
        const relevantCandidates = summaryCandidates.filter(c => c.department === summaryDepartmentFilter);
        return ['All', ...Array.from(new Set(relevantCandidates.map(c => c.section)))];
    }, [summaryCandidates, summaryDepartmentFilter]);

    const summaryPositions = useMemo(() => {
        let relevantCandidates = summaryCandidates;
        if (summaryDepartmentFilter !== 'All') {
            relevantCandidates = relevantCandidates.filter(c => c.department === summaryDepartmentFilter);
        }
        if (summarySectionFilter !== 'All') {
            relevantCandidates = relevantCandidates.filter(c => c.section === summarySectionFilter);
        }
        return ['All', ...Array.from(new Set(relevantCandidates.map(c => c.positionAppliedFor)))];
    }, [summaryCandidates, summaryDepartmentFilter, summarySectionFilter]);

    const filteredSummaryList = useMemo(() =>
        summaryCandidates.filter(c =>
            (summaryDepartmentFilter === 'All' || c.department === summaryDepartmentFilter) &&
            (summarySectionFilter === 'All' || c.section === summarySectionFilter) &&
            (summaryPositionFilter === 'All' || c.positionAppliedFor === summaryPositionFilter)
        ),
        [summaryCandidates, summaryDepartmentFilter, summarySectionFilter, summaryPositionFilter]
    );

    useEffect(() => { setSummarySectionFilter('All'); }, [summaryDepartmentFilter]);
    useEffect(() => { setSummaryPositionFilter('All'); }, [summarySectionFilter]);
    
    useEffect(() => {
        if (summaryHeaderCheckboxRef.current) {
            const selectableCount = filteredSummaryList.length;
            const selectedCount = summarySelectedIds.length;
            summaryHeaderCheckboxRef.current.checked = selectableCount > 0 && selectedCount === selectableCount;
            summaryHeaderCheckboxRef.current.indeterminate = selectedCount > 0 && selectedCount < selectableCount;
        }
    }, [summarySelectedIds, filteredSummaryList]);

    const handleSelectAllSummary = () => {
        setSummarySelectedIds(filteredSummaryList.map(c => c.id));
    };

    const handleDeselectAllSummary = () => {
        setSummarySelectedIds([]);
    };

    const handleSelectSingleSummary = (id: number) => {
        setSummarySelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    
    const handleSelectAllSummaryCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            handleSelectAllSummary();
        } else {
            handleDeselectAllSummary();
        }
    };

    const handleSendBulkAcknowledgement = () => {
        if (summarySelectedIds.length > 0) {
            alert(`Acknowledgement sent to the respective departments for ${summarySelectedIds.length} selected candidate(s).`);
            setSummarySelectedIds([]);
        }
    };


    const handleSendSummary = () => {
        setShowSentConfirmation(true);
    };

    const handleConfirmSend = () => {
        setShowSentConfirmation(false);
        setTimeout(() => window.print(), 300); // Give modal time to close
    }

    const handleGetData = () => {
        if (!selectedAdId) return;
        setIsFetching(true);
        setTimeout(() => {
            setDataFetchedForAd(selectedAdId);
            setIsFetching(false);
            const ad = advertisements.find(a => a.id === selectedAdId);
            alert(`Applicant data for "${ad?.title}" has been successfully fetched from the portal.`);
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
        const finalRemarks = stage === 'department-review' 
            ? `Not recommended by department: ${remarks}` 
            : remarks;

        setCandidates(prev => prev.map(c => 
            c.id === candidateToReject.id 
            ? { ...c, status: 'Rejected', rejectionRemarks: finalRemarks }
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
        if (stage === 'collection' && !dataFetchedForAd) {
            return [];
        }

        let candidatesToFilter = stageCandidates;

        if (stage === 'collection' && dataFetchedForAd) {
            candidatesToFilter = stageCandidates.filter(c => c.adReference === `AD-${dataFetchedForAd}`);
        }

        return candidatesToFilter.filter(c => {
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

    }, [stageCandidates, filter, searchTerm, departmentFilter, sectionFilter, positionFilter, stage, dataFetchedForAd]);

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
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            const selectableCount = selectableCandidates.length;
            const selectedCount = selectedCandidateIds.filter(id => selectableCandidates.some(c => c.id === id)).length;
            headerCheckboxRef.current.checked = selectableCount > 0 && selectedCount === selectableCount;
            headerCheckboxRef.current.indeterminate = selectedCount > 0 && selectedCount < selectableCount;
        }
    }, [selectedCandidateIds, selectableCandidates]);

    const handleIndividualSelect = (candidateId: number) => {
        setSelectedCandidateIds(prev => 
            prev.includes(candidateId) 
                ? prev.filter(id => id !== candidateId)
                : [...prev, candidateId]
        );
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCandidateIds(selectableCandidates.map(c => c.id));
        } else {
            setSelectedCandidateIds([]);
        }
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

    if (stage === 'collection' && !dataFetchedForAd) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiredAds = advertisements.filter(ad => new Date(ad.deadline) < today);

        return (
             <Card>
                <CardHeader>
                    <CardTitle>Fetch Applicant Data from Portal</CardTitle>
                    <CardDescription>Select an advertisement with a past deadline to fetch applicant data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto p-2 border rounded-md bg-slate-50">
                        {expiredAds.length > 0 ? expiredAds.map(ad => (
                            <div 
                                key={ad.id} 
                                onClick={() => setSelectedAdId(ad.id)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAdId === ad.id ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'bg-white hover:bg-gray-100'}`}
                            >
                                <p className="font-bold text-gray-800">{ad.title}</p>
                                <p className="text-sm text-gray-500">Deadline: {ad.deadline} | Published: {ad.publishedOn || 'N/A'} | Positions: {ad.positions.length}</p>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-500">
                                <p>No expired advertisements found.</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t flex justify-end">
                        <button
                            onClick={handleGetData}
                            disabled={!selectedAdId || isFetching}
                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-base font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center shadow-sm hover:shadow-md"
                        >
                            {isFetching ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Fetching...
                                </>
                            ) : (
                                'Get Data from Portal'
                            )}
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <style>{`
                #summary-table-container .no-print-action { display: table-cell; }
                .print-only { display: none; }
                @media print {
                    body > #root > div > header, 
                    body > #root > div > footer,
                    main > .mb-8,
                    .no-print {
                        display: none !important;
                    }
                    main {
                        padding: 1rem !important;
                        margin: 0 !important;
                    }
                    #applications-card {
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    #summary-table-container .no-print-action {
                        display: none !important;
                    }
                    #summary-table-container table {
                        font-size: 10px;
                    }
                    #summary-table-container th, 
                    #summary-table-container td {
                        padding: 4px 8px !important;
                    }
                }
            `}</style>
            <Card id="applications-card">
                <CardHeader className="no-print">
                    {stage === 'collection' && !dataFetchedForAd ? (
                        <div>
                            <CardTitle>Fetch Applicant Data</CardTitle>
                            <CardDescription>No data source selected.</CardDescription>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start">
                                <div>
                                    {stage === 'collection' && dataFetchedForAd && (
                                        <button onClick={() => { setDataFetchedForAd(null); setSelectedAdId(null); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                            Select Another Advertisement
                                        </button>
                                    )}
                                    <CardTitle>{config.title}</CardTitle>
                                    <CardDescription>
                                        {stage === 'collection' && dataFetchedForAd ? `Displaying applicants for "${advertisements.find(a => a.id === dataFetchedForAd)?.title}"` : config.description}
                                    </CardDescription>
                                </div>
                                 {(stage !== 'final-shortlisting' || (stage === 'final-shortlisting' && finalShortlistingTab === 'review')) && (
                                    <div className="flex items-center space-x-2 flex-wrap justify-end">
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
                                )}
                            </div>
                            
                             {stage === 'final-shortlisting' && (
                                <div className="mt-4 border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                        <button
                                            onClick={() => setFinalShortlistingTab('review')}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base ${finalShortlistingTab === 'review' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                        >
                                            Candidate Review
                                        </button>
                                        <button
                                            onClick={() => setFinalShortlistingTab('summary')}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base ${finalShortlistingTab === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                        >
                                            Summary
                                        </button>
                                    </nav>
                                </div>
                            )}

                            {(stage === 'collection' || stage === 'department-review' || (stage === 'final-shortlisting' && finalShortlistingTab === 'review')) && (
                                <div className="border-t mt-4 pt-4">
                                {renderFilterControls}
                                    {stage === 'collection' && (
                                        <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                                            <button onClick={handleSendSelected} disabled={selectedCandidateIds.length === 0} className="px-3 py-1 text-sm font-semibold text-white bg-[#0076b6] rounded-md hover:bg-[#005a8c] disabled:bg-gray-400 disabled:cursor-not-allowed">
                                                Send Selected ({selectedCandidateIds.length}) to Department
                                            </button>
                                        </div>
                                    )}
                                    {stage === 'department-review' && (
                                        <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
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
                        </>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {stage === 'final-shortlisting' && finalShortlistingTab === 'summary' ? (
                        <div className="p-6">
                            <div className="no-print flex justify-between items-end mb-6 pb-4 border-b gap-4 flex-wrap">
                                <div className="flex items-end gap-4 flex-wrap">
                                    <div>
                                        <label htmlFor="summary-dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                                        <div className="relative mt-1">
                                            <select 
                                                id="summary-dept-filter" 
                                                value={summaryDepartmentFilter}
                                                onChange={e => setSummaryDepartmentFilter(e.target.value)}
                                                className="w-56 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                                            >
                                                {summaryDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="summary-sec-filter" className="text-sm font-medium text-slate-600">Section</label>
                                        <div className="relative mt-1">
                                            <select 
                                                id="summary-sec-filter" 
                                                value={summarySectionFilter}
                                                onChange={e => setSummarySectionFilter(e.target.value)}
                                                disabled={summaryDepartmentFilter === 'All'}
                                                className="w-56 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            >
                                                {summarySections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="summary-pos-filter" className="text-sm font-medium text-slate-600">Position</label>
                                        <div className="relative mt-1">
                                            <select 
                                                id="summary-pos-filter" 
                                                value={summaryPositionFilter}
                                                onChange={e => setSummaryPositionFilter(e.target.value)}
                                                className="w-56 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                                            >
                                                {summaryPositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendSummary}
                                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 font-semibold text-sm flex items-center"
                                >
                                    <PrinterIcon className="w-4 h-4 mr-2" />
                                    Send Summary to Department
                                </button>
                            </div>
                            <div className="print-only mb-6">
                                <h2 className="text-2xl font-bold">HR Final Shortlisting Summary</h2>
                                <p className="text-lg text-slate-600">
                                    {summaryDepartmentFilter !== 'All' && `Department: ${summaryDepartmentFilter}`}
                                    {summarySectionFilter !== 'All' && ` / Section: ${summarySectionFilter}`}
                                    {summaryPositionFilter !== 'All' && ` / Position: ${summaryPositionFilter}`}
                                </p>
                            </div>
                            <div id="summary-table-container">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle>HR Shortlisting Summary ({filteredSummaryList.length})</CardTitle>
                                            <div className="flex items-center space-x-4 no-print">
                                                <button onClick={handleSelectAllSummary} className="text-sm font-semibold text-blue-600 hover:underline">Select All</button>
                                                <button onClick={handleDeselectAllSummary} className="text-sm font-semibold text-blue-600 hover:underline">Deselect All</button>
                                                <button
                                                    onClick={handleSendBulkAcknowledgement}
                                                    disabled={summarySelectedIds.length === 0}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-sm flex items-center disabled:bg-gray-400"
                                                >
                                                    Send to Dept for Acknowledgement ({summarySelectedIds.length})
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-base text-left text-gray-600">
                                                <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="p-4 no-print-action">
                                                            <input
                                                                type="checkbox"
                                                                ref={summaryHeaderCheckboxRef}
                                                                onChange={handleSelectAllSummaryCheckbox}
                                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">Candidate Name</th>
                                                        <th scope="col" className="px-6 py-3">Position</th>
                                                        <th scope="col" className="px-6 py-3">Dept. Status</th>
                                                        <th scope="col" className="px-6 py-3">HR Status</th>
                                                        <th scope="col" className="px-6 py-3">HR Remarks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredSummaryList.length > 0 ? filteredSummaryList.map(c => {
                                                        let hrStatus, hrStatusColor, hrRemarks;
                                                        switch (c.status) {
                                                            case 'Shortlisted for Interview':
                                                                hrStatus = 'Shortlisted';
                                                                hrStatusColor = 'bg-green-100 text-green-800';
                                                                hrRemarks = c.shortlistingRemarks;
                                                                break;
                                                            case 'Rejected':
                                                                hrStatus = 'Rejected';
                                                                hrStatusColor = 'bg-red-100 text-red-800';
                                                                hrRemarks = c.rejectionRemarks;
                                                                break;
                                                            case 'Recommended by Department':
                                                            default:
                                                                hrStatus = 'Pending';
                                                                hrStatusColor = 'bg-yellow-100 text-yellow-800';
                                                                hrRemarks = 'N/A';
                                                                break;
                                                        }

                                                        return (
                                                            <tr key={c.id} className="border-b bg-white hover:bg-gray-50">
                                                                <td className="p-4 no-print-action">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={summarySelectedIds.includes(c.id)}
                                                                        onChange={() => handleSelectSingleSummary(c.id)}
                                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 font-semibold text-gray-900">{c.name}</td>
                                                                <td className="px-6 py-4">{c.positionAppliedFor}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className="px-2 py-1 text-sm font-medium rounded-full bg-lime-100 text-lime-800">
                                                                        Shortlisted
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 text-sm font-medium rounded-full ${hrStatusColor}`}>
                                                                        {hrStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm italic text-gray-500 max-w-xs truncate" title={hrRemarks}>
                                                                    {hrRemarks || 'N/A'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }) : (
                                                        <tr>
                                                            <td colSpan={6} className="text-center py-10 text-gray-500">No candidates match the current filters.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left text-gray-600">
                                <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        {(stage === 'collection' || stage === 'department-review' || stage === 'final-shortlisting') && (
                                            <th scope="col" className="px-6 py-3 w-12">
                                                <input
                                                    type="checkbox"
                                                    ref={headerCheckboxRef}
                                                    onChange={handleSelectAll}
                                                    disabled={selectableCandidates.length === 0}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
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
                                                    {stage === 'department-review' && candidate.status === 'Sent to Department' ? 'Pending Review' : candidate.status}
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
                    )}
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
            <Modal isOpen={showSentConfirmation} onClose={() => setShowSentConfirmation(false)} title="Confirmation">
                <div className="text-center p-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Summary Ready to Send</h3>
                    <p className="mt-2 text-base text-gray-600">
                        The summary for the {summaryDepartmentFilter !== 'All' ? `${summaryDepartmentFilter} department` : 'selected departments'} is ready. The print dialog will now open, allowing you to save as a PDF to send for intimation.
                    </p>
                </div>
                <div className="mt-4 flex justify-end p-4 bg-gray-50 rounded-b-xl">
                    <button 
                        onClick={handleConfirmSend} 
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                    >
                        OK
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Applications;
