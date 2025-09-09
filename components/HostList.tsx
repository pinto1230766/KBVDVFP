import React, { useState, useMemo } from 'react';
import { Host, UnavailabilityPeriod } from '../types';
import { PlusIcon, TrashIcon, EditIcon, ChevronDownIcon, SearchIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { Avatar as CustomAvatar } from './Avatar';

interface HostListProps {
    onAddHost: () => void;
    onEditHost: (host: Host) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

type SortOption = 'name' | 'availability';

export const HostList: React.FC<HostListProps> = ({ onAddHost, onEditHost, isExpanded, onToggleExpand }) => {
    const { hosts, visits, deleteHost } = useData();
    const confirm = useConfirm();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('name');

    const isCurrentlyUnavailable = (unavailability: UnavailabilityPeriod[]): boolean => {
        if (!unavailability) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return unavailability.some(period => {
            const start = new Date(`${period.startDate}T00:00:00`);
            const end = new Date(`${period.endDate}T00:00:00`);
            return today >= start && today <= end;
        });
    };
    
    const filteredHosts = useMemo(() => {
        let hostsToProcess = hosts.filter(h => h.nom.toLowerCase().includes(searchTerm.toLowerCase()));

        if (sortOption === 'availability') {
            hostsToProcess.sort((a, b) => {
                const aUnavailable = isCurrentlyUnavailable(a.unavailability);
                const bUnavailable = isCurrentlyUnavailable(b.unavailability);
                if (aUnavailable === bUnavailable) {
                    return a.nom.localeCompare(b.nom); // Sort alphabetically within the same status
                }
                return aUnavailable ? 1 : -1; // false (available) comes first
            });
        }
        // 'name' sort is default and the initial list is already sorted by name
        return hostsToProcess;
    }, [hosts, searchTerm, sortOption]);


    const handleDelete = async (hostName: string) => {
        const assignedVisitsCount = visits.filter(v => v.host === hostName && v.status !== 'cancelled').length;
        let confirmMessage = `Êtes-vous sûr de vouloir supprimer "${hostName}" de la liste d'accueil ?`;

        if (assignedVisitsCount > 0) {
            const visitPlural = assignedVisitsCount > 1 ? 's' : '';
            confirmMessage += `\n\nATTENTION : Ce contact est assigné à ${assignedVisitsCount} visite${visitPlural} à venir. L'accueil pour cette/ces visite${visitPlural} sera réinitialisé à "À définir".`;
        }

        if(await confirm(confirmMessage)) {
            deleteHost(hostName);
        }
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 mt-8">
            <div className="flex justify-between items-center cursor-pointer" onClick={onToggleExpand}>
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-secondary dark:text-primary-light">Liste des contacts d'accueil</h2>
                     <span className="bg-gray-200 dark:bg-gray-700 text-text-muted dark:text-text-muted-dark text-sm font-semibold px-3 py-1 rounded-full">
                        {hosts.length}
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
                                    placeholder="Rechercher un contact..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary bg-card-light dark:bg-dark"
                                    aria-label="Rechercher un contact d'accueil"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="relative">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="w-full pl-3 pr-10 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary appearance-none bg-card-light dark:bg-dark"
                                    aria-label="Trier les contacts par"
                                >
                                    <option value="name">Trier par Nom</option>
                                    <option value="availability">Trier par Disponibilité</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onAddHost}
                            className="w-full md:w-auto flex-shrink-0 flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-2"/>
                            Ajouter un contact
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
                        {filteredHosts.length > 0 ? filteredHosts.map(host => {
                            const isUnavailable = isCurrentlyUnavailable(host.unavailability);
                            return (
                                <div key={host.nom} className="bg-gray-50 dark:bg-dark p-3 rounded-lg">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4 flex-grow min-w-0">
                                            <CustomAvatar item={host} size="w-12 h-12" />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold text-text-main dark:text-text-main-dark truncate" title={host.nom}>{host.nom}</p>
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isUnavailable ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                                                        {isUnavailable ? 'Indisponible' : 'Disponible'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text-muted dark:text-text-muted-dark truncate" title={host.telephone}>{host.telephone || 'Téléphone non renseigné'}</p>
                                                <p className="text-sm text-text-muted dark:text-text-muted-dark truncate" title={host.address}>{host.address || 'Adresse non renseignée'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                                            <button onClick={() => onEditHost(host)} className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Modifier"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(host.nom)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" title="Supprimer"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-center py-8 text-text-muted dark:text-text-muted-dark">Aucun contact d'accueil trouvé.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};