import React, { useState, useMemo } from 'react';
import type { Candidate, PanelMember, Notification, PanelEvaluation } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Modal } from '../components/Modal';
import { CheckIcon, UsersIcon } from '../components/icons';
import { EvaluationRouter } from '../components/EvaluationForms';

interface NominationPortalProps {
    candidates: Candidate[];
    setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
}

const NominationPortal: React.FC<NominationPortalProps> = ({ candidates, setCandidates }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'evaluation'>('pending');
    const [notification, setNotification] = useState<Notification | null>(null);
    const [assignRepModal, setAssignRepModal] = useState<{ open: boolean, candidateId: number | null }>({ open: false, candidateId: null });
    const [repName, setRepName] = useState('');
    const [repDesignation, setRepDesignation] = useState('');
    const [evaluationModal, setEvaluationModal] = useState<{ open: boolean, candidate: Candidate | null, panelMemberName: string | null }>({ open: false, candidate: null, panelMemberName: null });
    const [evaluationData, setEvaluationData] = useState<PanelEvaluation | null>(null);
    
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [positionFilter, setPositionFilter] = useState('All');

    const panelistName = "Dr. Aisha Latif"; // Hardcoded for this view

    const relevantCandidates = useMemo(() => {
        return candidates.filter(c => c.interviewPanel.some(p => p.name === panelistName));
    }, [candidates, panelistName]);

    const departments = useMemo(() => ['All', ...new Set(relevantCandidates.map(c => c.department))], [relevantCandidates]);
    const sections = useMemo(() => {
        if (departmentFilter === 'All') return ['All'];
        return ['All', ...new Set(relevantCandidates.filter(c => c.department === departmentFilter).map(c => c.section))];
    }, [relevantCandidates, departmentFilter]);
    const positions = useMemo(() => ['All', ...new Set(relevantCandidates.map(c => c.positionAppliedFor))], [relevantCandidates]);


    const pendingNominations = useMemo(() => {
        return candidates.filter(c => 
            c.interviewPanel.some(p => p.name === panelistName && p.status === 'Pending') &&
            (departmentFilter === 'All' || c.department === departmentFilter) &&
            (sectionFilter === 'All' || c.section === sectionFilter) &&
            (positionFilter === 'All' || c.positionAppliedFor === positionFilter)
        );
    }, [candidates, panelistName, departmentFilter, sectionFilter, positionFilter]);

    const confirmedInterviewsByJob = useMemo(() => {
        const filteredRelevantCandidates = relevantCandidates.filter(c =>
            (departmentFilter === 'All' || c.department === departmentFilter) &&
            (sectionFilter === 'All' || c.section === sectionFilter) &&
            (positionFilter === 'All' || c.positionAppliedFor === positionFilter)
        );

        const confirmedCandidates = filteredRelevantCandidates.filter(c => c.interviewPanel.some(p => p.name === panelistName && (p.status === 'Available' || p.status === 'Representative Nominated')));
        
        const jobs: Record<string, Candidate[]> = {};
        confirmedCandidates.forEach(c => {
            const allCandidatesForThisJob = candidates.filter(cand => 
                cand.positionAppliedFor === c.positionAppliedFor && 
                (cand.interviewStatus === 'Scheduled' || cand.interviewStatus === 'Completed')
            );

            if (!jobs[c.positionAppliedFor]) {
                jobs[c.positionAppliedFor] = allCandidatesForThisJob;
            }
        });
        return jobs;
    }, [candidates, relevantCandidates, panelistName, departmentFilter, sectionFilter, positionFilter]);


    const handleConfirm = (candidateId: number) => {
        const confirmedCandidate = candidates.find(c => c.id === candidateId);
        if (!confirmedCandidate) return;
        const jobTitle = confirmedCandidate.positionAppliedFor;

        setCandidates(prev => prev.map(c => {
            // If this candidate is for the same job
            if (c.positionAppliedFor === jobTitle) {
                const newPanel = c.interviewPanel.map(p => 
                    // and the panel member is the current user
                    p.name === panelistName ? { ...p, status: 'Available' as const } : p
                );
                return { ...c, interviewPanel: newPanel };
            }
            return c;
        }));
        setNotification({ type: 'success', message: `Nomination confirmed for all ${jobTitle} interviews. The interviews will appear in the evaluation tab.` });
    };


    const handleOpenAssignRep = (candidateId: number) => {
        setRepName('');
        setRepDesignation('');
        setAssignRepModal({ open: true, candidateId });
    };

    const handleAssignRep = () => {
        if (!assignRepModal.candidateId || !repName || !repDesignation) return;
        
        const targetCandidate = candidates.find(c => c.id === assignRepModal.candidateId);
        if (!targetCandidate) return;
        const jobTitle = targetCandidate.positionAppliedFor;
        
        setCandidates(prev => prev.map(c => {
            if (c.positionAppliedFor === jobTitle) {
                const newPanel = c.interviewPanel.map(p => 
                    p.name === panelistName ? { 
                        ...p, 
                        status: 'Representative Nominated' as const,
                        representative: { name: repName, role: repDesignation }
                    } : p
                );
                return { ...c, interviewPanel: newPanel };
            }
            return c;
        }));
        
        setAssignRepModal({ open: false, candidateId: null });
        setNotification({ type: 'success', message: `You have assigned ${repName} as your representative for all ${jobTitle} interviews.` });
    };

    const handleOpenEvaluation = (candidate: Candidate) => {
        const panelMember = candidate.interviewPanel.find(p => p.name === panelistName);
        if (!panelMember) return; // Safeguard

        const panelMemberName = panelMember.status === 'Representative Nominated' && panelMember.representative ? panelMember.representative.name : panelMember.name;
        
        const existingEval = candidate.evaluation?.find(e => e.panelMemberName === panelMemberName);
        setEvaluationData(existingEval || { panelMemberName: panelMemberName, scores: {}, comments: {} });
        setEvaluationModal({ open: true, candidate, panelMemberName: panelMemberName });
    };
    
    const handleEvaluationChange = (field: string, value: any) => {
        if (!evaluationData) return;
        const [fieldKey, subKey] = field.split('.');
        if (subKey) {
            setEvaluationData(prev => ({ ...prev!, [fieldKey]: { ...(prev as any)[fieldKey], [subKey]: value } }));
        } else {
            setEvaluationData(prev => ({ ...prev!, [field]: value }));
        }
    };
    
    const handleSaveEvaluation = () => {
        if (!evaluationModal.candidate || !evaluationData) return;

        setCandidates(prevCands => prevCands.map(c => {
            if (c.id === evaluationModal.candidate!.id) {
                const otherEvals = c.evaluation?.filter(e => e.panelMemberName !== evaluationData.panelMemberName) || [];
                const newEvaluations = [...otherEvals, evaluationData];

                // Check if all panel members have evaluated
                const allPanelMembers = c.interviewPanel.map(p => {
                    return p.status === 'Representative Nominated' && p.representative ? p.representative.name : p.name;
                });
                const evaluatedMembers = new Set(newEvaluations.map(e => e.panelMemberName));
                
                const allEvaluated = allPanelMembers.every(name => evaluatedMembers.has(name));

                return { 
                    ...c, 
                    evaluation: newEvaluations,
                    interviewStatus: allEvaluated ? 'Completed' : c.interviewStatus
                };
            }
            return c;
        }));

        setEvaluationModal({ open: false, candidate: null, panelMemberName: null });
        setEvaluationData(null);
        setNotification({ type: 'success', message: `Evaluation for ${evaluationModal.candidate.name} has been saved.` });
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex border-b">
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 text-lg font-semibold border-b-4 transition-colors ${activeTab === 'pending' ? 'border-[#0076b6] text-[#0076b6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Pending Nominations ({pendingNominations.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('evaluation')}
                            className={`px-4 py-2 text-lg font-semibold border-b-4 transition-colors ${activeTab === 'evaluation' ? 'border-[#0076b6] text-[#0076b6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Interview Evaluation ({Object.keys(confirmedInterviewsByJob).length})
                        </button>
                    </div>
                    <div className="flex items-end gap-6 pt-4 mt-4">
                        <div>
                            <label htmlFor="dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                            <div className="relative mt-1">
                                <select id="dept-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
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
                                <select id="sec-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base" disabled={departmentFilter === 'All'}>
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
                            <label htmlFor="pos-filter" className="text-sm font-medium text-slate-600">Position</label>
                            <div className="relative mt-1">
                                <select id="pos-filter" value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                    {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
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
                <CardContent>
                    {activeTab === 'pending' && (
                        <div>
                            {pendingNominations.length > 0 ? (
                                <ul className="space-y-4">
                                    {pendingNominations.map(c => (
                                        <li key={c.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-lg text-gray-800">{c.positionAppliedFor}</p>
                                                <p className="text-gray-600">Interview Scheduled for: {c.interviewTime ? new Date(c.interviewTime).toLocaleString() : 'Date TBD'}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleConfirm(c.id)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Confirm</button>
                                                <button onClick={() => handleOpenAssignRep(c.id)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Assign Representative</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-8">You have no pending interview nominations matching the current filters.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'evaluation' && (
                         <div>
                            {Object.entries(confirmedInterviewsByJob).length > 0 ? (
                                <ul className="space-y-6">
                                    {(Object.entries(confirmedInterviewsByJob) as [string, Candidate[]][]).map(([jobTitle, jobCandidates]) => (
                                        <li key={jobTitle} className="p-4 border rounded-lg bg-gray-50">
                                            <h3 className="font-bold text-xl text-gray-800 mb-3">{jobTitle}</h3>
                                            <div className="space-y-2">
                                                {jobCandidates.map(c => {
                                                    const panelMember = c.interviewPanel.find(p => p.name === panelistName);

                                                    if (!panelMember) return null; 

                                                    const isEvaluated = c.evaluation?.some(e => e.panelMemberName === (panelMember.representative?.name || panelMember.name));

                                                    return (
                                                        <div key={c.id} className="flex justify-between items-center bg-white p-3 rounded-md border">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{c.name}</p>
                                                                <p className="text-sm text-gray-500">Interview: {c.interviewTime ? new Date(c.interviewTime).toLocaleString() : 'N/A'}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleOpenEvaluation(c)}
                                                                disabled={!['Scheduled', 'Completed'].includes(c.interviewStatus || '')}
                                                                className={`px-4 py-2 font-semibold rounded-md text-white transition-colors ${
                                                                    isEvaluated ? 'bg-green-600 hover:bg-green-700' : 'bg-teal-600 hover:bg-teal-700'
                                                                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                                            >
                                                                {isEvaluated ? 'View/Edit Evaluation' : 'Evaluate Candidate'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-8">No interviews are ready for evaluation with the current filters.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {notification && (
                <Modal isOpen={!!notification} onClose={() => setNotification(null)} title={notification.type === 'success' ? 'Success!' : 'Info'}>
                    <div className="text-center">
                        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
                            <CheckIcon className={`h-6 w-6 ${notification.type === 'success' ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Action Complete</h3>
                        <div className="mt-2 px-7 py-3">
                            <p className="text-base text-gray-600">{notification.message}</p>
                        </div>
                        <div className="mt-4">
                            <button type="button" onClick={() => setNotification(null)} className="px-4 py-2 bg-[#0076b6] text-white rounded-md hover:bg-[#005a8c] font-semibold">Close</button>
                        </div>
                    </div>
                </Modal>
            )}

            <Modal isOpen={assignRepModal.open} onClose={() => setAssignRepModal({ open: false, candidateId: null })} title="Assign a Representative">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="repName" className="block text-sm font-medium text-gray-700">Representative Name</label>
                        <input type="text" id="repName" value={repName} onChange={e => setRepName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="repDesignation" className="block text-sm font-medium text-gray-700">Representative Designation</label>
                        <input type="text" id="repDesignation" value={repDesignation} onChange={e => setRepDesignation(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
                <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                    <button type="button" onClick={() => setAssignRepModal({open: false, candidateId: null})} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                    <button type="button" onClick={handleAssignRep} disabled={!repName || !repDesignation} className="px-4 py-2 bg-[#0076b6] text-white rounded-md hover:bg-[#005a8c] font-semibold disabled:bg-gray-400">Confirm Assignment</button>
                </div>
            </Modal>
            
            {evaluationModal.open && evaluationModal.candidate && evaluationData && (
                <Modal isOpen={evaluationModal.open} onClose={() => setEvaluationModal({ open: false, candidate: null, panelMemberName: null })} title={`Evaluation for ${evaluationModal.candidate.name}`} maxWidth="max-w-5xl">
                    <EvaluationRouter
                        candidate={evaluationModal.candidate}
                        data={evaluationData}
                        onChange={handleEvaluationChange}
                    />
                     <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                        <button type="button" onClick={() => setEvaluationModal({ open: false, candidate: null, panelMemberName: null })} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        <button type="button" onClick={handleSaveEvaluation} className="px-4 py-2 bg-[#0076b6] text-white rounded-md hover:bg-[#005a8c] font-semibold">Save Evaluation</button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default NominationPortal;