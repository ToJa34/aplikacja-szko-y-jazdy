import React, { useState, useEffect } from 'react';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Role } from './types';

const requestNotificationPermissionOnce = async () => {
    const permissionRequested = localStorage.getItem('notificationPermissionRequested');
    if (!permissionRequested && 'Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
        localStorage.setItem('notificationPermissionRequested', 'true');
    }
};

const ThemedApp: React.FC = () => {
    const { currentUser } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    useEffect(() => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        requestNotificationPermissionOnce();
    }, []);

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
    };

    const renderDashboard = () => {
        if (!currentUser) return <Login />;
        switch (currentUser.role) {
            case Role.Student:
                return <StudentDashboard theme={theme} onThemeChange={handleThemeChange} />;
            case Role.Instructor:
                return <InstructorDashboard theme={theme} onThemeChange={handleThemeChange} />;
            case Role.Admin:
                return <AdminDashboard theme={theme} onThemeChange={handleThemeChange} />;
            default:
                return <Login />;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {renderDashboard()}
        </div>
    );
}

const App: React.FC = () => {
    return (
        <DataProvider>
            <AuthProvider>
                <ThemedApp />
            </AuthProvider>
        </DataProvider>
    );
};

export default App;