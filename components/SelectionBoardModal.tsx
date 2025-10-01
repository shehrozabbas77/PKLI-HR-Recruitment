
import React, { useState } from 'react';
import { Modal } from './Modal';
import type { SelectionBoard, BoardMember } from '../types';
import { XIcon } from './icons';

const BoardCard: React.FC<{ board: SelectionBoard }> = ({ board }) => (
    <div className="border border-gray-300 rounded-lg mb-4">
        <div className="bg-gray-100 p-3 rounded-t-lg border-b border-gray-300">
            <h3 className="font-bold text-gray-800 text-center">{board.title}</h3>
            <p className="text-sm text-gray-600 font-semibold text-center">{board.subtitle}</p>
        </div>
        <div className="p-4">
            {board.description && <p className="text-sm text-gray-600 mb-4 italic">{board.description}</p>}
            <table className="w-full text-left text-base">
                <tbody>
                    {board.members.map((member, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                            <td className="py-2 pr-4">{member.role}</td>
                            <td className="py-2 pl-4 font-semibold text-right">{member.position}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const initialNewBoardState: SelectionBoard = {
  title: '',
  subtitle: '',
  members: [{ role: '', position: 'Member' }],
};

export const SelectionBoardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  boards: SelectionBoard[];
  addBoard: (board: SelectionBoard) => void;
}> = ({ isOpen, onClose, boards, addBoard }) => {
  const [newBoard, setNewBoard] = useState<SelectionBoard>(initialNewBoardState);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBoard({ ...newBoard, [e.target.name]: e.target.value });
  };
  
  const handleMemberChange = (index: number, field: 'role' | 'position', value: string) => {
    const updatedMembers = [...newBoard.members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value as 'Chairperson' | 'Member' };
    setNewBoard({ ...newBoard, members: updatedMembers });
  };
  
  const addMemberField = () => {
    setNewBoard({ ...newBoard, members: [...newBoard.members, { role: '', position: 'Member' }] });
  };
  
  const removeMemberField = (index: number) => {
    if (newBoard.members.length > 1) {
        setNewBoard({ ...newBoard, members: newBoard.members.filter((_, i) => i !== index) });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoard.title.trim() && newBoard.subtitle.trim() && newBoard.members.every(m => m.role.trim())) {
        addBoard(newBoard);
        setNewBoard(initialNewBoardState);
        setShowCreateForm(false);
    }
  };

  const handleClose = () => {
      setShowCreateForm(false);
      setNewBoard(initialNewBoardState);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manage Selection Boards" maxWidth="max-w-3xl">
      <div className="space-y-6">
        {showCreateForm ? (
            <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-slate-50">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Selection Board</h3>
                <div className="space-y-4">
                    <input type="text" name="title" placeholder="Board Title (e.g., SUB SELECTION BOARD #6)" value={newBoard.title} onChange={handleInputChange} required className="w-full border-gray-300 rounded-md"/>
                    <input type="text" name="subtitle" placeholder="Board Subtitle (e.g., SELECTION OF IT STAFF)" value={newBoard.subtitle} onChange={handleInputChange} required className="w-full border-gray-300 rounded-md"/>
                    
                    <h4 className="font-semibold pt-2">Members</h4>
                    {newBoard.members.map((member, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input type="text" placeholder="Member Role (e.g., CTO)" value={member.role} onChange={e => handleMemberChange(index, 'role', e.target.value)} required className="flex-1 border-gray-300 rounded-md"/>
                            <select value={member.position} onChange={e => handleMemberChange(index, 'position', e.target.value)} className="border-gray-300 rounded-md">
                                <option value="Member">Member</option>
                                <option value="Chairperson">Chairperson</option>
                            </select>
                            <button type="button" onClick={() => removeMemberField(index)} disabled={newBoard.members.length <= 1} className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50">
                                <XIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addMemberField} className="text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add Member</button>
                </div>
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Save Board</button>
                </div>
            </form>
        ) : (
            <>
                <div className="flex justify-end">
                    <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
                        Create New Board
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {boards.map((board, index) => (
                        <BoardCard key={index} board={board} />
                    ))}
                </div>
            </>
        )}
      </div>
    </Modal>
  );
};
