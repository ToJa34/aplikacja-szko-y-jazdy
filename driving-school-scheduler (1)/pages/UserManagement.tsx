import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { User, Role, StudentInfo, Lesson } from '../types';
import { TrashIcon } from '../components/Icons';

const UserManagement: React.FC = () => {
    const { users, studentsInfo, lessons, updateUser, deleteUser } = useData();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
    };

    const handleRoleChange = (userId: number, newRole: Role) => {
        if(window.confirm(`Czy na pewno chcesz zmienić rolę tego użytkownika na ${newRole}?`)) {
            updateUser(userId, { role: newRole });
            // Update selected user in state to reflect change immediately
            const updatedUser = users.find(u => u.id === userId);
            if(updatedUser) setSelectedUser({...updatedUser, role: newRole});
        }
    }
    
    const handleDeleteUser = (user: User) => {
        if(window.confirm(`Czy na pewno chcesz trwale usunąć użytkownika ${user.name} ${user.surname}? Tej operacji nie można cofnąć.`)) {
            deleteUser(user.id);
            setSelectedUser(null);
        }
    }

    const UserDetails: React.FC<{ user: User }> = ({ user }) => {
        const studentInfo = useMemo(() => studentsInfo.find(si => si.userId === user.id), [studentsInfo, user.id]);
        const userLessons = useMemo(() => lessons.filter(l => l.studentId === user.id).sort((a,b) => b.date.getTime() - a.date.getTime()), [lessons, user.id]);

        return (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner h-full overflow-y-auto">
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold mb-4">{user.name} {user.surname}</h3>
                    <button onClick={() => handleDeleteUser(user)} className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm">
                        <TrashIcon className="w-4 h-4" />
                        <span>Usuń konto</span>
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="font-semibold">Dane Logowania:</p>
                        <p>Nazwa użytkownika: <span className="font-mono">{user.username}</span></p>
                    </div>
                     <div>
                        <label htmlFor="role" className="font-semibold">Rola:</label>
                        <select 
                            id="role" 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                            className="ml-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1"
                        >
                            <option value={Role.Student}>Kursant</option>
                            <option value={Role.Instructor}>Instruktor</option>
                            <option value={Role.Admin}>Administrator</option>
                        </select>
                    </div>
                    {user.role === Role.Student && studentInfo && (
                        <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                            <h4 className="font-semibold text-lg">Informacje o Kursie:</h4>
                            <p>Numer PKK: <span className="font-mono">{studentInfo.pkkNumber}</span></p>
                            <p>Wyjeżdżone godziny: <span className="font-bold">{studentInfo.hoursDriven} / 30</span></p>
                            <p>Wpłacono: <span className="font-bold text-green-500">{studentInfo.amountPaid} zł</span> / {studentInfo.totalCourseCost} zł</p>
                        </>
                    )}
                    {user.role === Role.Student && userLessons.length > 0 && (
                        <>
                             <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                             <h4 className="font-semibold text-lg">Historia Jazd ({userLessons.length}):</h4>
                             <ul className="space-y-2 max-h-60 overflow-y-auto">
                                {userLessons.map(lesson => (
                                    <li key={lesson.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                                        <p className="font-semibold">{lesson.date.toLocaleString('pl-PL')}</p>
                                        <p>Status: {lesson.confirmed ? <span className="text-green-500">Potwierdzona</span> : <span className="text-yellow-500">Oczekująca</span>}</p>
                                    </li>
                                ))}
                             </ul>
                        </>
                    )}
                </div>
            </div>
        )
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh]">
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Wszyscy Użytkownicy</h2>
                <ul className="space-y-2">
                    {users.map(user => (
                        <li key={user.id}>
                            <button
                                onClick={() => handleSelectUser(user)}
                                className={`w-full text-left p-2 rounded-md ${selectedUser?.id === user.id ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <p className="font-semibold">{user.name} {user.surname}</p>
                                <p className="text-sm opacity-80">{user.role}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2">
                {selectedUser ? (
                    <UserDetails user={selectedUser} />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-lg shadow-inner">
                        <p className="text-gray-500">Wybierz użytkownika z listy, aby zobaczyć szczegóły.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;