import React from 'react';
import type { Candidate } from '../types';

const FormSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`mt-6 ${className}`}>
        <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
);

const FormField: React.FC<{ label: string; value?: string | number | string[]; fullWidth?: boolean }> = ({ label, value, fullWidth }) => {
    let displayValue: React.ReactNode = <span className="text-gray-500 italic">N/A</span>;
    if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '')) {
        if (Array.isArray(value)) {
            displayValue = (
                <ul className="list-disc list-inside space-y-1">
                    {value.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            );
        } else {
            displayValue = String(value);
        }
    }

    return (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <p className="text-sm font-semibold text-gray-600">{label}</p>
            <div className="text-base text-gray-900 bg-gray-50 p-2 rounded-md mt-1 min-h-[40px]">{displayValue}</div>
        </div>
    );
};


const GeneralInfoSection: React.FC<{ formData: Record<string, any> }> = ({ formData }) => (
     <FormSection title="Personal Information">
        <FormField label="Name of Applicant:" value={formData['Applicant Name']} />
        <FormField label="Date of Birth:" value={formData['Date of Birth']} />
        <FormField label="Mobile Number:" value={formData['Mobile Number']} />
    </FormSection>
);

const MBBSMarksSection: React.FC<{ formData: Record<string, any> }> = ({ formData }) => {
    const profs = ['1st', '2nd', '3rd', '4th', '5th'];
    return (
        <FormSection title="MBBS Professional Marks & Attempts">
            {profs.map(p => <FormField key={`${p}-marks`} label={`${p} Prof Marks:`} value={formData[`${p} Prof Marks`]} />)}
            {profs.map(p => <FormField key={`${p}-attempts`} label={`${p} Prof Attempts:`} value={formData[`${p} Prof Attempts`]} />)}
        </FormSection>
    );
};

const MedicalOfficerPreInterviewForm: React.FC<{ formData: Record<string, any> }> = ({ formData }) => (
    <div className="font-sans">
        <h3 className="text-xl font-bold text-center mb-4">Pre-Interview Form for Medical Officers</h3>
        <GeneralInfoSection formData={formData} />
        <MBBSMarksSection formData={formData} />
        <FormSection title="Postgraduate & Research">
            <FormField label="Part 1 FCPS / MD / MS Exam:" value={formData['Part 1 Exam']} />
            <FormField label="Date of Exam:" value={formData['Part 1 Exam Date']} />
            <FormField label="Positions in University Examinations:" value={formData['University Positions']} fullWidth />
            <FormField label="Research Papers:" value={formData['Research Papers']} fullWidth />
        </FormSection>
        <FormSection title="Work Experience">
            <FormField label="Experience in PKLI? (Years & Months)" value={formData['PKLI Experience']} />
            <FormField label="Dates:" value={formData['PKLI Experience Dates']} />
        </FormSection>
    </div>
);

const PostGraduateResidentPreInterviewForm: React.FC<{ formData: Record<string, any> }> = ({ formData }) => (
    <div className="font-sans">
        <h3 className="text-xl font-bold text-center mb-4">Pre-Interview Form for Post Graduate Residents</h3>
        <GeneralInfoSection formData={formData} />
        <MBBSMarksSection formData={formData} />
        <FormSection title="Postgraduate & House Job">
            <FormField label="Part 1 FCPS / MD / MS Exam:" value={formData['Part 1 Exam']} />
            <FormField label="Date of Exam:" value={formData['Part 1 Exam Date']} />
            <FormField label="Graduating Institute & Hospital where House Job has completed:" value={formData['House Job Hospital']} fullWidth />
            <FormField label="Is this Hospital attached with the Medical Institute from where you graduated?" value={formData['Is Hospital Attached']} fullWidth />
        </FormSection>
        <FormSection title="Experience">
            <FormField label="Primary HCL (BHUs & RHCs) (Years & Months):" value={formData['Primary HCL Experience']} />
            <FormField label="Dates:" value={formData['Primary HCL Dates']} />
            <FormField label="Secondary HCL (THQ/DHQ) (Years & Months):" value={formData['Secondary HCL Experience']} />
            <FormField label="Dates:" value={formData['Secondary HCL Dates']} />
            <FormField label="Tertiary Healthcare Level (Years & Months):" value={formData['Tertiary HCL Experience']} />
            <FormField label="Dates:" value={formData['Tertiary HCL Dates']} />
            <FormField label="Experience in PKLI? (Years & Months)" value={formData['PKLI Experience']} />
            <FormField label="Dates:" value={formData['PKLI Experience Dates']} />
        </FormSection>
        <FormSection title="Academics & Research">
            <FormField label="Positions in University Examinations:" value={formData['University Positions']} fullWidth />
            <FormField label="Research Papers:" value={formData['Research Papers']} fullWidth />
        </FormSection>
    </div>
);

const RegistrarPreInterviewForm: React.FC<{ formData: Record<string, any> }> = ({ formData }) => (
    <div className="font-sans">
        <h3 className="text-xl font-bold text-center mb-4">Pre-Interview Form for Registrars/Senior Registrars/Clinical Fellows</h3>
        <GeneralInfoSection formData={formData} />
        <MBBSMarksSection formData={formData} />
        <FormSection title="Postgraduate & House Job">
            <FormField label="IMM Exam:" value={formData['IMM Exam']} />
            <FormField label="Date of Exam:" value={formData['IMM Exam Date']} />
            <FormField label="Graduating Institute & Hospital where House Job has completed:" value={formData['House Job Hospital']} fullWidth />
            <FormField label="Is this Hospital a Government Teaching Institute?" value={formData['Is Govt Teaching Institute']} />
            <FormField label="Is this Hospital attached with the Medical Institute from where you graduated?" value={formData['Is Hospital Attached']} />
        </FormSection>
        <FormSection title="Academics & Research">
            <FormField label="Positions in University Examinations:" value={formData['University Positions']} fullWidth />
            <FormField label="Research Papers:" value={formData['Research Papers']} fullWidth />
        </FormSection>
    </div>
);

export const PreInterviewFormRouter: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
    const formData = candidate.preInterviewFormData || {};
    const position = candidate.positionAppliedFor.toLowerCase();

    if (position.includes('medical officer')) {
        return <MedicalOfficerPreInterviewForm formData={formData} />;
    }
    if (position.includes('post graduate resident')) {
        return <PostGraduateResidentPreInterviewForm formData={formData} />;
    }
    if (position.includes('registrar') || position.includes('clinical fellow')) {
        return <RegistrarPreInterviewForm formData={formData} />;
    }
    
    // Default fallback to display any data found, same as before
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Submitted Information</h3>
            <p className="text-sm text-gray-500">No specific form template found for this position. Displaying raw data.</p>
            <div className="p-4 bg-gray-50 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="py-1">
                        <p className="text-sm font-semibold text-gray-600">{key}</p>
                        <p className="text-base text-gray-900">{Array.isArray(value) ? value.join(', ') : value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
