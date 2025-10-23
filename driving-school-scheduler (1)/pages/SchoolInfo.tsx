import React from 'react';
import { useData } from '../contexts/DataContext';
import { InformationCircleIcon } from '../components/Icons';

const SchoolInfo: React.FC = () => {
    const { schoolInfo } = useData();
    return (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex items-center justify-center mb-6">
                <InformationCircleIcon className="w-8 h-8 text-primary-500 mr-3" />
                <h2 className="text-2xl font-bold text-center">Informacje o Szkole Jazdy</h2>
            </div>
            <div className="space-y-4 text-lg">
                <div className="flex flex-col sm:flex-row justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Nazwa szkoły:</span>
                    <span className="font-bold">{schoolInfo.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Instruktor prowadzący:</span>
                    <span>{schoolInfo.instructorName}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Telefon kontaktowy:</span>
                    <a href={`tel:${schoolInfo.phone}`} className="text-primary-500 hover:underline">{schoolInfo.phone}</a>
                </div>
                <div className="flex flex-col sm:flex-row justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Adres e-mail:</span>
                    <a href={`mailto:${schoolInfo.email}`} className="text-primary-500 hover:underline">{schoolInfo.email}</a>
                </div>
                <div className="flex flex-col sm:flex-row justify-between p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-800 dark:text-green-200">
                    <span className="font-semibold">Cena kursu podstawowego:</span>
                    <span className="font-bold text-xl">{schoolInfo.coursePrice} zł</span>
                </div>
            </div>
        </div>
    );
};

export default SchoolInfo;
