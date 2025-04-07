import React, { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-hidden">
      {children}
    </main>
  );
};
