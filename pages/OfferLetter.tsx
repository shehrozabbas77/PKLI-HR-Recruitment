
import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import type { Candidate } from '../types';
import { Modal } from '../components/Modal';

interface OfferLetterProps {
    candidates: Candidate[];
    setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
}

const numberToWords = (num: number): string => {
    if (num === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const twenties = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    const numToWords = (n: number): string => {
        if (n === 0) return "";
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return twenties[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
        if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + numToWords(n % 100) : "");
        return "";
    };

    let words = "";
    if (num >= 10000000) {
        words += numToWords(Math.floor(num / 10000000)) + " Crore ";
        num %= 10000000;
    }
    if (num >= 100000) {
        words += numToWords(Math.floor(num / 100000)) + " Lac ";
        num %= 100000;
    }
    if (num >= 1000) {
        words += numToWords(Math.floor(num / 1000)) + " Thousand ";
        num %= 1000;
    }
    
    if (num > 0) {
        words += numToWords(num);
    }
    
    return words.trim();
};


const OfferLetter: React.FC<OfferLetterProps> = ({ candidates, setCandidates }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [actionForEvidence, setActionForEvidence] = useState<{ candidateId: number; status: 'Offer Accepted' | 'Rejected' } | null>(null);
  const [confirmationDetails, setConfirmationDetails] = useState<{
    candidateId: number;
    status: 'Offer Accepted' | 'Rejected';
    file: File;
  } | null>(null);

  const departments = useMemo(() => ['All', ...new Set(candidates.map(c => c.department))], [candidates]);
  const sections = useMemo(() => {
    if (departmentFilter === 'All') return ['All'];
    return ['All', ...new Set(candidates.filter(c => c.department === departmentFilter).map(c => c.section))];
  }, [candidates, departmentFilter]);
  const positions = useMemo(() => ['All', ...new Set(candidates.map(c => c.positionAppliedFor))], [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
        (departmentFilter === 'All' || c.department === departmentFilter) &&
        (sectionFilter === 'All' || c.section === sectionFilter) &&
        (positionFilter === 'All' || c.positionAppliedFor === positionFilter)
    );
  }, [candidates, departmentFilter, sectionFilter, positionFilter]);

  const candidatesToOffer = useMemo(() => filteredCandidates.filter(c => c.status === 'Approved for Hire'), [filteredCandidates]);
  const offersSent = useMemo(() => filteredCandidates.filter(c => c.status === 'Offer Sent'), [filteredCandidates]);
  const offerHistory = useMemo(() => 
      filteredCandidates.filter(c => 
          c.status === 'Offer Accepted' || 
          (c.status === 'Rejected' && c.offerEvidence)
      ).sort((a,b) => (a.name > b.name) ? 1 : -1),
  [filteredCandidates]);

  const handleSendOffer = (id: number) => {
      setCandidates(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, status: 'Offer Sent' };
        }
        return c;
      }));
      setSelectedCandidate(null);
  };
  
  const handleStatusChangeWithEvidence = (candidateId: number, status: 'Offer Accepted' | 'Rejected') => {
    setActionForEvidence({ candidateId, status });
    fileInputRef.current?.click();
  };

  const handleEvidenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && actionForEvidence) {
      const { candidateId, status } = actionForEvidence;
      setConfirmationDetails({
        candidateId,
        status,
        file,
      });
      setActionForEvidence(null);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleConfirmProceed = () => {
    if (!confirmationDetails) return;

    const { candidateId, status, file } = confirmationDetails;
    
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        if (status === 'Rejected') {
          return { ...c, status: 'Rejected', rejectionRemarks: 'Candidate rejected the offer.', offerEvidence: file.name };
        }
        return { ...c, status, offerEvidence: file.name };
      }
      return c;
    }));
    
    setConfirmationDetails(null);
  };
  
  const refNo = selectedCandidate ? `PKLI/HR/TA/${selectedCandidate.id}/${new Date().getFullYear()}` : '';
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const salary = selectedCandidate?.finalSalary || 0;
  const salaryInWords = numberToWords(salary);

  return (
    <div className="space-y-6">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleEvidenceUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.msg,.eml"
      />
      <Card>
        <CardHeader>
            <CardTitle>Offer Letter Generation & Tracking</CardTitle>
            <CardDescription>Generate, send, and track offer letter responses.</CardDescription>
            <div className="flex items-end gap-6 pt-4 mt-4 border-t">
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
            <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base ${activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Pending Actions
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Action History
                    </button>
                </nav>
            </div>
        </CardHeader>
        <CardContent>
            {activeTab === 'pending' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Candidates Ready for Offer</h3>
                        {candidatesToOffer.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-base">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Name</th>
                                            <th className="px-6 py-3 text-left">Position</th>
                                            <th className="px-6 py-3 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candidatesToOffer.map(candidate => (
                                            <tr key={candidate.id} className="border-b bg-white">
                                                <td className="px-6 py-4 font-semibold">{candidate.name}</td>
                                                <td className="px-6 py-4">{candidate.positionAppliedFor}</td>
                                                <td className="px-6 py-4">
                                                    <button 
                                                        onClick={() => setSelectedCandidate(candidate)}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        Generate Offer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">No candidates are currently approved for hire with the selected filters.</p>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Sent Offers</h3>
                        {offersSent.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-base">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Name</th>
                                            <th className="px-6 py-3 text-left">Position</th>
                                            <th className="px-6 py-3 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {offersSent.map(candidate => (
                                            <tr key={candidate.id} className="border-b bg-white">
                                                <td className="px-6 py-4 font-semibold">{candidate.name}</td>
                                                <td className="px-6 py-4">{candidate.positionAppliedFor}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            onClick={() => handleStatusChangeWithEvidence(candidate.id, 'Offer Accepted')}
                                                            className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600"
                                                        >
                                                            Mark as Accepted
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChangeWithEvidence(candidate.id, 'Rejected')}
                                                            className="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
                                                        >
                                                            Mark as Rejected
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">No offers have been sent yet with the selected filters.</p>
                        )}
                    </div>
                </div>
            )}
            {activeTab === 'history' && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Offer Action History</h3>
                    {offerHistory.length > 0 ? (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-base">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Name</th>
                                        <th className="px-6 py-3 text-left">Position</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-left">Evidence File</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {offerHistory.map(candidate => (
                                        <tr key={candidate.id} className="border-b bg-white">
                                            <td className="px-6 py-4 font-semibold">{candidate.name}</td>
                                            <td className="px-6 py-4">{candidate.positionAppliedFor}</td>
                                            <td className="px-6 py-4">
                                                {candidate.status === 'Offer Accepted' ? (
                                                <span className="px-2 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">Accepted</span>
                                                ) : (
                                                <span className="px-2 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">Rejected</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{candidate.offerEvidence || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No offer history available for the selected filters.</p>
                    )}
                </div>
            )}
        </CardContent>
      </Card>
      
      {selectedCandidate && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Offer for {selectedCandidate.name}</CardTitle>
                  <CardDescription>Review and send the conditional offer letter.</CardDescription>
                </div>
                <button 
                    onClick={() => handleSendOffer(selectedCandidate.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold"
                >
                  Send Offer Letter
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-8 bg-white shadow-lg font-serif text-sm">
                <header className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold">PAKISTAN KIDNEY AND LIVER INSTITUTE<br/>AND RESEARCH CENTER</h2>
                    <img src="https://pkli.org.pk/wp-content/uploads/2020/09/cropped-Insignia_512_512.png" alt="PKLI Logo" className="h-20 w-auto"/>
                    <h2 className="text-lg font-semibold text-right" dir="rtl">پاکستان کڈنی اینڈ لیور ٹرانسپلانٹ<br/>انسٹیٹیوٹ</h2>
                </header>
                <h3 className="text-center font-bold text-base mb-6 underline">Conditional Offer Letter</h3>
                
                <div className="mb-4 space-y-1">
                  <p><strong>Ref. No. {refNo}</strong></p>
                  <p><strong>Date: {today}</strong></p>
                </div>
                
                <div className="mb-4 space-y-1">
                  <p>Mr. {selectedCandidate.name}</p>
                  <p>CNIC: {selectedCandidate.cnic}</p>
                </div>

                <p className="mb-4">
                  We are pleased to offer you an appointment with Pakistan Kidney and Liver Institute & Research Centre (PKLI & RC) Lahore, as per the following details, which will be subject to your acknowledgement of the offer letter and signing of the job contract:
                </p>

                <table className="w-full border-collapse border border-black mb-4 text-sm">
                  <tbody>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black w-1/3">Position</td><td className="p-2">{selectedCandidate.recommendedDesignation || selectedCandidate.positionAppliedFor}</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Department</td><td className="p-2">{selectedCandidate.department}</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Work Location</td><td className="p-2">PKLI & RC's Head Office, Lahore</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Reporting To</td><td className="p-2">Head of the department or as per Organizational Chart</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Commencement</td><td className="p-2">To be communicated by the applicant. If candidate does not join on mutually agreed date, the said offer will automatically be cancelled.</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Duration</td><td className="p-2">Three Year Contract, Extendable on Mutual Agreement or as per Hospital Policy</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Work Hours</td><td className="p-2">Minimum 45 hours per Week and 5 Days Per Week or as per Hospital Policy</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Salary and Benefits</td><td className="p-2">Gross PKR {salary.toLocaleString()}/- ({salaryInWords} Rupees only) per month. [Health insurance, One post-employment/Retirement Benefit] or as per the policy of PKLI & RC</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Applicable Taxes</td><td className="p-2">The salary is subject to the deduction of all applicable taxes.</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Applicable Law and Jurisdiction</td><td className="p-2">The applicable laws shall be the laws of Pakistan, in force, from time to time and the Jurisdiction shall be that of the Courts of Pakistan. As per Institutional policy, you will not be allowed to do any job, in addition to your employment at PKLI & RC. In case of any such involvement, the management reserves the right to terminate the service.</td></tr>
                    <tr className="border border-black"><td className="font-semibold p-2 border-r border-black">Leave Entitlement</td><td className="p-2">08 days Sick, 06 days Casual and 24 days Annual Leaves in 12 (twelve) calendar months (based on 5 days per week working) or as per Hospital Policy</td></tr>
                  </tbody>
                </table>

                <div className="space-y-3 text-xs leading-relaxed">
                  <p>This is a conditional offer letter of Job at PKLI & RC, subject to the Medical Checkup, satisfactory reference checks & correctness of documents. You will bear the cost of credential verification, which will be deducted from your salary. If you remain unable to join the company after accepting the offer, you will be required to reimburse the charges incurred against your credential verifications and medical screening. The detailed terms and conditions shall be incorporated in the Services Agreement. You'll be required to provide the documents as per the attached list.</p>
                  <p>This Offer is valid for 7 days only. Please sign this and send it back to us, as an acceptance of this offer letter. Detailed Verification of antecedents of candidates (degrees, experiences, character certificates, licenses and professional membership) is at the discretion of the Hospital shall be undertaken by HR Department. In case verification shows that information is misrepresented, or omitted from an application or resume, or during the interview process or has submitted fake/forged documents or degrees, Hospital reserves the right to rescind an offer, or to terminate employment contract and take further possible legal action.</p>
                  <p className="font-bold">Please bring your original experience letter at the time of offer acceptance/medical screening.</p>
                </div>
                 
                 <div className="flex justify-between mt-16 pt-8">
                    <div>
                        <p className="border-t border-black pt-1">Alpha Latif</p>
                        <p className="font-bold">Director Human Resource</p>
                    </div>
                     <div>
                        <p className="pt-1">Prepared by: Atifa Ambreen</p>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
      )}

      {confirmationDetails && (
        <Modal
          isOpen={!!confirmationDetails}
          onClose={() => setConfirmationDetails(null)}
          title="Confirm Action"
        >
          <div className="space-y-4">
            <p className="text-base text-gray-700">
              You have attached the file: <span className="font-semibold">{confirmationDetails.file.name}</span>.
            </p>
            <p className="text-base text-gray-700">
              Do you want to proceed with marking this offer as <span className="font-semibold">"{confirmationDetails.status === 'Rejected' ? 'Rejected' : 'Accepted'}"</span>?
            </p>
          </div>
          <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
            <button
              type="button"
              onClick={() => setConfirmationDetails(null)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmProceed}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
            >
              Proceed
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OfferLetter;
