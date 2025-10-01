
import React from 'react';
import type { Step } from '../types';
import { AdIcon, AlertIcon, ApplicationIcon, ApprovalIcon, InterviewIcon, MedicalIcon, OfferIcon, PlanIcon, RequisitionIcon, ScreenIcon, VerificationIcon } from './icons';

interface SidebarProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  steps: Step[];
}

const ICONS: { [key: number]: React.ReactNode } = {
  1: <PlanIcon className="w-5 h-5" />,
  2: <RequisitionIcon className="w-5 h-5" />,
  3: <AdIcon className="w-5 h-5" />,
  4: <ApplicationIcon className="w-5 h-5" />,
  5: <ScreenIcon className="w-5 h-5" />,
  6: <InterviewIcon className="w-5 h-5" />,
  7: <ApprovalIcon className="w-5 h-5" />,
  8: <OfferIcon className="w-5 h-5" />,
  9: <MedicalIcon className="w-5 h-5" />,
  10: <VerificationIcon className="w-5 h-5" />,
  11: <AlertIcon className="w-5 h-5" />,
};

export const Sidebar: React.FC<SidebarProps> = ({ activeStep, setActiveStep, steps }) => {
  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-20 flex items-center justify-center px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">HR Workflow</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`flex items-center w-full px-4 py-2.5 text-base font-medium rounded-md transition-colors duration-150 ${
              activeStep === step.id
                ? 'bg-[#0076b6] text-white shadow-md'
                : 'text-gray-600 hover:bg-[#e0f2fe] hover:text-[#0076b6]'
            }`}
          >
            <div className={`flex items-center justify-center w-7 h-7 mr-3 rounded-full text-sm font-bold ${activeStep === step.id ? 'bg-white text-[#0076b6]' : 'bg-gray-200 text-gray-600'}`}>
              {step.id}
            </div>
            <span className="truncate text-left flex-1">{step.title}</span>
            <div className={`ml-2 ${activeStep !== step.id && 'text-gray-400'}`}>
                {ICONS[step.id]}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};
