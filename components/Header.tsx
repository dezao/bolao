
import React from 'react';
import { KeyIcon } from './icons';

interface HeaderProps {
  isAdmin: boolean;
  onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, onAdminClick }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
          💰 Bolão do Sebastião
        </h1>
        <button
          onClick={onAdminClick}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
            isAdmin
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          <KeyIcon className="w-4 h-4" />
          <span>{isAdmin ? 'Sair do Modo Admin' : 'Modo Admin'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
