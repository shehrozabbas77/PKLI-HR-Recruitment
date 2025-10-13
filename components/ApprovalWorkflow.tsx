import React from 'react';
import { HourglassIcon, CheckIcon, XIcon, HistoryIcon } from './icons';
import type { ApprovalStep, JobDescriptionStatus } from '../types';

interface ApprovalWorkflowProps {
  stepNames: string[];
  currentStepIndex: number;
  isCompleted: boolean;
  isRejected: boolean;
  approvalHistory: ApprovalStep[];
  completionDate?: string;
  overallStatus?: JobDescriptionStatus;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ stepNames, currentStepIndex, isCompleted, isRejected, approvalHistory, completionDate, overallStatus }) => {
    // A mapping from the step name array index to the role key used in the history object.
    const roleMap = ['Supervisor', 'HOD', 'HR'];

    return (
        <div className="flex items-start w-full">
            {stepNames.map((name, index) => {
                let visualStatus: 'approved' | 'rejected' | 'current' | 'future' | 'returned';
                
                // Handle the final "Completed" step, which doesn't have a role in the history.
                if (index >= roleMap.length) {
                    visualStatus = isCompleted ? 'approved' : 'future';
                } else {
                    const roleKey = roleMap[index];
                    const historyForStep = approvalHistory.filter(h => h.role.includes(roleKey));
                    const lastEventForStep = historyForStep.length > 0 ? historyForStep[historyForStep.length - 1] : null;

                    if (!lastEventForStep) {
                        visualStatus = 'future';
                    } else {
                        switch (lastEventForStep.status) {
                            case 'Approved':
                            case 'Reviewed':
                                visualStatus = 'approved';
                                break;
                            case 'Rejected':
                                visualStatus = (overallStatus === 'Rejected') ? 'rejected' : 'returned';
                                break;
                            case 'Pending':
                                visualStatus = 'current';
                                break;
                            default:
                                visualStatus = 'future';
                        }
                    }
                    
                    // Override logic: if the overall status indicates this step is now pending (due to a return), mark it as 'current'.
                    if (overallStatus === 'Pending HOD Approval' && roleKey === 'HOD') {
                        visualStatus = 'current';
                    }
                    if (overallStatus === 'Pending HR Review' && roleKey === 'HR') {
                        visualStatus = 'current';
                    }
                }
                
                let icon;
                if (visualStatus === 'approved') icon = <CheckIcon className="w-6 h-6" />;
                else if (visualStatus === 'rejected') icon = <XIcon className="w-6 h-6" />;
                else if (visualStatus === 'returned') icon = <HistoryIcon className="w-6 h-6" />;
                else if (visualStatus === 'current') icon = <HourglassIcon className="w-6 h-6" />;
                else icon = <div className="w-3 h-3 bg-gray-400 rounded-full" />;
                
                const styles = {
                    circle: {
                        'approved': 'bg-green-100 border-green-500 text-green-600',
                        'rejected': 'bg-red-100 border-red-500 text-red-600',
                        'returned': 'bg-amber-100 border-amber-500 text-amber-600',
                        'current': 'bg-blue-600 border-blue-700 text-white',
                        'future': 'bg-gray-100 border-gray-300 text-gray-400',
                    }[visualStatus],
                    label: {
                        'approved': 'text-gray-700 font-semibold',
                        'rejected': 'text-red-600 font-semibold',
                        'returned': 'text-amber-600 font-semibold',
                        'current': 'text-blue-600 font-semibold',
                        'future': 'text-gray-500 font-medium',
                    }[visualStatus],
                };

                // Find the latest event for this step to display info
                const roleKey = roleMap[index];
                const historyEventsForStep = approvalHistory.filter(h => h.role.includes(roleKey));
                const latestEvent = historyEventsForStep.length > 0 ? historyEventsForStep[historyEventsForStep.length - 1] : null;
                
                let dateToShow: string | undefined = latestEvent?.date;
                if ((name === 'Approved' || name === 'Completed') && isCompleted) {
                    dateToShow = completionDate || latestEvent?.date;
                }

                return (
                    <React.Fragment key={name}>
                        <div className="flex flex-col items-center text-center w-56 shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${styles.circle}`}>
                                {icon}
                            </div>
                            <p className={`mt-2 text-sm transition-colors duration-300 min-h-[3rem] flex items-center justify-center ${styles.label}`}>{name}</p>
                             <div className="text-xs text-gray-500 mt-1 min-h-[4rem] space-y-0.5 flex flex-col justify-center">
                                {latestEvent?.approver && latestEvent.status !== 'Pending' && (
                                    <div className="font-semibold">{latestEvent.approver}</div>
                                )}
                                {dateToShow && latestEvent?.status !== 'Pending' && (
                                    <div className="font-medium">{new Date(dateToShow).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                )}
                                {latestEvent?.comments && latestEvent.status !== 'Pending' && (
                                    <div className="italic text-gray-500 px-2 line-clamp-2" title={latestEvent.comments}>"{latestEvent.comments}"</div>
                                )}
                            </div>
                        </div>

                        {index < stepNames.length - 1 && (
                             <div className={`flex-1 h-1 transition-colors duration-300 mt-6 ${visualStatus === 'approved' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};