import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const AIHelper: React.FC = () => {
    const [errorInput, setErrorInput] = useState('');
    const [solution, setSolution] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAnalyze = async () => {
        if (!errorInput.trim()) return;
        setIsLoading(true);
        setSolution('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Jesteś pomocnym asystentem dla dewelopera aplikacji szkoły jazdy. Przeanalizuj poniższy błąd z aplikacji i podaj prawdopodobną przyczynę oraz rozwiązanie w języku polskim. Błąd: "${errorInput}"`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setSolution(response.text);

        } catch (error) {
            console.error("AI Helper Error:", error);
            setSolution('Wystąpił błąd podczas komunikacji z asystentem AI. Sprawdź konsolę przeglądarki, aby uzyskać więcej informacji.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 text-white text-sm h-full flex flex-col">
            <h3 className="font-bold mb-2">Asystent AI do rozwiązywania błędów</h3>
            <p className="text-xs text-gray-400 mb-4">Wklej komunikat o błędzie z dziennika, aby uzyskać pomoc.</p>
            <textarea
                value={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
                className="w-full h-24 p-2 bg-gray-900 border border-gray-600 rounded-md mb-2 text-xs"
                placeholder="Np. Failed to load user data."
            />
            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-500"
            >
                {isLoading ? 'Analizowanie...' : 'Analizuj błąd'}
            </button>
            {solution && (
                <div className="mt-4 p-2 bg-gray-900 border border-gray-600 rounded-md flex-grow overflow-y-auto">
                    <h4 className="font-bold mb-2">Sugerowane rozwiązanie:</h4>
                    <pre className="whitespace-pre-wrap text-xs">{solution}</pre>
                </div>
            )}
        </div>
    );
};

export default AIHelper;
