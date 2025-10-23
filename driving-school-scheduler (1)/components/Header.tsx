import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SunIcon, MoonIcon, UserCircleIcon, CogIcon, ArrowLeftOnRectangleIcon } from './Icons';

interface HeaderProps {
    theme: string;
    onThemeChange: (newTheme: 'light' | 'dark' | 'system') => void;
}

const Logo: React.FC = () => (
    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 tracking-wider">
        DZIESIATKA
    </div>
);


const Header: React.FC<HeaderProps> = ({ theme, onThemeChange }) => {
    const { currentUser, logout } = useAuth();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <Logo />
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    {currentUser?.role === 'ADMINISTRATOR' ? <CogIcon className="w-6 h-6" /> : <UserCircleIcon className="w-6 h-6" />}
                    <span className="font-medium">{currentUser?.name} {currentUser?.surname}</span>
                </div>
                
                <div className="flex items-center rounded-full bg-gray-200 dark:bg-gray-700 p-1">
                    <button onClick={() => onThemeChange('light')} className={`p-1 rounded-full ${theme === 'light' ? 'bg-primary-500 text-white' : ''}`}>
                        <SunIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onThemeChange('dark')} className={`p-1 rounded-full ${theme === 'dark' ? 'bg-primary-500 text-white' : ''}`}>
                        <MoonIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onThemeChange('system')} className={`px-2 py-1 text-xs rounded-full ${theme === 'system' ? 'bg-primary-500 text-white' : ''}`}>
                        Auto
                    </button>
                </div>
                
                <button onClick={logout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title="Wyloguj">
                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;
