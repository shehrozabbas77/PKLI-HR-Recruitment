

import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import type { StaffingPosition } from '../types';
import { PositionStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Modal } from '../components/Modal';
import { UploadIcon, EditIcon, BriefcaseIcon, UsersIcon, UserMinusIcon, FilePlusIcon, UserMinusIcon as ResignedIcon } from '../components/icons';

interface StaffingPlanProps {
  positions: StaffingPosition[];
  setPositions: React.Dispatch<React.SetStateAction<StaffingPosition[]>>;
  initialDepartment: string;
}

const statusColorMap: { [key in PositionStatus]: string } = {
  [PositionStatus.Normal]: 'bg-white',
  [PositionStatus.Abolished]: 'bg-[#fde8e9] text-[#c01823]',
  [PositionStatus.Created]: 'bg-green-50 text-green-800',
  [PositionStatus.NewAddition]: 'bg-yellow-50 text-yellow-800',
  [PositionStatus.Resigned]: 'bg-[#fde8e9] text-[#c01823]',
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <div className="text-left w-full">
        <Card className="h-full">
            <CardContent className="flex items-center p-4">
                <div className="p-3 rounded-full bg-[#e0f2fe] text-[#0076b6] mr-4">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                </div>
            </CardContent>
        </Card>
    </div>
);

const StaffingPlan: React.FC<StaffingPlanProps> = ({ positions, setPositions, initialDepartment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>(initialDepartment);
  const [sectionFilter, setSectionFilter] = useState<string>('All Sections');
  const [designationFilter, setDesignationFilter] = useState<string>('All Posts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<StaffingPosition | null>(null);

  const allDepartments = useMemo(() => {
    const departments = new Set(positions.map(p => p.department));
    return ['All Departments', ...Array.from(departments)];
  }, [positions]);

  const allSections = useMemo(() => {
    if (departmentFilter === 'All Departments') {
        return ['All Sections'];
    }
    const sections = new Set(positions.filter(p => p.department === departmentFilter).map(p => p.section));
    return ['All Sections', ...Array.from(sections)];
  }, [positions, departmentFilter]);

  const allDesignations = useMemo(() => {
    let relevantPositions = positions;
    if (departmentFilter !== 'All Departments') {
      relevantPositions = relevantPositions.filter(p => p.department === departmentFilter);
    }
    if (sectionFilter !== 'All Sections') {
      relevantPositions = relevantPositions.filter(p => p.section === sectionFilter);
    }
    const designations = new Set(relevantPositions.map(p => p.designation));
    return ['All Posts', ...Array.from(designations)];
  }, [positions, departmentFilter, sectionFilter]);
  
  useEffect(() => {
    setSectionFilter('All Sections');
  }, [departmentFilter]);

  useEffect(() => {
    setDesignationFilter('All Posts');
  }, [sectionFilter]);

  const initialFormState = {
    designation: '',
    section: '',
    minSalary: '',
    maxSalary: '',
    positions2526: 1,
    onBoard: 0,
    positions2627: 1,
    remarks: '',
    status: PositionStatus.Normal,
  };
  
  const [newPositionData, setNewPositionData] = useState(initialFormState);

  const weightedAvgSalary = useMemo(() => {
    const min = parseFloat(newPositionData.minSalary) || 0;
    const max = parseFloat(newPositionData.maxSalary) || 0;
    return (min * 0.75) + (max * 0.25);
  }, [newPositionData.minSalary, newPositionData.maxSalary]);

  const vacant = useMemo(() => {
    return Number(newPositionData.positions2526) - Number(newPositionData.onBoard);
  }, [newPositionData.positions2526, newPositionData.onBoard]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ['positions2526', 'onBoard', 'positions2627'].includes(name);
    if (isNumber) {
        setNewPositionData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
        setNewPositionData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const minSalary = parseFloat(newPositionData.minSalary) || 0;
    const maxSalary = parseFloat(newPositionData.maxSalary) || 0;

    if (vacant < 0) {
        alert('Onboard count cannot exceed budgeted positions for the year.');
        return;
    }
     if (minSalary > maxSalary) {
        alert('Minimum salary cannot be greater than maximum salary.');
        return;
    }

    const newPosition: StaffingPosition = {
        id: positions.length > 0 ? Math.max(...positions.map(p => p.id)) + 1 : 1,
        department: departmentFilter,
        ...newPositionData,
        minSalary,
        maxSalary,
        weightedAvgSalary: weightedAvgSalary,
        vacant: vacant,
        date: newPositionData.status !== PositionStatus.Normal ? new Date().toISOString().split('T')[0] : undefined,
    };
    
    setPositions(prev => [...prev, newPosition]);
    setIsModalOpen(false);
    setNewPositionData(initialFormState);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            alert("Failed to read file data.");
            return;
          }
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          setPositions(prevPositions => {
            const maxId = prevPositions.length > 0 ? Math.max(...prevPositions.map(p => p.id)) : 0;

            const newPositions: StaffingPosition[] = json.map((row, index) => {
                const minSalary = Number(row['Min Salary'] || row['minSalary'] || 0);
                const maxSalary = Number(row['Max Salary'] || row['maxSalary'] || 0);
                const positions2526 = Number(row['Positions 25-26'] || row['positions2526'] || 0);
                const onBoard = Number(row['On Board'] || row['onBoard'] || 0);
                
                const weightedAvgSalary = (minSalary * 0.75) + (maxSalary * 0.25);
                const vacant = positions2526 - onBoard;

                const statusString = row['Status'] || row['status'] || PositionStatus.Normal;
                const status = Object.values(PositionStatus).includes(statusString as PositionStatus) 
                ? statusString as PositionStatus 
                : PositionStatus.Normal;

                return {
                    id: maxId + index + 1,
                    department: row['Department'] || row['department'] || '',
                    section: row['Section'] || row['section'] || '',
                    designation: row['Designation'] || row['designation'] || '',
                    minSalary,
                    maxSalary,
                    weightedAvgSalary,
                    positions2526,
                    onBoard,
                    vacant,
                    positions2627: Number(row['Positions 26-27'] || row['positions2627'] || 0),
                    remarks: row['Remarks'] || row['remarks'] || '',
                    status,
                    date: (status !== PositionStatus.Normal && (row['Date'] || row['date'])) ? new Date(row['Date'] || row['date']).toISOString().split('T')[0] : undefined,
                };
            }).filter(p => p.designation && p.department);

            if (newPositions.length > 0) {
              alert(`${newPositions.length} positions have been successfully uploaded and added to the plan.`);
              return [...prevPositions, ...newPositions];
            } else {
              alert("No valid positions found in the uploaded file. Please check the file format and column headers (e.g., 'Designation', 'Min Salary').");
              return prevPositions;
            }
          });

        } catch (error) {
          console.error("Error parsing file:", error);
          alert("There was an error parsing the file. Please ensure it is a valid .xlsx or .csv file with correct headers.");
        }
      };
      
      reader.readAsBinaryString(file);

      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditClick = (position: StaffingPosition) => {
    setEditingPosition({ ...position });
    setIsEditModalOpen(true);
  };

  const handleUpdatePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosition) return;

    if (editingPosition.vacant < 0) {
        alert('Onboard count cannot exceed budgeted positions for the year.');
        return;
    }
    if (editingPosition.minSalary > editingPosition.maxSalary) {
        alert('Minimum salary cannot be greater than maximum salary.');
        return;
    }

    const originalPosition = positions.find(p => p.id === editingPosition.id);
    const statusChanged = originalPosition?.status !== editingPosition.status;
    const date = (editingPosition.status !== PositionStatus.Normal && statusChanged) 
        ? new Date().toISOString().split('T')[0] 
        : originalPosition?.date;

    setPositions(prev => prev.map(p => p.id === editingPosition.id ? {...editingPosition, date} : p));
    setIsEditModalOpen(false);
    setEditingPosition(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingPosition) return;
    const { name, value } = e.target;
    const isNumber = ['positions2526', 'onBoard', 'positions2627', 'minSalary', 'maxSalary'].includes(name);
    
    const updatedData = {
        ...editingPosition,
        [name]: isNumber ? Number(value) || 0 : value
    };

    if (['minSalary', 'maxSalary'].includes(name)) {
        const min = name === 'minSalary' ? Number(value) : updatedData.minSalary;
        const max = name === 'maxSalary' ? Number(value) : updatedData.maxSalary;
        updatedData.weightedAvgSalary = (min * 0.75) + (max * 0.25);
    }

    if (['positions2526', 'onBoard'].includes(name)) {
        const pos2526 = name === 'positions2526' ? Number(value) : updatedData.positions2526;
        const onBoard = name === 'onBoard' ? Number(value) : updatedData.onBoard;
        updatedData.vacant = pos2526 - onBoard;
    }

    setEditingPosition(updatedData);
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const filteredPositions = useMemo(() => {
    return positions.filter(p => {
        const departmentMatch = departmentFilter === 'All Departments' || p.department === departmentFilter;
        const sectionMatch = sectionFilter === 'All Sections' || p.section === sectionFilter;
        const designationMatch = designationFilter === 'All Posts' || p.designation === designationFilter;
        return departmentMatch && sectionMatch && designationMatch;
    });
  }, [positions, departmentFilter, sectionFilter, designationFilter]);

  const summaryData = useMemo(() => {
      const total2526 = filteredPositions.reduce((sum, pos) => sum + pos.positions2526, 0);
      const totalOnboard = filteredPositions.reduce((sum, pos) => sum + pos.onBoard, 0);
      const totalVacant = filteredPositions.reduce((sum, pos) => sum + pos.vacant, 0);
      const total2627 = filteredPositions.reduce((sum, pos) => sum + pos.positions2627, 0);
      const totalResigned = filteredPositions.filter(p => p.status === PositionStatus.Resigned).length;
      const totalNew = filteredPositions.filter(p => p.status === PositionStatus.NewAddition).length;

      return { total2526, totalOnboard, totalVacant, total2627, totalResigned, totalNew };
    }, [filteredPositions]);


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="max-w-xl">
              <CardTitle>Staffing Plan / HR Budgeting</CardTitle>
              <CardDescription>
                Select a department to view its budgeted positions. This view reflects budgeted, vacant, onboard, and requested positions.
              </CardDescription>
            </div>
            <div className="flex flex-col space-y-2 shrink-0 ml-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-[#0076b6] text-white rounded-lg hover:bg-[#005a8c] text-base font-semibold shadow-sm hover:shadow-md transition-all whitespace-nowrap transform hover:-translate-y-px"
                >
                  Add New Position
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                />
                <button
                  onClick={handleUploadClick}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-base font-semibold transition-all whitespace-nowrap flex items-center justify-center shadow-sm hover:shadow-md transform hover:-translate-y-px"
                >
                  <UploadIcon className="w-5 h-5 mr-2" />
                  Upload File
                </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div>
              <h4 className="text-base font-semibold text-slate-800 mb-3">Summary for Filtered View</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard icon={<BriefcaseIcon className="w-6 h-6" />} title="Budgeted (25-26)" value={summaryData.total2526.toString()} />
                  <StatCard icon={<UsersIcon className="w-6 h-6" />} title="Onboard" value={summaryData.totalOnboard.toString()} />
                  <StatCard icon={<UserMinusIcon className="w-6 h-6" />} title="Vacant" value={summaryData.totalVacant.toString()} />
                  <StatCard icon={<BriefcaseIcon className="w-6 h-6" />} title="Budgeted (26-27)" value={summaryData.total2627.toString()} />
                  <StatCard icon={<ResignedIcon className="w-6 h-6" />} title="Resignations" value={summaryData.totalResigned.toString()} />
                  <StatCard icon={<FilePlusIcon className="w-6 h-6" />} title="New Additions" value={summaryData.totalNew.toString()} />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-end gap-6">
                <div>
                  <label htmlFor="department-filter" className="text-sm font-medium text-slate-600">Department</label>
                  <div className="relative mt-1">
                    <select
                      id="department-filter"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                    >
                      {allDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="section-filter" className="text-sm font-medium text-slate-600">Section</label>
                  <div className="relative mt-1">
                    <select
                      id="section-filter"
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value)}
                      disabled={departmentFilter === 'All Departments'}
                      className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      {allSections.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="designation-filter" className="text-sm font-medium text-slate-600">Post</label>
                  <div className="relative mt-1">
                    <select
                      id="designation-filter"
                      value={designationFilter}
                      onChange={(e) => setDesignationFilter(e.target.value)}
                      className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base"
                    >
                      {allDesignations.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-base text-left text-slate-600">
              <thead className="text-sm font-semibold text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4">Sr. #</th>
                  <th scope="col" className="px-6 py-4">Designation</th>
                  <th scope="col" className="px-6 py-4 text-right">Min Salary</th>
                  <th scope="col" className="px-6 py-4 text-right">Max Salary</th>
                  <th scope="col" className="px-6 py-4 text-right">Avg Salary</th>
                  <th scope="col" className="px-6 py-4 text-center">Yr 25-26</th>
                  <th scope="col" className="px-6 py-4 text-center">Onboard</th>
                  <th scope="col" className="px-6 py-4 text-center">Vacant</th>
                  <th scope="col" className="px-6 py-4 text-center">Yr 26-27</th>
                  <th scope="col" className="px-6 py-4">Status/Remarks</th>
                  <th scope="col" className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPositions.map((pos, index) => (
                  <tr key={pos.id} className={`hover:bg-slate-50 ${statusColorMap[pos.status]}`}>
                    <td className="px-6 py-4 font-medium text-slate-900 text-center">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold">{pos.designation}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(pos.minSalary)}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(pos.maxSalary)}</td>
                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(pos.weightedAvgSalary)}</td>
                    <td className="px-6 py-4 text-center">{pos.positions2526}</td>
                    <td className="px-6 py-4 text-center text-[#0076b6] font-bold">{pos.onBoard}</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600">{pos.vacant}</td>
                    <td className="px-6 py-4 text-center">{pos.positions2627}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>{pos.remarks}</div>
                      {pos.date && <div className="text-xs italic">{pos.status} on {pos.date}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button onClick={() => handleEditClick(pos)} className="p-2 text-slate-500 hover:text-[#0076b6] transition-colors rounded-full hover:bg-[#e0f2fe]">
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add Position to ${departmentFilter} Department`}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="designation" className="block text-sm font-medium text-slate-700">Designation</label>
                    <input type="text" name="designation" id="designation" value={newPositionData.designation} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>

                <div>
                    <label htmlFor="minSalary" className="block text-sm font-medium text-slate-700">Min Salary</label>
                    <input type="text" name="minSalary" id="minSalary" value={newPositionData.minSalary} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>
                <div>
                    <label htmlFor="maxSalary" className="block text-sm font-medium text-slate-700">Max Salary</label>
                    <input type="text" name="maxSalary" id="maxSalary" value={newPositionData.maxSalary} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>

                <div className="md:col-span-2 bg-slate-50 p-2 rounded-md text-center border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700">Weighted Average Salary</label>
                    <p className="text-lg font-semibold text-slate-800">{formatCurrency(weightedAvgSalary)}</p>
                </div>
                
                <div>
                    <label htmlFor="positions2526" className="block text-sm font-medium text-slate-700">Position Yr 25-26</label>
                    <input type="number" name="positions2526" id="positions2526" min="0" value={newPositionData.positions2526} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>
                <div>
                    <label htmlFor="onBoard" className="block text-sm font-medium text-slate-700">OnBoard</label>
                    <input type="number" name="onBoard" id="onBoard" min="0" value={newPositionData.onBoard} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border text-center ${vacant < 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <p className="text-sm font-medium text-amber-800">Vacant</p>
                        <p className={`text-2xl font-bold ${vacant < 0 ? 'text-red-900' : 'text-amber-900'}`}>{vacant}</p>
                    </div>
                     <div>
                        <label htmlFor="positions2627" className="block text-sm font-medium text-slate-700">Position Yr 26-27</label>
                        <input type="number" name="positions2627" id="positions2627" min="0" value={newPositionData.positions2627} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                    </div>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                    <select name="status" id="status" value={newPositionData.status} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-slate-300 pl-3 pr-10 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base">
                        {Object.values(PositionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="remarks" className="block text-sm font-medium text-slate-700">Status/Remarks</label>
                    <textarea name="remarks" id="remarks" value={newPositionData.remarks} onChange={handleInputChange} rows={2} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base"></textarea>
                </div>
            </div>

            <div className="flex justify-end pt-4 space-x-3 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 text-base font-semibold">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0076b6] text-white rounded-lg hover:bg-[#005a8c] text-base font-semibold"
                >
                    Save Position
                </button>
            </div>
        </form>
      </Modal>

      {editingPosition && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Position: ${editingPosition.designation}`}>
          <form onSubmit={handleUpdatePosition} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Designation</label>
                    <input type="text" name="designation" value={editingPosition.designation} onChange={handleEditInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Min Salary</label>
                    <input type="number" name="minSalary" value={editingPosition.minSalary} onChange={handleEditInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Max Salary</label>
                    <input type="number" name="maxSalary" value={editingPosition.maxSalary} onChange={handleEditInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>

                <div className="md:col-span-2 bg-slate-50 p-2 rounded-md text-center border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700">Weighted Average Salary</label>
                    <p className="text-lg font-semibold text-slate-800">{formatCurrency(editingPosition.weightedAvgSalary)}</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700">Position Yr 25-26</label>
                    <input type="number" name="positions2526" min="0" value={editingPosition.positions2526} onChange={handleEditInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">OnBoard</label>
                    <input type="number" name="onBoard" min="0" value={editingPosition.onBoard} onChange={handleEditInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border text-center ${editingPosition.vacant < 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <p className="text-sm font-medium text-amber-800">Vacant</p>
                        <p className={`text-2xl font-bold ${editingPosition.vacant < 0 ? 'text-red-900' : 'text-amber-900'}`}>{editingPosition.vacant}</p>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Position Yr 26-27</label>
                        <input type="number" name="positions2627" min="0" value={editingPosition.positions2627} onChange={handleEditInputChange} required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base" />
                    </div>
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Status</label>
                    <select name="status" value={editingPosition.status} onChange={handleEditInputChange} className="mt-1 block w-full rounded-md border border-slate-300 pl-3 pr-10 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base">
                        {Object.values(PositionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Status/Remarks</label>
                    <textarea name="remarks" value={editingPosition.remarks} onChange={handleEditInputChange} rows={2} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-[#0076b6] focus:ring-[#0076b6] text-base"></textarea>
                </div>
            </div>

            <div className="flex justify-end pt-4 space-x-3 border-t mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 text-base font-semibold">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0076b6] text-white rounded-lg hover:bg-[#005a8c] text-base font-semibold">
                    Save Changes
                </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default StaffingPlan;