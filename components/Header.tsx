import React, { useState, useEffect, useRef } from 'react';
import type { Step } from '../types';

interface NavLinkProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ children, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`flex items-center text-white text-sm font-semibold hover:bg-white/10 transition-colors duration-200 px-3 py-2 rounded-lg whitespace-nowrap ${
        isActive ? 'bg-black/20' : ''
      }`}
    >
      {children}
    </button>
  </li>
);

const Dropdown: React.FC<{
  title: string;
  steps: Step[];
  activeStep: number;
  setActiveStep: (step: number) => void;
}> = ({ title, steps, activeStep, setActiveStep }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const isActive = steps.some(s => s.id === activeStep);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <li ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center text-white text-sm font-semibold hover:bg-white/10 transition-colors duration-200 px-3 py-2 rounded-lg whitespace-nowrap ${
          isActive ? 'bg-black/20' : ''
        }`}
      >
        {title}
        <svg className={`w-4 h-4 ml-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <ul className="absolute mt-2 w-64 bg-white rounded-xl shadow-2xl z-20 text-slate-800 py-2 left-0 ring-1 ring-black ring-opacity-5">
          {steps.map(step => (
            <li key={step.id}>
              <button
                onClick={() => {
                  setActiveStep(step.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 ${
                  activeStep === step.id ? 'font-bold text-[#0076b6] bg-slate-100' : ''
                }`}
              >
                {step.shortTitle}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

interface HeaderProps {
    activeStep: number;
    setActiveStep: (step: number) => void;
    steps: Step[];
}

export const Header: React.FC<HeaderProps> = ({ activeStep, setActiveStep, steps }) => {
    const mainNavSteps = steps.filter(s => s.id !== 18); // Exclude "My Nominations" from main nav
    const myNominationsStep = steps.find(s => s.id === 18);

    return (
        <header className="bg-[#8C3A3F] flex items-center justify-between px-6 py-2 text-white shadow-lg relative z-10 print-hidden">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
                 <img src="https://pkli.org.pk/wp-content/uploads/2020/09/cropped-Insignia_512_512.png" alt="PKLI Logo" className="h-16 w-auto drop-shadow-md"/>
            </div>

            {/* Center: Navigation */}
            <nav className="flex-grow">
                <ul className="flex items-center justify-center flex-wrap gap-x-1.5 gap-y-1">
                    {mainNavSteps.map(step => {
                        if (step.children && step.children.length > 0) {
                            return (
                                <Dropdown
                                    key={step.id}
                                    title={step.shortTitle}
                                    steps={step.children}
                                    activeStep={activeStep}
                                    setActiveStep={setActiveStep}
                                />
                            );
                        }
                        return (
                            <NavLink
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
                                isActive={activeStep === step.id}
                            >
                                {step.shortTitle}
                            </NavLink>
                        );
                    })}
                </ul>
            </nav>

            {/* Right: My Nominations & Pulse Logo */}
            <div className="flex-shrink-0 flex items-center space-x-4">
                {myNominationsStep && (
                     <button
                        onClick={() => setActiveStep(myNominationsStep.id)}
                        className={`text-white text-sm font-semibold transition-colors duration-200 px-4 py-2 rounded-lg whitespace-nowrap ${
                            activeStep === myNominationsStep.id
                            ? 'bg-black/25 border-2 border-white/50 shadow-inner'
                            : 'bg-black/10 border border-white/30 hover:bg-black/20'
                        }`}
                    >
                        {myNominationsStep.shortTitle}
                    </button>
                )}
                <img src="https://nv4mg5yqbstyir41.public.blob.vercel-storage.com/Pulse.png" alt="Pulse Logo" className="h-12 w-auto"/>
            </div>
        </header>
    );
};