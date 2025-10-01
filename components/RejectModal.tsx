import React, { useState } from 'react';
import { Modal } from './Modal';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
  title: string;
}

export const RejectModal: React.FC<RejectModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [remarks, setRemarks] = useState('');

  const handleConfirm = () => {
    onConfirm(remarks);
    setRemarks('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
            Rejection Remarks <span className="text-red-600">*</span>
          </label>
          <textarea
            id="remarks"
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-1 block w-full shadow-sm text-base border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="Please provide a clear reason for rejection."
            required
          />
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
          disabled={!remarks.trim()}
          className="px-4 py-2 text-white rounded-md text-base font-semibold transition-colors bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Confirm Rejection
        </button>
      </div>
    </Modal>
  );
};
