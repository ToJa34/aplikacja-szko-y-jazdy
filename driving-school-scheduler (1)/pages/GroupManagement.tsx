import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Group } from '../types';
import { PencilIcon, TrashIcon, CheckCircleIcon } from '../components/Icons';

const GroupManagement: React.FC = () => {
    const { groups, addGroup, updateGroup, deleteGroup } = useData();
    const [newGroupName, setNewGroupName] = useState('');
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');

    const handleAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            addGroup(newGroupName.trim());
            setNewGroupName('');
        }
    };

    const handleEditClick = (group: Group) => {
        setEditingGroupId(group.id);
        setEditingGroupName(group.name);
    };

    const handleSaveEdit = (groupId: number) => {
        if (editingGroupName.trim()) {
            updateGroup(groupId, editingGroupName.trim());
            setEditingGroupId(null);
            setEditingGroupName('');
        }
    };

    const handleDeleteGroup = (groupId: number) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę grupę? Można usunąć tylko puste grupy.')) {
            deleteGroup(groupId);
        }
    };


    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Zarządzanie Grupami Kursantów</h2>
            
            <div className="max-w-xl mx-auto">
                {/* Add new group form */}
                <form onSubmit={handleAddGroup} className="flex items-center space-x-2 mb-6">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Nazwa nowej grupy"
                        className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        Dodaj Grupę
                    </button>
                </form>

                {/* List of groups */}
                <div className="space-y-3">
                    {groups.map(group => (
                        <div key={group.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {editingGroupId === group.id ? (
                                <input
                                    type="text"
                                    value={editingGroupName}
                                    onChange={(e) => setEditingGroupName(e.target.value)}
                                    className="flex-grow px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900"
                                    autoFocus
                                />
                            ) : (
                                <span className="font-semibold">{group.name}</span>
                            )}
                            
                            <div className="flex items-center space-x-2">
                                {editingGroupId === group.id ? (
                                    <button onClick={() => handleSaveEdit(group.id)} title="Zapisz" className="text-green-500 hover:text-green-700 p-1">
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button onClick={() => handleEditClick(group)} title="Zmień nazwę" className="text-blue-500 hover:text-blue-700 p-1">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => handleDeleteGroup(group.id)} title="Usuń grupę" className="text-red-500 hover:text-red-700 p-1">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupManagement;