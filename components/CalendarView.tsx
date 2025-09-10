import React, { useState, useMemo } from 'react';
import { Visit, Speaker } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, UserIcon, EditIcon, InformationCircleIcon, HomeIcon, UtensilsIcon, PaperclipIcon, DocumentTextIcon, VideoCameraIcon } from './Icons';
import { useData } from '../contexts/DataContext';

interface CalendarViewProps {
    onEditVisit: (visit: Visit) => void;
}

interface DayDetails {
    date: Date;
    visit: Visit | null;
    history: Speaker[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onEditVisit }) => {
    const { visits, speakers } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const daysInMonth = useMemo(() => {
        const days = [];
        const startingDay = firstDayOfMonth.getDay(); 
        const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1; 

        for (let i = 0; i < adjustedStartingDay; i++) {
            days.push(null);
        }

        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        }
        return days;
    }, [currentDate]);

    const dataByDate = useMemo(() => {
        const map = new Map<string, { visit: Visit | null; history: Speaker[] }>();
        
        visits.forEach(visit => {
            const dateStr = visit.visitDate;
            if (!map.has(dateStr)) {
                map.set(dateStr, { visit: null, history: [] });
            }
            map.get(dateStr)!.visit = visit;
        });

        speakers.forEach(speaker => {
            if (speaker.talkHistory) {
                speaker.talkHistory.forEach(historyItem => {
                    const dateStr = historyItem.date;
                    if (!map.has(dateStr)) {
                        map.set(dateStr, { visit: null, history: [] });
                    }
                    // Avoid adding duplicates if multiple speakers visited on the same day
                    if (!map.get(dateStr)!.history.some(s => s.id === speaker.id)) {
                        map.get(dateStr)!.history.push(speaker);
                    }
                });
            }
        });
        return map;
    }, [visits, speakers]);


    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: Date, dayData: { visit: Visit | null, history: Speaker[] } | undefined) => {
        if (dayData && (dayData.visit || dayData.history.length > 0)) {
            setSelectedDay({
                date: day,
                visit: dayData.visit,
                history: dayData.history
            });
        }
    };
    
    const closeModal = () => setSelectedDay(null);
    
    const statusStyles: { [key: string]: { bg: string; dot: string; } } = {
        confirmed: {
            bg: 'bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:border-green-800',
            dot: 'bg-green-500'
        },
        pending: {
            bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:border-amber-800',
            dot: 'bg-amber-500'
        },
        cancelled: {
            bg: 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
            dot: 'bg-gray-400'
        }
    };
    
    const statusBadgeStyles: { [key: string]: { text: string; classes: string } } = {
        confirmed: {
            text: 'Confirmé',
            classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
        },
        pending: {
            text: 'En attente',
            classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
        },
        cancelled: {
            text: 'Annulé',
            classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        }
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronLeftIcon className="w-6 h-6 text-text-muted dark:text-text-muted-dark" />
                </button>
                <h3 className="text-xl font-bold text-text-main dark:text-text-main-dark">
                    {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronRightIcon className="w-6 h-6 text-text-muted dark:text-text-muted-dark" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-text-muted dark:text-text-muted-dark mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="border rounded-lg border-transparent"></div>;
                    
                    try {
                        const year = day.getFullYear();
                        const month = String(day.getMonth() + 1).padStart(2, '0');
                        const date = String(day.getDate()).padStart(2, '0');
                        const dayStr = `${year}-${month}-${date}`;

                        const dayData = dataByDate.get(dayStr);
                        const visit = dayData?.visit;
                        const isToday = new Date().toDateString() === day.toDateString();
                        const hasEvent = dayData && (dayData.visit || (dayData.history && dayData.history.length > 0));
                        const visitStatus = visit?.status || '';
                        const isZoom = visit?.locationType === 'zoom';
                        const isLocal = visit?.congregation?.toLowerCase().includes('lyon');

                        const cellClasses = `p-1 h-20 sm:h-24 border rounded-lg transition-colors flex flex-col items-center justify-start ${
                            hasEvent ? 'cursor-pointer' : ''
                        } ${
                            visitStatus && statusStyles[visitStatus] ? statusStyles[visitStatus].bg :
                            (dayData?.history?.length ?? 0) > 0 ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-700 dark:border-gray-700' : 
                            'bg-card-light dark:bg-card-dark border-gray-100 dark:border-dark'
                        }`;

                        return (
                            <div 
                                key={day.toString()} 
                                onClick={() => dayData && handleDayClick(day, dayData)}
                                className={cellClasses}
                            >
                                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                                    isToday ? 'bg-primary text-white font-bold' : 'text-text-main dark:text-text-main-dark'
                                }`}>
                                    {day.getDate()}
                                </span>
                                
                                {visit && visitStatus && statusStyles[visitStatus] && (
                                    <div className="mt-1 w-full px-1 text-center overflow-hidden flex flex-col items-center gap-1">
                                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-tight ${
                                            statusBadgeStyles[visitStatus]?.classes || 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                                        }`}>
                                            {statusBadgeStyles[visitStatus]?.text || 'Inconnu'}
                                        </span>
                                        <p className={`text-xs font-semibold text-text-main dark:text-text-main-dark leading-tight break-words ${
                                            visitStatus === 'cancelled' ? 'line-through' : ''
                                        }`} title={visit.nom || ''}>
                                            {visit.nom || 'Visite sans nom'}
                                        </p>
                                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                            {isZoom && <span title="Visite par Zoom"><VideoCameraIcon className="w-3 h-3 text-indigo-500" /></span>}
                                            {isLocal && !isZoom && <span title="Orateur Local"><HomeIcon className="w-3 h-3 text-blue-500" /></span>}
                                        </div>
                                    </div>
                                )}
                                
                                {dayData?.history?.length > 0 && !dayData.visit && (
                                    <div className="mt-1 w-full px-1 text-center overflow-hidden flex flex-col items-center gap-1">
                                        <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-tight bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            Passé
                                        </span>
                                        <p className="text-xs font-semibold text-text-muted dark:text-text-muted-dark leading-tight break-words" 
                                           title={dayData.history.map(s => s?.nom).filter(Boolean).join(', ')}>
                                            {dayData.history[0]?.nom || 'Orateur inconnu'}
                                            {dayData.history.length > 1 ? ` +${dayData.history.length - 1}` : ''}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    } catch (error) {
                        console.error('Error rendering calendar cell:', error);
                        return (
                            <div key={`error-${index}`} className="p-1 h-20 sm:h-24 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                <span className="text-xs text-red-500 dark:text-red-300">Erreur</span>
                            </div>
                        );
                    }
                })}
            </div>
             {selectedDay && selectedDay.visit && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={closeModal}>
                    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full sm:max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                             <h2 className="text-xl font-bold text-text-main dark:text-text-main-dark mb-4">
                                {selectedDay.date.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})}
                            </h2>
                            
                            {selectedDay.visit && (
                                <div>
                                    <h3 className="text-lg font-semibold text-secondary dark:text-primary-light mb-2 border-b border-border-light dark:border-border-dark pb-2">Visite programmée</h3>
                                    <div className="flex justify-between items-start mt-2">
                                        <div>
                                            <p className={`text-lg font-bold ${selectedDay.visit.status === 'cancelled' ? 'line-through' : ''}`}>{selectedDay.visit.nom}</p>
                                            <p className="text-sm text-text-muted dark:text-text-muted-dark">{selectedDay.visit.congregation}</p>
                                            {selectedDay.visit.locationType === 'zoom' && <div className="mt-1 text-sm font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><VideoCameraIcon className="w-4 h-4"/>Visite par Zoom</div>}
                                            {selectedDay.visit.congregation.toLowerCase().includes('lyon') && selectedDay.visit.locationType !== 'zoom' && <div className="mt-1 text-sm font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400"><HomeIcon className="w-4 h-4"/>Orateur Local</div>}
                                        </div>
                                        <button onClick={() => { onEditVisit(selectedDay.visit!); closeModal(); }} className="p-2 rounded-full text-text-muted dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-light">
                                            <EditIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    <div className="mt-2 space-y-2 text-text-main dark:text-text-main-dark">
                                        <p className="font-semibold text-sm">Prévu à {selectedDay.visit.visitTime}</p>
                                        {selectedDay.visit.talkTheme && (
                                            <div className="flex items-start space-x-3 pt-1">
                                                <DocumentTextIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                <p className="text-sm min-w-0">
                                                    <span className="font-semibold">Thème ({selectedDay.visit.talkNoOrType}):</span>
                                                    <span className="block text-text-muted dark:text-text-muted-dark">{selectedDay.visit.talkTheme}</span>
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-3 pt-1">
                                            <UserIcon className="w-5 h-5 text-primary" />
                                            <span>Accueil: <span className="font-semibold">{selectedDay.visit.host}</span></span>
                                        </div>
                                         <div className="flex items-center space-x-3">
                                            <HomeIcon className="w-5 h-5 text-primary" />
                                            <span className="truncate" title={selectedDay.visit.accommodation}>Hébergement: {selectedDay.visit.accommodation || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <UtensilsIcon className="w-5 h-5 text-primary" />
                                            <span className="truncate" title={selectedDay.visit.meals}>Repas: {selectedDay.visit.meals || 'N/A'}</span>
                                        </div>
                                         {selectedDay.visit.attachments && selectedDay.visit.attachments.length > 0 && (
                                            <div className="flex items-start space-x-3 pt-1">
                                                <PaperclipIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-sm font-semibold">Pièces jointes:</span>
                                                    <ul className="list-disc list-inside">
                                                    {selectedDay.visit.attachments.map((file, index) => (
                                                        <li key={index} className="text-sm truncate">
                                                            <a href={file.dataUrl} download={file.name} className="text-primary dark:text-primary-light hover:underline">{file.name}</a>
                                                        </li>
                                                    ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                        {selectedDay.visit.notes && (
                                            <div className="flex items-start space-x-3 pt-1">
                                                <InformationCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                <p className="text-sm min-w-0">
                                                    <span className="font-semibold">Notes:</span>
                                                    <span className="block text-text-muted dark:text-text-muted-dark whitespace-pre-wrap break-words">{selectedDay.visit.notes}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                             {selectedDay.history.length > 0 && (
                                <div className={selectedDay.visit ? 'mt-6' : ''}>
                                    <h3 className="text-lg font-semibold text-text-muted dark:text-text-muted-dark mb-2 border-b border-border-light dark:border-border-dark pb-2">Historique (Visites terminées)</h3>
                                    <ul className="mt-2 space-y-2">
                                        {selectedDay.history.map(speaker => (
                                            <li key={speaker.id} className="text-sm p-2 bg-gray-50 dark:bg-dark rounded-md">
                                                <span className="font-semibold text-text-main dark:text-text-main-dark">{speaker.nom}</span>
                                                <span className="text-text-muted dark:text-text-muted-dark"> - {speaker.congregation}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </div>
                        <div className="bg-gray-50 dark:bg-dark px-6 py-3 text-right border-t border-border-light dark:border-border-dark">
                             <button onClick={closeModal} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-700">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};