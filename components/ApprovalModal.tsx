import React, { useState } from 'react';
import { Modal } from './Modal';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
  action: 'approve' | 'reject' | 'return';
  title: string;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose, onConfirm, action, title }) => {
  const [remarks, setRemarks] = useState('');

  const handleConfirm = () => {
    onConfirm(remarks);
    setRemarks('');
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {action !== 'approve' ? (
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              id="remarks"
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 block w-full shadow-sm text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={action === 'reject' ? "Please provide a reason for rejection." : "Please provide comments for returning."}
              required={action === 'reject' || action === 'return'}
            />
          </div>
        ) : (
            <p className="text-base text-gray-600">Are you sure you want to approve this request?</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <p className="mt-1 text-base text-gray-800 bg-gray-100 p-2 rounded-md">{today}</p>
        </div>
      </div>
      <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-base font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={(action === 'reject' || action === 'return') && !remarks.trim()}
          className={`px-4 py-2 text-white rounded-md text-base font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
            action === 'approve'
              ? 'bg-green-600 hover:bg-green-700'
              : action === 'reject' 
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {action === 'approve' ? 'Confirm Approval' : action === 'reject' ? 'Confirm Rejection' : 'Confirm Return'}
        </button>
      </div>
    </Modal>
  );
};