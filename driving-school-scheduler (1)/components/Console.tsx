import React, { useState, useRef, useEffect } from 'react';
import AIHelper from './AIHelper';

interface HistoryItem {
    type: 'input' | 'output' | 'error';
    content: string;
}

const Console: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [command, setCommand] = useState('');
    const [activeSideTab, setActiveSideTab] = useState<'commands' | 'ai'>('commands');
    const endOfHistoryRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [history]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        const newHistory: HistoryItem[] = [...history, { type: 'input', content: command }];

        try {
            const result = eval.call(window, command); 
            let output: string;
            if (result === undefined) output = 'undefined';
            else if (result === null) output = 'null';
            else if (typeof result === 'object') output = JSON.stringify(result, null, 2);
            else output = result.toString();

            newHistory.push({ type: 'output', content: output });
        } catch (error: any) {
            newHistory.push({ type: 'error', content: error.message });
        }

        setHistory(newHistory);
        setCommand('');
    };

    const commands = [
        { cmd: 'window.getUsers()', desc: 'Wyświetl wszystkich użytkowników' },
        { cmd: 'window.getLessons()', desc: 'Wyświetl wszystkie lekcje' },
        { cmd: 'window.getErrors()', desc: 'Wyświetl wszystkie błędy' },
        { cmd: 'window.getStudentsInfo()', desc: 'Wyświetl info o kursantach' },
    ];

    const CommandList = () => (
        <div className="p-2 space-y-2">
            <h3 className="font-bold text-white">Pomocne komendy</h3>
            <ul className="space-y-1">
                {commands.map(c => (
                    <li key={c.cmd}>
                        <button 
                            onClick={() => setCommand(c.cmd)} 
                            className="text-left w-full p-1 rounded hover:bg-gray-600"
                        >
                            <p className="text-cyan-400">{c.cmd}</p>
                            <p className="text-xs text-gray-400">{c.desc}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="bg-gray-800 rounded-lg shadow-md h-[70vh] flex">
            <div className="bg-gray-900 text-white font-mono text-sm flex-grow flex flex-col">
                <div className="p-2 bg-gray-800 rounded-tl-lg">
                    <p className="text-gray-400">Aplikacja Konsola</p>
                </div>
                <div className="flex-grow p-4 overflow-y-auto">
                    {history.map((item, index) => (
                        <div key={index} className="flex">
                            {item.type === 'input' && <div className="flex w-full"><span className="text-gray-500 mr-2">&gt;</span><span>{item.content}</span></div>}
                            {item.type === 'output' && <pre className="whitespace-pre-wrap break-all text-green-400">{item.content}</pre>}
                            {item.type === 'error' && <div className="flex w-full"><span className="text-red-500 mr-2">Error:</span><span className="text-red-400">{item.content}</span></div>}
                        </div>
                    ))}
                    <div ref={endOfHistoryRef} />
                </div>
                <form onSubmit={handleFormSubmit} className="flex items-center p-2 border-t border-gray-700">
                    <span className="text-gray-500 mr-2">&gt;</span>
                    <input type="text" value={command} onChange={e => setCommand(e.target.value)} className="w-full bg-transparent focus:outline-none" placeholder="Wpisz polecenie..." autoFocus/>
                </form>
            </div>
            <div className="w-1/3 border-l border-gray-700 flex flex-col">
                <div className="flex border-b border-gray-700">
                    <button onClick={() => setActiveSideTab('commands')} className={`flex-1 p-2 text-sm ${activeSideTab === 'commands' ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-600`}>Komendy</button>
                    <button onClick={() => setActiveSideTab('ai')} className={`flex-1 p-2 text-sm ${activeSideTab === 'ai' ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-600`}>Asystent AI</button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {activeSideTab === 'commands' && <CommandList />}
                    {activeSideTab === 'ai' && <AIHelper />}
                </div>
            </div>
        </div>
    );
};

export default Console;
