import React, { useState } from 'react';
import { NAVIGATION_STRUCTURE, ALL_STEPS, SELECTION_BOARDS } from './constants';
import Dashboard from './pages/Dashboard';
import StaffingPlan from './pages/StaffingPlan';
import JobDescriptionPage from './pages/JobDescription';
// FIX: Renamed component import to avoid conflict with 'Requisition' type.
import RequisitionPage from './pages/Requisition';
import JobAdvertisement from './pages/JobAdvertisement';
import Applications from './pages/Applications';
import InterviewsPage from './pages/Interviews';
import ApprovalForHire from './pages/ApprovalForHire';
import OfferLetter from './pages/OfferLetter';
import MedicalScreening from './pages/MedicalScreening';
import Verification from './pages/Verification';
import PostOnboarding from './pages/PostOnboarding';
import NominationPortal from './pages/NominationPortal';
import { Header } from './components/Header';
import type { Candidate, Requisition, StaffingPosition, JobAdvertisement as JobAdvertisementType, JobDescription as JobDescriptionType, SelectionBoard } from './types';
import { mockCandidates, mockRequisitions, mockStaffingPlan, mockJobDescriptions, mockAdvertisements } from './constants';
import Login from './pages/Login';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [staffingPlan, setStaffingPlan] = useState<StaffingPosition[]>(mockStaffingPlan);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionType[]>(mockJobDescriptions);
  const [requisitions, setRequisitions] = useState<Requisition[]>(mockRequisitions);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ICT');
  const [advertisements, setAdvertisements] = useState<JobAdvertisementType[]>(mockAdvertisements);
  const [selectionBoards, setSelectionBoards] = useState<SelectionBoard[]>(SELECTION_BOARDS);

  const handleNavigate = (step: number, department?: string) => {
    if (department) {
      setSelectedDepartment(department);
    }
    setActiveStep(step);
  };

  const renderContent = () => {
    // FIX: Expanded filter to include candidates rejected after their interview, ensuring they remain visible on the comparative sheet as requested.
    const candidatesForInterview = candidates.filter(c => c.status === 'Shortlisted for Interview' || c.status === 'Recommended for Hire' || c.status === 'Approved for Hire' || c.status === 'Offer Sent' || c.status === 'Offer Accepted' || c.status === 'Pending Verification' || c.status === 'Hired' || (c.status === 'Rejected' && c.interviewStatus === 'Completed'));
    switch (activeStep) {
      case 1:
        return <Dashboard 
                  staffingPlan={staffingPlan} 
                  requisitions={requisitions}
                  candidates={candidates}
                  onNavigate={handleNavigate} 
               />;
      case 2:
        return <StaffingPlan positions={staffingPlan} setPositions={setStaffingPlan} initialDepartment={selectedDepartment} />;
      case 3:
        return <JobDescriptionPage jobDescriptions={jobDescriptions} setJobDescriptions={setJobDescriptions} staffingPlan={staffingPlan} />;
      case 4:
        // FIX: Using renamed component 'RequisitionPage'.
        return <RequisitionPage requisitions={requisitions} setRequisitions={setRequisitions} staffingPlan={staffingPlan} jobDescriptions={jobDescriptions} advertisements={advertisements} />;
      case 5:
        return <JobAdvertisement requisitions={requisitions} advertisements={advertisements} setAdvertisements={setAdvertisements} candidates={candidates} />;
      case 6:
        return <Applications candidates={candidates} setCandidates={setCandidates} stage="collection" advertisements={advertisements} />;
      case 7:
         return <Applications candidates={candidates} setCandidates={setCandidates} stage="department-review" advertisements={advertisements} />;
      case 8:
        return <Applications candidates={candidates} setCandidates={setCandidates} stage="final-shortlisting" advertisements={advertisements} />;
      case 9:
        return <InterviewsPage
                    candidates={candidatesForInterview}
                    setCandidates={setCandidates} 
                    selectionBoards={selectionBoards}
                    setSelectionBoards={setSelectionBoards}
                    activeView="panel-nomination"
               />;
      case 10:
        return <InterviewsPage
                    candidates={candidatesForInterview}
                    setCandidates={setCandidates} 
                    selectionBoards={selectionBoards}
                    setSelectionBoards={setSelectionBoards}
                    activeView="interview-scheduling"
               />;
      case 11:
        return <InterviewsPage
                    candidates={candidatesForInterview}
                    setCandidates={setCandidates} 
                    selectionBoards={selectionBoards}
                    setSelectionBoards={setSelectionBoards}
                    activeView="evaluation"
               />;
      case 12:
        return <InterviewsPage
                    candidates={candidatesForInterview}
                    setCandidates={setCandidates} 
                    selectionBoards={selectionBoards}
                    setSelectionBoards={setSelectionBoards}
                    activeView="comparative-sheet"
                    advertisements={advertisements}
                    requisitions={requisitions}
                />;
      case 13:
        return <ApprovalForHire candidates={candidates.filter(c => c.status === 'Recommended for Hire')} setCandidates={setCandidates} />;
      case 14:
        return <OfferLetter candidates={candidates.filter(c => c.status === 'Approved for Hire' || c.status === 'Offer Sent')} setCandidates={setCandidates} />;
      case 15:
        return <MedicalScreening candidates={candidates.filter(c => c.status === 'Offer Accepted' || c.status === 'Offer Sent')} setCandidates={setCandidates} />;
      case 16:
        return <Verification candidates={candidates.filter(c => c.status === 'Pending Verification')} setCandidates={setCandidates} />;
      case 17:
        return <PostOnboarding candidates={candidates.filter(c => c.status === 'Hired')} />;
      case 18:
        return <NominationPortal candidates={candidates} setCandidates={setCandidates} />;
      default:
        return <Dashboard 
                  staffingPlan={staffingPlan} 
                  requisitions={requisitions}
                  candidates={candidates}
                  onNavigate={handleNavigate}
               />;
    }
  };
  
  const activeStepInfo = ALL_STEPS.find(s => s.id === activeStep);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <Header activeStep={activeStep} setActiveStep={setActiveStep} steps={NAVIGATION_STRUCTURE} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{activeStepInfo?.title || ''}</h2>
            <p className="text-base text-slate-500 mt-1 max-w-2xl">{activeStepInfo?.description || ''}</p>
          </div>
          {activeStep === 4 && (
             <button 
              onClick={() => {
                // This is a bit of a hack to trigger the modal in RequisitionPage.
                // A better solution would involve a global state manager (like Context or Redux).
                const event = new CustomEvent('openCreateRequisitionModal');
                window.dispatchEvent(event);
              }}
              className="px-5 py-2.5 bg-[#0076b6] text-white rounded-lg hover:bg-[#005a8c] text-base font-semibold transition-colors flex items-center shadow-sm hover:shadow-md whitespace-nowrap transform hover:-translate-y-px"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Requisition
            </button>
          )}
        </div>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
