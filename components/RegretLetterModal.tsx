import React from 'react';
import { Modal } from './Modal';
import type { Candidate } from '../types';
import { MailIcon } from './icons';

interface RegretLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  candidate: Candidate | null;
}

export const RegretLetterModal: React.FC<RegretLetterModalProps> = ({ isOpen, onClose, onSend, candidate }) => {
  if (!candidate) return null;

  const letterContent = `Dear ${candidate.name},

I hope this message finds you well.

Thank you for your interest in the ${candidate.positionAppliedFor} position at PKLI & RC, and for taking the time to participate in our interview process. We truly appreciate the effort you invested and the expertise you shared with us.

After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, given the strength of your qualifications, and we sincerely hope you will consider applying for future opportunities with us.

We are grateful for your interest in PKLI & RC and wish you the very best in your future endeavors. Should you have any questions or require further information, please feel free to reach out.

Regards,

Human Resource`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Regret Letter for ${candidate.name}`}>
      <div className="p-4 bg-gray-50 border rounded-md font-serif text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
        {letterContent}
      </div>
      <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold flex items-center"
        >
          <MailIcon className="w-5 h-5 mr-2" />
          Send Email
        </button>
      </div>
    </Modal>
  );
};
