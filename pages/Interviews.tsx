import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Candidate, PanelMember, SelectionBoard, InterviewStatus, PanelEvaluation, PanelMemberStatus, Notification, JobAdvertisement, Requisition, CandidateStatus } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Modal } from '../components/Modal';
import { SelectionBoardModal } from '../components/SelectionBoardModal';
import { ClipboardListIcon, EditIcon, MailIcon, ClockIcon, CheckIcon, UsersIcon, EyeIcon, PrinterIcon, UploadIcon } from '../components/icons';
import { departmentSections, MOCK_PANELISTS } from '../constants';
import { RegretLetterModal } from '../components/RegretLetterModal';
import { PreInterviewFormRouter } from '../components/PreInterviewForms';

// --- Candidate Comparison Component ---
interface CandidateComparisonProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

const CandidateComparison: React.FC<CandidateComparisonProps> = ({
  candidates,
  setCandidates,
  setNotification
}) => {
    const [regretModalCandidate, setRegretModalCandidate] = useState<Candidate | null>(null);

    // Filter states
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [positionFilter, setPositionFilter] = useState('All');
    
    const [uploadedSheets, setUploadedSheets] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const evaluatedOrCompletedCandidates = useMemo(() =>
        candidates.filter(c => c.evaluation && c.evaluation.length > 0),
    [candidates]);
    
    const departments = useMemo(() => ['All', ...Array.from(new Set(evaluatedOrCompletedCandidates.map(c => c.department)))], [evaluatedOrCompletedCandidates]);
    
    const sections = useMemo(() => {
        const relevantCandidates = departmentFilter === 'All' 
            ? evaluatedOrCompletedCandidates 
            : evaluatedOrCompletedCandidates.filter(c => c.department === departmentFilter);
        return ['All', ...Array.from(new Set(relevantCandidates.map(c => c.section)))];
    }, [evaluatedOrCompletedCandidates, departmentFilter]);

    const positions = useMemo(() => {
        let relevantCandidates = evaluatedOrCompletedCandidates;
        if (departmentFilter !== 'All') {
            relevantCandidates = relevantCandidates.filter(c => c.department === departmentFilter);
        }
        if (sectionFilter !== 'All') {
            relevantCandidates = relevantCandidates.filter(c => c.section === sectionFilter);
        }
        return ['All', ...Array.from(new Set(relevantCandidates.map(c => c.positionAppliedFor))).sort()];
    }, [evaluatedOrCompletedCandidates, departmentFilter, sectionFilter]);
    
    useEffect(() => { setSectionFilter('All'); }, [departmentFilter]);
    useEffect(() => { setPositionFilter('All'); }, [departmentFilter, sectionFilter]);
    
    useEffect(() => {
        if (positions.length > 1 && (positionFilter === 'All' || !positions.includes(positionFilter))) {
            setPositionFilter(positions[1]); // Auto-select the first available position
        } else if (positions.length <= 1) { // Only 'All' or is empty
            setPositionFilter('All');
        }
    }, [positions]);

    const displayedCandidates = useMemo(() => {
        if (positionFilter === 'All') return [];
        return evaluatedOrCompletedCandidates.filter(c => c.positionAppliedFor === positionFilter);
    }, [evaluatedOrCompletedCandidates, positionFilter]);

    const sortedCandidates = useMemo(() => {
      if (!displayedCandidates.length) return [];
      
      return displayedCandidates.map(c => {
        // FIX: Explicitly cast result of Object.values to number[] to ensure correct type for reduce operation.
        const panelScores = c.evaluation?.map(e => (Object.values(e.scores) as number[]).reduce((sum, score) => sum + score, 0)) || [];
        const averageScore = panelScores.length > 0 ? panelScores.reduce((a, b) => a + b, 0) / panelScores.length : 0;
        return { ...c, averageScore };
      }).sort((a, b) => b.averageScore - a.averageScore);
    }, [displayedCandidates]);

    const allPanelists = useMemo(() => {
        if (!displayedCandidates.length) return [];
        const panelists = new Set<string>();
        displayedCandidates.forEach(c => {
            c.evaluation?.forEach(e => panelists.add(e.panelMemberName));
        });
        return Array.from(panelists).sort();
    }, [displayedCandidates]);

    const handleStatusChange = (candidateId: number, newStatus: 'Recommended' | 'Not Recommended' | 'Pending') => {
        let finalStatus: CandidateStatus;
        if (newStatus === 'Recommended') {
            finalStatus = 'Recommended for Hire';
        } else if (newStatus === 'Not Recommended') {
            finalStatus = 'Rejected';
        } else {
            finalStatus = 'Shortlisted for Interview'; // Revert to a neutral post-interview status
        }

        setCandidates(prev => 
            prev.map(c => c.id === candidateId ? { ...c, status: finalStatus } : c)
        );
    };

    const handleDesignationChange = (candidateId: number, newDesignation: string) => {
        setCandidates(prev => 
            prev.map(c => c.id === candidateId ? { ...c, recommendedDesignation: newDesignation } : c)
        );
    };
    
    const handleSendRegretLetter = () => {
        if (regretModalCandidate) {
            setNotification({ type: 'success', message: `Regret letter sent to ${regretModalCandidate.name}.` });
            setRegretModalCandidate(null);
        }
    };
    
    const handlePrint = () => {
        if (positionFilter === 'All') {
            alert('Please select a position from the dropdown to print the comparative sheet.');
            return;
        }

        const printContentNode = document.getElementById('printable-comparative');
        if (!printContentNode) return;

        const printWindow = window.open('', '_blank', 'height=800,width=1200');

        if (printWindow) {
            printWindow.document.title = 'Print Comparative Sheet';

            const tailwindScript = printWindow.document.createElement('script');
            tailwindScript.src = 'https://cdn.tailwindcss.com';
            printWindow.document.head.appendChild(tailwindScript);
            
            const fontPreconnect1 = printWindow.document.createElement('link');
            fontPreconnect1.rel = 'preconnect';
            fontPreconnect1.href = 'https://fonts.googleapis.com';
            printWindow.document.head.appendChild(fontPreconnect1);

            const fontPreconnect2 = printWindow.document.createElement('link');
            fontPreconnect2.rel = 'preconnect';
            fontPreconnect2.href = 'https://fonts.gstatic.com';
            fontPreconnect2.crossOrigin = 'anonymous';
            printWindow.document.head.appendChild(fontPreconnect2);

            const fontLink = printWindow.document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap';
            printWindow.document.head.appendChild(fontLink);

            const styleEl = printWindow.document.createElement('style');
            styleEl.textContent = `
                body { font-family: 'Poppins', sans-serif; }
                .print-hidden { display: none !important; }
                .hidden.print\\:block { display: block !important; }
                body { background: white !important; }
                #printable-comparative { box-shadow: none !important; border: none !important; }
                #printable-comparative .p-0 { padding: 0 !important; }
                table { font-size: 10px; }
                td, th { padding: 4px 8px !important; }
                @page { size: landscape; margin: 1cm; }
            `;
            printWindow.document.head.appendChild(styleEl);

            const clonedNode = printContentNode.cloneNode(true) as HTMLElement;
            
            const originalSelects = printContentNode.querySelectorAll('select');
            const clonedSelects = clonedNode.querySelectorAll('select');
            originalSelects.forEach((select, index) => {
                if (clonedSelects[index]) {
                    clonedSelects[index].value = select.value;
                }
            });

            const originalInputs = printContentNode.querySelectorAll('input[type="text"]');
            const clonedInputs = clonedNode.querySelectorAll('input[type="text"]');
            originalInputs.forEach((input, index) => {
                if (clonedInputs[index]) {
                    (clonedInputs[index] as HTMLInputElement).value = (input as HTMLInputElement).value;
                }
            });

            printWindow.document.body.appendChild(clonedNode);
            
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 1500); 
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && positionFilter !== 'All') {
            setUploadedSheets(prev => ({ ...prev, [positionFilter]: true }));
            setNotification({
                type: 'success',
                message: `Approved sheet "${file.name}" for ${positionFilter} has been uploaded.`
            });
        }
        if (event.target) {
            event.target.value = '';
        }
    };


    return (
        <>
            <div id="printable-comparative">
                <Card>
                    <CardHeader>
                        <div className="print-hidden">
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div>
                                    <CardTitle>Comparative of Interviews</CardTitle>
                                    <CardDescription>Compare evaluated candidates and make a hiring decision.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold text-sm flex items-center"
                                    >
                                        <PrinterIcon className="w-4 h-4 mr-2" />
                                        Print
                                    </button>
                                    <button
                                        onClick={handleUploadClick}
                                        disabled={positionFilter === 'All'}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-sm flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        <UploadIcon className="w-4 h-4 mr-2" />
                                        Upload Approved Sheet
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.png"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end gap-6 flex-wrap mt-4 pt-4 border-t">
                                <div>
                                    <label htmlFor="comp-dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                                    <div className="relative mt-1">
                                        <select id="comp-dept-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="comp-sec-filter" className="text-sm font-medium text-slate-600">Section</label>
                                    <div className="relative mt-1">
                                        <select id="comp-sec-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                            {sections.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="comp-pos-filter" className="text-sm font-medium text-slate-600">Position</label>
                                    <div className="relative mt-1 flex items-center gap-2">
                                        <select id="comp-pos-filter" value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                        </div>
                                        {uploadedSheets[positionFilter] && (
                                            <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center whitespace-nowrap">
                                                <CheckIcon className="w-4 h-4 mr-1" />
                                                Uploaded
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden print:block">
                            <CardTitle>Comparative of Interviews</CardTitle>
                            <CardDescription>Position: {positionFilter}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-center">Merit #</th>
                                        <th className="px-4 py-3 font-medium">First Name</th>
                                        <th className="px-4 py-3 font-medium">Last Name</th>
                                        <th className="px-4 py-3 font-medium">CNIC</th>
                                        <th className="px-4 py-3 font-medium">Qualification</th>
                                        <th className="px-4 py-3 font-medium text-center">Exp. (Yrs)</th>
                                        <th className="px-4 py-3 font-medium text-right">Current Salary</th>
                                        <th className="px-4 py-3 font-medium text-right">Expected Salary</th>
                                        {allPanelists.map(name => (
                                            <th key={name} className="px-4 py-3 font-medium text-center">{name}</th>
                                        ))}
                                        <th className="px-4 py-3 font-medium text-center">Avg. Score</th>
                                        <th className="px-4 py-3 font-medium text-center">Status</th>
                                        <th className="px-4 py-3 font-medium">Recommended Designation</th>
                                        <th className="px-4 py-3 font-medium text-center print-hidden">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-gray-700">
                                    {sortedCandidates.map((c, index) => {
                                        const nameParts = c.name.split(' ');
                                        const lastName = nameParts.pop() || '';
                                        const firstName = nameParts.join(' ');

                                        return (
                                            <tr key={c.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-center font-bold text-lg text-gray-800">{index + 1}</td>
                                                <td className="px-4 py-4 font-semibold">{firstName}</td>
                                                <td className="px-4 py-4 font-semibold">{lastName}</td>
                                                <td className="px-4 py-4">{c.cnic}</td>
                                                <td className="px-4 py-4">{c.qualification}</td>
                                                <td className="px-4 py-4 text-center">{c.experienceYears}</td>
                                                <td className="px-4 py-4 text-right">{c.currentSalary?.toLocaleString() || 'N/A'}</td>
                                                <td className="px-4 py-4 text-right">{c.expectedSalary?.toLocaleString() || 'N/A'}</td>
                                                {allPanelists.map(panelistName => {
                                                    const evaluation = c.evaluation?.find(e => e.panelMemberName === panelistName);
                                                    // FIX: Explicitly cast result of Object.values to number[] to ensure correct type for reduce operation. This resolves the 'toFixed does not exist on type unknown' error.
                                                    const score = evaluation ? (Object.values(evaluation.scores) as number[]).reduce((sum, s) => sum + s, 0) : null;
                                                    return <td key={panelistName} className="px-4 py-4 text-center font-semibold">{score !== null ? score.toFixed(1) : '-'}</td>;
                                                })}
                                                <td className="px-4 py-4 text-center font-bold text-lg text-blue-600">{c.averageScore.toFixed(2)}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <select 
                                                        value={c.status === 'Recommended for Hire' ? 'Recommended' : c.status === 'Rejected' ? 'Not Recommended' : 'Pending'}
                                                        onChange={e => handleStatusChange(c.id, e.target.value as any)}
                                                        className={`w-full text-sm rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 font-semibold ${
                                                            c.status === 'Recommended for Hire' ? 'bg-green-100 text-green-800' : 
                                                            c.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''
                                                        }`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Recommended">Recommended</option>
                                                        <option value="Not Recommended">Not Recommended</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input 
                                                        type="text" 
                                                        defaultValue={c.recommendedDesignation || c.positionAppliedFor} 
                                                        onBlur={e => handleDesignationChange(c.id, e.target.value)}
                                                        className="w-full text-sm p-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center print-hidden">
                                                    <div className="flex justify-center items-start space-x-4">
                                                        {/* Send Offer Letter Action */}
                                                        <div className="flex flex-col items-center">
                                                            <button
                                                                onClick={() => { alert(`A success email/offer letter would be sent to ${c.name}. This feature can be built out next.`); }}
                                                                disabled={c.status !== 'Recommended for Hire'}
                                                                className="p-2 rounded-full transition-colors text-green-600 hover:bg-green-100 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                                title="Send Success Letter"
                                                                aria-label="Send Success Letter"
                                                            >
                                                                <MailIcon className="w-6 h-6" />
                                                            </button>
                                                            <span className="text-xs text-gray-500 mt-1">Send Offer</span>
                                                        </div>

                                                        {/* Send Regret Letter Action */}
                                                        <div className="flex flex-col items-center">
                                                            <button
                                                                onClick={() => setRegretModalCandidate(c)}
                                                                disabled={c.status !== 'Rejected'}
                                                                className="p-2 rounded-full transition-colors text-red-600 hover:bg-red-100 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                                title="Send Regret Letter"
                                                                aria-label="Send Regret Letter"
                                                            >
                                                                <MailIcon className="w-6 h-6" />
                                                            </button>
                                                            <span className="text-xs text-gray-500 mt-1">Send Regret</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                             {sortedCandidates.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <h3 className="text-xl font-semibold">No Evaluated Candidates</h3>
                                    <p className="mt-2">No candidates match the current filter criteria, or no position is selected.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                {/* Approval Section for Print View */}
                <div className="hidden print:flex justify-between items-start mt-32 pt-16 text-xs text-black">
                    <div className="text-center">
                        <div className="border-t border-gray-600 w-56 mb-2 mx-auto"></div>
                        <p>Reviewed by</p>
                        <p className="font-bold">Aisha Latif</p>
                        <p>Director HR</p>
                        <p>PKLI & RC</p>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-gray-600 w-56 mb-2 mx-auto"></div>
                        <p>Reviewed by</p>
                        <p className="font-bold">Dr. Faisal Amir</p>
                        <p>Hospital Director</p>
                        <p>PKLI & RC</p>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-gray-600 w-56 mb-2 mx-auto"></div>
                        <p>Reviewed by</p>
                        <p className="font-bold">Dr. Faisal Saud Dar</p>
                        <p>Dean</p>
                        <p>PKLI & RC</p>
                    </div>
                </div>
            </div>
             <RegretLetterModal
                isOpen={!!regretModalCandidate}
                onClose={() => setRegretModalCandidate(null)}
                onSend={handleSendRegretLetter}
                candidate={regretModalCandidate}
            />
        </>
    );
}


const medicalPositionsForForm = ['Medical Officer', 'Post Graduate Resident', 'Registrar', 'Senior Registrar', 'Clinical Fellow'];


// --- Main Page Component ---
interface InterviewsPageProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  selectionBoards: SelectionBoard[];
  setSelectionBoards: React.Dispatch<React.SetStateAction<SelectionBoard[]>>;
  activeView: 'panel-nomination' | 'interview-scheduling' | 'evaluation' | 'comparative-sheet';
  advertisements?: JobAdvertisement[];
  requisitions?: Requisition[];
  onNavigate?: (step: number) => void;
}

const InterviewsPage: React.FC<InterviewsPageProps> = ({ candidates, setCandidates, selectionBoards, setSelectionBoards, activeView, advertisements, requisitions, onNavigate }) => {
  const panelistOptions = useMemo(() => MOCK_PANELISTS.map(p => p.name), []);
  
  const [isNominationModalOpen, setIsNominationModalOpen] = useState(false);
  const [selectedCandidateForPanel, setSelectedCandidateForPanel] = useState<Candidate | null>(null);
  const [selectedBoardTitle, setSelectedBoardTitle] = useState<string>('');
  const [panelMemberNames, setPanelMemberNames] = useState<Record<string, string>>({});
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);

  const [isViewFormModalOpen, setIsViewFormModalOpen] = useState(false);
  const [candidateForFormView, setCandidateForFormView] = useState<Candidate | null>(null);

  const [isViewEvaluationModalOpen, setIsViewEvaluationModalOpen] = useState(false);
  const [candidateToViewEvaluation, setCandidateToViewEvaluation] = useState<Candidate | null>(null);
  
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [candidateForInvite, setCandidateForInvite] = useState<Candidate | null>(null);
  const [isSendFormModalOpen, setIsSendFormModalOpen] = useState(false);
  const [candidateForSendForm, setCandidateForSendForm] = useState<Candidate | null>(null);

  // Filters
  const [jobTitleFilter, setJobTitleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<'All' | 'Pending' | 'Scheduled' | 'Completed'>('All');
  
  // State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkScheduleModalOpen, setIsBulkScheduleModalOpen] = useState(false);
  const [bulkScheduleStartTime, setBulkScheduleStartTime] = useState('');
  const [bulkNominationJobTitle, setBulkNominationJobTitle] = useState<string | null>(null);
  const [editingTimeId, setEditingTimeId] = useState<number | null>(null);

  const scheduleHeaderCheckboxRef = useRef<HTMLInputElement>(null);
  const evaluationHeaderCheckboxRef = useRef<HTMLInputElement>(null);
  
  const documentList = [ "Updated Resume / CV", "Two latest Passport size Photographs", "Secondary School Certificate", "Higher Secondary School Certificate", "Related Degree", "All Experience Certificates", "PMDC/PNC/Required License (if required)", "Valid CNIC", "NOC (For government employee/PKLI employee)", "Fee Slip", ];
  
  const candidatesForScheduling = useMemo(() => 
    candidates.filter(c => c.status === 'Shortlisted for Interview')
  , [candidates]);
  
  const candidatesForNomination = useMemo(() =>
    candidates.filter(c => c.interviewStatus === 'Scheduled' && c.panelNominationStatus === 'Pending Nomination')
  , [candidates]);

  const candidatesForEvaluation = useMemo(() =>
    candidates.filter(c => c.panelNominationStatus === 'Panel Nominated' && (c.interviewStatus === 'Scheduled' || c.interviewStatus === 'Completed'))
  , [candidates]);
  
  // --- Filtered lists for display ---
  const departments = useMemo(() => ['All', ...Object.keys(departmentSections)], []);
  const sections = useMemo(() => {
      if (departmentFilter === 'All') return ['All'];
      const relevantCandidates = candidates.filter(c => c.department === departmentFilter);
      return ['All', ...Array.from(new Set(relevantCandidates.map(c => c.section)))];
  }, [candidates, departmentFilter]);
  const jobTitles = useMemo(() => ['All', ...Array.from(new Set(candidates.map(c => c.positionAppliedFor)))], [candidates]);

  useEffect(() => {
    setSectionFilter('All');
  }, [departmentFilter]);

  useEffect(() => {
    setSelectedIds([]);
  }, [jobTitleFilter, departmentFilter, sectionFilter, interviewStatusFilter, activeView]);


  const filteredForScheduling = useMemo(() => 
      candidatesForScheduling.filter(c => {
          const jobMatch = jobTitleFilter === 'All' || c.positionAppliedFor === jobTitleFilter;
          const deptMatch = departmentFilter === 'All' || c.department === departmentFilter;
          const statusMatch = interviewStatusFilter === 'All' ||
              (interviewStatusFilter === 'Pending' && (c.interviewStatus === 'Pending Schedule' || !c.interviewStatus)) ||
              (interviewStatusFilter === 'Scheduled' && c.interviewStatus === 'Scheduled') ||
              (interviewStatusFilter === 'Completed' && c.interviewStatus === 'Completed');
          return jobMatch && deptMatch && statusMatch;
      })
  , [candidatesForScheduling, jobTitleFilter, departmentFilter, interviewStatusFilter]);

  const filteredForNomination = useMemo(() =>
    candidatesForNomination.filter(c => jobTitleFilter === 'All' || c.positionAppliedFor === jobTitleFilter)
  , [candidatesForNomination, jobTitleFilter]);
  
  const filteredForEvaluation = useMemo(() => 
      candidatesForEvaluation.filter(c => {
          const jobMatch = jobTitleFilter === 'All' || c.positionAppliedFor === jobTitleFilter;
          const deptMatch = departmentFilter === 'All' || c.department === departmentFilter;
          // FIX: Corrected self-referencing variable `sectionMatch` to use `sectionFilter` for comparison.
          const sectionMatch = sectionFilter === 'All' || c.section === sectionFilter;
          const statusMatch = interviewStatusFilter === 'All' ||
              (interviewStatusFilter === 'Scheduled' && c.interviewStatus === 'Scheduled') ||
              (interviewStatusFilter === 'Completed' && c.interviewStatus === 'Completed');
              
          return jobMatch && deptMatch && sectionMatch && statusMatch;
      })
  , [candidatesForEvaluation, jobTitleFilter, departmentFilter, sectionFilter, interviewStatusFilter]);

  const selectableForScheduling = useMemo(() => 
    filteredForScheduling.filter(c => !c.interviewStatus || c.interviewStatus === 'Pending Schedule'),
  [filteredForScheduling]);

  const selectableForEvaluation = useMemo(() => 
    filteredForEvaluation.filter(c => c.interviewStatus === 'Scheduled'),
  [filteredForEvaluation]);

  useEffect(() => {
    if (activeView === 'interview-scheduling' && scheduleHeaderCheckboxRef.current) {
        const selectableCount = selectableForScheduling.length;
        const currentSelectedCount = selectedIds.filter(id => selectableForScheduling.some(c => c.id === id)).length;
        scheduleHeaderCheckboxRef.current.checked = selectableCount > 0 && currentSelectedCount === selectableCount;
        scheduleHeaderCheckboxRef.current.indeterminate = currentSelectedCount > 0 && currentSelectedCount < selectableCount;
    } else if (activeView === 'evaluation' && evaluationHeaderCheckboxRef.current) {
        const selectableCount = selectableForEvaluation.length;
        const currentSelectedCount = selectedIds.filter(id => selectableForEvaluation.some(c => c.id === id)).length;
        evaluationHeaderCheckboxRef.current.checked = selectableCount > 0 && currentSelectedCount === selectableCount;
        evaluationHeaderCheckboxRef.current.indeterminate = currentSelectedCount > 0 && currentSelectedCount < selectableCount;
    }
  }, [selectedIds, selectableForScheduling, selectableForEvaluation, activeView]);

  const groupedForNomination = useMemo(() => {
    return filteredForNomination.reduce((acc, candidate) => {
        (acc[candidate.positionAppliedFor] = acc[candidate.positionAppliedFor] || []).push(candidate);
        return acc;
    }, {} as Record<string, Candidate[]>);
  }, [filteredForNomination]);

  
  // --- Event Handlers ---

  const handleOpenNominationModal = (candidate: Candidate) => {
    setSelectedCandidateForPanel(candidate);
    setBulkNominationJobTitle(null);
    setSelectedBoardTitle('');
    setPanelMemberNames({});
    setIsNominationModalOpen(true);
  };
  
  const handleOpenBulkNominationModal = (jobTitle: string) => {
    setBulkNominationJobTitle(jobTitle);
    setSelectedCandidateForPanel(null);
    setSelectedBoardTitle('');
    setPanelMemberNames({});
    setIsNominationModalOpen(true);
  };

  const handleNominationSubmit = () => {
    if (!selectedBoardTitle) return;

    const selectedBoard = selectionBoards.find(b => b.title === selectedBoardTitle);
    if (!selectedBoard) return;

    const allNamesFilled = selectedBoard.members.every(member => panelMemberNames[member.role]?.trim());
    if (!allNamesFilled) {
        alert('Please provide names for all panel members.');
        return;
    }

    const newPanelMembers: PanelMember[] = selectedBoard.members.map(member => ({
        name: panelMemberNames[member.role],
        role: member.position,
        status: 'Pending',
        notified: false,
    }));
    
    if (bulkNominationJobTitle) {
      const targetIds = new Set(selectedIds);
      let updatedCount = 0;
      setCandidates(prev => prev.map(c => {
        if (targetIds.has(c.id) && c.positionAppliedFor === bulkNominationJobTitle) {
          updatedCount++;
          return {
            ...c,
            panelNominationStatus: 'Panel Nominated',
            interviewPanel: newPanelMembers
          };
        }
        return c;
      }));
      setNotification({ type: 'success', message: `Panel nominated for ${updatedCount} candidates for ${bulkNominationJobTitle}.`});
      setSelectedIds(prev => prev.filter(id => !targetIds.has(id)));
    } else if (selectedCandidateForPanel) {
      setCandidates(prev => prev.map(c => 
          c.id === selectedCandidateForPanel.id 
          ? { ...c, 
              panelNominationStatus: 'Panel Nominated',
              interviewPanel: newPanelMembers
            } 
          : c
      ));
      setNotification({ type: 'success', message: `Panel nominated for ${selectedCandidateForPanel.name}.` });
    }

    setIsNominationModalOpen(false);
    setSelectedCandidateForPanel(null);
    setBulkNominationJobTitle(null);
    setSelectedBoardTitle('');
    setPanelMemberNames({});
  };
  
  const handleSetInterviewTime = (candidateId: number, time: string) => {
    setCandidates(prev => prev.map(c => 
        c.id === candidateId 
        ? { ...c, interviewTime: time, interviewStatus: 'Scheduled' } 
        : c
    ));
  };

  const handleOpenInviteModal = (candidate: Candidate) => {
    setCandidateForInvite(candidate);
    setIsInviteModalOpen(true);
  };
  
  const handleSendInvite = (candidateId: number) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, interviewInviteSent: true } : c
    ));
    setNotification({ type: 'success', message: `Interview invite sent to ${candidate.name}.` });
  };

  const handleOpenSendFormModal = (candidate: Candidate) => {
    setCandidateForSendForm(candidate);
    setIsSendFormModalOpen(true);
  };

  const handleSendPreInterviewForm = (candidateId: number) => {
    setCandidates(prev => prev.map(c =>
        c.id === candidateId
        ? { ...c, preInterviewFormSent: true }
        : c
    ));
    setNotification({ type: 'success', message: 'Pre-interview form link has been sent to the applicant.' });
  };
  
  const handleOpenViewFormModal = (candidate: Candidate) => {
      setCandidateForFormView(candidate);
      setIsViewFormModalOpen(true);
  };

  const addBoard = (newBoard: SelectionBoard) => {
    setSelectionBoards(prev => [...prev, newBoard]);
  };

  const handleMarkAsCompleted = (candidateId: number) => {
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, interviewStatus: 'Completed' } : c));
  };

  const handleOpenViewEvaluationModal = (candidate: Candidate) => {
      setCandidateToViewEvaluation(candidate);
      setIsViewEvaluationModalOpen(true);
  };

  const handleSendReminder = (panelistName: string) => {
    setNotification({ type: 'success', message: `Reminder sent to ${panelistName}.` });
  };
  
  const handleBulkSchedule = () => {
      if (!bulkScheduleStartTime || selectedIds.length === 0) return;

      let scheduleTime = new Date(bulkScheduleStartTime);
      if (isNaN(scheduleTime.getTime())) {
          alert("Invalid start time format.");
          return;
      }

      setCandidates(prev => {
          const updatedCandidates = [...prev];
          selectedIds.forEach(id => {
              const index = updatedCandidates.findIndex(c => c.id === id);
              if (index !== -1) {
                  updatedCandidates[index] = {
                      ...updatedCandidates[index],
                      interviewTime: scheduleTime.toISOString(),
                      interviewStatus: 'Scheduled'
                  };
                  scheduleTime = new Date(scheduleTime.getTime() + 15 * 60000);
              }
          });
          return updatedCandidates;
      });
      
      setSelectedIds([]);
      setBulkScheduleStartTime('');
      setIsBulkScheduleModalOpen(false);
      setNotification({ type: 'success', message: `${selectedIds.length} interviews have been scheduled successfully.` });
  };
  
  const handleBulkMarkCompleted = () => {
    if (selectedIds.length === 0) return;
    setCandidates(prev => prev.map(c => 
        selectedIds.includes(c.id) && c.interviewStatus === 'Scheduled'
        ? { ...c, interviewStatus: 'Completed' } 
        : c
    ));
    setNotification({ type: 'success', message: `${selectedIds.length} interviews have been marked as completed.` });
    setSelectedIds([]);
  };

  const handleSelectAllScheduling = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedIds(selectableForScheduling.map(c => c.id));
    } else {
        setSelectedIds([]);
    }
  };

  const handleSelectAllEvaluation = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedIds(selectableForEvaluation.map(c => c.id));
    } else {
        setSelectedIds([]);
    }
  };
  
  // FIX: Corrected an undefined variable `i` to `id` when adding a new selection.
  const handleIndividualSelect = (id: number) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedBoardMembers = selectionBoards.find(b => b.title === selectedBoardTitle)?.members;
  const allNamesEntered = selectedBoardMembers ? selectedBoardMembers.every(member => panelMemberNames[member.role]?.trim()) : false;

  const statusColorMap: { [key in InterviewStatus]: string } = {
    'Pending Schedule': 'bg-gray-100 text-gray-800',
    'Scheduled': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
  };

  
  // --- Render Functions for each View ---

  const renderContent = () => {
    switch(activeView) {
      case 'interview-scheduling':
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Interview Scheduling & Communication</CardTitle>
                  <CardDescription>Set interview times and send forms/invites to shortlisted candidates.</CardDescription>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate(11)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-base font-semibold transition-colors flex items-center shadow-sm hover:shadow-md whitespace-nowrap transform hover:-translate-y-px"
                  >
                    Proceed to Attendance & Verification
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="pt-4 mt-4 border-t space-y-4">
                  <div className="flex items-end gap-6 flex-wrap">
                      <div>
                        <label htmlFor="is-dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                         <div className="relative mt-1">
                            <select id="is-dept-filter" value={departmentFilter} onChange={e => {setDepartmentFilter(e.target.value);}} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                              {departments.map(d => <option key={d}>{d}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="is-job-filter" className="text-sm font-medium text-slate-600">Job Title</label>
                         <div className="relative mt-1">
                            <select id="is-job-filter" value={jobTitleFilter} onChange={e => setJobTitleFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                              {jobTitles.map(title => <option key={title}>{title}</option>)}
                            </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="is-status-filter" className="text-sm font-medium text-slate-600">Interview Status</label>
                        <div className="relative mt-1">
                            <select id="is-status-filter" value={interviewStatusFilter} onChange={e => setInterviewStatusFilter(e.target.value as any)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                              <option>All</option>
                              <option>Pending</option>
                              <option>Scheduled</option>
                              <option>Completed</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                      </div>
                  </div>
                   <div className="pt-4 mt-4 border-t flex items-center space-x-4">
                      <button 
                          onClick={() => setIsBulkScheduleModalOpen(true)}
                          disabled={selectedIds.length === 0}
                          className="px-4 py-2 bg-[#0076b6] text-white rounded-md text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                          Schedule Selected ({selectedIds.length})
                      </button>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-base text-left text-gray-600">
                        <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="p-4 w-4">
                                  <input 
                                    type="checkbox"
                                    ref={scheduleHeaderCheckboxRef}
                                    onChange={handleSelectAllScheduling}
                                    disabled={selectableForScheduling.length === 0}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </th>
                                <th className="px-6 py-3">Candidate</th>
                                <th className="px-6 py-3">Interview Panel</th>
                                <th className="px-6 py-3">Interview Time</th>
                                <th className="px-6 py-3">Form Status</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredForScheduling.map(candidate => {
                                const formStatus = candidate.preInterviewFormSubmitted ? 'Submitted' : candidate.preInterviewFormSent ? 'Sent' : 'Not Sent';
                                const isScheduled = candidate.interviewStatus === 'Scheduled' || candidate.interviewStatus === 'Completed';
                                const showFormOptions = ['Post Graduate Resident', 'Post Graduate Trainee'].includes(candidate.positionAppliedFor);
                                return (
                                <tr key={candidate.id} className="border-b bg-white hover:bg-gray-50">
                                  <td className="p-4">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedIds.includes(candidate.id)} 
                                      onChange={() => handleIndividualSelect(candidate.id)}
                                      disabled={isScheduled}
                                      className="h-4 w-4 text-[#0076b6] border-gray-300 rounded focus:ring-[#0076b6] disabled:cursor-not-allowed disabled:bg-gray-200"
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                      <p className="font-semibold text-gray-900">{candidate.name}</p>
                                      <p className="text-sm text-gray-500">{candidate.positionAppliedFor}</p>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={candidate.interviewPanel.map(p => p.name).join(', ')}>
                                      {candidate.interviewPanel.map(p => p.name).join(', ') || 'Panel Not Nominated'}
                                  </td>
                                  <td className="px-6 py-4">
                                    {editingTimeId === candidate.id ? (
                                        <input 
                                            type="datetime-local" 
                                            defaultValue={candidate.interviewTime ? new Date(new Date(candidate.interviewTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 16) : ''}
                                            onBlur={(e) => {
                                                const newTime = e.target.value;
                                                if (newTime) {
                                                    handleSetInterviewTime(candidate.id, new Date(newTime).toISOString());
                                                } else {
                                                    setCandidates(prev => prev.map(c => 
                                                        c.id === candidate.id 
                                                        ? { ...c, interviewTime: undefined, interviewStatus: 'Pending Schedule' } 
                                                        : c
                                                    ));
                                                }
                                                setEditingTimeId(null);
                                            }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            autoFocus
                                            className="text-sm border-gray-300 rounded-md shadow-sm"
                                        />
                                    ) : isScheduled && candidate.interviewTime ? (
                                        <div className="flex items-center justify-between min-h-[42px]">
                                            <span className="text-gray-800">{new Date(candidate.interviewTime).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            {candidate.interviewStatus === 'Scheduled' && (
                                                 <button 
                                                    onClick={() => setEditingTimeId(candidate.id)} 
                                                    className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-opacity"
                                                    title="Edit time"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <input 
                                            type="datetime-local" 
                                            onBlur={(e) => e.target.value && handleSetInterviewTime(candidate.id, new Date(e.target.value).toISOString())}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            className="text-sm border-gray-300 rounded-md shadow-sm"
                                        />
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          formStatus === 'Submitted' ? 'bg-green-100 text-green-800' :
                                          formStatus === 'Sent' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                          {formStatus}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-start space-x-4">
                                        <div className="flex flex-col items-center">
                                            {candidate.interviewInviteSent ? (
                                                <>
                                                    <div className="p-2 text-green-600 rounded-full bg-green-50">
                                                        <CheckIcon className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-xs text-green-700 font-semibold mt-1 text-center">Invite Sent</span>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenInviteModal(candidate)}
                                                        disabled={!candidate.interviewTime}
                                                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                                                        title="Send Interview Invite"
                                                    >
                                                        <MailIcon className="w-6 h-6"/>
                                                    </button>
                                                    <span className="text-xs text-gray-500 mt-1 text-center">Send Invite</span>
                                                </>
                                            )}
                                        </div>
                                        {showFormOptions && (
                                            <>
                                                <div className="flex flex-col items-center">
                                                    <button
                                                        onClick={() => handleOpenSendFormModal(candidate)}
                                                        disabled={!!candidate.preInterviewFormSubmitted}
                                                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                        title="Send Pre-Interview Form"
                                                    >
                                                        <ClipboardListIcon className="w-6 h-6"/>
                                                    </button>
                                                    <span className="text-xs text-gray-500 mt-1 text-center">Send Form</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <button
                                                        onClick={() => handleOpenViewFormModal(candidate)}
                                                        disabled={!candidate.preInterviewFormSubmitted}
                                                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                                                        title="View Submitted Form"
                                                    >
                                                        <EyeIcon className="w-6 h-6"/>
                                                    </button>
                                                    <span className="text-xs text-gray-500 mt-1 text-center">View Form</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                  </td>
                                </tr>
                            );
                           })}
                            {filteredForScheduling.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-6 text-gray-500">No candidates match the current filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
          </Card>
        );
      case 'panel-nomination':
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Panel Nomination</CardTitle>
                  <CardDescription>Nominate an interview panel for scheduled candidates.</CardDescription>
                </div>
                <button onClick={() => setIsBoardModalOpen(true)} className="px-4 py-2 bg-[#0076b6] text-white rounded-md hover:bg-[#005a8c] text-sm font-semibold transition-colors flex items-center">
                    <ClipboardListIcon className="w-4 h-4 mr-2" /> Manage Selection Boards
                </button>
              </div>
               <div className="pt-4 mt-4 border-t">
                  <label htmlFor="job-title-filter-nom" className="text-sm font-medium text-gray-700">Filter by Job Title</label>
                  <select id="job-title-filter-nom" value={jobTitleFilter} onChange={e => setJobTitleFilter(e.target.value)} className="mt-1 block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#0076b6] focus:border-[#0076b6] rounded-md">
                      {jobTitles.map(title => <option key={title}>{title}</option>)}
                  </select>
              </div>
            </CardHeader>
            <CardContent>
                {Object.keys(groupedForNomination).length > 0 ? (
                    <div className="space-y-6">
                        {(Object.entries(groupedForNomination) as [string, Candidate[]][]).map(([jobTitle, groupCandidates]) => {
                            const selectedInGroup = groupCandidates.filter(c => selectedIds.includes(c.id)).length;

                            const handleSelectAll = () => {
                                const groupIds = groupCandidates.map(c => c.id);
                                setSelectedIds(prev => [...new Set([...prev, ...groupIds])]);
                            };
                            const handleDeselectAll = () => {
                                const groupIds = new Set(groupCandidates.map(c => c.id));
                                setSelectedIds(prev => prev.filter(id => !groupIds.has(id)));
                            };
                            
                            return (
                                <div key={jobTitle} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b">
                                        <h3 className="text-lg font-bold text-gray-800">{jobTitle}</h3>
                                        <p className="text-sm text-gray-500">{groupCandidates.length} candidate(s) awaiting panel nomination.</p>
                                    </div>
                                    <div className="p-4 flex items-center justify-between border-b bg-white">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={handleSelectAll} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Select All</button>
                                            <span className="text-gray-300">|</span>
                                            <button onClick={handleDeselectAll} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Deselect All</button>
                                        </div>
                                        <button
                                            onClick={() => handleOpenBulkNominationModal(jobTitle)}
                                            disabled={selectedInGroup === 0}
                                            className="px-4 py-2 bg-[#0076b6] text-white rounded-md text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                                        >
                                           <UsersIcon className="w-4 h-4 mr-2" /> Nominate Panel for Selected ({selectedInGroup})
                                        </button>
                                    </div>
                                    <table className="w-full text-base text-left text-gray-600">
                                        <thead className="text-sm text-gray-700 uppercase bg-gray-50/50">
                                            <tr>
                                                <th className="p-4 w-4"><span className="sr-only">Select</span></th>
                                                <th className="px-6 py-3">Candidate Name</th>
                                                <th className="px-6 py-3 text-center">Individual Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupCandidates.map(candidate => (
                                                <tr key={candidate.id} className="border-b bg-white last:border-b-0">
                                                    <td className="p-4">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedIds.includes(candidate.id)} 
                                                            onChange={() => handleIndividualSelect(candidate.id)}
                                                            className="h-4 w-4 text-[#0076b6] border-gray-300 rounded focus:ring-[#0076b6]"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold">{candidate.name}</td>
                                                    <td className="px-6 py-4 text-center">
                                                          <button onClick={() => handleOpenNominationModal(candidate)} className="font-medium text-blue-600 hover:underline text-sm">
                                                              Nominate Panel
                                                          </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>No candidates available for panel nomination based on the current filter.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        );
      case 'evaluation':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Interview Evaluation</CardTitle>
              <CardDescription>View evaluation scores and feedback for completed interviews.</CardDescription>
               <div className="pt-4 mt-4 border-t space-y-4">
                  <div className="flex items-end gap-6 flex-wrap">
                      <div>
                          <label htmlFor="eval-dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                           <div className="relative mt-1">
                                <select id="eval-dept-filter" value={departmentFilter} onChange={e => {setDepartmentFilter(e.target.value);}} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                    {departments.map(d => <option key={d}>{d}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                </div>
                           </div>
                      </div>
                      <div>
                          <label htmlFor="eval-sec-filter" className="text-sm font-medium text-slate-600">Section</label>
                          <div className="relative mt-1">
                            <select id="eval-sec-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                {sections.map(s => <option key={s}>{s}</option>)}
                            </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                            </div>
                           </div>
                      </div>
                      <div>
                          <label htmlFor="eval-job-filter" className="text-sm font-medium text-slate-600">Job Title</label>
                          <div className="relative mt-1">
                                <select id="eval-job-filter" value={jobTitleFilter} onChange={e => setJobTitleFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                    {jobTitles.map(title => <option key={title}>{title}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                </div>
                          </div>
                      </div>
                      <div>
                          <label htmlFor="eval-status-filter" className="text-sm font-medium text-slate-600">Interview Status</label>
                           <div className="relative mt-1">
                                <select id="eval-status-filter" value={interviewStatusFilter} onChange={e => setInterviewStatusFilter(e.target.value as any)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                    <option value="All">All</option>
                                    <option value="Scheduled">In Process</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                </div>
                           </div>
                      </div>
                  </div>
                  <div className="pt-4 mt-4 border-t flex items-center space-x-4">
                      <button 
                          onClick={handleBulkMarkCompleted}
                          disabled={selectedIds.length === 0}
                          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                          Mark Selected ({selectedIds.length}) as Completed
                      </button>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-base text-left text-gray-600">
                <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="p-4 w-4">
                        <input
                            type="checkbox"
                            ref={evaluationHeaderCheckboxRef}
                            onChange={handleSelectAllEvaluation}
                            disabled={selectableForEvaluation.length === 0}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </th>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Job Title</th>
                    <th className="px-6 py-3">Interview Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForEvaluation.map(candidate => {
                      const displayStatus = candidate.interviewStatus === 'Completed' ? 'Completed' : 'In Process';
                      const displayStatusColor = candidate.interviewStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                      const canBeSelected = candidate.interviewStatus === 'Scheduled';
                      
                      return (
                        <tr key={candidate.id} className="border-b bg-white">
                          <td className="p-4">
                            {canBeSelected && (
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(candidate.id)}
                                    onChange={() => handleIndividualSelect(candidate.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold">{candidate.name}</td>
                          <td className="px-6 py-4">{candidate.positionAppliedFor}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-sm font-medium rounded-full ${displayStatusColor}`}>
                              {displayStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2">
                            {candidate.interviewStatus === 'Scheduled' && (
                              <button onClick={() => handleMarkAsCompleted(candidate.id)} className="px-3 py-1 text-sm font-semibold text-white bg-[#0076b6] rounded-md hover:bg-[#005a8c]"><CheckIcon className="w-4 h-4 inline-block mr-1" /> Mark as Completed</button>
                            )}
                             <button 
                              onClick={() => handleOpenViewEvaluationModal(candidate)} 
                              className="px-3 py-1 text-sm font-semibold text-white bg-teal-500 rounded-md hover:bg-teal-600"
                             >
                              View Status
                             </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredForEvaluation.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-10 text-gray-500">
                                No candidates match the current filter criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      case 'comparative-sheet': {
        return <CandidateComparison 
            candidates={candidates}
            setCandidates={setCandidates}
            setNotification={setNotification}
        />;
      }
      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}

      <SelectionBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        boards={selectionBoards}
        addBoard={addBoard}
      />

      <Modal 
        isOpen={isNominationModalOpen} 
        onClose={() => setIsNominationModalOpen(false)} 
        title={bulkNominationJobTitle ? `Nominate Panel for ${bulkNominationJobTitle}` : `Nominate Panel for ${selectedCandidateForPanel?.name}`}
      >
        <datalist id="panelist-options">
            {panelistOptions.map(name => <option key={name} value={name} />)}
        </datalist>
        <div>
            <label htmlFor="board-select" className="block text-sm font-medium text-gray-700">Select Selection Board</label>
            <select 
              id="board-select" 
              value={selectedBoardTitle} 
              onChange={(e) => {
                const boardTitle = e.target.value;
                setSelectedBoardTitle(boardTitle);
                setPanelMemberNames({});
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#0076b6] focus:border-[#0076b6] rounded-md"
            >
              <option value="">Select a board...</option>
              {selectionBoards.map(board => (
                <option key={board.title} value={board.title}>{board.title}</option>
              ))}
            </select>
        </div>

        {selectedBoardMembers && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <h4 className="font-semibold text-gray-800">Panel Members for {selectedBoardTitle}</h4>
            {selectedBoardMembers.map(member => (
              <div key={member.role}>
                <label htmlFor={`panelist-${member.role}`} className="block text-sm font-medium text-gray-700">
                  {member.role} <span className="text-xs text-gray-500">({member.position})</span>
                </label>
                <input
                  type="text"
                  id={`panelist-${member.role}`}
                  list="panelist-options"
                  value={panelMemberNames[member.role] || ''}
                  onChange={e => setPanelMemberNames(prev => ({ ...prev, [member.role]: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#0076b6] focus:border-[#0076b6]"
                  placeholder={`Name for ${member.position}`}
                  required
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
            <button type="button" onClick={() => setIsNominationModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
            <button
                type="button"
                onClick={handleNominationSubmit}
                disabled={!selectedBoardTitle || !allNamesEntered}
                className="px-4 py-2 bg-[#0076b6] text-white rounded-md hover:bg-[#005a8c] font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Confirm Nomination
            </button>
        </div>
      </Modal>
      
      {candidateForInvite && (
        <Modal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            title={`Interview Invite for ${candidateForInvite.name}`}
            maxWidth="max-w-3xl"
        >
            <div className="p-4 bg-gray-50 border rounded-md font-serif text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
{`Subject: Interview Invitation for the position of ${candidateForInvite.positionAppliedFor} at PKLI & RC

Dear ${candidateForInvite.name},

Thank you for your interest in the ${candidateForInvite.positionAppliedFor} position at Pakistan Kidney and Liver Institute and Research Center (PKLI & RC).

We were impressed with your background and would like to invite you for an interview to discuss your application further. Your interview has been scheduled as follows:

Date: ${candidateForInvite.interviewTime ? new Date(candidateForInvite.interviewTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
Time: ${candidateForInvite.interviewTime ? new Date(candidateForInvite.interviewTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
Location: PKLI & RC Head Office, Lahore

Panel:
${candidateForInvite.interviewPanel.map(p => `- ${p.name} (${p.role})`).join('\n')}

Please bring the following documents with you to the interview:
- Original CNIC
- Updated CV / Resume
- Copies of all academic and experience certificates

We look forward to meeting you.

Best regards,
HR Department
PKLI & RC`}
            </div>
            <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-base font-semibold"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => {
                        handleSendInvite(candidateForInvite.id);
                        setIsInviteModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base font-semibold"
                >
                    Confirm & Send Invite
                </button>
            </div>
        </Modal>
      )}

      {candidateForSendForm && (
         <Modal
            isOpen={isSendFormModalOpen}
            onClose={() => setIsSendFormModalOpen(false)}
            title={`Send Pre-Interview Form to ${candidateForSendForm.name}`}
            maxWidth="max-w-3xl"
        >
            <div className="p-4 bg-gray-50 border rounded-md font-serif text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
{`Subject: Pre-Interview Information Form for ${candidateForSendForm.positionAppliedFor} at PKLI & RC

Dear ${candidateForSendForm.name},

In preparation for your upcoming interview for the ${candidateForSendForm.positionAppliedFor} position, we kindly request you to fill out the pre-interview information form.

This form helps us understand your profile better and ensures a more productive discussion during the interview.

Please click the link below to access and submit the form:
[Link to Pre-Interview Form]

We appreciate your cooperation and look forward to speaking with you.

Best regards,
HR Department
PKLI & RC`}
            </div>
            <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                <button
                    type="button"
                    onClick={() => setIsSendFormModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-base font-semibold"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => {
                        handleSendPreInterviewForm(candidateForSendForm.id);
                        setIsSendFormModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base font-semibold"
                >
                    Confirm & Send Form
                </button>
            </div>
        </Modal>
      )}

       {candidateForFormView && (
        <Modal
            isOpen={isViewFormModalOpen}
            onClose={() => setIsViewFormModalOpen(false)}
            title={`Pre-Interview Form: ${candidateForFormView.name}`}
            maxWidth="max-w-4xl"
        >
            {candidateForFormView.preInterviewFormData ? (
                <PreInterviewFormRouter candidate={candidateForFormView} />
            ) : (
                <p className="text-center py-8 text-gray-500">The candidate has not submitted the form yet.</p>
            )}
        </Modal>
      )}
    </>
  );
};

export default InterviewsPage;
