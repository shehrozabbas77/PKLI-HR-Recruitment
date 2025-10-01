import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import type { Candidate } from '../types';
import { Modal } from '../components/Modal';

// --- Types for the new detailed verification process ---

type VerificationStatus = 'Pending' | 'Sent' | 'Verified' | 'Discrepancy' | 'Fake' | 'No Response';

interface OsvItem {
    id: number;
    type: string;
    target: string;
    status: VerificationStatus;
    lastSent?: string;
    receivedDate?: string;
    notes?: string;
}

interface VerificationProcessState {
    checklist: {
        policeVerification: 'Pending' | 'Cleared' | 'Issue Found';
        originalsSeen: boolean;
        lastEmployerLetterDate?: string;
    };
    finance: {
        requestStatus: 'Not Sent' | 'Request Sent' | 'Cheque Ready';
        requestDate?: string;
        chequeReadyDate?: string;
    };
    osvItems: OsvItem[];
}

const initialProcessState: VerificationProcessState = {
    checklist: {
        policeVerification: 'Pending',
        originalsSeen: false,
    },
    finance: {
        requestStatus: 'Not Sent',
    },
    osvItems: [
        { id: 1, type: 'Academic Qualification', target: 'University of Punjab', status: 'Pending' },
        { id: 2, type: 'Professional Experience', target: 'Tech Solutions Inc.', status: 'Pending' },
        { id: 3, type: 'Professional License', target: 'PMDC', status: 'Pending' },
        { id: 4, type: 'Reference Check', target: 'Mr. John Doe', status: 'Pending' },
    ],
};

const statusColorMap: { [key in VerificationStatus]: string } = {
    'Pending': 'bg-gray-100 text-gray-800',
    'Sent': 'bg-yellow-100 text-yellow-800',
    'Verified': 'bg-green-100 text-green-800',
    'Discrepancy': 'bg-purple-100 text-purple-800',
    'Fake': 'bg-red-100 text-red-800',
    'No Response': 'bg-orange-100 text-orange-800',
};

// --- Main Verification Page Component ---

interface VerificationProps {
    candidates: Candidate[];
    setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
}

const Verification: React.FC<VerificationProps> = ({ candidates, setCandidates }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [verificationProcess, setVerificationProcess] = useState<VerificationProcessState>(initialProcessState);
  const [activeTab, setActiveTab] = useState<'checklist' | 'osv' | 'summary'>('checklist');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotificationSent, setIsNotificationSent] = useState(false);

  // --- Filtering Logic ---
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All');

  const departments = useMemo(() => ['All', ...Array.from(new Set(candidates.map(c => c.department)))], [candidates]);
  const sections = useMemo(() => {
    if (departmentFilter === 'All') return ['All'];
    return ['All', ...Array.from(new Set(candidates.filter(c => c.department === departmentFilter).map(c => c.section)))];
  }, [candidates, departmentFilter]);
  const positions = useMemo(() => ['All', ...Array.from(new Set(candidates.map(c => c.positionAppliedFor)))], [candidates]);

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

  useEffect(() => {
      // Reset process state when candidate changes
      setVerificationProcess(initialProcessState);
      setIsNotificationSent(false);
  }, [selectedCandidate]);


  // --- Event Handlers ---
  const handleCompleteOnboarding = () => {
      if (!selectedCandidate) return;
      setCandidates(prev => prev.map(c => 
        c.id === selectedCandidate.id ? { ...c, status: 'Hired' } : c
      ));
  };

  const handleProcessChange = (path: string, value: any) => {
    setVerificationProcess(prev => {
        const keys = path.split('.');
        const newState = JSON.parse(JSON.stringify(prev));
        let current = newState;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newState;
    });
  };
  
  const handleOsvItemChange = (id: number, field: keyof OsvItem, value: any) => {
      setVerificationProcess(prev => ({
          ...prev,
          osvItems: prev.osvItems.map(item => {
              if (item.id !== id) return item;
              const updatedItem = { ...item, [field]: value };
              if (field === 'status' && value !== 'Sent') {
                  // If status changes from 'Sent', clear the sent date unless it's being marked as Verified now
                  if(value === 'Verified' && !updatedItem.receivedDate) {
                    updatedItem.receivedDate = new Date().toISOString().split('T')[0];
                  }
              }
              if (field === 'status' && value === 'Sent') {
                  updatedItem.lastSent = new Date().toISOString().split('T')[0];
              }
              return updatedItem;
          })
      }));
  };

  const allVerified = useMemo(() => verificationProcess.osvItems.every(v => v.status === 'Verified'), [verificationProcess.osvItems]);

  // --- Render Functions for Tabs ---
  
  const renderChecklistTab = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader><CardTitle>Initial Checks</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="font-semibold">Police Verification</label>
                    <select 
                        value={verificationProcess.checklist.policeVerification}
                        onChange={e => handleProcessChange('checklist.policeVerification', e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                    >
                        <option>Pending</option>
                        <option>Cleared</option>
                        <option>Issue Found</option>
                    </select>
                </div>
                <div className="flex items-center space-x-3">
                    <input 
                        type="checkbox" 
                        id="originalsSeen" 
                        checked={verificationProcess.checklist.originalsSeen}
                        onChange={e => handleProcessChange('checklist.originalsSeen', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="originalsSeen" className="font-semibold">Original Seen Documents (Qualification, Experiences, License, etc.)</label>
                </div>
                <div>
                    <label htmlFor="lastEmployerLetter" className="font-semibold">Last Employer Letter Received Date</label>
                    <input 
                        type="date" 
                        id="lastEmployerLetter"
                        value={verificationProcess.checklist.lastEmployerLetterDate || ''}
                        onChange={e => handleProcessChange('checklist.lastEmployerLetterDate', e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                    />
                     {verificationProcess.checklist.lastEmployerLetterDate && <p className="text-xs text-blue-600 mt-1">Alert: HR to verify letter authenticity.</p>}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Finance for Degree Verification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="font-semibold">Status: <span className="font-bold text-blue-700">{verificationProcess.finance.requestStatus}</span></p>
                    {verificationProcess.finance.requestDate && <p className="text-sm text-gray-600">Request Sent On: {verificationProcess.finance.requestDate}</p>}
                    {verificationProcess.finance.chequeReadyDate && <p className="text-sm text-green-600">Cheque Ready Since: {verificationProcess.finance.chequeReadyDate}</p>}
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => handleProcessChange('finance', { requestStatus: 'Request Sent', requestDate: new Date().toISOString().split('T')[0] })}
                        disabled={verificationProcess.finance.requestStatus !== 'Not Sent'}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Send Cheque Request to Finance
                    </button>
                    <button 
                         onClick={() => handleProcessChange('finance', { ...verificationProcess.finance, requestStatus: 'Cheque Ready', chequeReadyDate: new Date().toISOString().split('T')[0] })}
                         disabled={verificationProcess.finance.requestStatus !== 'Request Sent'}
                         className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                       (Simulate) Finance Marks Ready
                    </button>
                </div>
                 {verificationProcess.finance.requestStatus === 'Cheque Ready' && <p className="text-xs text-orange-600 mt-1 font-semibold">Alert (HR & Finance): 5 days for cheque completion time.</p>}
            </CardContent>
        </Card>
    </div>
  );

  const renderOsvTab = () => (
    <div className="space-y-4">
        {verificationProcess.osvItems.map(item => {
            const daysSinceSent = item.lastSent ? Math.floor((new Date().getTime() - new Date(item.lastSent).getTime()) / (1000 * 3600 * 24)) : -1;
            const needsFollowUp = item.status === 'Sent' && daysSinceSent >= 7;
            const finalFollowUp = item.status === 'Sent' && daysSinceSent >= 30;

            return (
                <Card key={item.id}>
                    <CardContent className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-1">
                            <p className="font-bold text-gray-800">{item.type}</p>
                            <p className="text-sm text-gray-600">{item.target}</p>
                             {item.status === 'Fake' && <p className="mt-2 font-bold text-red-600 text-sm p-2 bg-red-100 rounded-md">ALERT: Notify Employee Relations immediately!</p>}
                        </div>
                        <div className="col-span-1">
                            <select 
                                value={item.status}
                                onChange={e => handleOsvItemChange(item.id, 'status', e.target.value as VerificationStatus)}
                                className={`w-full p-2 border rounded-md font-semibold text-sm ${statusColorMap[item.status]}`}
                            >
                                {Object.keys(statusColorMap).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                             <input type="text" placeholder="Notes..." value={item.notes || ''} onChange={e => handleOsvItemChange(item.id, 'notes', e.target.value)} className="w-full p-2 border rounded-md text-sm"/>
                        </div>
                        <div className="col-span-1 text-sm text-center">
                            <p>Last Sent: {item.lastSent || 'N/A'}</p>
                            <p>Received: {item.receivedDate || 'N/A'}</p>
                        </div>
                        <div className="col-span-1 text-center">
                            {finalFollowUp ? <p className="text-red-600 font-bold">Final Follow-up Due!</p> :
                             needsFollowUp ? <p className="text-orange-500 font-bold">Follow-up Due</p> : 
                             <p className="text-gray-500 text-sm">On track</p>}
                        </div>
                    </CardContent>
                </Card>
            )
        })}
    </div>
  );
  
  const renderSummaryTab = () => {
    const verifiedCount = verificationProcess.osvItems.filter(v => v.status === 'Verified').length;
    const totalCount = verificationProcess.osvItems.length;
    const progress = totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verification Summary & Final Actions</CardTitle>
                <CardDescription>Review the overall progress and finalize the onboarding process.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-gray-800">Overall OSV Progress</span>
                        <span className="text-sm font-medium text-gray-600">{verifiedCount} of {totalCount} Verified</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-green-600 h-4 rounded-full transition-all duration-500 text-white text-xs font-bold text-center leading-4" style={{ width: `${progress}%` }}>
                           {progress.toFixed(0)}%
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 text-base font-semibold"
                    >
                        Generate Analytical Report
                    </button>
                    <div>
                        <button
                            onClick={() => {
                                handleCompleteOnboarding();
                                setIsNotificationSent(true);
                            }}
                            disabled={!allVerified}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                           Send Joining Notifications
                        </button>
                        {isNotificationSent && <p className="text-sm text-green-600 mt-1 font-semibold text-right">Notifications sent to Comp & Ben and L&D!</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  };


  // --- Main Render ---

  if (candidates.length === 0) {
    return (
        <Card>
            <CardContent className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700">No Candidates for Verification</h3>
                <p className="text-gray-500 mt-2">There are currently no candidates pending verification.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
          <Card>
              <CardHeader><CardTitle>Candidates for Verification</CardTitle></CardHeader>
              <CardContent>
                  <div className="flex items-end gap-6 flex-wrap">
                      <div className="w-full">
                          <label htmlFor="dept-filter" className="text-sm font-medium text-slate-600">Department</label>
                           <select id="dept-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base mt-1">
                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                           </select>
                      </div>
                       <div className="w-full">
                          <label htmlFor="sec-filter" className="text-sm font-medium text-slate-600">Section</label>
                           <select id="sec-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base mt-1" disabled={departmentFilter === 'All'}>
                                {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                           </select>
                      </div>
                       <div className="w-full">
                          <label htmlFor="pos-filter" className="text-sm font-medium text-slate-600">Position</label>
                           <select id="pos-filter" value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base mt-1">
                                {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                           </select>
                      </div>
                  </div>
              </CardContent>
              <div className="border-t">
                  <ul className="divide-y max-h-96 overflow-y-auto">
                      {filteredCandidates.map(c => (
                          <li key={c.id} onClick={() => setSelectedCandidate(c)} className={`p-4 cursor-pointer ${selectedCandidate?.id === c.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                              <p className="font-semibold text-gray-800">{c.name}</p>
                              <p className="text-sm text-gray-600">{c.positionAppliedFor}</p>
                          </li>
                      ))}
                  </ul>
              </div>
          </Card>
      </div>
      <div className="lg:col-span-2">
          {selectedCandidate ? (
              <div>
                <div className="mb-4">
                    <CardHeader>
                        <CardTitle>HR Verification Process for {selectedCandidate.name}</CardTitle>
                        <CardDescription>Real-time tracking for all verification steps.</CardDescription>
                    </CardHeader>
                </div>
                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('checklist')} className={`px-4 py-2 text-lg font-semibold border-b-4 ${activeTab === 'checklist' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Pre-Verification</button>
                    <button onClick={() => setActiveTab('osv')} className={`px-4 py-2 text-lg font-semibold border-b-4 ${activeTab === 'osv' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>OSV Tracking</button>
                    <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 text-lg font-semibold border-b-4 ${activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Summary & Actions</button>
                </div>
                <div>
                    {activeTab === 'checklist' && renderChecklistTab()}
                    {activeTab === 'osv' && renderOsvTab()}
                    {activeTab === 'summary' && renderSummaryTab()}
                </div>
              </div>
          ) : (
              <Card>
                  <CardContent className="text-center py-20">
                      <h3 className="text-xl font-semibold text-gray-700">No Candidate Selected</h3>
                      <p className="text-gray-500 mt-2">Please select a candidate to begin the verification process.</p>
                  </CardContent>
              </Card>
          )}
      </div>

       {selectedCandidate && (
        <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title={`Analytical Report for ${selectedCandidate.name}`} maxWidth="max-w-3xl">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                    <tr><th colSpan={2} className="p-3 font-bold text-base">Checklist</th></tr>
                </thead>
                <tbody>
                    <tr className="border-b"><td className="p-2">Police Verification</td><td className="p-2 font-semibold">{verificationProcess.checklist.policeVerification}</td></tr>
                    <tr className="border-b"><td className="p-2">Originals Seen</td><td className="p-2 font-semibold">{verificationProcess.checklist.originalsSeen ? 'Yes' : 'No'}</td></tr>
                    <tr className="border-b"><td className="p-2">Last Employer Letter</td><td className="p-2 font-semibold">{verificationProcess.checklist.lastEmployerLetterDate || 'Not Provided'}</td></tr>
                    <tr className="border-b"><td className="p-2">Finance Request</td><td className="p-2 font-semibold">{verificationProcess.finance.requestStatus}</td></tr>
                </tbody>
                <thead className="bg-gray-100 mt-4">
                    <tr><th colSpan={2} className="p-3 font-bold text-base">OSV Status</th></tr>
                </thead>
                <tbody>
                    {verificationProcess.osvItems.map(item => (
                        <tr key={item.id} className="border-b">
                            <td className="p-2">{item.type} ({item.target})</td>
                            <td className="p-2 font-semibold"><span className={`px-2 py-1 rounded-full ${statusColorMap[item.status]}`}>{item.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Modal>
      )}
    </div>
  );
};

export default Verification;
