import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';

const Login: React.FC = () => {
    const { login } = useAuth();
    const { schoolInfo, groups, addUser } = useData();
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [error, setError] = useState('');

    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
    });

    const [registrationData, setRegistrationData] = useState({
        name: '',
        surname: '',
        username: '',
        password: '',
        confirmPassword: '',
        pkkNumber: '',
        groupId: groups[0]?.id || 1,
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRegistrationData(prev => ({ 
            ...prev, 
            [name]: name === 'groupId' ? Number(value) : value 
        }));
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = login(loginData.username, loginData.password);
        if (!user) {
            setError('Nieprawidłowa nazwa użytkownika lub hasło.');
        } else {
            setError('');
        }
    };
    
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if(registrationData.password !== registrationData.confirmPassword) {
            setError("Hasła nie są zgodne.");
            return;
        }
        const { confirmPassword, ...dataToSubmit } = registrationData;

        const newUser = addUser({ ...dataToSubmit });
        if(newUser) {
            alert(`Rejestracja pomyślna dla ${newUser.name}! Możesz się teraz zalogować.`);
            setIsRegistering(false);
            setError('');
             setRegistrationData({
                name: '', surname: '', username: '', password: '', confirmPassword: '', pkkNumber: '', groupId: groups[0]?.id || 1,
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Witaj w {schoolInfo.name}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {isRegistering ? 'Utwórz nowe konto kursanta' : 'Zaloguj się do swojego konta'}
                    </p>
                </div>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                
                {isRegistering ? 
                    (
                        <form className="space-y-4" onSubmit={handleRegister}>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="name" type="text" placeholder="Imię" required value={registrationData.name} onChange={handleRegistrationChange} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
                                <input name="surname" type="text" placeholder="Nazwisko" required value={registrationData.surname} onChange={handleRegistrationChange} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
                            </div>
                            <input name="username" type="text" placeholder="Nazwa użytkownika" required value={registrationData.username} onChange={handleRegistrationChange} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
                            <input name="password" type="password" placeholder="Hasło" required value={registrationData.password} onChange={handleRegistrationChange} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
                            <input name="confirmPassword" type="password" placeholder="Potwierdź hasło" required value={registrationData.confirmPassword} onChange={handleRegistrationChange} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
                            <input name="pkkNumber" type="text" placeholder="Numer PKK (20 cyfr)" required pattern="\d{20}" title="PKK musi składać się z 20 cyfr" value={registrationData.pkkNumber} onChange={handleRegistrationChange} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
                            <div>
                                <label htmlFor="group" className="block text-sm font-medium">Wybierz grupę</label>
                                <select id="group" name="groupId" value={registrationData.groupId} onChange={handleRegistrationChange} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700">
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                                    Zarejestruj się
                                </button>
                            </div>
                            <p className="text-center text-sm">
                                Masz już konto?{' '}
                                <button type="button" onClick={() => setIsRegistering(false)} className="font-medium text-primary-600 hover:text-primary-500">
                                    Zaloguj się
                                </button>
                            </p>
                        </form>
                    ) : 
                    (
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa użytkownika</label>
                                <input id="username" name="username" type="text" required value={loginData.username} onChange={handleLoginChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
                            </div>
                            <div>
                                <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hasło</label>
                                <input id="password" name="password" type="password" required value={loginData.password} onChange={handleLoginChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <a href="#" onClick={(e) => { e.preventDefault(); setForgotPasswordOpen(true); }} className="font-medium text-primary-600 hover:text-primary-500">
                                    Zapomniałeś hasła?
                                </a>
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                                    Zaloguj się
                                </button>
                            </div>
                            <p className="text-center text-sm">
                                Nie masz konta?{' '}
                                <button type="button" onClick={() => setIsRegistering(true)} className="font-medium text-primary-600 hover:text-primary-500">
                                    Zarejestruj się
                                </button>
                            </p>
                        </form>
                    )
                }
            </div>
            <Modal isOpen={isForgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} title="Resetowanie Hasła">
                <div className="text-center">
                    <p>Aby zresetować hasło, skontaktuj się bezpośrednio z administratorem lub instruktorem.</p>
                    <button onClick={() => setForgotPasswordOpen(false)} className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md">
                        Rozumiem
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Login;
