import React, { useMemo, useState } from 'react';
import type { StaffingPosition, Requisition, Candidate } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { BriefcaseIcon, UsersIcon, UserMinusIcon, RequisitionIcon, ListIcon, BarChartIcon } from '../components/icons';
import { PositionStatus } from '../types';

interface DashboardProps {
  staffingPlan: StaffingPosition[];
  requisitions: Requisition[];
  candidates: Candidate[];
  onNavigate: (step: number, department?: string) => void;
}

const statConfig = {
    budgeted: { color: 'bg-blue-100 text-blue-600', icon: <BriefcaseIcon className="w-6 h-6" /> },
    onboard: { color: 'bg-green-100 text-green-600', icon: <UsersIcon className="w-6 h-6" /> },
    vacant: { color: 'bg-amber-100 text-amber-600', icon: <UserMinusIcon className="w-6 h-6" /> },
    requisitions: { color: 'bg-indigo-100 text-indigo-600', icon: <RequisitionIcon className="w-6 h-6" /> },
};

const StatCard: React.FC<{ title: string; value: string; type: keyof typeof statConfig; onClick?: () => void; }> = ({ title, value, type, onClick }) => (
    <button onClick={onClick} disabled={!onClick} className="text-left w-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 disabled:cursor-default disabled:transform-none disabled:shadow-md">
        <Card className="h-full">
            <CardContent className="flex items-center p-5">
                <div className={`p-3 rounded-full ${statConfig[type].color} mr-4`}>
                    {statConfig[type].icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-3xl font-bold text-slate-800">{value}</p>
                </div>
            </CardContent>
        </Card>
    </button>
);


const DonutChart: React.FC<{ data: { name: string; value: number; color: string }[], onNavigate?: () => void }> = ({ data, onNavigate }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">No data available</div>;
    }
    let cumulative = 0;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex items-center justify-center space-x-8 py-4">
            <button
                onClick={onNavigate}
                disabled={!onNavigate}
                className="relative w-40 h-40 rounded-full group disabled:cursor-default"
            >
                 <svg width="160" height="160" viewBox="0 0 120 120" className="-rotate-90">
                    <circle r={radius} cx="60" cy="60" fill="transparent" stroke="#e5e7eb" strokeWidth="20" />
                    {data.map(item => {
                        const dashoffset = circumference - (cumulative / total) * circumference;
                        const dasharray = (item.value / total) * circumference;
                        cumulative += item.value;
                        return (
                            <circle
                                key={item.name}
                                r={radius}
                                cx="60"
                                cy="60"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="20"
                                strokeDasharray={`${dasharray} ${circumference - dasharray}`}
                                strokeDashoffset={-dashoffset}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform group-hover:scale-105 group-disabled:transform-none">
                    <span className="text-3xl font-bold text-slate-800">{total}</span>
                    <span className="text-sm text-slate-500">Total</span>
                </div>
            </button>
            <div className="space-y-3">
                {data.map(item => (
                    <button
                        key={item.name}
                        onClick={onNavigate}
                        disabled={!onNavigate}
                        className="flex items-center w-full text-left p-1 rounded-md transition-colors hover:bg-slate-100 disabled:cursor-default disabled:hover:bg-transparent"
                    >
                        <span className="w-3.5 h-3.5 rounded-full mr-3" style={{ backgroundColor: item.color }}></span>
                        <span className="text-sm font-medium text-slate-700">{item.name} ({item.value})</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const DepartmentBarChart: React.FC<{ 
    summary: Record<string, { budgeted: number; onboard: number; vacant: number; }>;
    onNavigate: (step: number, department?: string) => void;
}> = ({ summary, onNavigate }) => {
    // FIX: Cast the result of Object.entries to the correct tuple array type to resolve 'unknown' type errors.
    const departments = Object.entries(summary) as [string, { budgeted: number, onboard: number, vacant: number }][];

    return (
        <div className="space-y-4 px-6 py-4">
            <div className="flex justify-end text-sm text-slate-500 mb-2">
                <div className="flex items-center mr-4"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Onboard</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>Vacant</div>
            </div>
            {departments.map(([dept, data]) => {
                const onboardPercent = data.budgeted > 0 ? (data.onboard / data.budgeted) * 100 : 0;
                const vacantPercent = data.budgeted > 0 ? (data.vacant / data.budgeted) * 100 : 0;
                
                return (
                    <div key={dept} className="grid grid-cols-4 items-center gap-4 group">
                        <button 
                            onClick={() => onNavigate(2, dept)} 
                            className="text-sm font-semibold text-slate-800 text-left text-blue-600 truncate col-span-1 group-hover:underline"
                        >
                            {dept}
                        </button>
                        <div className="col-span-3 flex items-center">
                            <div className="w-full bg-slate-200 rounded-full h-6 flex overflow-hidden shadow-inner">
                                <div 
                                    className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-bold transition-all duration-500" 
                                    style={{ width: `${onboardPercent}%` }}
                                    title={`Onboard: ${data.onboard}`}
                                >
                                    {onboardPercent > 10 ? data.onboard : ''}
                                </div>
                                <div 
                                    className="bg-amber-500 h-full flex items-center justify-center text-xs text-white font-bold transition-all duration-500" 
                                    style={{ width: `${vacantPercent}%` }}
                                    title={`Vacant: ${data.vacant}`}
                                >
                                   {vacantPercent > 10 ? data.vacant : ''}
                                </div>
                            </div>
                             <div className="ml-4 text-sm font-bold w-20 text-right text-slate-600">
                                {data.onboard} / {data.budgeted}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ staffingPlan, requisitions, candidates, onNavigate }) => {
    const [summaryView, setSummaryView] = useState<'table' | 'chart'>('chart');
    const totalBudgeted = staffingPlan.reduce((sum, pos) => sum + pos.positions2526, 0);
    const totalOnboard = staffingPlan.reduce((sum, pos) => sum + pos.onBoard, 0);
    const totalVacant = staffingPlan.reduce((sum, pos) => sum + pos.vacant, 0);
    
    const activeRequisitions = requisitions.filter(r => r.status !== 'Approved' && r.status !== 'Rejected').length;
    
    const departmentSummary = useMemo(() => {
        const summary: Record<string, { budgeted: number; onboard: number; vacant: number; resigned: number; budgeted2627: number; }> = {};
        staffingPlan.forEach((pos) => {
            if (!summary[pos.department]) {
                summary[pos.department] = { budgeted: 0, onboard: 0, vacant: 0, resigned: 0, budgeted2627: 0 };
            }
            summary[pos.department].budgeted += pos.positions2526;
            summary[pos.department].onboard += pos.onBoard;
            summary[pos.department].vacant += pos.vacant;
            summary[pos.department].budgeted2627 += pos.positions2627;
            if (pos.status === PositionStatus.Resigned) {
                summary[pos.department].resigned += 1; // Assuming 1 person per resigned record
            }
        });
        return summary;
    }, [staffingPlan]);

    const recruitmentFunnelData = useMemo(() => {
        const stages: Record<string, { statuses: string[], stepId: number }> = {
            'New Applications': { statuses: ['New', 'Under Review'], stepId: 6 },
            'Department Review': { statuses: ['Sent to Department', 'Pending Dept. Acknowledgement', 'Acknowledged'], stepId: 7 },
            'Shortlisted': { statuses: ['Recommended by Department', 'Shortlisted for Interview'], stepId: 8 },
            'Interview & Approval': { statuses: ['Recommended for Hire', 'Approved for Hire'], stepId: 10 },
            'Offer Stage': { statuses: ['Offer Sent', 'Offer Accepted', 'Pending Verification'], stepId: 15 },
        };
        const allStatuses = Object.values(stages).flatMap(s => s.statuses);
        const totalInProcess = candidates.filter(c => allStatuses.includes(c.status)).length || 1;

        return Object.entries(stages).map(([name, data]) => {
            const count = candidates.filter(c => data.statuses.includes(c.status)).length;
            return {
                name,
                count,
                percentage: (count / totalInProcess) * 100,
                stepId: data.stepId
            };
        });
    }, [candidates]);
    
    const positionStatusData = useMemo(() => {
        return [
            { name: 'Onboard', value: totalOnboard, color: '#2563eb' },
            { name: 'Vacant', value: totalVacant, color: '#f59e0b' },
            { name: 'New Additions', value: staffingPlan.filter(p => p.status === PositionStatus.NewAddition).length, color: '#16a34a' },
        ];
    }, [staffingPlan, totalOnboard, totalVacant]);

    const requisitionStatusData = useMemo(() => {
       const counts = requisitions.reduce((acc, req) => {
            if (req.status !== 'Approved' && req.status !== 'Rejected') {
                acc[req.status] = (acc[req.status] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const colors: Record<string, string> = {
            'Pending Director/Dean Approval': '#6366f1',
            'Pending HOD Approval': '#f97316',
            'Pending HR Review': '#a855f7',
            'Needs Revision': '#6b7280',
        };
        
        const statusOrder = [
            'Pending Director/Dean Approval',
            'Pending HOD Approval',
            'Pending HR Review',
            'Needs Revision'
        ];

        return statusOrder
            .filter(status => counts[status]) // only include statuses that exist in the data
            .map(name => ({ 
                name, 
                value: counts[name],
                color: colors[name]
            }));

    }, [requisitions]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Budgeted Positions" value={totalBudgeted.toString()} type="budgeted" onClick={() => onNavigate(2)} />
                <StatCard title="Onboard Staff" value={totalOnboard.toString()} type="onboard" />
                <StatCard title="Vacant Positions" value={totalVacant.toString()} type="vacant" onClick={() => onNavigate(2)} />
                <StatCard title="Active Requisitions" value={activeRequisitions.toString()} type="requisitions" onClick={() => onNavigate(4)} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">Department Wise Summary</h3>
                            <p className="text-base text-slate-300 mt-1">An overview of staffing status across all departments.</p>
                        </div>
                        <div className="ml-auto flex items-center space-x-1 bg-slate-900/50 p-1 rounded-lg">
                            <button onClick={() => setSummaryView('chart')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors flex items-center ${summaryView === 'chart' ? 'bg-white text-slate-800' : 'text-white hover:bg-white/10'}`}>
                                <BarChartIcon className="w-4 h-4 mr-1.5" /> Chart
                            </button>
                            <button onClick={() => setSummaryView('table')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors flex items-center ${summaryView === 'table' ? 'bg-white text-slate-800' : 'text-white hover:bg-white/10'}`}>
                                <ListIcon className="w-4 h-4 mr-1.5" /> Table
                            </button>
                        </div>
                    </div>
                    <CardContent className="p-0">
                         {summaryView === 'table' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-base text-left">
                                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Department</th>
                                            <th className="px-6 py-4 text-center">Budgeted (25-26)</th>
                                            <th className="px-6 py-4 text-center">Onboard</th>
                                            <th className="px-6 py-4 text-center">Vacant</th>
                                            <th className="px-6 py-4 text-center">Resigned</th>
                                            <th className="px-6 py-4 text-center">Budgeted (26-27)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {Object.keys(departmentSummary).map((dept) => {
                                            const data = departmentSummary[dept];
                                            const onboardPercentage = data.budgeted > 0 ? (data.onboard / data.budgeted) * 100 : 0;
                                            return (
                                                <tr key={dept} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                                        <button onClick={() => onNavigate(2, dept)} className="hover:underline text-blue-600">{dept}</button>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-slate-700">{data.budgeted}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <span className="font-bold text-green-600 w-8">{data.onboard}</span>
                                                            <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2.5">
                                                                <div 
                                                                    className="bg-green-600 h-2.5 rounded-full" 
                                                                    style={{ width: `${onboardPercentage}%` }}
                                                                    title={`${onboardPercentage.toFixed(0)}% staffed`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-amber-600">{data.vacant}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-red-600">{data.resigned}</td>
                                                    <td className="px-6 py-4 text-center text-slate-700">{data.budgeted2627}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                         ) : (
                            <DepartmentBarChart summary={departmentSummary} onNavigate={onNavigate} />
                         )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Recruitment Funnel</CardTitle>
                        <CardDescription>Current candidate pipeline status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recruitmentFunnelData.map((stage) => (
                                <button
                                    key={stage.name}
                                    onClick={() => onNavigate(stage.stepId)}
                                    className="block w-full text-left p-3 rounded-lg hover:bg-slate-100 transition-colors"
                                    aria-label={`Navigate to ${stage.name}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-slate-700">{stage.name}</span>
                                        <span className="text-sm font-bold text-slate-800">{stage.count}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${stage.percentage}%` }}></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Position Status</CardTitle>
                        <CardDescription>A summary of all budgeted positions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DonutChart data={positionStatusData} onNavigate={() => onNavigate(2)} />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Requisition Status</CardTitle>
                        <CardDescription>Breakdown of active requisitions in the approval process.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {requisitionStatusData.length > 0 ? (
                            <DonutChart data={requisitionStatusData} onNavigate={() => onNavigate(4)} />
                        ) : (
                            <p className="text-center text-slate-500 py-8">No active requisitions.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;