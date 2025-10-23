import { Role, User, StudentInfo, Lesson, AppError, DayOff, TimeBlock, Group, SchoolInfoType } from './types';

export const SCHOOL_INFO_INITIAL: SchoolInfoType = {
    name: "Ośrodek Szkolenia Kierowców DZIESIĄTKA",
    instructorName: "Krzysztof Charewicz",
    phone: "695 022 251",
    email: "kontakt@dziesiatka.pl",
    coursePrice: 3000,
};

export const GROUPS_INITIAL: Group[] = [
  { id: 1, name: 'Grupa A (Weekendowa)' },
  { id: 2, name: 'Grupa B (Tygodniowa)' },
];

export const USERS: User[] = [
  { id: 1, name: 'Jan', surname: 'Kowalski', role: Role.Student, username: 'student', password: 'password', groupId: 1 },
  { id: 2, name: 'Anna', surname: 'Nowak', role: Role.Student, username: 'student2', password: 'password', groupId: 2 },
  { id: 3, name: 'Krzysztof', surname: 'Charewicz', role: Role.Instructor, username: 'kcharewicz', password: '737371' },
  { id: 4, name: 'Mikołaj', surname: 'Charewicz', role: Role.Admin, username: 'mcharewicz', password: '737371' },
];

export const STUDENTS_INFO: StudentInfo[] = [
  { userId: 1, hoursDriven: 15, amountPaid: 1500, totalCourseCost: 3000, pkkNumber: '12345678901234567890' },
  { userId: 2, hoursDriven: 25, amountPaid: 2800, totalCourseCost: 3000, pkkNumber: '09876543210987654321' },
];

const today = new Date();
export const LESSONS: Lesson[] = [
  { id: 1, studentId: 1, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0), pickupAddress: 'ul. Główna 1, Warszawa', dropoffAddress: 'ul. Główna 1, Warszawa', durationMinutes: 120, confirmed: true },
  { id: 2, studentId: 2, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0), pickupAddress: 'ul. Boczna 5, Kraków', dropoffAddress: 'ul. Rynkowa 2, Kraków', durationMinutes: 60, confirmed: true },
  { id: 3, studentId: 1, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 8, 0), pickupAddress: 'ul. Główna 1, Warszawa', dropoffAddress: 'ul. Główna 1, Warszawa', durationMinutes: 120, confirmed: false },
];

export const DAYS_OFF: DayOff[] = [
    { id: 1, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10) }
]

export const TIME_BLOCKS: TimeBlock[] = [
    { id: 1, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), startTime: '17:00', endTime: '20:00', type: 'lecture', title: 'Wykłady - teoria' }
];

export const ERRORS: AppError[] = [
    {id: 1, timestamp: new Date(), message: 'Failed to load user data.', component: 'Login'}
];