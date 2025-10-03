import React, { useMemo } from 'react';
import type { Candidate, PanelEvaluation } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

// --- Evaluation Form Components ---
const EvaluationHeader: React.FC<{ title: string; candidate: Candidate }> = ({ title, candidate }) => (
    <div className="mb-6 text-center border-b pb-4">
        <img src="https://pkli.org.pk/wp-content/uploads/2020/09/cropped-Insignia_512_512.png" alt="PKLI Logo" className="h-20 w-auto mx-auto mb-2"/>
        <h2 className="text-xl font-bold text-gray-800">PAKISTAN KIDNEY AND LIVER INSTITUTE AND RESEARCH CENTER</h2>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="grid grid-cols-3 gap-4 mt-4 text-left text-sm p-2 bg-gray-50 rounded-md border">
            <p><strong>Candidate Name:</strong> {candidate.name}</p>
            <p><strong>Position:</strong> {candidate.positionAppliedFor}</p>
            <p><strong>Interview Date:</strong> {candidate.interviewTime ? new Date(candidate.interviewTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
        </div>
    </div>
);

const EvaluationFooter: React.FC<{
    data: PanelEvaluation;
    onChange: (field: string, value: any) => void;
}> = ({ data, onChange }) => {
    return (
        <div className="mt-8 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <InputField label="Current Salary & Benefits:" name="current_salary" type="text" value={(data.comments as any).current_salary} onChange={e => onChange(`comments.current_salary`, e.target.value)} />
                <InputField label="Expected Salary:" name="expected_salary" type="text" value={(data.comments as any).expected_salary} onChange={e => onChange(`comments.expected_salary`, e.target.value)} />
                <InputField label="Time required for joining (Days):" name="joining_time" type="text" value={(data.comments as any).joining_time} onChange={e => onChange(`comments.joining_time`, e.target.value)} />
                <InputField label="Interviewer Name:" name="interviewer_name" type="text" value={data.panelMemberName} onChange={() => {}} />
                <div>
                    <label className="block text-sm font-medium text-gray-700">Interviewer Signature:</label>
                    <div className="mt-1 h-12 block w-full border-b border-gray-300 bg-gray-50 rounded-t-md"></div>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-6 text-center">Note: A minimum score of 60% is required for recommendation of hiring.</p>
        </div>
    );
};

const InputField: React.FC<{ label: string; name: string; type: string; value?: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, type, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input name={name} type={type} value={value || ''} onChange={onChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#0076b6] focus:border-[#0076b6] px-3 py-2" />
    </div>
);

const TotalScoreDisplay: React.FC<{ score: number; maxScore: number; title: string }> = ({ score, maxScore, title }) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="mt-6 bg-gray-50">
      <CardContent className="flex items-center justify-between p-4">
        <div className="text-lg font-bold text-gray-800">{title}</div>
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle className="text-gray-200" strokeWidth="12" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
              <circle
                className="text-[#0076b6] transition-all duration-500"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
              {`${Math.round(percentage)}%`}
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#0076b6]">{score}</p>
            <p className="text-sm text-gray-500">out of {maxScore}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CompetencyInput: React.FC<{
    label: string;
    desc?: string;
    score: number;
    maxScore: number;
    comment: string;
    onScoreChange: (value: number) => void;
    onCommentChange: (value: string) => void;
    hideComment?: boolean;
}> = ({ label, desc, score, maxScore, comment, onScoreChange, onCommentChange, hideComment }) => (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <label className="font-semibold text-gray-800">{label}</label>
                {desc && <p className="text-xs text-gray-500 mt-1">{desc}</p>}
                 {!hideComment && (
                    <textarea 
                        value={comment || ''} 
                        onChange={e => onCommentChange(e.target.value)} 
                        className="mt-2 w-full border-gray-300 rounded-md text-sm shadow-sm focus:ring-[#0076b6] focus:border-[#0076b6] p-2" 
                        rows={2}
                        placeholder="Comments..."
                    />
                )}
            </div>
            <div className="flex items-center space-x-2 pt-1">
                <input 
                    type="number" 
                    value={score || ''} 
                    onChange={e => onScoreChange(Math.max(0, Math.min(maxScore, parseInt(e.target.value) || 0)))}
                    max={maxScore} 
                    min={0} 
                    className="w-20 text-center border-gray-300 rounded-md text-lg font-bold shadow-sm focus:ring-[#0076b6] focus:border-[#0076b6] py-2"
                />
                <span className="text-gray-500 text-lg">/ {maxScore}</span>
            </div>
        </div>
    </div>
);

const EvaluationFormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card className="bg-slate-50">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);


const EvaluationFormManagement: React.FC<{ candidate: Candidate; data: PanelEvaluation; onChange: (field: string, value: any) => void; }> = ({ candidate, data, onChange }) => {
    const competencies = [
        { key: 'leadership', label: 'Leadership Skills', desc: '(Experience, meeting the goals/challenges, conflict resolution, achievements)', max: 15 },
        { key: 'work_experience', label: 'Work Experience', desc: '(duration, quality and relevance)', max: 10 },
        { key: 'governance', label: 'Clinical/Corporate Governance, Audit, Teaching & Research Skills', max: 15 },
        { key: 'knowledge', label: 'Professional & Specialty Knowledge', max: 15 },
        { key: 'finance', label: 'Finance & Budget', desc: '(Expertise, Knowledge, Foresight)', max: 15 },
        { key: 'resource', label: 'Resource management/creation, Procurement', desc: '(Expertise, Knowledge, Foresight)', max: 15 },
        { key: 'appearance', label: 'Appearance, Communications & eloquence', max: 15 },
    ];
    const totalScore = useMemo(() => Object.values(data.scores).reduce((a: number, b) => a + (Number(b) || 0), 0), [data.scores]);
    const maxScore = useMemo(() => competencies.reduce((a, b) => a + b.max, 0), []);

    return (
        <div className="space-y-6">
            <EvaluationHeader title="INTERVIEW EVALUATION FORM FOR MANAGEMENT POSITION" candidate={candidate} />
            <table className="w-full border-collapse border border-slate-400">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="border border-slate-300 p-3 text-left font-semibold text-slate-700">Competencies</th>
                        <th className="border border-slate-300 p-3 text-center w-32 font-semibold text-slate-700">Score</th>
                        <th className="border border-slate-300 p-3 text-left font-semibold text-slate-700">Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {competencies.map(c => (
                        <tr key={c.key} className="bg-white">
                            <td className="border border-slate-300 p-3 align-top">
                                <p className="font-semibold text-slate-800">{c.label}</p>
                                {c.desc && <p className="text-xs text-slate-500 mt-1">{c.desc}</p>}
                            </td>
                            <td className="border border-slate-300 p-2 align-middle">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="number"
                                        value={data.scores[c.key] || ''}
                                        onChange={e => onChange(`scores.${c.key}`, Math.max(0, Math.min(c.max, parseInt(e.target.value) || 0)))}
                                        max={c.max}
                                        min={0}
                                        className="w-16 text-center border-slate-300 rounded-md text-lg font-bold shadow-sm focus:ring-[#0076b6] focus:border-[#0076b6] py-1"
                                    />
                                    <span className="ml-2 text-slate-500 text-lg">/ {c.max}</span>
                                </div>
                            </td>
                            <td className="border border-slate-300 p-1 align-middle">
                                <textarea
                                    value={data.comments[c.key] || ''}
                                    onChange={e => onChange(`comments.${c.key}`, e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm shadow-sm focus:ring-[#0076b6] focus:border-[#0076b6] p-2 min-h-[60px]"
                                    rows={2}
                                />
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-slate-200 font-bold text-slate-800">
                        <td className="border border-slate-300 p-3 text-right">Total Marks</td>
                        <td className="border border-slate-300 p-3 text-center text-xl">
                            {totalScore} / {maxScore}
                        </td>
                        <td className="border border-slate-300 p-3"></td>
                    </tr>
                </tbody>
            </table>
            <EvaluationFooter data={data} onChange={onChange} />
        </div>
    );
};

const EvaluationFormGeneralStaff: React.FC<{ candidate: Candidate; data: PanelEvaluation; onChange: (field: string, value: any) => void; }> = ({ candidate, data, onChange }) => {
    const competencies = [
        { key: "qualification", label: "Qualification" }, { key: "work_experience", label: "Work Experience (duration, quality and relevance)" }, 
        { key: "technical_knowledge", label: "Technical Knowledge" }, { key: "communication", label: "Communication" }, 
        { key: "personality", label: "Personality" }, { key: "suitability", label: "Suitability for Job" }, 
        { key: "reasoning", label: "Logical Reasoning/ Maturity" }, { key: "computer", label: "Computer Proficiency" }, 
        { key: "attitude", label: "Attitude" }, { key: "teamwork", label: "Teamwork/ Interpersonal Skills" }
    ];
    const maxPerComp = 5;
    const totalScore = useMemo(() => Object.values(data.scores).reduce((a: number, b) => a + (Number(b) || 0), 0), [data.scores]);
    const maxScore = competencies.length * maxPerComp;

    return (
         <div className="space-y-6">
            <EvaluationHeader title="INTERVIEW EVALUATION FORM FOR GENERAL STAFF" candidate={candidate} />
            <p className="text-center text-sm my-2 p-2 bg-[#e0f2fe] border border-[#0076b6]/30 rounded-md">Scoring: 1 - Not Suitable, 2 - Below Average, 3 - Acceptable, 4 - Meets Expectations, 5 - Beyond Expectations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competencies.map((c) => (
                    <CompetencyInput 
                        key={c.key} label={c.label}
                        score={data.scores[c.key]} maxScore={maxPerComp} comment={data.comments[c.key]}
                        onScoreChange={value => onChange(`scores.${c.key}`, value)}
                        onCommentChange={value => onChange(`comments.${c.key}`, value)}
                    />
                ))}
            </div>
            <TotalScoreDisplay score={totalScore} maxScore={maxScore} title="Overall Score" />
            <EvaluationFooter data={data} onChange={onChange} />
        </div>
    );
};

const EvaluationFormConsultant: React.FC<{ candidate: Candidate; data: PanelEvaluation; onChange: (field: string, value: any) => void; }> = ({ candidate, data, onChange }) => {
    const competencies = [
        { key: 'clinical_skills', label: 'Clinical skills', max: 20 },
        { key: 'knowledge', label: 'Professional & Specialty Knowledge', max: 5 },
        { key: 'work_experience', label: 'Work Experience (duration, quality and relevance)', max: 5 },
        { key: 'governance', label: 'Clinical Governance, Audit, Teaching & Research Skills', max: 5 },
        { key: 'appearance', label: 'Appearance, Communications & Leadership Skills', max: 5 },
    ];
    const totalScore = useMemo(() => Object.values(data.scores).reduce((a: number, b) => a + (Number(b) || 0), 0), [data.scores]);
    const maxScore = 40; // Hardcoded from PDF

    return (
        <div className="space-y-6">
            <EvaluationHeader title="INTERVIEW EVALUATION FORM FOR CONSULTANT" candidate={candidate} />
            <div className="space-y-4">
                {competencies.map(c => (
                    <CompetencyInput 
                        key={c.key} label={c.label}
                        score={data.scores[c.key]} maxScore={c.max} comment={data.comments[c.key]}
                        onScoreChange={value => onChange(`scores.${c.key}`, value)}
                        onCommentChange={value => onChange(`comments.${c.key}`, value)}
                    />
                ))}
            </div>
            <TotalScoreDisplay score={totalScore} maxScore={maxScore} title="Total marks in interview" />
            <EvaluationFooter data={data} onChange={onChange} />
        </div>
    );
};

const EvaluationFormRegistrar: React.FC<{ candidate: Candidate; data: PanelEvaluation; onChange: (field: string, value: any) => void; }> = ({ candidate, data, onChange }) => {
    const preInterviewComps = [
        { key: 'mbbs_marks', label: 'MBBS (0.5 marks for each professional passed in 1st attempt & 0.5 for each 1st division)', max: 5 },
        { key: 'gov_grad', label: 'Graduation from Government Institution', max: 3 },
        { key: 'gov_house_job', label: 'House job from Government teaching institution (attached with medical college)', max: 2 },
        { key: 'publication', label: 'Publication/research (Indexed/PMDC approved journal) one for each publication', max: 2 },
        { key: 'university_pos', label: 'Top three university positions [1-Mark for each position Max-2 Marks]', max: 2 },
        { key: 'imm_passed', label: 'IMM Passed', max: 3 },
    ];
    const interviewComps = [
        { key: 'emergency', label: 'Emergency skills', max: 5 },
        { key: 'investigation', label: 'Investigation skills', max: 5 },
        { key: 'examination', label: 'Examination skills', max: 5 },
        { key: 'diagnosis', label: 'Diagnosis and management skills', max: 5 },
        { key: 'communication', label: 'Communication skills / Personality / Attitude / Maturity', max: 13, desc: '(≤ 6 unsuitable, 7 bare minimum, 8 average, 9-10 satisfactory, 10-11 good, ≥ 12 very good)' },
    ];
    
    const preInterviewScore = useMemo(() => preInterviewComps.reduce((sum, c) => sum + (Number(data.scores[c.key]) || 0), 0), [data.scores]);
    const interviewScore = useMemo(() => interviewComps.reduce((sum, c) => sum + (Number(data.scores[c.key]) || 0), 0), [data.scores]);

    return (
        <div className="space-y-6">
            <EvaluationHeader title="INTERVIEW EVALUATION FORM FOR REGISTRAR (HR DEPARTMENT)" candidate={candidate} />
            <EvaluationFormSection title="Pre-interview marks and clinical competencies">
                {preInterviewComps.map(c => ( <CompetencyInput key={c.key} label={c.label} score={data.scores[c.key]} maxScore={c.max} hideComment comment="" onScoreChange={value => onChange(`scores.${c.key}`, value)} onCommentChange={()=>{}}/> ))}
                <TotalScoreDisplay score={preInterviewScore} maxScore={17} title="Total marks obtained" />
            </EvaluationFormSection>
            <EvaluationFormSection title="Interview Clinical skills">
                {interviewComps.map(c => ( <CompetencyInput key={c.key} label={c.label} desc={c.desc} score={data.scores[c.key]} maxScore={c.max} comment={data.comments[c.key]} onScoreChange={value => onChange(`scores.${c.key}`, value)} onCommentChange={value => onChange(`comments.${c.key}`, value)}/> ))}
                <TotalScoreDisplay score={interviewScore} maxScore={33} title="Total marks in interview" />
            </EvaluationFormSection>
            <TotalScoreDisplay score={preInterviewScore + interviewScore} maxScore={50} title="Grand Total" />
            <EvaluationFooter data={data} onChange={onChange} />
        </div>
    );
};

const EvaluationFormSrRegistrar: React.FC<{ candidate: Candidate; data: PanelEvaluation; onChange: (field: string, value: any) => void; }> = ({ candidate, data, onChange }) => {
    const preInterviewComps = [
        { key: 'mbbs_marks', label: 'MBBS (0.5 marks for each professional passed in 1st attempt & 0.5 for each 1st division)', max: 5 },
        { key: 'publication', label: 'Publication/research (Indexed/PMDC approved journal) (1-Mark for each publication)', max: 3 },
        { key: 'university_pos', label: 'Top three university positions (1-Mark for each position)', max: 2 },
    ];
    const interviewComps = [
        { key: 'emergency', label: 'Emergency skills', max: 5 },
        { key: 'investigation', label: 'Investigation skills', max: 5 },
        { key: 'examination', label: 'Examination skills', max: 5 },
        { key: 'diagnosis', label: 'Diagnosis and management skills', max: 5 },
        { key: 'awareness', label: 'Awareness of current trends and new research', max: 5 },
        { key: 'communication', label: 'Communication skills / Personality / Attitude / Maturity', max: 15, desc: '(≤ 6 unsuitable, 7 bare minimum, 9 average, 10-11 satisfactory, 12-13 good, ≥ 14 very good)' },
    ];

    const preInterviewScore = useMemo(() => preInterviewComps.reduce((sum, c) => sum + (Number(data.scores[c.key]) || 0), 0), [data.scores]);
    const interviewScore = useMemo(() => interviewComps.reduce((sum, c) => sum + (Number(data.scores[c.key]) || 0), 0), [data.scores]);

    return (
        <div className="space-y-6">
            <EvaluationHeader title="INTERVIEW EVALUATION FORM FOR SENIOR REGISTRAR/CLINICAL FELLOW" candidate={candidate} />
            <EvaluationFormSection title="Pre-interview marks and clinical competencies">
                {preInterviewComps.map(c => ( <CompetencyInput key={c.key} label={c.label} score={data.scores[c.key]} maxScore={c.max} hideComment comment="" onScoreChange={value => onChange(`scores.${c.key}`, value)} onCommentChange={()=>{}} /> ))}
                <TotalScoreDisplay score={preInterviewScore} maxScore={10} title="Total marks obtained" />
            </EvaluationFormSection>
            <EvaluationFormSection title="Interview Clinical skills">
                {interviewComps.map(c => ( <CompetencyInput key={c.key} label={c.label} desc={c.desc} score={data.scores[c.key]} maxScore={c.max} comment={data.comments[c.key]} onScoreChange={value => onChange(`scores.${c.key}`, value)} onCommentChange={value => onChange(`comments.${c.key}`, value)}/> ))}
                <TotalScoreDisplay score={interviewScore} maxScore={40} title="Total marks in interview" />
            </EvaluationFormSection>
            <TotalScoreDisplay score={preInterviewScore + interviewScore} maxScore={50} title="Grand Total" />
            <EvaluationFooter data={data} onChange={onChange} />
        </div>
    );
};

const EvaluationFormPGR: React.FC<{ candidate: Candidate; data: PanelEvaluation; onChange: (field: string, value: any) => void; }> = ({ candidate, data, onChange }) => {
    const preInterviewComps = [
        { key: 'mbbs_aggregate', label: 'MBBS Aggregate of Marks', max: 20 }, { key: 'mbbs_attempts', label: 'Attempts Marks in MBBS (for local graduates)', max: 5 },
        { key: 'neb_exam', label: 'NEB Exam / NLE (for foreign graduates) for each step', max: 5 }, { key: 'fcps_part1', label: 'Part 1 FCPS / MD / MS/MDS Exam', max: 40 },
        { key: 'house_job', label: 'House Job', max: 5 }, { key: 'experience_hcl', label: 'Experience at Primary / Secondary / Tertiary HCL', max: 10 },
        { key: 'university_pos', label: 'Position at University Level examination', max: 5 }, { key: 'research_paper', label: 'Research Paper', max: 5 },
    ];
    const clinicalSkillsComps = [
        { key: 'q1_history', label: 'Question 1: Clinical Scenario - History/Examination', max: 5 }, { key: 'q1_investigation', label: 'Question 1: Clinical Scenario - Investigations/Management', max: 5 },
        { key: 'q2_ethical', label: 'Question 2: Ethical Question', max: 5 }, { key: 'q3_suitability', label: 'Question 3: Suitability and Commitment to Specialty', max: 5 },
        { key: 'q4_application', label: 'Question 4: Application and Training', max: 5 }, { key: 'q5_communication', label: 'Question 5: Communication Marks', max: 5 },
    ];

    const preInterviewScore = useMemo(() => preInterviewComps.reduce((sum, c) => sum + (Number(data.scores[c.key]) || 0), 0), [data.scores]);
    const clinicalScore = useMemo(() => clinicalSkillsComps.reduce((sum, c) => sum + (Number(data.scores[c.key]) || 0), 0), [data.scores]);
    const mcqScore = Number(data.scores.mcq) || 0;
    
    return (
         <div className="space-y-6">
            <EvaluationHeader title="INTERVIEW EVALUATION FORM FOR POST GRADUATE TRAINEE" candidate={candidate} />
            <EvaluationFormSection title="Pre-Interview Scoring (90 Marks)">
                {preInterviewComps.map(c => ( <CompetencyInput key={c.key} label={c.label} score={data.scores[c.key]} maxScore={c.max} hideComment comment="" onScoreChange={value => onChange(`scores.${c.key}`, value)} onCommentChange={()=>{}} /> ))}
                <TotalScoreDisplay score={preInterviewScore} maxScore={90} title="Marks Achieved" />
            </EvaluationFormSection>
             <EvaluationFormSection title="MCQ Test Score">
                <CompetencyInput label="MCQ Test Score (if applicable)" score={data.scores.mcq} maxScore={100} comment={data.comments.mcq} onScoreChange={value => onChange(`scores.mcq`, value)} onCommentChange={value => onChange(`comments.mcq`, value)} />
            </EvaluationFormSection>
            <EvaluationFormSection title="Clinical Skills (30 Marks)">
                {clinicalSkillsComps.map(c => ( <CompetencyInput key={c.key} label={c.label} score={data.scores[c.key]} maxScore={c.max} hideComment comment="" onScoreChange={value => onChange(`scores.${c.key}`, value)} onCommentChange={()=>{}} /> ))}
                <TotalScoreDisplay score={clinicalScore} maxScore={30} title="Marks Achieved" />
            </EvaluationFormSection>
            <EvaluationFooter data={data} onChange={onChange} />
        </div>
    );
};


export const EvaluationRouter: React.FC<{ candidate: Candidate; data: PanelEvaluation; onChange: (field: string, value: any) => void; }> = ({ candidate, data, onChange }) => {
    const position = candidate.positionAppliedFor.toLowerCase();
    
    // Management Positions
    if (position.includes('director') || position.includes('manager')) return <EvaluationFormManagement candidate={candidate} data={data} onChange={onChange} />;
    
    // Medical Consultant
    if (position.includes('consultant')) return <EvaluationFormConsultant candidate={candidate} data={data} onChange={onChange} />;
    
    // Medical Fellows/Registrars
    if (position.includes('senior registrar') || position.includes('clinical fellow')) return <EvaluationFormSrRegistrar candidate={candidate} data={data} onChange={onChange} />;
    if (position.includes('registrar')) return <EvaluationFormRegistrar candidate={candidate} data={data} onChange={onChange} />;
    
    // Medical Trainees
    if (position.includes('post graduate')) return <EvaluationFormPGR candidate={candidate} data={data} onChange={onChange} />;
    
    // Default form for all other staff (Admin, IT, General Staff etc.)
    return <EvaluationFormGeneralStaff candidate={candidate} data={data} onChange={onChange} />;
};