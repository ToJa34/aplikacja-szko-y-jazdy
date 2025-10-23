import React, { useState } from 'react';
import { Lesson, DayOff, Role, TimeBlock } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, ClockIcon, AcademicCapIcon, NoSymbolIcon, TrashIcon, CalendarDaysIcon } from './Icons';

interface CalendarProps {
    lessonsToDisplay: Lesson[];
    onDayClick: (day: Date) => void;
    onInstructorDayClick: (day: Date) => void;
    onConfirmLesson?: (lessonId: number) => void;
    onCancelLesson?: (lessonId: number) => void;
    onDeleteTimeBlock?: (blockId: number) => void;
    onRescheduleEvent?: (event: Lesson | TimeBlock) => void;
}

const Calendar: React.FC<CalendarProps> = ({ lessonsToDisplay, onDayClick, onInstructorDayClick, onConfirmLesson, onCancelLesson, onDeleteTimeBlock, onRescheduleEvent }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { currentUser } = useAuth();
    const { daysOff, timeBlocks, allStudents } = useData();

    const daysOfWeek = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
    const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

    const getStudentName = (studentId: number) => {
        const student = allStudents.find(s => s.id === studentId);
        return student ? `${student.name} ${student.surname}` : 'Nieznany';
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        return (
            <div className="grid grid-cols-4 md:grid-cols-7 gap-1 text-center font-semibold mb-2">
                {daysOfWeek.map(day => <div key={day} className="hidden md:block">{day}</div>)}
                {daysOfWeek.slice(0, 4).map(day => <div key={day + '-mobile'} className="block md:hidden">{day}</div>)}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        let dayOfWeek = startDate.getDay();
        if (dayOfWeek === 0) dayOfWeek = 7;
        startDate.setDate(startDate.getDate() - (dayOfWeek - 1));

        const endDate = new Date(monthEnd);
        let endDayOfWeek = endDate.getDay();
        if (endDayOfWeek === 0) endDayOfWeek = 7;
        // Ensure the grid is always full by adding days to the end
        if(endDayOfWeek !== 7) {
            endDate.setDate(endDate.getDate() + (7 - endDayOfWeek));
        }
        
        const allDaysInView = [];
        let day = new Date(startDate);
        
        while(day <= endDate) {
             allDaysInView.push(new Date(day));
             day.setDate(day.getDate() + 1);
        }

        return (
            <div className="grid grid-cols-4 md:grid-cols-7 gap-1 md:gap-2">
            {allDaysInView.map((day) => {
                 const cloneDay = new Date(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = new Date().toDateString() === day.toDateString();
                const isDayOff = daysOff.some(d => d.date.toDateString() === day.toDateString());

                const dayEvents = [
                    ...lessonsToDisplay.filter(l => l.date.toDateString() === day.toDateString())
                        .map(l => ({ ...l, type: 'lesson', time: l.date.getHours() * 60 + l.date.getMinutes() })),
                    ...timeBlocks.filter(tb => tb.date.toDateString() === day.toDateString())
                        .map(tb => {
                            const [startH, startM] = tb.startTime.split(':').map(Number);
                            return { ...tb, time: startH * 60 + startM };
                        })
                ].sort((a, b) => a.time - b.time);

                let eventsForCell = dayEvents;
                if (currentUser?.role === Role.Student) {
                    eventsForCell = dayEvents.filter(e => e.type !== 'lesson' || (e.type === 'lesson' && e.studentId === currentUser.id));
                }
                
                return (
                    <div
                        key={day.toString()}
                        className={`p-1 md:p-2 h-28 md:h-36 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-y-auto group
                        ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400' : 'bg-white/50 dark:bg-gray-900/50'} 
                        ${isToday ? 'border-2 border-primary-500' : ''}
                        ${isDayOff ? 'bg-red-100 dark:bg-red-900/50' : ''}
                        transition-all duration-200 cursor-pointer backdrop-blur-sm`}
                        onClick={() => {
                            if (currentUser?.role === Role.Student && !isDayOff) onDayClick(cloneDay);
                            if (currentUser?.role === Role.Instructor || currentUser?.role === Role.Admin) onInstructorDayClick(cloneDay);
                        }}
                    >
                        <span className={`font-bold ${isToday ? 'text-primary-500' : ''}`}>{day.getDate()}</span>
                        {isDayOff && <span className="text-xs text-red-500 font-bold">WOLNE</span>}
                        <div className="flex-grow mt-1 space-y-1 text-xs">
                            {eventsForCell.map(event => {
                                if ('confirmed' in event) { // It's a Lesson
                                    return (
                                        <div key={`lesson-${event.id}`} className={`relative p-1 rounded ${event.confirmed ? 'bg-green-100 dark:bg-green-800/50' : 'bg-yellow-100 dark:bg-yellow-800/50'}`}>
                                            <div className="font-semibold">{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            {(currentUser?.role === Role.Instructor || currentUser?.role === Role.Admin) && <div>{getStudentName(event.studentId)}</div>}
                                            <div className="flex items-center justify-center space-x-1 mt-1">
                                                {event.confirmed ? 
                                                  <><CheckCircleIcon className="w-4 h-4 text-green-500"/><span>Potwierdzona</span></>
                                                : <><ClockIcon className="w-4 h-4 text-yellow-500"/><span>Oczekuje</span></>}
                                            </div>
                                            {(currentUser?.role === Role.Instructor || currentUser?.role === Role.Admin) &&
                                                <div className="flex space-x-1 mt-1 justify-center">
                                                    {!event.confirmed && onConfirmLesson &&
                                                        <button onClick={(e) => { e.stopPropagation(); onConfirmLesson(event.id); }} className="flex-1 text-xs bg-primary-500 text-white py-0.5 rounded hover:bg-primary-600">
                                                            Potwierdź
                                                        </button>
                                                    }
                                                    {onRescheduleEvent && 
                                                        <button onClick={(e) => { e.stopPropagation(); onRescheduleEvent(event); }} title="Zmień termin" className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"><CalendarDaysIcon className="w-3 h-3"/></button>
                                                    }
                                                    {onCancelLesson && 
                                                        <button onClick={(e) => { e.stopPropagation(); onCancelLesson(event.id); }} title="Odwołaj" className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><TrashIcon className="w-3 h-3"/></button>
                                                    }
                                                </div>
                                            }
                                        </div>
                                    )
                                } else { // It's a TimeBlock
                                    return (
                                        <div key={`block-${event.id}`} className={`relative p-1 rounded ${event.type === 'lecture' ? 'bg-blue-100 dark:bg-blue-800/50' : 'bg-gray-200 dark:bg-gray-600/50'}`}>
                                            <div className="font-semibold">{event.startTime} - {event.endTime}</div>
                                            <div className="flex items-center justify-center space-x-1 mt-1">
                                                {event.type === 'lecture' ? <AcademicCapIcon className="w-4 h-4 text-blue-500"/> : <NoSymbolIcon className="w-4 h-4 text-gray-500"/>}
                                                <span>{event.title}</span>
                                            </div>
                                            {(currentUser?.role === Role.Instructor || currentUser?.role === Role.Admin) && onDeleteTimeBlock && onRescheduleEvent && (
                                                <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); onRescheduleEvent(event); }} title="Zmień termin" className="p-0.5 bg-blue-500 text-white rounded hover:bg-blue-600"><CalendarDaysIcon className="w-3 h-3"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); onDeleteTimeBlock(event.id); }} title="Usuń" className="p-0.5 bg-red-500 text-white rounded hover:bg-red-600"><TrashIcon className="w-3 h-3"/></button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </div>
                )
            })}
            </div>
        )
    };

    return (
        <div className="p-2 md:p-4 bg-gray-100/50 dark:bg-gray-900/50 rounded-lg shadow-inner backdrop-blur-md">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
             {(currentUser?.role === Role.Instructor || currentUser?.role === Role.Admin) && (
                <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    Kliknij na dacie, aby dodać wydarzenie lub oznaczyć dzień jako wolny. Najedź na wydarzenie, aby zobaczyć opcje.
                </div>
            )}
        </div>
    );
};

export default Calendar;