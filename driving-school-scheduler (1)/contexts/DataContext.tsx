import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Lesson, StudentInfo, AppError, DayOff, User, TimeBlock, SchoolInfoType, Group, RegistrationData, Role } from '../types';
import { LESSONS, STUDENTS_INFO, ERRORS, DAYS_OFF, USERS, TIME_BLOCKS, SCHOOL_INFO_INITIAL, GROUPS_INITIAL } from '../constants';

interface DataContextType {
  lessons: Lesson[];
  studentsInfo: StudentInfo[];
  errors: AppError[];
  daysOff: DayOff[];
  timeBlocks: TimeBlock[];
  users: User[];
  allStudents: User[];
  groups: Group[];
  schoolInfo: SchoolInfoType;
  addLesson: (lesson: Omit<Lesson, 'id'>) => void;
  deleteLesson: (lessonId: number) => void;
  updateLesson: (lessonId: number, data: Partial<Omit<Lesson, 'id' | 'studentId'>>) => void;
  confirmLesson: (lessonId: number) => void;
  toggleDayOff: (date: Date) => void;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  deleteTimeBlock: (blockId: number) => void;
  updateTimeBlock: (blockId: number, data: Partial<Omit<TimeBlock, 'id'>>) => void;
  updateStudentInfo: (userId: number, data: Partial<Pick<StudentInfo, 'hoursDriven' | 'amountPaid'>>) => void;
  updateSchoolInfo: (data: Partial<SchoolInfoType>) => void;
  logError: (error: Omit<AppError, 'id'|'timestamp'>) => void;
  addUser: (data: RegistrationData) => User | null;
  deleteUser: (userId: number) => void;
  updateUser: (userId: number, data: Partial<User>) => void;
  addGroup: (name: string) => void;
  updateGroup: (groupId: number, name: string) => void;
  deleteGroup: (groupId: number) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [studentsInfo, setStudentsInfo] = useState<StudentInfo[]>(STUDENTS_INFO);
  const [errors, setErrors] = useState<AppError[]>(ERRORS);
  const [daysOff, setDaysOff] = useState<DayOff[]>(DAYS_OFF);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(TIME_BLOCKS);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfoType>(SCHOOL_INFO_INITIAL);
  const [groups, setGroups] = useState<Group[]>(GROUPS_INITIAL);
  
  const allStudents = React.useMemo(() => users.filter(u => u.role === Role.Student), [users]);

  useEffect(() => {
    (window as any).getUsers = () => users;
    (window as any).getLessons = () => lessons;
    (window as any).getErrors = () => errors;
    (window as any).getStudentsInfo = () => studentsInfo;
    (window as any).getGroups = () => groups;
    return () => {
        delete (window as any).getUsers;
        delete (window as any).getLessons;
        delete (window as any).getErrors;
        delete (window as any).getStudentsInfo;
        delete (window as any).getGroups;
    }
  }, [users, lessons, errors, studentsInfo, groups]);

  const addUser = (data: RegistrationData): User | null => {
      if (users.some(u => u.username === data.username)) {
          alert('Użytkownik o tej nazwie już istnieje.');
          return null;
      }
      const newUser: User = {
          id: Date.now(),
          name: data.name,
          surname: data.surname,
          username: data.username,
          password: data.password,
          role: Role.Student,
          groupId: data.groupId,
      };
      const newStudentInfo: StudentInfo = {
          userId: newUser.id,
          hoursDriven: 0,
          amountPaid: 0,
          totalCourseCost: schoolInfo.coursePrice,
          pkkNumber: data.pkkNumber
      };
      setUsers(prev => [...prev, newUser]);
      setStudentsInfo(prev => [...prev, newStudentInfo]);
      return newUser;
  };

  const deleteUser = (userId: number) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setStudentsInfo(prev => prev.filter(si => si.userId !== userId));
    setLessons(prev => prev.filter(l => l.studentId !== userId));
  }
  
  const updateUser = (userId: number, data: Partial<User>) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  };
  
  const addLesson = (lessonData: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = { ...lessonData, id: Date.now() };
    if (typeof newLesson.confirmed === 'undefined') {
        newLesson.confirmed = false;
    }
    setLessons(prev => [...prev, newLesson].sort((a,b) => a.date.getTime() - b.date.getTime()));
  };
  
  const deleteLesson = (lessonId: number) => {
      setLessons(prev => prev.filter(l => l.id !== lessonId));
  };
  
  const updateLesson = (lessonId: number, data: Partial<Omit<Lesson, 'id'|'studentId'>>) => {
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...data } : l));
  };

  const confirmLesson = (lessonId: number) => {
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, confirmed: true } : l));
  };
  
  const toggleDayOff = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayOff = daysOff.find(d => d.date.getTime() === dateOnly.getTime());

    if (dayOff) {
        setDaysOff(prev => prev.filter(d => d.id !== dayOff.id));
    } else {
        const newDayOff: DayOff = { id: Date.now(), date: dateOnly };
        setDaysOff(prev => [...prev, newDayOff]);
    }
  };

  const addTimeBlock = (blockData: Omit<TimeBlock, 'id'>) => {
      const newBlock: TimeBlock = { ...blockData, id: Date.now() };
      setTimeBlocks(prev => [...prev, newBlock]);
  };

  const deleteTimeBlock = (blockId: number) => {
      setTimeBlocks(prev => prev.filter(b => b.id !== blockId));
  };
  
  const updateTimeBlock = (blockId: number, data: Partial<Omit<TimeBlock, 'id'>>) => {
      setTimeBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...data } : b));
  };

  const updateStudentInfo = (userId: number, data: Partial<Pick<StudentInfo, 'hoursDriven' | 'amountPaid'>>) => {
      setStudentsInfo(prev => prev.map(info => 
          info.userId === userId ? { ...info, ...data } : info
      ));
  };
  
  const updateSchoolInfo = (data: Partial<SchoolInfoType>) => {
      setSchoolInfo(prev => ({...prev, ...data}));
  };

  const logError = (errorData: Omit<AppError, 'id'|'timestamp'>) => {
      const newError: AppError = { ...errorData, id: Date.now(), timestamp: new Date() };
      setErrors(prev => [newError, ...prev]);
  };

  const addGroup = (name: string) => {
      const newGroup: Group = { id: Date.now(), name };
      setGroups(prev => [...prev, newGroup]);
  };

  const updateGroup = (groupId: number, name: string) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name } : g));
  };

  const deleteGroup = (groupId: number) => {
      const isGroupInUse = users.some(u => u.groupId === groupId);
      if (isGroupInUse) {
          alert('Nie można usunąć grupy, do której przypisani są kursanci.');
          return false;
      }
      setGroups(prev => prev.filter(g => g.id !== groupId));
      return true;
  };

  return (
    <DataContext.Provider value={{ 
        lessons, studentsInfo, errors, daysOff, timeBlocks, users, allStudents, groups, schoolInfo,
        addLesson, deleteLesson, updateLesson, confirmLesson, 
        toggleDayOff, 
        addTimeBlock, deleteTimeBlock, updateTimeBlock,
        updateStudentInfo, updateSchoolInfo, logError,
        addUser, deleteUser, updateUser,
        addGroup, updateGroup, deleteGroup
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};