import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { SchoolInfoType } from '../types';
import { PencilIcon } from '../components/Icons';

const EditableSchoolInfo: React.FC = () => {
    const { schoolInfo, updateSchoolInfo } = useData();
    const [formData, setFormData] = useState<SchoolInfoType>(schoolInfo);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(schoolInfo);
    }, [schoolInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'coursePrice' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSchoolInfo(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex items-center justify-center mb-6">
                 <PencilIcon className="w-8 h-8 text-primary-500 mr-3" />
                <h2 className="text-2xl font-bold text-center">Edytuj Informacje o Szkole</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa szkoły</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="instructorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instruktor prowadzący</label>
                    <input type="text" id="instructorName" name="instructorName" value={formData.instructorName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon kontaktowy</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adres e-mail</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                 <div>
                    <label htmlFor="coursePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cena kursu (zł)</label>
                    <input type="number" id="coursePrice" name="coursePrice" value={formData.coursePrice} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                <div className="flex items-center justify-end space-x-4 pt-4">
                    {isSaved && <p className="text-sm text-green-500 transition-opacity duration-300">Zmiany zostały zapisane!</p>}
                    <button type="submit" className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700">
                        Zapisz zmiany
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditableSchoolInfo;
