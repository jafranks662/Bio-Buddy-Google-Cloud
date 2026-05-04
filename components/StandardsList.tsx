
import React from 'react';
import { Standard } from '../types';

interface StandardsListProps {
  standards: Standard[];
  selectedStandard: Standard | null;
  onSelectStandard: (standard: Standard) => void;
}

export const StandardsList: React.FC<StandardsListProps> = ({ standards, selectedStandard, onSelectStandard }) => {
  return (
    <div className="flex flex-col space-y-2">
      <h2 className="text-lg font-semibold text-gray-300 mb-2 px-2">Biology Standards</h2>
      {standards.map((standard) => (
        <button
          key={standard.id}
          onClick={() => onSelectStandard(standard)}
          className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
            selectedStandard?.id === standard.id
              ? 'bg-teal-600/50 text-white'
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          <p className="font-bold">{standard.id}</p>
          <p className="text-sm">{standard.title}</p>
        </button>
      ))}
    </div>
  );
};
