import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import type { Candidate } from '../types';
import { PrinterIcon } from '../components/icons';

// Component for the printable form layout, hidden from screen view
const PrintableFormLayout: React.FC<{ candidate: Candidate | null }> = ({ candidate }) => {
    if (!candidate) return null;

    // A container to roughly simulate A4 aspect ratio and provide padding
    return (
        <div className="p-8 bg-white" id="printable-form">
            <div className="border-2 border-black p-4 font-serif text-black text-sm">
                {/* Header */}
                <div className="flex items-center pb-2 border-b-2 border-black">
                    <div className="w-1/6">
                        <img src="https://pkli.org.pk/wp-content/uploads/2020/09/cropped-Insignia_512_512.png" alt="PKLI Logo" className="h-16 w-auto" />
                    </div>
                    <div className="w-4/6 text-center">
                        <h1 className="font-bold text-xl leading-tight">PAKISTAN KIDNEY AND LIVER</h1>
                        <h1 className="font-bold text-xl leading-tight">INSTITUTE AND RESEARCH CENTER</h1>
                    </div>
                    <div className="w-1/6 text-xs self-start">
                        <div className="border border-black p-1">Form Number: HR F001</div>
                        <div className="border border-l-black border-r-black border-b-black p-1">Version Number: 01</div>
                    </div>
                </div>

                <div className="border-2 border-black mt-2 text-sm">
                    <div className="flex border-b-2 border-black">
                        <div className="font-bold p-1 w-1/4 border-r-2 border-black">Department Name:</div>
                        <div className="p-1">Human Resources</div>
                    </div>
                    <div className="flex">
                        <div className="font-bold p-1 w-1/4 border-r-2 border-black">Form Name:</div>
                        <div className="p-1">Pre-Employment Screening Form</div>
                    </div>
                </div>

                {/* Body */}
                <div className="mt-8 text-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p>To:</p>
                            <p className="font-bold mt-1">Admission & Discharge Representative</p>
                        </div>
                        <div className="self-start">
                            <span>Date:</span>
                            <span className="inline-block w-40 border-b border-black text-center ml-2">{new Date().toLocaleDateString('en-CA')}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <span className="font-bold mr-4">Subject:</span>
                        <span className="font-bold underline">Employment Screening</span>
                    </div>

                    <p>Kindly initiate pre-employment medical screening process of below mentioned individual for successful selection at PKLI&RC.</p>
                </div>

                {/* Candidate Table */}
                <div className="mt-4">
                    <table className="w-full border-collapse border-2 border-black text-sm">
                        <thead className="text-center font-bold">
                            <tr>
                                <th className="border-2 border-black p-2">Name</th>
                                <th className="border-2 border-black p-2">Designation</th>
                                <th className="border-2 border-black p-2">Department</th>
                                <th className="border-2 border-black p-2">CNIC #</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center">
                                <td className="border-2 border-black p-2 h-12">{candidate.name}</td>
                                <td className="border-2 border-black p-2">{candidate.positionAppliedFor}</td>
                                <td className="border-2 border-black p-2">{candidate.department}</td>
                                <td className="border-2 border-black p-2">{candidate.cnic}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Declaration */}
                <div className="mt-8 text-sm">
                    <p className="font-bold mb-2">Declaration:</p>
                    <p className="leading-relaxed">
                        I "<span className="font-semibold px-4 border-b border-black">{candidate.name}</span>" acknowledge that I shall bear the cost of examination if I fail to join PKLI&RC after my pre-employment medical screening or resign during the probation period.
                    </p>
                    <div className="mt-8">
                        <span className="font-bold">Signatures:</span>
                        <span className="inline-block w-3/4 border-b border-black ml-2"></span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20">
                    <div className="inline-block">
                        <div className="w-48 border-t-2 border-black mb-1"></div>
                        <div className="font-bold">
                            HR Representative.
                        </div>
                    </div>
                </div>
                <div className="mt-16 text-xs">
                    Cc: Medical Records Department.
                </div>
            </div>
        </div>
    );
};


const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
);

// Component for the interactive on-screen form
const InteractiveScreeningForm: React.FC<{ 
    candidate: Candidate; 
    onMarkFit: (id: number) => void;
    onPrint: () => void;
}> = ({ candidate, onMarkFit, onPrint }) => {
    const [screeningInitiated, setScreeningInitiated] = useState(false);
    const [tempId, setTempId] = useState<string | null>(null);

    useEffect(() => {
        setScreeningInitiated(false);
        setTempId(null);
    }, [candidate]);

    const handleInitiateScreening = () => {
        if (!candidate) return;
        setTempId(`PKLI-MED-${new Date().getFullYear()}-${String(candidate.id).padStart(4, '0')}`);
        setScreeningInitiated(true);
    };

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <div>
                    <CardTitle>Pre-Employment Screening</CardTitle>
                    <CardDescription>Interactive form for {candidate.name}</CardDescription>
                </div>
                <button
                    onClick={onPrint}
                    className="px-5 py-2.5 bg-[#0076b6] text-white rounded-lg hover:bg-[#005a8c] font-semibold flex items-center shadow-sm hover:shadow-md transition-all whitespace-nowrap transform hover:-translate-y-px"
                >
                    <PrinterIcon className="w-5 h-5 mr-2" />
                    Print Official Form
                </button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="To" value="Admission & Discharge Representative" />
                        <DetailItem label="Date" value={new Date().toLocaleDateString('en-CA')} />
                        <div className="col-span-2">
                            <DetailItem label="Subject" value="Employment Screening" />
                        </div>
                    </div>
                </div>

                <p>Kindly initiate the pre-employment medical screening process for the individual below.</p>

                <Card>
                    <CardHeader>
                        <CardTitle>Candidate Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Name" value={candidate.name} />
                            <DetailItem label="Designation" value={candidate.positionAppliedFor} />
                            <DetailItem label="Department" value={candidate.department} />
                            <DetailItem label="CNIC #" value={candidate.cnic} />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Declaration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base leading-relaxed">
                            I "<span className="font-semibold">{candidate.name}</span>" acknowledge that I shall bear the cost of examination if I fail to join PKLI&RC after my pre-employment medical screening or resign during the probation period.
                        </p>
                    </CardContent>
                </Card>
                
                <div className="mt-6 flex justify-between items-center pt-6 border-t">
                    <div>
                        {!screeningInitiated ? (
                            <button
                                onClick={handleInitiateScreening}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base font-semibold"
                            >
                                Initiate Screening & Generate ID
                            </button>
                        ) : (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm font-semibold text-blue-800">Screening Initiated. Temporary ID: <span className="font-bold">{tempId}</span></p>
                                <p className="text-xs text-blue-700">This ID is linked to Comp & Ben upon joining.</p>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => onMarkFit(candidate.id)}
                        disabled={!screeningInitiated}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Mark as Medically Fit & Proceed
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};


interface MedicalScreeningProps {
    candidates: Candidate[];
    setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
}

const MedicalScreening: React.FC<MedicalScreeningProps> = ({ candidates, setCandidates }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All');

  const departments = useMemo(() => ['All', ...Array.from(new Set(candidates.map(c => c.department)))], [candidates]);
  
  const sections = useMemo(() => {
    if (departmentFilter === 'All') return ['All'];
    const relevantCandidates = candidates.filter(c => c.department === departmentFilter);
    return ['All', ...Array.from(new Set(relevantCandidates.map(c => c.section)))];
  }, [candidates, departmentFilter]);
  
  const positions = useMemo(() => {
    let relevantCandidates = candidates;
    if (departmentFilter !== 'All') {
        relevantCandidates = relevantCandidates.filter(c => c.department === departmentFilter);
    }
    if (sectionFilter !== 'All') {
        relevantCandidates = relevantCandidates.filter(c => c.section === sectionFilter);
    }
    return ['All', ...Array.from(new Set(relevantCandidates.map(c => c.positionAppliedFor)))];
  }, [candidates, departmentFilter, sectionFilter]);

  useEffect(() => { setSectionFilter('All'); }, [departmentFilter]);
  useEffect(() => { setPositionFilter('All'); }, [departmentFilter, sectionFilter]);

  const filteredCandidates = useMemo(() => {
      return candidates.filter(c => 
          (departmentFilter === 'All' || c.department === departmentFilter) &&
          (sectionFilter === 'All' || c.section === sectionFilter) &&
          (positionFilter === 'All' || c.positionAppliedFor === positionFilter)
      );
  }, [candidates, departmentFilter, sectionFilter, positionFilter]);

  useEffect(() => {
      if (!selectedCandidate || !filteredCandidates.some(c => c.id === selectedCandidate.id)) {
          setSelectedCandidate(filteredCandidates.length > 0 ? filteredCandidates[0] : null);
      }
  }, [filteredCandidates, selectedCandidate]);


  const handleMarkAsFit = (candidateId: number) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, status: 'Pending Verification' } : c
    ));
    setSelectedCandidate(null);
  };
  
  if (candidates.length === 0) {
    return (
        <Card>
            <CardContent className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700">No Candidates for Medical Screening</h3>
                <p className="text-gray-500 mt-2">There are currently no candidates who have been sent or have accepted an offer.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <>
    <div className="print-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Candidates for Screening</CardTitle>
                        <CardDescription>Select a candidate to generate the form.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-6 flex-wrap">
                            <div>
                                <label htmlFor="dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                                <div className="relative mt-1">
                                    <select id="dept-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
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
                                    <select id="sec-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base" disabled={departmentFilter === 'All'}>
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
                                    <select id="pos-filter" value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
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
                    </CardContent>
                    <div className="border-t">
                        <ul className="divide-y max-h-96 overflow-y-auto">
                            {filteredCandidates.length > 0 ? filteredCandidates.map(c => (
                                <li key={c.id} onClick={() => setSelectedCandidate(c)} className={`p-4 cursor-pointer ${selectedCandidate?.id === c.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                                    <p className="font-semibold text-gray-800">{c.name}</p>
                                    <p className="text-sm text-gray-600">{c.positionAppliedFor}</p>
                                </li>
                            )) : (
                                <li className="p-4 text-center text-gray-500">No candidates match filters.</li>
                            )}
                        </ul>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                {selectedCandidate ? (
                    <InteractiveScreeningForm 
                        candidate={selectedCandidate}
                        onMarkFit={handleMarkAsFit}
                        onPrint={() => window.print()}
                    />
                ) : (
                    <Card className="h-full">
                        <CardContent className="flex items-center justify-center h-full text-center text-gray-500">
                            <div>
                                <h3 className="text-xl font-semibold">No Candidate Selected</h3>
                                <p className="mt-2">Please select a candidate from the list to view their screening form.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    </div>

    <div className="hidden print:block">
        <PrintableFormLayout candidate={selectedCandidate} />
    </div>

    <style>{`
        @media print {
            body {
                background-color: white !important;
                -webkit-print-color-adjust: exact; /* Chrome, Safari, Edge */
                print-color-adjust: exact; /* Firefox */
            }
            .print-hidden {
                display: none !important;
            }
            .print\\:block {
                display: block !important;
            }
            @page {
                size: A4;
                margin: 0;
            }
        }
    `}</style>
    </>
  );
};

export default MedicalScreening;