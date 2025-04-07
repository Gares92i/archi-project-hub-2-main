
import React from 'react';

interface DocumentProps {
  url: string;
}

export const Document: React.FC<DocumentProps> = ({ url }) => {
  return (
    <div className="h-full w-full">
      <img 
        src={url} 
        alt="Document plan" 
        className="h-full w-full object-contain" 
      />
    </div>
  );
};
