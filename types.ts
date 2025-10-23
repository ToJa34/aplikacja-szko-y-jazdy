export enum Role {
  Student = 'KURSANT',
  Instructor = 'INSTRUKTOR',
  Admin = 'ADMINISTRATOR',
}

export interface Group {
    id: number;
    name: string;
}

export interface User {
  id: number;
  name: string;
  surname: string;
  role: Role;
  username: string;
  password?: string;
  groupId?: number;
}

export interface StudentInfo {
  userId: number;
  hoursDriven: number;
  amountPaid: number;
  totalCourseCost: number;
  pkkNumber: string;
}

export interface Lesson {
  id: number;
  studentId: number;
  date: Date;
  pickupAddress: string;
  dropoffAddress: string;
  durationMinutes: number;
  confirmed: boolean;
}

export interface AppError {
    id: number;
    timestamp: Date;
    message: string;
    component: string;
}

export interface DayOff {
    id: number;
    date: Date;
}

export interface TimeBlock {
    id: number;
    date: Date;
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    type: 'lecture' | 'unavailable';
    title: string;
}

export interface SchoolInfoType {
    name: string;
    instructorName: string;
    phone: string;
    email: string;
    coursePrice: number;
}

export interface RegistrationData {
    name: string;
    surname: string;
    username: string;
    password: string;
    pkkNumber: string;
    groupId: number;
}
