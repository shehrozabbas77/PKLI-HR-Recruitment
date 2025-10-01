

import React from 'react';
import { HourglassIcon, CheckIcon, XIcon } from './icons';
import type { ApprovalStep } from '../types';

interface ApprovalWorkflowProps {
  stepNames: string[];
  currentStepIndex: number;
  isCompleted: boolean;
  isRejected: boolean;
  approvalHistory: ApprovalStep[];
  completionDate?: string;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ stepNames, currentStepIndex, isCompleted, isRejected, approvalHistory, completionDate }) => {
    return (
        <div className="flex items-start w-full">
            {stepNames.map((name, index) => {
                let status: 'approved' | 'rejected' | 'current' | 'future';
                let icon;

                if (isCompleted) {
                    status = 'approved';
                } else if (isRejected) {
                    if (index < currentStepIndex) status = 'approved';
                    else if (index === currentStepIndex) status = 'rejected';
                    else status = 'future';
                } else {
                    if (index < currentStepIndex) status = 'approved';
                    else if (index === currentStepIndex) status = 'current';
                    else status = 'future';
                }
                
                // Final "Approved" step visualization
                if (name === 'Approved' && isCompleted) {
                    status = 'approved';
                } else if (name === 'Completed' && isCompleted) {
                    status = 'approved';
                } else if ((name === 'Approved' || name === 'Completed') && !isCompleted) {
                    status = 'future';
                }


                if (status === 'approved') icon = <CheckIcon className="w-6 h-6" />;
                else if (status === 'rejected') icon = <XIcon className="w-6 h-6" />;
                else if (status === 'current') icon = <HourglassIcon className="w-6 h-6" />;
                else icon = <div className="w-3 h-3 bg-gray-400 rounded-full" />;
                
                const styles = {
                    circle: {
                        'approved': 'bg-green-100 border-green-500 text-green-600',
                        'rejected': 'bg-red-100 border-red-500 text-red-600',
                        'current': 'bg-blue-600 border-blue-700 text-white',
                        'future': 'bg-gray-100 border-gray-300 text-gray-400',
                    }[status],
                    label: {
                        'approved': 'text-gray-700 font-semibold',
                        'rejected': 'text-red-600 font-semibold',
                        'current': 'text-blue-600 font-semibold',
                        'future': 'text-gray-500 font-medium',
                    }[status],
                };

                let prevStepWasApproved = index > 0 && (index <= currentStepIndex || isCompleted);
                if (isRejected && index -1 === currentStepIndex) {
                    // Don't color line green after a rejection
                    prevStepWasApproved = false; 
                }
                
                const historyStep = approvalHistory[index];
                let dateToShow: string | undefined = historyStep?.date;
                if ((name === 'Approved' || name === 'Completed') && isCompleted) {
                    dateToShow = completionDate || historyStep?.date;
                }

                return (
                    <React.Fragment key={name}>
                        <div className="flex flex-col items-center text-center w-56 shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${styles.circle}`}>
                                {icon}
                            </div>
                            <p className={`mt-2 text-sm transition-colors duration-300 min-h-[3rem] flex items-center justify-center ${styles.label}`}>{name}</p>
                             <div className="text-xs text-gray-500 mt-1 min-h-[4rem] space-y-0.5 flex flex-col justify-center">
                                {historyStep?.approver && (status === 'approved' || status === 'rejected') && (
                                    <div className="font-semibold">{historyStep.approver}</div>
                                )}
                                {dateToShow && (status === 'approved' || status === 'rejected') && (
                                    <div className="font-medium">{new Date(dateToShow).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                )}
                                {historyStep?.comments && (status === 'approved' || status === 'rejected') && (
                                    <div className="italic text-gray-500 px-2 line-clamp-2" title={historyStep.comments}>"{historyStep.comments}"</div>
                                )}
                            </div>
                        </div>

                        {index < stepNames.length - 1 && (
                            <div className={`flex-1 h-1 transition-colors duration-300 mt-6 ${prevStepWasApproved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};