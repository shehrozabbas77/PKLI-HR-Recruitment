import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import type { Candidate } from '../types';

interface AlertItem {
  id: number;
  employee: string;
  department: string;
  section: string;
  position: string;
  type: 'License Expiry' | 'CNIC Expiry';
  expiryDate: string;
  daysRemaining: number;
  status: 'Pending Update' | 'Updated';
}

const generateMockAlerts = (candidates: Candidate[]): AlertItem[] => {
    if (candidates.length === 0) {
        return [
            { id: 1, employee: 'Dr. Aisha Khan (Sample)', department: 'Medical Services', section: 'Pediatrics', position: 'Consultant', type: 'License Expiry', expiryDate: '2025-12-31', daysRemaining: 25, status: 'Pending Update' },
            { id: 2, employee: 'Ali Raza (Sample)', department: 'ICT', section: 'Software Development', position: 'Software Engineer', type: 'CNIC Expiry', expiryDate: '2026-01-15', daysRemaining: 40, status: 'Pending Update' },
        ];
    }
    return candidates.map((c, i) => ({
        id: c.id,
        employee: c.name,
        department: c.department,
        section: c.section,
        position: c.positionAppliedFor,
        type: i % 2 === 0 ? 'License Expiry' : 'CNIC Expiry',
        expiryDate: `2026-0${i+1}-15`,
        daysRemaining: 30 * (i+1),
        status: 'Pending Update'
    }));
};


interface PostOnboardingProps {
    candidates: Candidate[];
}

const PostOnboarding: React.FC<PostOnboardingProps> = ({ candidates }) => {
    const mockAlerts = generateMockAlerts(candidates);
    const expiredAlert: AlertItem = { id: 99, employee: 'Fatima Ali (Sample)', department: 'Administration', section: 'Housekeeping', position: 'Support Staff', type: 'License Expiry', expiryDate: '2025-11-20', daysRemaining: -6, status: 'Pending Update' };
    const allAlerts = [...mockAlerts, expiredAlert];

    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [positionFilter, setPositionFilter] = useState('All');

    const departments = useMemo(() => ['All', ...Array.from(new Set(allAlerts.map(a => a.department)))], [allAlerts]);
    const sections = useMemo(() => {
        if (departmentFilter === 'All') return ['All'];
        return ['All', ...Array.from(new Set(allAlerts.filter(a => a.department === departmentFilter).map(a => a.section)))];
    }, [allAlerts, departmentFilter]);
    const positions = useMemo(() => ['All', ...Array.from(new Set(allAlerts.map(a => a.position)))], [allAlerts]);

    const filteredAlerts = useMemo(() => {
        return allAlerts.filter(alert => 
            (departmentFilter === 'All' || alert.department === departmentFilter) &&
            (sectionFilter === 'All' || alert.section === sectionFilter) &&
            (positionFilter === 'All' || alert.position === positionFilter)
        );
    }, [allAlerts, departmentFilter, sectionFilter, positionFilter]);

    return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post-Onboarding Alerts</CardTitle>
          <CardDescription>Monitor license and document expiry for all staff.</CardDescription>
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
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto">
              <table className="w-full text-base text-left text-gray-600">
                <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Employee</th>
                    <th scope="col" className="px-6 py-3">Alert Type</th>
                    <th scope="col" className="px-6 py-3">Expiry Date</th>
                    <th scope="col" className="px-6 py-3">Days Remaining</th>
                    <th scope="col" className="px-6 py-3">Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((item) => (
                    <tr key={item.id} className={`border-b ${item.daysRemaining < 0 ? 'bg-red-50' : item.daysRemaining < 30 ? 'bg-yellow-50' : 'bg-white'}`}>
                      <td className="px-6 py-4 font-semibold">{item.employee}</td>
                      <td className="px-6 py-4">{item.type}</td>
                      <td className="px-6 py-4">{item.expiryDate}</td>
                      <td className={`px-6 py-4 font-bold ${item.daysRemaining < 0 ? 'text-red-600' : item.daysRemaining < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {item.daysRemaining > 0 ? `${item.daysRemaining} days` : `Expired ${Math.abs(item.daysRemaining)} days ago`}
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Alerts for Non-Updated Documents</CardTitle>
          <CardDescription>If a document is not updated post-expiry, the following actions are triggered.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-100 rounded-md border border-red-200">
                    <div>
                        <p className="font-semibold text-red-800">Privileges Hold</p>
                        <p className="text-base text-red-700">Employee: {expiredAlert.employee}</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">Action Triggered</span>
                </div>
                 <div className="flex justify-between items-center p-3 bg-red-100 rounded-md border border-red-200">
                    <div>
                        <p className="font-semibold text-red-800">Area Restriction</p>
                        <p className="text-base text-red-700">Employee: {expiredAlert.employee}</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">Action Triggered</span>
                </div>
                 <div className="flex justify-between items-center p-3 bg-red-100 rounded-md border border-red-200">
                    <div>
                        <p className="font-semibold text-red-800">Salary Hold</p>
                        <p className="text-base text-red-700">Employee: {expiredAlert.employee}</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">Action Triggered</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostOnboarding;