import React, { useState, useMemo } from 'react';
import { Visit, Speaker, Host } from '../types';
import { SearchIcon, XIcon, CalendarIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { Avatar } from './Avatar';

interface GlobalSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEditVisit: (visit: Visit) => void;
    onEditSpeaker: (speaker: Speaker) => void;
    onEditHost: (host: Host) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
    isOpen,
    onClose,
    onEditVisit,
    onEditSpeaker,
    onEditHost,
}) => {
    const { speakers, visits, hosts } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return { speakers: [], visits: [], hosts: [] };
        }
        const lowerCaseTerm = searchTerm.toLowerCase();

        const filteredSpeakers = speakers.filter(s =>
            s.nom.toLowerCase().includes(lowerCaseTerm) ||
            s.congregation.toLowerCase().includes(lowerCaseTerm)
        );

        const filteredVisits = visits.filter(v =>
            v.nom.toLowerCase().includes(lowerCaseTerm) ||
            v.host.toLowerCase().includes(lowerCaseTerm)
        );
        
        const filteredHosts = hosts.filter(h =>
            h.nom.toLowerCase().includes(lowerCaseTerm) ||
            (h.telephone && h.telephone.includes(lowerCaseTerm))
        );

        return { speakers: filteredSpeakers, visits: filteredVisits, hosts: filteredHosts };
    }, [searchTerm, speakers, visits, hosts]);
    
    const hasResults = searchResults.speakers.length > 0 || searchResults.visits.length > 0 || searchResults.hosts.length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center p-4 sm:p-6 md:p-8" onClick={onClose}>
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full sm:max-w-2xl flex flex-col max-h-full animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center">
                    <SearchIcon className="w-6 h-6 text-gray-400 mr-3 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Rechercher un orateur, une visite, un frère pour l'accueil..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-lg bg-transparent focus:outline-none text-text-main dark:text-text-main-dark"
                        autoFocus
                    />
                     <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ml-3">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto p-4">
                    {searchTerm.trim() && !hasResults && (
                         <div className="text-center py-12">
                            <p className="text-lg text-text-muted dark:text-text-muted-dark">Aucun résultat trouvé pour "{searchTerm}"</p>
                        </div>
                    )}
                    
                    {searchResults.speakers.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold text-sm uppercase text-text-muted dark:text-text-muted-dark px-2 mb-2">Orateurs</h3>
                            <ul className="space-y-1">
                                {searchResults.speakers.map(speaker => (
                                    <li key={speaker.id} onClick={() => onEditSpeaker(speaker)} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                        <Avatar item={speaker} />
                                        <div className="ml-3">
                                            <p className="font-semibold text-text-main dark:text-text-main-dark">{speaker.nom}</p>
                                            <p className="text-sm text-text-muted dark:text-text-muted-dark">{speaker.congregation}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                     {searchResults.visits.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold text-sm uppercase text-text-muted dark:text-text-muted-dark px-2 mb-2">Visites programmées</h3>
                            <ul className="space-y-1">
                                {searchResults.visits.map(visit => (
                                    <li key={visit.visitId} onClick={() => onEditVisit(visit)} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                        <CalendarIcon className="w-10 h-10 text-primary bg-primary/10 p-2 rounded-full flex-shrink-0" />
                                        <div className="ml-3">
                                            <p className="font-semibold text-text-main dark:text-text-main-dark">{visit.nom}</p>
                                            <p className="text-sm text-text-muted dark:text-text-muted-dark">Le {new Date(visit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR')} - Accueil: {visit.host}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {searchResults.hosts.length > 0 && (
                        <div>
                            <h3 className="font-bold text-sm uppercase text-text-muted dark:text-text-muted-dark px-2 mb-2">Frères pour l'accueil</h3>
                            <ul className="space-y-1">
                                {searchResults.hosts.map(host => (
                                    <li key={host.nom} onClick={() => onEditHost(host)} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                        <Avatar item={host} />
                                        <div className="ml-3">
                                            <p className="font-semibold text-text-main dark:text-text-main-dark">{host.nom}</p>
                                            <p className="text-sm text-text-muted dark:text-text-muted-dark">{host.telephone || 'N/A'}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};