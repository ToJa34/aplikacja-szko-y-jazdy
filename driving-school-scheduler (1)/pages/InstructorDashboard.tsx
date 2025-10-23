import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import Modal from '../components/Modal';
import { useData } from '../contexts/DataContext';
import { CalendarDaysIcon } from '../components/Icons';
import { StudentInfo, User, Lesson, TimeBlock, DayOff } from '../types';
import EditableSchoolInfo from './EditableSchoolInfo';
import UserManagement from './UserManagement';
import GroupManagement from './GroupManagement';


interface DashboardProps {
    theme: string;
    onThemeChange: (newTheme: 'light' | 'dark' | 'system') => void;
}

const InstructorDashboard: React.FC<DashboardProps> = ({ theme, onThemeChange }) => {
    const [activeTab, setActiveTab] = useState<'calendar' | 'userManagement' | 'groupManagement' | 'school'>('calendar');
    const { 
        allStudents, 
        lessons,
        confirmLesson, 
        deleteLesson,
        updateLesson,
        addLesson,
        daysOff,
        toggleDayOff, 
        addTimeBlock,
        deleteTimeBlock,
        updateTimeBlock
    } = useData();
    
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

    const unconfirmedLessonsCount = useMemo(() => lessons.filter(l => !l.confirmed).length, [lessons]);
    const isDayOff = useMemo(() => {
        if (!selectedDate) return false;
        return daysOff.some(d => d.date.toDateString() === selectedDate.toDateString());
    }, [daysOff, selectedDate]);

    const filteredStudents = useMemo(() => {
        if (!studentSearch) return [];
        return allStudents.filter(s => 
            `${s.name.toLowerCase()} ${s.surname.toLowerCase()}`.includes(studentSearch.toLowerCase())
        );
    }, [studentSearch, allStudents]);
    
    const handleInstructorDayClick = (date: Date) => {
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

        if ('startTime' in event) { // TimeBlock
            setNewStartTime(event.startTime);
            setNewEndTime(event.endTime);
        } else { // Lesson
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
    
    const selectedStudent = useMemo(() => allStudents.find(s => s.id === newLessonData.studentId), [allStudents, newLessonData.studentId]);

    return (
        <div className="min-h-screen">
            <Header theme={theme} onThemeChange={onThemeChange} />
            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap border-b border-gray-300 dark:border-gray-700 mb-4">
                        <button onClick={() => setActiveTab('calendar')} className={`py-2 px-4 relative ${activeTab === 'calendar' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>
                            Kalendarz
                            {unconfirmedLessonsCount > 0 && 
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unconfirmedLessonsCount}
                                </span>
                            }
                        </button>
                        <button onClick={() => setActiveTab('userManagement')} className={`py-2 px-4 ${activeTab === 'userManagement' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Zarządzanie Użytkownikami</button>
                        <button onClick={() => setActiveTab('groupManagement')} className={`py-2 px-4 ${activeTab === 'groupManagement' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Zarządzanie Grupami</button>
                        <button onClick={() => setActiveTab('school')} className={`py-2 px-4 ${activeTab === 'school' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>O Szkole</button>
                    </div>

                    {activeTab === 'calendar' && <Calendar lessonsToDisplay={lessons} onDayClick={() => {}} onInstructorDayClick={handleInstructorDayClick} onConfirmLesson={confirmLesson} onCancelLesson={handleCancelLesson} onDeleteTimeBlock={handleDeleteTimeBlock} onRescheduleEvent={handleOpenRescheduleModal} />}
                    {activeTab === 'userManagement' && <UserManagement />}
                    {activeTab === 'groupManagement' && <GroupManagement />}
                    {activeTab === 'school' && <EditableSchoolInfo />}
                </div>
            </main>

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

export default InstructorDashboard;