import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Modal } from '../components/Modal';
import type { Requisition, JobAdvertisement, AdvertisedPositionInfo, Candidate } from '../types';
import { XIcon, PrinterIcon, UsersIcon, CheckIcon } from '../components/icons';

interface JobAdvertisementProps {
    requisitions: Requisition[];
    advertisements: JobAdvertisement[];
    setAdvertisements: React.Dispatch<React.SetStateAction<JobAdvertisement[]>>;
    candidates: Candidate[];
}

const DEFAULT_AD_NOTES = [
    'Only ONLINE applications will be entertained.',
    'Employees from Government Institutes must send their application along with fresh NOC, issued by the concerned department.',
    'Applications after the due date will not be entertained.',
    'The age limit is 18 to 62 Years, except staff nurses.',
    'The age limit for Staff Nurses is 18 to 50 Years.',
    'The applicants who have applied earlier need to apply again.',
    'The candidates who do not fulfil the required eligibility criteria can be cancelled at any stage during the process of selection or subsequently.',
    'PKLI&RC is an \'Equal Opportunity Employer\'.',
];

const groupPositions = (positions: AdvertisedPositionInfo[]) => {
    // Helper to map departments to the main categories from the image
    const getDisplayCategory = (department: string) => {
        if (department === 'Medical Services') return 'MEDICAL SERVICES';
        return 'NON-CLINICAL STAFF';
    };

    const groupedByCategory = positions.reduce((acc, pos) => {
        // Special case for Nursing
        const category = pos.section.toLowerCase().includes('nurs') ? 'NURSING' : getDisplayCategory(pos.department);
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(pos);
        return acc;
    }, {} as Record<string, AdvertisedPositionInfo[]>);

    // Now group by section within each category
    const groupedBySection: Record<string, Record<string, AdvertisedPositionInfo[]>> = {};
    for (const category in groupedByCategory) {
        groupedBySection[category] = groupedByCategory[category].reduce((acc, pos) => {
            const section = pos.section;
            if (!acc[section]) {
                acc[section] = [];
            }
            acc[section].push(pos);
            return acc;
        }, {} as Record<string, AdvertisedPositionInfo[]>);
    }
    return groupedBySection;
};


const AdvertisementPreview: React.FC<{ ad: JobAdvertisement; onPositionClick: (positionTitle: string) => void; }> = ({ ad, onPositionClick }) => {
    const grouped = groupPositions(ad.positions);

    return (
        <div className="border-2 border-black p-4 bg-white">
            <header className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <img src="https://pkli.org.pk/wp-content/uploads/2020/09/cropped-Insignia_512_512.png" alt="PKLI Logo" className="h-20 w-auto"/>
                    <h1 className="text-2xl font-bold text-green-800 text-center">
                        PAKISTAN KIDNEY AND LIVER INSTITUTE AND RESEARCH CENTER
                    </h1>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Coat_of_arms_of_Punjab.svg" alt="Punjab Logo" className="h-20 w-auto" />
                </div>
                <div className="border-2 border-black p-2 text-center text-sm">
                    <p>Pakistan Kidney and Liver Institute and Research Center (PKLI & RC) is working as a body corporate through Pakistan Kidney and Liver Institute and Research Center Act 2019 (the Act) passed by the Provincial Assembly of Punjab. PKLI & RC is overseen by an independent Board of Governors constituted through the said Act.</p>
                </div>
                 <p className="font-semibold mt-2">We are pleased to offer following positions for qualified candidates:</p>
            </header>

            <main>
                {Object.entries(grouped).map(([category, sections]) => (
                    <div key={category} className="mb-4">
                        <h2 className="bg-[#0076b6] text-white text-center p-2 font-bold text-xl uppercase">{category}</h2>
                        {Object.entries(sections).map(([section, positions]) => (
                             <div key={section}>
                                 <h3 className="bg-[#ffd966] text-black text-center p-1 font-bold">{section}</h3>
                                 <table className="w-full border-collapse border-2 border-black">
                                     <thead className="bg-[#0076b6] text-white">
                                         <tr>
                                             <th className="border-2 border-black p-2 text-left">Sr. #</th>
                                             <th className="border-2 border-black p-2 text-left">Designation</th>
                                             <th className="border-2 border-black p-2 text-left">No. of Posts</th>
                                             <th className="border-2 border-black p-2 text-left">Qualification</th>
                                             <th className="border-2 border-black p-2 text-left">Experience</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {positions.map((pos, index) => (
                                             <tr key={pos.reqId} className="bg-[#e0f2fe]">
                                                 <td className="border-2 border-black p-2">{index + 1}</td>
                                                 <td className="border-2 border-black p-2">
                                                    <button onClick={() => onPositionClick(pos.position)} className="font-semibold text-blue-600 hover:underline">
                                                        {pos.position}
                                                    </button>
                                                 </td>
                                                 <td className="border-2 border-black p-2">{pos.numberOfPositions}</td>
                                                 <td className="border-2 border-black p-2">{pos.qualification}</td>
                                                 <td className="border-2 border-black p-2">{pos.experience}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        ))}
                    </div>
                ))}
            </main>
            
            <footer className="mt-4 text-sm">
                 <ul className="space-y-1 list-disc list-inside">
                    {ad.notes.map((note, i) => <li key={i}>{note}</li>)}
                    <li>Deposit an application processing fee of <strong>Rs. {ad.applicationFeeDoctors.toLocaleString()}/-</strong> (non-refundable) against each post for doctors and <strong>Rs. {ad.applicationFeeOthers.toLocaleString()}/-</strong> for other positions through bank deposit slip at Bank of Punjab, Account No. [ACCOUNT_NUMBER] OR deposit the same amount</li>
                    <li>Upload screenshot of online transaction or picture of bank slip while applying for an online position.</li>
                    <li>The last date to apply is <strong>{new Date(ad.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</li>
                </ul>
                <div className="mt-4 font-semibold text-center">
                    <p>Human Resource Department Pakistan Kidney and Liver Institute and Research Centre (PKLI & RC)</p>
                    <p>One PKLI Avenue, Opposite DHA Phase VI, Lahore, Pakistan. Phone: 042-111 117 554, Website: www.pkli.org.pk</p>
                </div>
            </footer>
        </div>
    );
};

const NewspaperAdPreview: React.FC<{ ad: JobAdvertisement }> = ({ ad }) => {
    // This grouping is an interpretation of the ad's structure to fit the available data.
    const grouped = ad.positions.reduce((acc, pos) => {
        let majorCategory: string;
        let subCategory: string;

        if (pos.department === 'Medical Services') {
            majorCategory = pos.section === 'Nursing' ? 'DIRECTORATE (HQ)' : 'FILTER CLINICS';
            subCategory = pos.section === 'Nursing' ? 'CLINICAL STAFF - NURSING' : 'CLINICAL STAFF';
        } else {
            majorCategory = 'NON-CLINICAL STAFF';
            subCategory = pos.department;
        }

        if (!acc[majorCategory]) acc[majorCategory] = {};
        if (!acc[majorCategory][subCategory]) acc[majorCategory][subCategory] = [];
        acc[majorCategory][subCategory].push(pos);

        return acc;
    }, {} as Record<string, Record<string, AdvertisedPositionInfo[]>>);

    const allTermsFromImage = [
        "Competitive salaries will be offered.",
        "Candidates must upload all required documents (Qualification, Experience, Certificates, Valid License & NOC (if applicable) on the application portal.",
        "Incomplete application will not be considered.",
        "Shortlisted candidates must bring all original & 1 set of copies at the time of interview.",
        "Only shortlisted candidates will be contacted. No TA/DA will be admissible for the interview.",
        "PKLI&RC has the right to revoke/increase/decrease the number of positions at any time based on its need.",
        "Candidates who do not meet the selection criteria, need not to apply.",
        "Apply online job portal at: https://jobs.pkli.org.pk:440/",
        "Only ONLINE applications will be entertained.",
        "Employees from Government Institutes and Internal candidate must attach their application along with fresh NOC, issued by the concerned department.",
        "Applications after the due date will not be entertained.",
        "The applicants who have applied earlier need to apply again.",
        "The candidates who do not fulfil the required eligibility criteria can be cancelled at any stage during the process of selection or subsequently.",
        "Education, experience and age will be calculated on the closing date of the advertisement.",
        "Age limit to apply, for other positions applicant must be 18-62 years old.",
        "Details of the above-mentioned positions are available on https://pkli.org.pk/careers/",
        `Deposit an application processing fee of Rs.${ad.applicationFeeDoctors.toLocaleString()}/- (non-refundable) for doctors and Rs.${ad.applicationFeeOthers.toLocaleString()}/- (non-refundable) for other positions (excluding “Staff Nurse” position), against each respective post through bank deposit slip at Bank of Punjab, Account No. 6580008550400038 OR deposit the same amount in ONLINE account PK09BPUN6580008550400038 under account title Pakistan Kidney and Liver Institute and Research Center (HPTP-1).`,
        "Note: The application fee is paid through “Raast online transfer app” temporarily, are not acceptable.",
        "Upload screenshot of online transaction or picture of bank slip while applying for an online position.",
        "PKLI&RC is an ‘Equal Opportunity Employer’.",
        `The last date to apply is ${new Date(ad.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`
    ];

    const half = Math.ceil(allTermsFromImage.length / 2);
    const termsCol1 = allTermsFromImage.slice(0, half);
    const termsCol2 = allTermsFromImage.slice(half);

    return (
        <div className="font-sans text-black bg-white p-2 border-2 border-black text-[9px] leading-snug">
            <h1 className="text-center font-extrabold text-3xl tracking-wider my-2">CAREER OPPORTUNITIES</h1>
            <p className="text-[8px] leading-tight mb-2">
                Pakistan kidney and Liver Institute and Research Center (PKLI&RC) is working as a body corporate through Pakistan Kidney and Liver Institute and Research Center Act 2019 (the Act) passed by the Provincial Assembly of Punjab. PKLI&RC is overseen by an independent Board of Governors constituted through the said Act.
                <br/>
                We are pleased to offer following positions for qualified candidates (The number of positions is mentioned in brackets):
            </p>

            <div className="space-y-2">
                {grouped['FILTER CLINICS'] && (
                    <>
                        <div className="bg-gray-600 text-white text-center font-bold p-1 text-[10px]">PKLI FILTER CLINICS</div>
                         <div className="grid grid-cols-2 gap-x-2">
                             <div>
                                <div className="bg-gray-300 text-black text-center font-bold p-1">CLINICAL STAFF</div>
                                <div className="p-1">
                                    {/* FIX: Cast the result of Object.entries to the correct tuple array type to resolve 'map' does not exist on 'unknown' error. */}
                                    {(Object.entries(grouped['FILTER CLINICS']) as [string, AdvertisedPositionInfo[]][]).map(([section, positions]) => (
                                         <div key={section}>
                                            <p className="font-bold my-1">{section}</p>
                                            <ul className="list-disc list-inside pl-2">
                                                {positions.map(p => <li key={p.reqId}>{p.position} ({String(p.numberOfPositions).padStart(2, '0')})</li>)}
                                            </ul>
                                         </div>
                                    ))}
                                </div>
                            </div>
                         </div>
                    </>
                )}

                {grouped['DIRECTORATE (HQ)'] && (
                    <>
                         <div className="bg-gray-600 text-white text-center font-bold p-1 text-[10px]">PKLI FILTER CLINICS DIRECTORATE (HEAD QUARTER, LAHORE)</div>
                         <div className="bg-gray-300 text-black font-bold p-1 flex items-baseline space-x-4">
                             <span className="self-center">CLINICAL STAFF</span>
                             {/* FIX: Cast the result of Object.entries to the correct tuple array type to resolve 'map' does not exist on 'unknown' error. */}
                             {(Object.entries(grouped['DIRECTORATE (HQ)']) as [string, AdvertisedPositionInfo[]][]).map(([section, positions]) => (
                                 <div key={section} className="flex items-baseline space-x-2">
                                     <span>{section.replace('CLINICAL STAFF - ','')}</span>
                                     <ul className="list-disc list-inside font-normal">
                                        {positions.map(p => <li key={p.reqId}>{p.position} ({String(p.numberOfPositions).padStart(2, '0')})</li>)}
                                    </ul>
                                 </div>
                             ))}
                         </div>
                    </>
                )}

                {grouped['NON-CLINICAL STAFF'] && (
                    <>
                        <div className="bg-gray-600 text-white text-center font-bold p-1 text-[10px]">NON-CLINICAL STAFF</div>
                        <div className="grid grid-cols-3 gap-x-2 p-1">
                            {/* FIX: Cast the result of Object.entries to the correct tuple array type to resolve 'map' does not exist on 'unknown' error. */}
                            {(Object.entries(grouped['NON-CLINICAL STAFF']) as [string, AdvertisedPositionInfo[]][]).map(([dept, positions]) => (
                                <div key={dept}>
                                    <p className="font-bold">{dept}</p>
                                    <ul className="list-disc list-inside pl-2">
                                        {positions.map(p => <li key={p.reqId}>{p.position} ({String(p.numberOfPositions).padStart(2, '0')})</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            
            <div className="mt-2 pt-1 border-t-2 border-black">
                <h2 className="font-bold text-[10px]">TERMS & CONDITIONS:</h2>
                <div className="grid grid-cols-2 gap-x-4 text-[8px] leading-tight">
                    <ul className="list-disc list-inside space-y-0.5">
                        {termsCol1.map((term, i) => <li key={`t1-${i}`}>{term}</li>)}
                    </ul>
                    <ul className="list-disc list-inside space-y-0.5">
                         {termsCol2.map((term, i) => <li key={`t2-${i}`}>{term}</li>)}
                    </ul>
                </div>
            </div>

            <div className="mt-2 pt-1 border-t-4 border-black text-center">
                <h2 className="font-bold text-[10px]">Human Resource Department</h2>
                <div className="flex items-center justify-center space-x-2 mt-1">
                    <img src="https://pkli.org.pk/wp-content/uploads/2020/09/cropped-Insignia_512_512.png" alt="PKLI Logo" className="h-10 w-auto"/>
                    <div className="text-[8px] leading-tight">
                        <p className="font-bold">Pakistan Kidney and Liver Institute and Research Center</p>
                        <p>One PKLI Avenue, DHA Phase 6, Lahore, Pakistan.</p>
                        <p className="font-bold">
                           042-111 117 554 ext. 3399 | pklinrc | www.pkli.org.pk
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const JobAdvertisementPage: React.FC<JobAdvertisementProps> = ({ requisitions, advertisements, setAdvertisements, candidates }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] = useState(false);
    
    // State for the new advertisement form
    const [newAdTitle, setNewAdTitle] = useState('');
    const [selectedReqIds, setSelectedReqIds] = useState<number[]>([]);
    const [deadline, setDeadline] = useState('');
    const [newAdInstructions, setNewAdInstructions] = useState<string[]>(DEFAULT_AD_NOTES);
    
    const [timeFilter, setTimeFilter] = useState<'current' | 'past'>('current');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Published'>('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [designationFilter, setDesignationFilter] = useState('All');
    const [viewingApplicantsFor, setViewingApplicantsFor] = useState<string | null>(null);
    const [portalSuccessAd, setPortalSuccessAd] = useState<JobAdvertisement | null>(null);
    
    const [adForNewspaper, setAdForNewspaper] = useState<JobAdvertisement | null>(null);
    const newspaperAdRef = useRef<HTMLDivElement>(null);
    
    const [openAdId, setOpenAdId] = useState<number | null>(null);

    const availableRequisitions = useMemo(() => {
        const advertisedReqIds = new Set(
            advertisements.flatMap(ad => ad.positions.map(p => p.reqId))
        );
        return requisitions.filter(
            req => req.status === 'Approved' && !advertisedReqIds.has(req.id)
        );
    }, [requisitions, advertisements]);

    const allDepartments = useMemo(() => ['All', ...Array.from(new Set(advertisements.flatMap(ad => ad.positions.map(p => p.department))))], [advertisements]);
    const allSections = useMemo(() => {
        if (departmentFilter === 'All') return ['All'];
        const relevantSections = advertisements
            .flatMap(ad => ad.positions)
            .filter(p => p.department === departmentFilter)
            .map(p => p.section);
        return ['All', ...Array.from(new Set(relevantSections))];
    }, [advertisements, departmentFilter]);
    const allDesignations = useMemo(() => {
        const designations = new Set(advertisements.flatMap(ad => ad.positions.map(p => p.position)));
        return ['All', ...Array.from(designations)];
    }, [advertisements]);

    const filteredAdvertisements = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

        return advertisements.filter(ad => {
            const deadlineDate = new Date(ad.deadline);
            const timeMatch = timeFilter === 'current' ? deadlineDate >= today : deadlineDate < today;
            const statusMatch = statusFilter === 'All' || ad.status === statusFilter;
            const departmentMatch = departmentFilter === 'All' || ad.positions.some(p => p.department === departmentFilter);
            const sectionMatch = sectionFilter === 'All' || ad.positions.some(p => p.section === sectionFilter);
            const designationMatch = designationFilter === 'All' || ad.positions.some(p => p.position === designationFilter);
            
            return timeMatch && statusMatch && departmentMatch && sectionMatch && designationMatch;
        });
    }, [advertisements, timeFilter, statusFilter, departmentFilter, sectionFilter, designationFilter]);
    
    const handleToggleAccordion = (id: number) => {
        setOpenAdId(prevId => (prevId === id ? null : id));
    };

    const canSaveDraft = newAdTitle.trim() !== '';
    const canPublish = canSaveDraft && selectedReqIds.length > 0 && deadline;

    const resetAndCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setNewAdTitle('');
        setSelectedReqIds([]);
        setDeadline('');
        setNewAdInstructions(DEFAULT_AD_NOTES);
    };
    
    const handleOpenCreateModal = () => {
        // Reset other fields to ensure a clean slate
        setNewAdTitle('');
        setDeadline('');
        setNewAdInstructions(DEFAULT_AD_NOTES);

        // Pre-select the "Finance Manager" requisition, as shown in the screenshot
        const financeManagerReq = availableRequisitions.find(r => r.position === 'Finance Manager');
        if (financeManagerReq) {
            setSelectedReqIds([financeManagerReq.id]);
        } else {
            setSelectedReqIds([]);
        }
        
        // Open the modal
        setIsCreateModalOpen(true);
    };

    const createAdvertisementObject = (publish: boolean): JobAdvertisement => {
        const selectedPositions: AdvertisedPositionInfo[] = requisitions
            .filter(r => selectedReqIds.includes(r.id))
            .map(r => ({
                reqId: r.id,
                position: r.position,
                qualification: r.qualification,
                experience: r.experience,
                numberOfPositions: r.numberOfPositions,
                department: r.department,
                section: r.section,
            }));

        return {
            id: advertisements.length > 0 ? Math.max(...advertisements.map(ad => ad.id)) + 1 : 1,
            title: newAdTitle,
            status: publish ? 'Published' : 'Draft',
            positions: selectedPositions,
            applicationFeeDoctors: 3000,
            applicationFeeOthers: 1000,
            deadline: deadline,
            notes: newAdInstructions.filter(note => note.trim() !== ''),
            publishedOn: publish ? new Date().toISOString().split('T')[0] : undefined,
        };
    };
    
    const handleConfirmPublish = () => {
        const newAdvertisement = createAdvertisementObject(true);
        setAdvertisements(prev => [...prev, newAdvertisement]);
        setIsConfirmPublishModalOpen(false);
        resetAndCloseCreateModal();
    };

    const handleCreateAdvertisement = (publish: boolean) => {
        if (publish) {
            if (!canPublish) return;
            setIsConfirmPublishModalOpen(true);
        } else {
            if (!canSaveDraft) return;
            const newAdvertisement = createAdvertisementObject(false);
            setAdvertisements(prev => [...prev, newAdvertisement]);
            resetAndCloseCreateModal();
        }
    };
    
    const handleToggleRequisition = (reqId: number) => {
        setSelectedReqIds(prev =>
            prev.includes(reqId)
                ? prev.filter(id => id !== reqId)
                : [...prev, reqId]
        );
    };

    const handlePublishDraft = (adId: number) => {
        setAdvertisements(prevAds => prevAds.map(ad => 
            ad.id === adId 
                ? { ...ad, status: 'Published', publishedOn: new Date().toISOString().split('T')[0] } 
                : ad
        ));
    };

    const handleInstructionChange = (index: number, value: string) => {
        const updatedInstructions = [...newAdInstructions];
        updatedInstructions[index] = value;
        setNewAdInstructions(updatedInstructions);
    };

    const handleAddInstruction = () => {
        setNewAdInstructions([...newAdInstructions, '']);
    };

    const handleRemoveInstruction = (index: number) => {
        setNewAdInstructions(newAdInstructions.filter((_, i) => i !== index));
    };

    const handleSendToPortal = (ad: JobAdvertisement) => {
        setPortalSuccessAd(ad);
    };

    const handlePositionClick = (positionTitle: string) => {
        setViewingApplicantsFor(positionTitle);
    };
    
    const handlePrint = () => {
        const printContent = newspaperAdRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=600');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Print Advertisement</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
                 printWindow.document.write('<style>body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: sans-serif; } @page { size: A4; margin: 20mm; }<\/style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500); // Wait for styles to load
            }
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Job Advertisements</CardTitle>
                            <CardDescription>Draft and publish job advertisements for the PKLI & RC Website.</CardDescription>
                        </div>
                        <button
                            onClick={handleOpenCreateModal}
                            className="px-4 py-2 bg-[#0076b6] text-white rounded-md hover:bg-[#005a8c] text-base font-semibold transition-colors whitespace-nowrap"
                        >
                            Create Advertisement
                        </button>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                        <button
                            onClick={() => setTimeFilter('current')}
                            className={`px-4 py-2 text-base font-semibold rounded-lg transition-colors ${timeFilter === 'current' ? 'bg-[#0076b6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Current Advertisements
                        </button>
                        <button
                            onClick={() => setTimeFilter('past')}
                            className={`px-4 py-2 text-base font-semibold rounded-lg transition-colors ${timeFilter === 'past' ? 'bg-[#0076b6] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Past Advertisements
                        </button>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-end gap-6 flex-wrap">
                            <div>
                                <label htmlFor="status-filter" className="text-sm font-medium text-slate-600">Status</label>
                                <div className="relative mt-1">
                                    <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                        <option>All</option>
                                        <option>Draft</option>
                                        <option>Published</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="department-filter" className="text-sm font-medium text-slate-600">Department</label>
                                <div className="relative mt-1">
                                    <select id="department-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                        {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="section-filter" className="text-sm font-medium text-slate-600">Section</label>
                                <div className="relative mt-1">
                                    <select id="section-filter" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                        {allSections.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="designation-filter" className="text-sm font-medium text-slate-600">Designation</label>
                                <div className="relative mt-1">
                                    <select id="designation-filter" value={designationFilter} onChange={e => setDesignationFilter(e.target.value)} className="w-64 appearance-none bg-white border border-slate-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-base">
                                        {allDesignations.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredAdvertisements.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <h3 className="text-xl font-semibold">No Advertisements Found</h3>
                             <p className="mt-2">
                                No advertisements match the current filter criteria.
                            </p>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden divide-y">
                            {filteredAdvertisements.map(ad => (
                                <div key={ad.id}>
                                    <button
                                        onClick={() => handleToggleAccordion(ad.id)}
                                        className="w-full p-4 text-left bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        aria-expanded={openAdId === ad.id}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">{ad.title}</h3>
                                                <div className="flex items-center gap-x-2 mt-1">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ad.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {ad.status}
                                                    </span>
                                                    <span className="text-xs text-slate-500">Deadline: {ad.deadline}</span>
                                                </div>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-500 transition-transform duration-300 ${openAdId === ad.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                    <div className={`overflow-hidden transition-[max-height] duration-700 ease-in-out ${openAdId === ad.id ? 'max-h-[5000px]' : 'max-h-0'}`}>
                                        <div className="p-4 border-t bg-white">
                                            <div className="flex items-center space-x-3 mb-4">
                                                {ad.status === 'Published' && (
                                                    <>
                                                        <button
                                                            onClick={() => setAdForNewspaper(ad)}
                                                            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold text-sm flex items-center"
                                                        >
                                                            <PrinterIcon className="w-4 h-4 mr-2" />
                                                            Newspaper Ad
                                                        </button>
                                                        <button
                                                            onClick={() => handleSendToPortal(ad)}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-sm flex items-center"
                                                        >
                                                            Send to Job Portal
                                                        </button>
                                                    </>
                                                )}
                                                {ad.status === 'Draft' && timeFilter === 'current' && (
                                                    <button 
                                                        onClick={() => handlePublishDraft(ad.id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                                                    >
                                                        Publish Advertisement
                                                    </button>
                                                )}
                                            </div>
                                            <div className="p-4 bg-slate-100 rounded-lg">
                                                <AdvertisementPreview ad={ad} onPositionClick={handlePositionClick} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isCreateModalOpen} onClose={resetAndCloseCreateModal} title="Create New Job Advertisement" maxWidth="max-w-4xl">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="adTitle" className="block text-sm font-medium text-gray-700">Advertisement Title</label>
                        <input
                            type="text"
                            id="adTitle"
                            value={newAdTitle}
                            onChange={(e) => setNewAdTitle(e.target.value)}
                            className="mt-1 focus:ring-[#0076b6] focus:border-[#0076b6] block w-full shadow-sm text-base border-gray-300 rounded-md"
                            placeholder="e.g., Clinical and Administrative Staff Openings"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">Select Approved Requisitions</label>
                          <div className="flex items-center space-x-2">
                            <button type="button" onClick={() => setSelectedReqIds(availableRequisitions.map(r => r.id))} className="text-sm font-semibold text-[#0076b6] hover:text-[#005a8c]">Select All</button>
                            <button type="button" onClick={() => setSelectedReqIds([])} className="text-sm font-semibold text-[#0076b6] hover:text-[#005a8c]">Deselect All</button>
                          </div>
                        </div>
                        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                            {availableRequisitions.length > 0 ? (
                                availableRequisitions.map(req => (
                                    <label key={req.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedReqIds.includes(req.id)}
                                            onChange={() => handleToggleRequisition(req.id)}
                                            className="h-4 w-4 text-[#0076b6] border-gray-300 rounded focus:ring-[#0076b6]"
                                        />
                                        <span>
                                            <span className="font-semibold text-gray-800">#{req.id} - {req.position}</span>
                                            <span className="block text-sm text-gray-500">{req.department} ({req.numberOfPositions} position{req.numberOfPositions > 1 ? 's' : ''})</span>
                                        </span>
                                    </label>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">No approved requisitions available to advertise.</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Application Deadline</label>
                        <input
                            type="date"
                            id="deadline"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="mt-1 focus:ring-[#0076b6] focus:border-[#0076b6] block w-full shadow-sm text-base border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Application Instructions</label>
                        <div className="mt-2 space-y-2 border border-gray-300 rounded-md p-3">
                            {newAdInstructions.map((instruction, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={instruction}
                                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                                        className="flex-1 focus:ring-[#0076b6] focus:border-[#0076b6] block w-full shadow-sm text-base border-gray-300 rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveInstruction(index)}
                                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddInstruction}
                                className="mt-2 text-sm font-semibold text-[#0076b6] hover:text-[#005a8c]"
                            >
                                + Add Instruction
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                    <button
                        type="button"
                        onClick={() => handleCreateAdvertisement(false)}
                        disabled={!canSaveDraft}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-base font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Save as Draft
                    </button>
                    <button
                        type="button"
                        onClick={() => handleCreateAdvertisement(true)}
                        disabled={!canPublish}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                    >
                        Publish Advertisement
                    </button>
                </div>
            </Modal>
            
            <Modal
              isOpen={isConfirmPublishModalOpen}
              onClose={() => setIsConfirmPublishModalOpen(false)}
              title="Confirm Publication"
            >
              <div className="text-base text-gray-700">
                <p>You are about to publish an advertisement titled <span className="font-semibold">"{newAdTitle}"</span> with <span className="font-semibold">{selectedReqIds.length}</span> requisition(s).</p>
                <p className="mt-2">Are you sure you want to proceed?</p>
              </div>
              <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsConfirmPublishModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-base font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base font-semibold"
                >
                  Confirm & Publish
                </button>
              </div>
            </Modal>

             {adForNewspaper && (
                <Modal
                    isOpen={!!adForNewspaper}
                    onClose={() => setAdForNewspaper(null)}
                    title="Newspaper Advertisement Preview"
                    maxWidth="max-w-4xl"
                >
                    <div ref={newspaperAdRef}>
                        <NewspaperAdPreview ad={adForNewspaper} />
                    </div>
                    <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => setAdForNewspaper(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 bg-[#0076b6] text-white rounded-md hover:bg-[#005a8c] font-semibold flex items-center"
                        >
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Print
                        </button>
                    </div>
                </Modal>
            )}
            
            {viewingApplicantsFor && (() => {
                const applicants = candidates.filter(c => c.positionAppliedFor === viewingApplicantsFor);
                return (
                    <Modal isOpen={!!viewingApplicantsFor} onClose={() => setViewingApplicantsFor(null)} title={`Applicants for ${viewingApplicantsFor}`} maxWidth="max-w-4xl">
                        <div className="overflow-x-auto">
                            {applicants.length > 0 ? (
                                <table className="w-full text-base text-left text-gray-600">
                                    <thead className="text-sm text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Name</th>
                                            <th scope="col" className="px-6 py-3">Qualification</th>
                                            <th scope="col" className="px-6 py-3">Experience</th>
                                            <th scope="col" className="px-6 py-3">Current Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {applicants.map(candidate => (
                                            <tr key={candidate.id} className="bg-white hover:bg-gray-50">
                                                <td className="px-6 py-4 font-semibold text-gray-900">{candidate.name}</td>
                                                <td className="px-6 py-4">{candidate.qualification}</td>
                                                <td className="px-6 py-4">{candidate.experienceYears} years</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                                        {candidate.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <UsersIcon className="w-16 h-16 mx-auto text-gray-300" />
                                    <h3 className="text-xl font-semibold mt-4">No Applicants Found</h3>
                                    <p className="mt-2">There are currently no applicants for this position.</p>
                                </div>
                            )}
                        </div>
                    </Modal>
                );
            })()}

            {portalSuccessAd && (
                <Modal isOpen={!!portalSuccessAd} onClose={() => setPortalSuccessAd(null)} title="Success!">
                    <div className="text-center">
                        <div className="mx-auto my-5 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                          <CheckIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Advertisement Sent</h3>
                        <div className="mt-2 px-7 py-3">
                          <p className="text-base text-gray-600">
                            The advertisement "{portalSuccessAd.title}" with jobs ({portalSuccessAd.positions.map(p => p.position).join(', ')}) has been sent to the portal.
                          </p>
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setPortalSuccessAd(null)}
                            className="px-4 py-2 bg-[#0076b6] text-white rounded-md hover:bg-[#005a8c] font-semibold"
                          >
                            Close
                          </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default JobAdvertisementPage;