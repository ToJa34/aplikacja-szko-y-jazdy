import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import Modal from '../components/Modal';
import { useData } from '../contexts/DataContext';
import { PencilIcon, CalendarDaysIcon } from '../components/Icons';
import { StudentInfo, User, Lesson, TimeBlock } from '../types';
import EditableSchoolInfo from './EditableSchoolInfo';
import Console from '../components/Console';
import UserManagement from './UserManagement';
import GroupManagement from './GroupManagement';

interface DashboardProps {
    theme: string;
    onThemeChange: (newTheme: 'light' | 'dark' | 'system') => void;
}

const AdminDashboard: React.FC<DashboardProps> = ({ theme, onThemeChange }) => {
    const [activeTab, setActiveTab] = useState<'calendar' | 'group' | 'userManagement' | 'groupManagement' | 'school' | 'errors' | 'console'>('calendar');
    const { 
        allStudents, 
        studentsInfo, 
        confirmLesson, 
        toggleDayOff, 
        lessons, 
        deleteLesson, 
        updateStudentInfo, 
        addTimeBlock, 
        groups, 
        deleteTimeBlock, 
        updateLesson, 
        updateTimeBlock,
        errors,
        logError,
        addLesson,
        daysOff
    } = useData();
    
    const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');
    
    // Edit Student Modal
    const [isEditStudentModalOpen, setEditStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<{user: User, info: StudentInfo} | null>(null);
    const [editedHours, setEditedHours] = useState(0);
    const [editedPayment, setEditedPayment] = useState(0);

    // Day Action Modal
    const [isActionModalOpen, setActionModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [actionTab, setActionTab] = useState<'drive' | 'block' | 'day'>('drive');
    
    // Drive tab state
    const [newLessonData, setNewLessonData] = useState({
        studentId: 0,
        time: '08:00',
        durationMinutes: 120,
        pickupAddress: '',
        dropoffAddress: ''
    });
    const [studentSearch, setStudentSearch] = useState('');

    // Block tab state
    const [blockType, setBlockType] = useState<'unavailable' | 'lecture'>('unavailable');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('11:00');

    // Reschedule Modal
    const [isRescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [eventToReschedule, setEventToReschedule] = useState<Lesson | TimeBlock | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');

    // Data filtering and memos
    const studentsToDisplay = useMemo(() => {
        if (selectedGroupId === 'all') return allStudents;
        return allStudents.filter(s => s.groupId === selectedGroupId);
    }, [allStudents, selectedGroupId]);

    const lessonsToDisplay = useMemo(() => {
        if (selectedGroupId === 'all') return lessons;
        const studentIdsInGroup = studentsToDisplay.map(s => s.id);
        return lessons.filter(l => studentIdsInGroup.includes(l.studentId));
    }, [lessons, studentsToDisplay, selectedGroupId]);
    
    const isDayOff = useMemo(() => {
        if (!selectedDate) return false;
        return daysOff.some(d => d.date.toDateString() === selectedDate.toDateString());
    }, [daysOff, selectedDate]);
    
    const filteredStudents = useMemo(() => {
        if (!studentSearch) return [];
        return studentsToDisplay.filter(s => 
            `${s.name.toLowerCase()} ${s.surname.toLowerCase()}`.includes(studentSearch.toLowerCase())
        );
    }, [studentSearch, studentsToDisplay]);
    
    const selectedStudent = useMemo(() => allStudents.find(s => s.id === newLessonData.studentId), [allStudents, newLessonData.studentId]);

    // Handlers
    const handleEditStudentClick = (user: User) => {
        const info = studentsInfo.find(i => i.userId === user.id);
        if (info) {
            setEditingStudent({ user, info });
            setEditedHours(info.hoursDriven);
            setEditedPayment(info.amountPaid);
            setEditStudentModalOpen(true);
        }
    };

    const handleSaveStudentInfo = () => {
        if (editingStudent) {
            updateStudentInfo(editingStudent.user.id, { hoursDriven: editedHours, amountPaid: editedPayment });
            setEditStudentModalOpen(false);
            setEditingStudent(null);
        }
    };

    const handleAdminDayClick = (date: Date) => {
        setSelectedDate(date);
        setNewLessonData({ studentId: 0, time: '08:00', durationMinutes: 120, pickupAddress: '', dropoffAddress: '' });
        setStudentSearch('');
        setActionTab('drive');
        setActionModalOpen(true);
    };
    
    const handleNewLessonDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewLessonData(prev => ({
            ...prev,
            [name]: name === 'durationMinutes' ? Number(value) : value
        }));
    };

    const handleAddLesson = () => {
        if (!selectedDate || !newLessonData.studentId || !newLessonData.pickupAddress || !newLessonData.dropoffAddress) {
            alert("Proszę wybrać kursanta i wypełnić wszystkie pola.");
            return;
        }
        const [hours, minutes] = newLessonData.time.split(':').map(Number);
        const lessonDate = new Date(selectedDate);
        lessonDate.setHours(hours, minutes);

        addLesson({
            studentId: newLessonData.studentId,
            date: lessonDate,
            pickupAddress: newLessonData.pickupAddress,
            dropoffAddress: newLessonData.dropoffAddress,
            durationMinutes: newLessonData.durationMinutes,
            confirmed: true
        });
        setActionModalOpen(false);
    };

    const handleAddBlock = () => {
        if (selectedDate) {
            addTimeBlock({
                date: selectedDate,
                startTime,
                endTime,
                type: blockType,
                title: blockType === 'lecture' ? 'Wykłady' : 'Niedostępny'
            });
        }
        setActionModalOpen(false);
    };

    const handleToggleDayOff = () => {
        if (selectedDate) {
            toggleDayOff(selectedDate);
            setActionModalOpen(false);
        }
    };

    const handleDeleteTimeBlock = (blockId: number) => {
        if(window.confirm('Czy na pewno chcesz usunąć ten blok czasowy?')) {
            deleteTimeBlock(blockId);
        }
    }

    const handleCancelLesson = (lessonId: number) => {
        if(window.confirm('Czy na pewno chcesz odwołać tę jazdę?')) {
            deleteLesson(lessonId);
        }
    }
    
    const handleOpenRescheduleModal = (event: Lesson | TimeBlock) => {
        setEventToReschedule(event);
        const eventDate = new Date(event.date);
        setNewDate(eventDate.toISOString().split('T')[0]);

        if ('startTime' in event) {
            setNewStartTime(event.startTime);
            setNewEndTime(event.endTime);
        } else {
            setNewStartTime(eventDate.toTimeString().substring(0, 5));
        }
        setRescheduleModalOpen(true);
    };

    const handleReschedule = () => {
        if (!eventToReschedule || !newDate || !newStartTime) return;

        const [year, month, day] = newDate.split('-').map(Number);
        const [hours, minutes] = newStartTime.split(':').map(Number);
        const updatedDate = new Date(year, month - 1, day, hours, minutes);

        if ('startTime' in eventToReschedule) {
            updateTimeBlock(eventToReschedule.id, { date: updatedDate, startTime: newStartTime, endTime: newEndTime });
        } else {
            updateLesson(eventToReschedule.id, { date: updatedDate });
        }
        setRescheduleModalOpen(false);
        setEventToReschedule(null);
    };


    // Reusable Views
    const GroupInfoView: React.FC<{students: User[]}> = ({students}) => (
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Informacje o Kursantach</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Imię i Nazwisko</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Godziny</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Wpłacono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Do Zapłaty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PKK</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {students.map(student => {
                            const info = studentsInfo.find(i => i.userId === student.id);
                            if (!info) return null;
                            const remaining = info.totalCourseCost - info.amountPaid;
                            return (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">{student.name} {student.surname}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{info.hoursDriven} / 30</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-green-600 dark:text-green-400">{info.amountPaid} zł</td>
                                    <td className={`px-6 py-4 whitespace-nowrap font-semibold ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{remaining} zł</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono">{info.pkkNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleEditStudentClick(student)} className="text-primary-600 hover:text-primary-800">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const ErrorLogView = () => (
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Dziennik Błędów Systemowych</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Tutaj wyświetlane są wszystkie błędy zarejestrowane w aplikacji.</p>
            <button onClick={() => logError({message: 'Manual test error logged by admin.', component: 'AdminDashboard'})} className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Zaloguj testowy błąd
            </button>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {errors.map(error => (
                    <div key={error.id} className="p-4 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <p className="font-semibold text-red-800 dark:text-red-300">{error.message}</p>
                        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            <span>Komponent: <span className="font-mono">{error.component}</span></span>
                            <span className="mx-2">|</span>
                            <span>Czas: <span className="font-mono">{error.timestamp.toLocaleString('pl-PL')}</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Main render
    return (
        <div className="min-h-screen">
            <Header theme={theme} onThemeChange={onThemeChange} />
            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap border-b border-gray-300 dark:border-gray-700 mb-4">
                        <button onClick={() => setActiveTab('calendar')} className={`py-2 px-4 ${activeTab === 'calendar' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Kalendarz</button>
                        <button onClick={() => setActiveTab('group')} className={`py-2 px-4 ${activeTab === 'group' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Kursanci</button>
                        <button onClick={() => setActiveTab('userManagement')} className={`py-2 px-4 ${activeTab === 'userManagement' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Zarządzanie Użytkownikami</button>
                        <button onClick={() => setActiveTab('groupManagement')} className={`py-2 px-4 ${activeTab === 'groupManagement' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Zarządzanie Grupami</button>
                        <button onClick={() => setActiveTab('school')} className={`py-2 px-4 ${activeTab === 'school' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>O Szkole</button>
                        <button onClick={() => setActiveTab('errors')} className={`py-2 px-4 ${activeTab === 'errors' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Dziennik Błędów</button>
                        <button onClick={() => setActiveTab('console')} className={`py-2 px-4 ${activeTab === 'console' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Konsola</button>
                    </div>

                    {(activeTab === 'calendar' || activeTab === 'group') && (
                         <div className="mb-4 max-w-sm">
                            <label htmlFor="group-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wyświetlana grupa:</label>
                            <select id="group-select" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                <option value="all">Wszystkie grupy</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {activeTab === 'calendar' && <Calendar lessonsToDisplay={lessonsToDisplay} onDayClick={() => {}} onInstructorDayClick={handleAdminDayClick} onConfirmLesson={confirmLesson} onCancelLesson={handleCancelLesson} onDeleteTimeBlock={handleDeleteTimeBlock} onRescheduleEvent={handleOpenRescheduleModal} />}
                    {activeTab === 'group' && <GroupInfoView students={studentsToDisplay} />}
                    {activeTab === 'userManagement' && <UserManagement />}
                    {activeTab === 'groupManagement' && <GroupManagement />}
                    {activeTab === 'school' && <EditableSchoolInfo />}
                    {activeTab === 'errors' && <ErrorLogView />}
                    {activeTab === 'console' && <Console />}
                </div>
            </main>

            {/* Modals */}
            {editingStudent && (
                <Modal isOpen={isEditStudentModalOpen} onClose={() => setEditStudentModalOpen(false)} title={`Edytuj dane - ${editingStudent.user.name} ${editingStudent.user.surname}`}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wyjeżdżone godziny</label>
                            <input type="number" id="hours" value={editedHours} onChange={e => setEditedHours(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="payment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wpłacona kwota (zł)</label>
                            <input type="number" id="payment" value={editedPayment} onChange={e => setEditedPayment(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                        </div>
                        <button onClick={handleSaveStudentInfo} className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700">Zapisz zmiany</button>
                    </div>
                </Modal>
            )}

             <Modal isOpen={isActionModalOpen} onClose={() => setActionModalOpen(false)} title={`Akcje na dzień ${selectedDate?.toLocaleDateString('pl-PL')}`}>
                <div className="space-y-4">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button onClick={() => setActionTab('drive')} className={`flex-1 py-2 text-sm ${actionTab === 'drive' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>Dodaj Jazdę</button>
                        <button onClick={() => setActionTab('block')} className={`flex-1 py-2 text-sm ${actionTab === 'block' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>Zablokuj Czas</button>
                        <button onClick={() => setActionTab('day')} className={`flex-1 py-2 text-sm ${actionTab === 'day' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>Zarządzaj Dniem</button>
                    </div>

                    {actionTab === 'drive' && (
                         <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium">Szukaj kursanta</label>
                                <input type="text" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Wpisz imię i nazwisko..." className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                                {studentSearch && (
                                    <ul className="border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-32 overflow-y-auto">
                                        {filteredStudents.length > 0 ? filteredStudents.map(s => (
                                            <li key={s.id} onClick={() => { setNewLessonData(p => ({...p, studentId: s.id })); setStudentSearch(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">{s.name} {s.surname}</li>
                                        )) : <li className="p-2 text-gray-500">Brak wyników</li>}
                                    </ul>
                                )}
                                {selectedStudent && <p className="mt-2 text-sm">Wybrano: <span className="font-bold">{selectedStudent.name} {selectedStudent.surname}</span></p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Godzina</label>
                                    <input type="time" name="time" value={newLessonData.time} onChange={handleNewLessonDataChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Czas (min)</label>
                                    <input type="number" name="durationMinutes" step="30" value={newLessonData.durationMinutes} onChange={handleNewLessonDataChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md" />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Miejsce odbioru</label>
                                <input type="text" name="pickupAddress" value={newLessonData.pickupAddress} onChange={handleNewLessonDataChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Miejsce zakończenia</label>
                                <input type="text" name="dropoffAddress" value={newLessonData.dropoffAddress} onChange={handleNewLessonDataChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md" />
                            </div>
                            <button onClick={handleAddLesson} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Dodaj Potwierdzoną Jazdę</button>
                        </div>
                    )}
                    
                    {actionTab === 'block' && (
                         <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium">Rodzaj</label>
                                <select value={blockType} onChange={e => setBlockType(e.target.value as 'unavailable' | 'lecture')} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md">
                                    <option value="unavailable">Czas niedostępny</option>
                                    <option value="lecture">Wykład</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Od</label>
                                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Do</label>
                                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md" />
                                </div>
                            </div>
                            <button onClick={handleAddBlock} className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 mt-4">Dodaj wydarzenie</button>
                        </div>
                    )}

                    {actionTab === 'day' && (
                        <div className="text-center p-4">
                            <p className="mb-4">Zarządzaj całym dniem jako niedostępnym.</p>
                            <button onClick={handleToggleDayOff} className={`w-full text-white py-2 rounded-md ${isDayOff ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
                                {isDayOff ? 'Odwołaj Dzień Wolny' : 'Ustaw Dzień Wolny'}
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={isRescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} title="Zmień termin wydarzenia">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nowa data</label>
                        <input type="date" id="newDate" value={newDate} onChange={e => setNewDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="newStartTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {eventToReschedule && 'startTime' in eventToReschedule ? 'Od' : 'Godzina'}
                            </label>
                            <input type="time" id="newStartTime" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                        </div>
                        {eventToReschedule && 'endTime' in eventToReschedule && (
                            <div>
                                <label htmlFor="newEndTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Do</label>
                                <input type="time" id="newEndTime" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                            </div>
                        )}
                    </div>
                    <button onClick={handleReschedule} className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 flex items-center justify-center space-x-2">
                        <CalendarDaysIcon className="w-5 h-5" />
                        <span>Zapisz zmianę terminu</span>
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;