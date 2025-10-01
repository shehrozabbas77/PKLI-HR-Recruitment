import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md shadow-slate-200/60 border border-slate-200 ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
    return <div className={`px-6 py-5 border-b border-slate-200 ${className}`}>{children}</div>
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
    return <div className={`p-6 ${className}`}>{children}</div>
}

interface CardTitleProps {
    children: React.ReactNode;
}
export const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
    return <h3 className="text-xl font-bold text-slate-800">{children}</h3>
}

interface CardDescriptionProps {
    children: React.ReactNode;
}
export const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => {
    return <p className="text-base text-slate-500 mt-1">{children}</p>
}