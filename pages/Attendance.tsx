
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Candidate } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Modal } from '../components/Modal';
import { EyeIcon } from '../components/icons';

interface AttendanceProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
}

const REQUIRED_DOCUMENTS = [
    'Original CNIC',
    'Updated CV / Resume (x2)',
    'Academic Degrees (Originals & Copies)',
    'Experience Letters (Originals & Copies)',
    'Latest Passport-size Photograph (x2)',
    'Valid PMDC/PNC/PEC License (if applicable)',
    'NOC (for Govt. Employees)',
    'Fee Deposit Slip',
];

const Attendance: React.FC<AttendanceProps> = ({ candidates, setCandidates }) => {
    const today = new Date().toISOString().split('T')[0];
    const [dateFilter, setDateFilter] = useState<string>(today);
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [positionFilter, setPositionFilter] = useState('All');

    const [checklistModalOpen, setChecklistModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [currentChecklist, setCurrentChecklist] = useState<Record<string, boolean>>({});

    const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const departments = useMemo(() => ['All', ...Array.from(new Set(candidates.map(c => c.department)))], [candidates]);
    
    const sections = useMemo(() => {
        if (departmentFilter === 'All') {
            const allSections = Array.from(new Set(candidates.map(c => c.section)));
            return ['All', ...allSections];
        }
        return ['All', ...Array.from(new Set(candidates.filter(c => c.department === departmentFilter).map(c => c.section)))];
    }, [candidates, departmentFilter]);

    const positions = useMemo(() => ['All', ...Array.from(new Set(candidates.map(c => c.positionAppliedFor)))], [candidates]);

    useEffect(() => {
        setSectionFilter('All');
    }, [departmentFilter]);

    const filteredCandidates = useMemo(() => {
        return candidates
            .filter(c => {
                const dateMatch = c.interviewTime?.startsWith(dateFilter);
                const departmentMatch = departmentFilter === 'All' || c.department === departmentFilter;
                const sectionMatch = sectionFilter === 'All' || c.section === sectionFilter;
                const positionMatch = positionFilter === 'All' || c.positionAppliedFor === positionFilter;
                return dateMatch && departmentMatch && sectionMatch && positionMatch;
            })
            .sort((a, b) => new Date(a.interviewTime!).getTime() - new Date(b.interviewTime!).getTime());
    }, [candidates, dateFilter, departmentFilter, sectionFilter, positionFilter]);
    
    const selectableCandidates = useMemo(() => 
        filteredCandidates.filter(c => c.attendanceStatus === 'Pending' || !c.attendanceStatus),
    [filteredCandidates]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const selectableCount = selectableCandidates.length;
            const selectedCount = selectedCandidateIds.length;
            headerCheckboxRef.current.checked = selectedCount > 0 && selectedCount === selectableCount;
            headerCheckboxRef.current.indeterminate = selectedCount > 0 && selectedCount < selectableCount;
        }
    }, [selectedCandidateIds, selectableCandidates]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCandidateIds(selectableCandidates.map(c => c.id));
        } else {
            setSelectedCandidateIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedCandidateIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    
    const handleBulkMarkAbsent = () => {
        setCandidates(prev => prev.map(c => 
            selectedCandidateIds.includes(c.id) ? { ...c, attendanceStatus: 'Absent' } : c
        ));
        setSelectedCandidateIds([]);
    };


    const handleOpenChecklist = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        // Initialize checklist from candidate's saved data or with all false
        const initialChecklist = REQUIRED_DOCUMENTS.reduce((acc, doc) => {
            acc[doc] = candidate.documentChecklist?.[doc] || false;
            return acc;
        }, {} as Record<string, boolean>);
        setCurrentChecklist(initialChecklist);
        setChecklistModalOpen(true);
    };

    const handleMarkAbsent = (candidateId: number) => {
        setCandidates(prev => prev.map(c => 
            c.id === candidateId ? { ...c, attendanceStatus: 'Absent' } : c
        ));
    };

    const handleChecklistChange = (docName: string, isChecked: boolean) => {
        setCurrentChecklist(prev => ({ ...prev, [docName]: isChecked }));
    };

    const handleSaveChecklist = () => {
        if (!selectedCandidate) return;
        setCandidates(prev => prev.map(c => 
            c.id === selectedCandidate.id 
            ? { ...c, attendanceStatus: 'Present', documentChecklist: currentChecklist } 
            : c
        ));
        setChecklistModalOpen(false);
        setSelectedCandidate(null);
    };
    
    const getStatusBadge = (candidate: Candidate) => {
        const status = candidate.attendanceStatus || 'Pending';
        switch (status) {
            case 'Present':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">Present</span>;
            case 'Absent':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700">Absent</span>;
            case 'Pending':
            default:
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Candidate Attendance & Document Verification</CardTitle>
                        <CardDescription>Mark attendance and verify documents for candidates on the interview day.</CardDescription>
                    </div>
                     <div className="flex items-end gap-6 flex-wrap pt-4 mt-4 border-t">
                         <div>
                            <label htmlFor="date-filter" className="text-sm font-medium text-gray-700">Interview Date</label>
                            <input
                                id="date-filter"
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
                            />
                        </div>
                         <div>
                            <label htmlFor="dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                            <div className="relative mt-1">
                                <select id="dept-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
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
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
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
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                          </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 bg-slate-50 border-b flex items-center space-x-4">
                        <button
                            onClick={handleBulkMarkAbsent}
                            disabled={selectedCandidateIds.length === 0}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Mark Selected ({selectedCandidateIds.length}) as Absent
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-base text-left text-gray-600">
                            <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                                <tr>
                                     <th scope="col" className="p-4">
                                        <input
                                            type="checkbox"
                                            ref={headerCheckboxRef}
                                            onChange={handleSelectAll}
                                            disabled={selectableCandidates.length === 0}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th scope="col" className="px-6 py-3">Candidate</th>
                                    <th scope="col" className="px-6 py-3">Position</th>
                                    <th scope="col" className="px-6 py-3">Time</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.length > 0 ? filteredCandidates.map(c => (
                                    <tr key={c.id} className="border-b bg-white hover:bg-gray-50">
                                         <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCandidateIds.includes(c.id)}
                                                onChange={() => handleSelectOne(c.id)}
                                                disabled={c.attendanceStatus !== 'Pending' && !!c.attendanceStatus}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{c.name}</td>
                                        <td className="px-6 py-4">{c.positionAppliedFor}</td>
                                        <td className="px-6 py-4">{c.interviewTime ? new Date(c.interviewTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
                                        <td className="px-6 py-4">{getStatusBadge(c)}</td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            {c.attendanceStatus === 'Present' ? (
                                                <button onClick={() => handleOpenChecklist(c)} className="px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 flex items-center justify-center mx-auto">
                                                    <EyeIcon className="w-4 h-4 inline-block mr-1"/>
                                                    View/Edit Docs
                                                </button>
                                            ) : c.attendanceStatus === 'Absent' ? (
                                                <span className="text-sm text-gray-500 italic">Marked as absent</span>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleOpenChecklist(c)} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                                                        Present & Verify Docs
                                                    </button>
                                                    <button onClick={() => handleMarkAbsent(c.id)} className="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
                                                        Mark Absent
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-500">No interviews match the current filters for this date.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {selectedCandidate && (
                <Modal isOpen={checklistModalOpen} onClose={() => setChecklistModalOpen(false)} title={`Document Checklist for ${selectedCandidate.name}`}>
                    <div className="space-y-3">
                        {REQUIRED_DOCUMENTS.map(doc => (
                            <label key={doc} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={currentChecklist[doc] || false}
                                    onChange={(e) => handleChecklistChange(doc, e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-base text-gray-700">{doc}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                        <button onClick={() => setChecklistModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        <button onClick={handleSaveChecklist} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Save Checklist</button>
                    </div>
                </Modal>
            )}
        </>
    );
};
export default Attendance;
