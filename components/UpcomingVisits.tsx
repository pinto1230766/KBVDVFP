import React, { useState, useMemo, useRef } from 'react';
import { Visit, MessageRole } from '../types';
import { CalendarIcon, EditIcon, TrashIcon, CheckIcon, InformationCircleIcon, ExclamationTriangleIcon, ChatBubbleOvalLeftEllipsisIcon, PlusIcon, DocumentTextIcon, VideoCameraIcon, EnvelopeIcon, EllipsisVerticalIcon, BellIcon, SparklesIcon, StreamingIcon, ZoomMeetingIcon, LocalSpeakerIcon } from './Icons';
import { UNASSIGNED_HOST } from '../constants';
import { useData } from '../contexts/DataContext';
import { Avatar } from './Avatar';

// FIX: Define props interface for UpcomingVisits component.
interface UpcomingVisitsProps {
    visits: Visit[];
    onEdit: (visit: Visit) => void;
    onDelete: (visitId: string) => void;
    onComplete: (visit: Visit) => void;
    onOpenMessageGenerator: (visit: Visit, role: MessageRole) => void;
    onScheduleFirst: () => void;
}

// Define types for state filtering.
type DateFilterType = 'all' | 'week' | 'month';
type StatusFilterType = 'all' | 'pending' | 'confirmed' | 'cancelled';

const formatMonth = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '');
const formatDay = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit' });
const formatWeekday = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long' });

const ChecklistItem: React.FC<{ label: string; done: boolean; icon: React.FC<any>; }> = ({ label, done, icon: Icon }) => (
    <div className="flex items-center gap-2" title={label}>
        <Icon className={`w-4 h-4 ${done ? 'text-green-500' : 'text-gray-400'}`} />
        <span className={`text-xs ${done ? 'font-semibold text-text-main dark:text-text-main-dark' : 'text-text-muted dark:text-text-muted-dark'}`}>{label}</span>
    </div>
);

const VisitCard: React.FC<{ visit: Visit; onEdit: (visit: Visit) => void; onDelete: (visitId: string) => void; onComplete: (visit: Visit) => void; onOpenMessageGenerator: (visit: Visit, role: MessageRole) => void; }> = ({ visit, onEdit, onDelete, onComplete, onOpenMessageGenerator }) => {
    const { hosts } = useData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const hostExists = useMemo(() => visit.host === UNASSIGNED_HOST || hosts.some(h => h.nom === visit.host), [hosts, visit.host]);
    const isLocalSpeaker = visit.congregation.toLowerCase().includes('lyon');
    const isZoom = visit.locationType === 'zoom';

    // Pré-calculer les valeurs ARIA pour éviter les erreurs de linter strict
    const menuExpanded = isMenuOpen ? 'true' : 'false';
    const menuLabel = isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu';

    const statusClasses = {
        confirmed: { border: 'border-green-500' },
        pending: { border: 'border-amber-500' },
        cancelled: { border: 'border-red-500' },
    };
    const currentStatusClasses = statusClasses[visit.status || 'pending'];

    const comms = visit.communicationStatus || {};
    const prep = comms.preparation || {};
    const reminder7 = comms.reminder7days || {};
    const thanks = comms.thanks || {};

     // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div className={`bg-card-light dark:bg-card-dark rounded-xl shadow-lg flex border-l-8 ${currentStatusClasses.border} transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 w-full items-center">
                
                {/* Column 1: Date & Speaker Info */}
                <div className="md:col-span-5 flex items-center space-x-4 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark pb-4 md:pb-0 md:pr-6">
                    <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg w-20 flex-shrink-0">
                        <span className="text-sm font-bold text-primary dark:text-primary-light">{formatMonth(visit.visitDate)}</span>
                        <span className="text-4xl font-bold text-text-main dark:text-text-main-dark tracking-tight">{formatDay(visit.visitDate)}</span>
                        <span className="text-xs text-text-muted dark:text-text-muted-dark capitalize">{formatWeekday(visit.visitDate)}</span>
                    </div>
                    <div className="min-w-0 flex-grow">
                        <div className="flex items-center space-x-3">
                            <Avatar item={visit} size="w-12 h-12" />
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-bold text-secondary dark:text-primary-light truncate" title={visit.nom}>{visit.nom}</h3>
                                    {isZoom && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">Zoom</span>}
                                    {isLocalSpeaker && !isZoom && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">Local</span>}
                                </div>
                                <p className="text-sm text-text-muted dark:text-text-muted-dark truncate" title={visit.congregation}>{visit.congregation}</p>
                            </div>
                        </div>
                        {visit.talkTheme && (
                            <div className="flex items-start space-x-2 mt-2">
                                <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-text-muted dark:text-text-muted-dark min-w-0" title={`${visit.talkNoOrType ? `(${visit.talkNoOrType}) ` : ''}${visit.talkTheme}`}>
                                    <span className="font-semibold text-text-main dark:text-text-main-dark">{visit.talkNoOrType ? `(${visit.talkNoOrType})` : ''}</span> {visit.talkTheme}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Host Assignment & Message Status */}
                <div className="md:col-span-3 flex flex-col items-center justify-center text-center py-4 md:py-0">
                     {isZoom ? (
                        <div className="flex items-center text-indigo-600 dark:text-indigo-400">
                            <ZoomMeetingIcon className="w-5 h-5 mr-2" />
                            <span className="font-semibold">Visite par Zoom</span>
                        </div>
                    ) : isLocalSpeaker ? (
                         <div className="flex items-center text-blue-600 dark:text-blue-400">
                            <LocalSpeakerIcon className="w-5 h-5 mr-2" />
                            <span className="font-semibold">Sur place (Orateur local)</span>
                        </div>
                    ) : visit.host === UNASSIGNED_HOST ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                                <span className="font-semibold">Accueil à définir</span>
                            </div>
                            <button onClick={() => onEdit(visit)} className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors">
                                Assigner
                            </button>
                        </div>
                    ) : visit.host === 'Zoom' ? (
                        <div className="flex items-center text-blue-600 dark:text-blue-400">
                            <ZoomMeetingIcon className="w-5 h-5 mr-2" />
                            <span className="font-semibold">Zoom</span>
                        </div>
                    ) : visit.host === 'Streaming' ? (
                        <div className="flex items-center text-purple-600 dark:text-purple-400">
                            <StreamingIcon className="w-5 h-5 mr-2" />
                            <span className="font-semibold">Streaming</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-2 w-full">
                            <div>
                                <p className="text-sm text-text-muted dark:text-text-muted-dark">Accueil par :</p>
                                <p className="font-bold text-lg text-text-main dark:text-text-main-dark truncate" title={visit.host}>{visit.host}</p>
                                {!hostExists && (
                                    <div title="Cet hôte a été supprimé. Veuillez modifier la visite." className="flex items-center justify-center text-amber-600 dark:text-amber-400 mt-1">
                                        <ExclamationTriangleIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                             <div className="mt-4 w-full bg-gray-50 dark:bg-dark p-3 rounded-lg space-y-2">
                                <h4 className="text-xs font-bold text-left text-text-muted dark:text-text-muted-dark uppercase">Check-list Comms</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left">
                                    <ChecklistItem label="Prépa Orateur" done={!!prep.speaker} icon={EnvelopeIcon} />
                                    <ChecklistItem label="Prépa Accueil" done={!!prep.host} icon={EnvelopeIcon} />
                                    <ChecklistItem label="Rappel J-7" done={!!reminder7.speaker || !!reminder7.host} icon={BellIcon} />
                                    <ChecklistItem label="Remerciements" done={!!thanks.speaker || !!thanks.host} icon={SparklesIcon} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Column 3: Actions */}
                <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-border-light dark:border-border-dark pt-4 md:pt-0 md:pl-6">
                    <div className="flex flex-col space-y-2">
                         <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => onOpenMessageGenerator(visit, 'speaker')} 
                                className="flex items-center justify-center p-2 text-sm font-semibold bg-gray-100 text-text-main dark:bg-gray-700 dark:text-text-main-dark rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                aria-label={`Envoyer un message à l'orateur ${visit.speakerName || ''}`}
                            >
                                <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 mr-1.5" aria-hidden="true"/>
                                <span>Orateur</span>
                            </button>
                            <button 
                                onClick={() => onOpenMessageGenerator(visit, 'host')} 
                                disabled={visit.host === UNASSIGNED_HOST || isLocalSpeaker || isZoom} 
                                className="flex items-center justify-center p-2 text-sm font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/50 transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                                aria-label={visit.host === UNASSIGNED_HOST || isLocalSpeaker || isZoom ? 'Option non disponible' : `Envoyer un message à l'hôte ${visit.host || ''}`}
                            >
                                <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 mr-1.5" aria-hidden="true"/>
                                <span>Accueil</span>
                            </button>
                        </div>
                        <div className="flex justify-end items-center space-x-1 mt-2">
                             <button 
                                onClick={() => onEdit(visit)} 
                                className="p-2 rounded-full text-text-muted dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-light transition-colors flex items-center justify-center" 
                                aria-label={`Modifier la visite de ${visit.speakerName || 'l\'orateur'}`}
                                type="button"
                            >
                                <EditIcon className="w-5 h-5" aria-hidden="true" />
                                <span className="sr-only">Modifier</span>
                            </button>
                             <div className="relative" ref={menuRef}>
                                <button 
                                    onClick={() => setIsMenuOpen((prev: boolean) => !prev)} 
                                    className="p-2 rounded-full text-text-muted dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    aria-label={menuLabel}
                                    {...(isMenuOpen ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
                                    aria-haspopup="true"
                                    type="button"
                                >
                                    <EllipsisVerticalIcon className="w-5 h-5" aria-hidden="true" />
                                    <span className="sr-only">{menuLabel}</span>
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                                        <div className="py-1">
                                            <button 
                                                onClick={() => { onComplete(visit); setIsMenuOpen(false); }} 
                                                className="w-full text-left flex items-center px-4 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                type="button"
                                                aria-label={`Marquer la visite de ${visit.speakerName || 'cet orateur'} comme terminée`}
                                            >
                                                <CheckIcon className="w-4 h-4 mr-3" aria-hidden="true" /> 
                                                <span>Terminer la visite</span>
                                            </button>
                                            <button 
                                                onClick={() => { onDelete(visit.visitId); setIsMenuOpen(false); }} 
                                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                type="button"
                                                aria-label={`Supprimer la visite de ${visit.speakerName || 'cet orateur'}`}
                                            >
                                                <TrashIcon className="w-4 h-4 mr-3" aria-hidden="true" /> 
                                                <span>Supprimer</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({ visits, onEdit, onDelete, onComplete, onOpenMessageGenerator, onScheduleFirst }) => {
    const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
    
    const filteredVisits = useMemo(() => {
        let statusFilteredVisits;
        if (statusFilter === 'all') {
            statusFilteredVisits = visits.filter(v => v.status === 'confirmed' || v.status === 'pending');
        } else if (statusFilter === 'pending') {
            // En attente = visites qui ont besoin d'un accueil à définir
            statusFilteredVisits = visits.filter(v => 
                v.host === UNASSIGNED_HOST && 
                v.status !== 'cancelled' && 
                v.locationType === 'physical' && 
                !v.congregation.toLowerCase().includes('lyon')
            );
        } else if (statusFilter === 'confirmed') {
            // Confirmé = toutes les visites avec status 'confirmed'
            statusFilteredVisits = visits.filter(v => v.status === 'confirmed');
        } else if (statusFilter === 'cancelled') {
            // Annulé = toutes les visites avec status 'cancelled'
            statusFilteredVisits = visits.filter(v => v.status === 'cancelled');
        } else {
            statusFilteredVisits = visits.filter(v => v.status === statusFilter);
        }
        
        if (dateFilter === 'all') {
            return statusFilteredVisits;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (dateFilter === 'week') {
            const endOfWeek = new Date(now);
            const dayOfWeek = now.getDay();
            const diff = 7 - (dayOfWeek === 0 ? 7 : dayOfWeek);
            endOfWeek.setDate(now.getDate() + diff);
            endOfWeek.setHours(23, 59, 59, 999);
            return statusFilteredVisits.filter(v => {
                const visitDate = new Date(`${v.visitDate}T00:00:00`);
                return visitDate >= now && visitDate <= endOfWeek;
            });
        }

        if (dateFilter === 'month') {
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            return statusFilteredVisits.filter(v => {
                const visitDate = new Date(`${v.visitDate}T00:00:00`);
                return visitDate >= now && visitDate <= endOfMonth;
            });
        }
        return statusFilteredVisits;
    }, [visits, dateFilter, statusFilter]);
    
    const FilterButton = <T extends string>({ label, value, active, onClick }: { label: string; value: T; active: boolean; onClick: (v: T) => void; }) => {
      // Pré-calculer la valeur ARIA pour éviter les erreurs de linter strict
      const pressedValue = active ? 'true' : 'false';
      
      return (
        <button
          onClick={() => onClick(value)}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 ${
            active 
              ? 'bg-white dark:bg-card-dark shadow-md text-primary dark:text-primary-light scale-105' 
              : 'text-text-muted dark:text-text-muted-dark hover:bg-white/70 dark:hover:bg-card-dark/70'
          }`}
          {...(active ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
          aria-label={`Filtrer par ${label}`}
        >
          {label}
        </button>
      );
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-secondary dark:text-primary-light shrink-0">Prochaines visites</h2>
                <div className="w-full md:w-auto flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-dark p-1.5 rounded-xl">
                        <FilterButton<DateFilterType> label="Toutes" value="all" active={dateFilter === 'all'} onClick={setDateFilter} />
                        <FilterButton<DateFilterType> label="Cette semaine" value="week" active={dateFilter === 'week'} onClick={setDateFilter} />
                        <FilterButton<DateFilterType> label="Ce mois-ci" value="month" active={dateFilter === 'month'} onClick={setDateFilter} />
                    </div>
                     <div className="grid grid-cols-4 gap-2 bg-gray-100 dark:bg-dark p-1.5 rounded-xl">
                        <FilterButton<StatusFilterType> label="Actives" value="all" active={statusFilter === 'all'} onClick={setStatusFilter} />
                        <FilterButton<StatusFilterType> label="En attente" value="pending" active={statusFilter === 'pending'} onClick={setStatusFilter} />
                        <FilterButton<StatusFilterType> label="Confirmé" value="confirmed" active={statusFilter === 'confirmed'} onClick={setStatusFilter} />
                        <FilterButton<StatusFilterType> label="Annulé" value="cancelled" active={statusFilter === 'cancelled'} onClick={setStatusFilter} />
                    </div>
                </div>
            </div>

            {filteredVisits.length === 0 ? (
                visits.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-card-light dark:bg-card-dark rounded-lg shadow-md">
                        <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                        <h2 className="mt-4 text-2xl font-semibold text-text-main dark:text-text-main-dark">Aucune visite programmée</h2>
                        <p className="mt-2 text-text-muted dark:text-text-muted-dark">Commencez par planifier une visite depuis la liste des orateurs.</p>
                        <button
                            onClick={onScheduleFirst}
                            className="mt-6 primary-button"
                            aria-label="Programmer une première visite"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Programmer une première visite
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-12 px-6 bg-card-light dark:bg-card-dark rounded-lg shadow-md">
                        <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                        <h2 className="mt-4 text-2xl font-semibold text-text-main dark:text-text-main-dark">Aucune visite pour ce filtre</h2>
                        <p className="mt-2 text-text-muted dark:text-text-muted-dark">Modifiez votre sélection pour voir d'autres visites à venir.</p>
                    </div>
                )
            ) : (
                <div className="space-y-6">
                    {filteredVisits.map((visit, index) => {
                        // Limiter le délai d'animation à 500ms maximum pour éviter des retards trop longs
                        const delayClass = `animate-delay-${Math.min(Math.floor(index * 0.1), 5)}`;
                        return (
                            <div key={visit.visitId} className={`animate-fade-in-up ${delayClass}`}>
                                <VisitCard 
                                    visit={visit} 
                                    onEdit={onEdit} 
                                    onDelete={onDelete} 
                                    onComplete={onComplete}
                                    onOpenMessageGenerator={onOpenMessageGenerator}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};