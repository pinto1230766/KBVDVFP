import React, { useState, useMemo } from 'react';
import { Speaker } from '../types';
import { PlusIcon, SearchIcon, ChevronDownIcon, UserCircleIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { Avatar } from './Avatar';

interface SpeakerListProps {
    onSchedule: (speaker: Speaker) => void;
    onAddSpeaker: () => void;
    onEditSpeaker: (speaker: Speaker) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

type SortOption = 'name' | 'congregation' | 'lastVisit';

export const SpeakerList: React.FC<SpeakerListProps> = ({ onSchedule, onAddSpeaker, onEditSpeaker, isExpanded, onToggleExpand }) => {
    const { speakers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCongregation, setSelectedCongregation] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('name');

    const congregations = useMemo(() => {
        const allCongs = speakers.map(s => s.congregation);
        return [...new Set(allCongs)].sort();
    }, [speakers]);
    
    const getMostRecentVisitDate = (speaker: Speaker): Date | null => {
        if (!speaker.talkHistory || speaker.talkHistory.length === 0) {
            return null;
        }
        const mostRecent = speaker.talkHistory.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date) ? current : latest;
        });
        return new Date(mostRecent.date + 'T00:00:00');
    };

    const filteredSpeakers = useMemo(() => {
        let speakersToSort = speakers.filter(speaker => {
            const searchTermMatch = searchTerm === '' ||
                speaker.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                speaker.congregation.toLowerCase().includes(searchTerm.toLowerCase());
            
            const congregationMatch = selectedCongregation === '' || speaker.congregation === selectedCongregation;

            return searchTermMatch && congregationMatch;
        });

        switch (sortOption) {
            case 'congregation':
                speakersToSort.sort((a, b) => a.congregation.localeCompare(b.congregation) || a.nom.localeCompare(b.nom));
                break;
            case 'lastVisit':
                speakersToSort.sort((a, b) => {
                    const dateA = getMostRecentVisitDate(a)?.getTime() || 0;
                    const dateB = getMostRecentVisitDate(b)?.getTime() || 0;
                    if (dateA === 0 && dateB !== 0) return -1; // Nulls (never visited) first
                    if (dateA !== 0 && dateB === 0) return 1;
                    return dateA - dateB; // Oldest first
                });
                break;
            case 'name':
            default:
                speakersToSort.sort((a, b) => a.nom.localeCompare(b.nom));
                break;
        }
        return speakersToSort;
    }, [speakers, searchTerm, selectedCongregation, sortOption]);

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 mt-8">
             <div className="flex justify-between items-center cursor-pointer" onClick={onToggleExpand}>
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-secondary dark:text-primary-light">Liste des orateurs</h2>
                    <span className="bg-gray-200 dark:bg-gray-700 text-text-muted dark:text-text-muted-dark text-sm font-semibold px-3 py-1 rounded-full">
                        {speakers.length}
                    </span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-text-muted dark:text-text-muted-dark transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 mb-4">
                        <div className="flex flex-col md:flex-row gap-4 flex-grow w-full md:w-auto">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="Rechercher un orateur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary bg-card-light dark:bg-dark"
                                    aria-label="Rechercher un orateur"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                             <div className="flex-grow md:flex-grow-0 grid grid-cols-2 md:flex md:flex-row gap-4">
                                <div className="relative">
                                    <select
                                        value={selectedCongregation}
                                        onChange={(e) => setSelectedCongregation(e.target.value)}
                                        className="w-full pl-3 pr-10 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary appearance-none bg-card-light dark:bg-dark"
                                        aria-label="Filtrer par congrégation"
                                    >
                                        <option value="">Toutes les congrégations</option>
                                        {congregations.map(cong => (
                                            <option key={cong} value={cong}>{cong}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                                 <div className="relative">
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                                        className="w-full pl-3 pr-10 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary appearance-none bg-card-light dark:bg-dark"
                                        aria-label="Trier les orateurs par"
                                    >
                                        <option value="name">Trier par Nom</option>
                                        <option value="congregation">Trier par Congrégation</option>
                                        <option value="lastVisit">Trier par Dernière visite</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onAddSpeaker}
                            className="w-full md:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Ajouter un orateur
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {filteredSpeakers.length > 0 ? (
                            filteredSpeakers.map(speaker => {
                                const lastVisitDate = getMostRecentVisitDate(speaker);
                                return (
                                <div key={speaker.id} className="bg-gray-50 dark:bg-dark p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-grow min-w-0">
                                        <Avatar item={speaker} size="w-12 h-12" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-lg text-text-main dark:text-text-main-dark truncate" title={speaker.nom}>{speaker.nom}</p>
                                            <p className="text-sm text-text-muted dark:text-text-muted-dark truncate" title={speaker.congregation}>{speaker.congregation}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-text-muted dark:text-text-muted-dark w-full sm:w-auto text-left sm:text-center shrink-0 sm:mx-4">
                                        <p>Dernière visite :</p>
                                        <p className="font-semibold text-text-main dark:text-text-main-dark">{lastVisitDate ? lastVisitDate.toLocaleDateString('fr-FR') : 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                                        <button
                                            onClick={() => onEditSpeaker(speaker)}
                                            className="p-2 text-text-muted dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            aria-label={`Détails pour ${speaker.nom}`}
                                            title="Détails"
                                        >
                                            <UserCircleIcon className="w-6 h-6" />
                                        </button>
                                        <button 
                                            onClick={() => onSchedule(speaker)} 
                                            className="flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            <PlusIcon className="w-5 h-5 sm:mr-2" />
                                            <span className="hidden sm:inline">Programmer</span>
                                        </button>
                                    </div>
                                </div>
                            )})
                        ) : (
                             <div className="text-center py-12 px-6">
                                <UserCircleIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                                <h3 className="mt-4 text-xl font-semibold text-text-main dark:text-text-main-dark">Aucun orateur trouvé</h3>
                                <p className="mt-1 text-text-muted dark:text-text-muted-dark">Essayez de modifier vos filtres de recherche.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};