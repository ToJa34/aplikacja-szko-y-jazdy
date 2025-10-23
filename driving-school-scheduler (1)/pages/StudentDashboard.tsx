import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Lesson, StudentInfo } from '../types';
import { BellAlertIcon, TrashIcon } from '../components/Icons';
import SchoolInfo from './SchoolInfo';

interface DashboardProps {
    theme: string;
    onThemeChange: (newTheme: 'light' | 'dark' | 'system') => void;
}

const StudentDashboard: React.FC<DashboardProps> = ({ theme, onThemeChange }) => {
    const [activeTab, setActiveTab] = useState<'calendar' | 'info' | 'school'>('calendar');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [pickupAddress, setPickupAddress] = useState('');
    const [dropoffAddress, setDropoffAddress] = useState('');
    const [time, setTime] = useState('08:00');
    const [durationMinutes, setDurationMinutes] = useState(120);
    const { currentUser } = useAuth();
    const { lessons, studentsInfo, addLesson, logError, deleteLesson } = useData();

    const studentInfo = useMemo(() => {
        return studentsInfo.find(info => info.userId === currentUser?.id);
    }, [studentsInfo, currentUser]);

    const studentLessons = useMemo(() => {
        return lessons.filter(lesson => lesson.studentId === currentUser?.id);
    }, [lessons, currentUser]);

    const hasFutureLessons = useMemo(() => {
        return studentLessons.some(lesson => lesson.date > new Date());
    }, [studentLessons]);

    const handleDayClick = (day: Date) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        if (day < today) {
            alert("Nie można umówić jazdy w przeszłości.");
            return;
        }
        setSelectedDate(day);
        setIsModalOpen(true);
    };

    const getEndTime = () => {
        if (!time) return '';
        const [hours, minutes] = time.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(hours, minutes, 0, 0);
        endDate.setMinutes(endDate.getMinutes() + durationMinutes);
        return endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const handleBooking = () => {
        if (!selectedDate || !pickupAddress || !dropoffAddress || !currentUser) {
            logError({message: 'Booking failed: missing data.', component: 'StudentDashboard'});
            alert("Proszę wypełnić wszystkie pola.");
            return;
        };

        const [hours, minutes] = time.split(':').map(Number);
        const bookingDate = new Date(selectedDate);
        bookingDate.setHours(hours, minutes);

        // FIX: Added missing 'confirmed' property. Student bookings are unconfirmed by default.
        addLesson({ 
            studentId: currentUser.id, 
            date: bookingDate, 
            pickupAddress: pickupAddress,
            dropoffAddress: dropoffAddress,
            durationMinutes: durationMinutes,
            confirmed: false
        });
        setIsModalOpen(false);
        setPickupAddress('');
        setDropoffAddress('');
    };

    const handleCancelLesson = (lessonId: number) => {
        if (window.confirm('Czy na pewno chcesz odwołać tę jazdę?')) {
            deleteLesson(lessonId);
        }
    }

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert("Ta przeglądarka nie obsługuje powiadomień na pulpicie.");
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            alert('Zgoda na powiadomienia udzielona! Przypomnienia będą ustawiane automatycznie dla nowych jazd.');
        } else {
            alert('Nie udzielono zgody na powiadomienia.');
        }
    };
    
    const setReminder = (lesson: Lesson) => {
        if (Notification.permission !== 'granted') {
             alert('Najpierw musisz wyrazić zgodę na powiadomienia.');
             requestNotificationPermission();
             return;
        }
        const reminderTime = new Date(lesson.date.getTime() - 60 * 60 * 1000); // 1 hour before
        if (reminderTime > new Date()) {
             setTimeout(() => {
                  new Notification('Przypomnienie o jeździe', {
                      body: `Masz zaplanowaną jazdę za godzinę o ${lesson.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                  });
             }, reminderTime.getTime() - new Date().getTime());
             alert(`Ustawiono przypomnienie na godzinę przed jazdą.`);
        } else {
            alert(`Nie można ustawić przypomnienia dla tej jazdy (jest zbyt blisko w czasie lub już minęła).`);
        }
    };


    const InfoView: React.FC<{ info: StudentInfo | undefined }> = ({ info }) => {
        if (!info) return <div className="p-8 text-center">Brak informacji o kursancie.</div>;
        const remaining = info.totalCourseCost - info.amountPaid;
        return (
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">Informacje o Mnie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Wyjeżdżone godziny</p>
                        <p className="text-2xl font-semibold">{info.hoursDriven} / 30</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Wpłacono</p>
                        <p className="text-2xl font-semibold text-green-500">{info.amountPaid} zł</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pozostało do zapłaty</p>
                        <p className={`text-2xl font-semibold ${remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {remaining} zł
                        </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Numer PKK</p>
                        <p className="text-lg font-mono">{info.pkkNumber}</p>
                    </div>
                </div>
                <div className="pt-4 text-center">
                    <button onClick={requestNotificationPermission} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2 mx-auto">
                        <BellAlertIcon className="w-5 h-5"/>
                        <span>Zezwól na przypomnienia</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <Header theme={theme} onThemeChange={onThemeChange} />
            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex border-b border-gray-300 dark:border-gray-700 mb-4">
                        <button onClick={() => setActiveTab('calendar')} className={`py-2 px-4 ${activeTab === 'calendar' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Kalendarz</button>
                        <button onClick={() => setActiveTab('info')} className={`py-2 px-4 ${activeTab === 'info' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>Informacje o mnie</button>
                        <button onClick={() => setActiveTab('school')} className={`py-2 px-4 ${activeTab === 'school' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>O Szkole</button>
                    </div>

                    {activeTab === 'calendar' && (
                        <div>
                            {!hasFutureLessons && (
                                <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded-lg mb-4">
                                    <p className="font-semibold">Nie masz zaplanowanych żadnych jazd.</p>
                                    <p>Kliknij na dostępny dzień w kalendarzu, aby się umówić.</p>
                                </div>
                            )}
                            <Calendar lessonsToDisplay={studentLessons} onDayClick={handleDayClick} onInstructorDayClick={()=>{}}/>
                            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                <h3 className="font-bold text-lg mb-2">Twoje nadchodzące jazdy:</h3>
                                <ul className="space-y-2">
                                {studentLessons.filter(l => l.date > new Date()).map(lesson => (
                                    <li key={lesson.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                        <div>
                                            <span className="font-semibold">{lesson.date.toLocaleString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            <span> - {lesson.confirmed ? <span className="text-green-500">Potwierdzona</span> : <span className="text-yellow-500">Oczekuje</span>}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => setReminder(lesson)} title="Ustaw przypomnienie" className="text-primary-500 hover:text-primary-600 p-1"><BellAlertIcon className="w-5 h-5"/></button>
                                            {!lesson.confirmed && lesson.date > new Date() && <button onClick={() => handleCancelLesson(lesson.id)} title="Odwołaj jazdę" className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5"/></button>}
                                        </div>
                                    </li>
                                ))}
                                {studentLessons.filter(l => l.date > new Date()).length === 0 && <p>Brak nadchodzących jazd.</p>}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'info' && <InfoView info={studentInfo} />}
                    {activeTab === 'school' && <SchoolInfo />}
                </div>
            </main>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Umów jazdę na ${selectedDate?.toLocaleDateString('pl-PL')}`}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Godzina rozpoczęcia</label>
                            <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} step="1800" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Czas trwania (w minutach)</label>
                             <input 
                                type="number" 
                                id="duration" 
                                value={durationMinutes} 
                                onChange={e => setDurationMinutes(Number(e.target.value))}
                                step="30"
                                min="30"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                     <div className="text-sm text-center text-gray-600 dark:text-gray-400">
                        Przewidywany koniec: <span className="font-bold">{getEndTime()}</span>
                    </div>
                    <div>
                        <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Miejsce rozpoczęcia jazdy</label>
                        <input type="text" id="pickupAddress" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="np. ul. Słoneczna 10, Warszawa" />
                    </div>
                    <div>
                        <label htmlFor="dropoffAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Miejsce zakończenia jazdy</label>
                        <input type="text" id="dropoffAddress" value={dropoffAddress} onChange={e => setDropoffAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="np. ul. Księżycowa 5, Warszawa" />
                    </div>
                    <button onClick={handleBooking} className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700">Zapisz się na jazdę</button>
                </div>
            </Modal>
        </div>
    );
};

export default StudentDashboard;
