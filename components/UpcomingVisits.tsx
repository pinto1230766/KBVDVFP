import React, { useState, useMemo, useRef } from 'react';
import { Visit, MessageRole } from '../types';
import { CalendarIcon, EditIcon, TrashIcon, CheckIcon, InformationCircleIcon, ExclamationTriangleIcon, ChatBubbleOvalLeftEllipsisIcon, PlusIcon, DocumentTextIcon, VideoCameraIcon, EnvelopeIcon, EllipsisVerticalIcon, BellIcon, SparklesIcon, StreamingIcon, ZoomMeetingIcon, LocalSpeakerIcon } from './Icons';
import { UNASSIGNED_HOST } from '../constants';
import { useData } from '../contexts/DataContext';
import { Avatar } from './Avatar';

interface FilterButtonProps {
    label: string;
    value: string;
    active: boolean;
    onClick: (value: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, value, active, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            active 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
);

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
type DateFilterType = 'all' | 'week' | 'month' | '2months';
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
    
    // Vérifications de sécurité pour les propriétés de visit
    const hostName = visit?.host || UNASSIGNED_HOST;
    const hostExists = hostName === UNASSIGNED_HOST || (hosts || []).some(h => h?.nom === hostName);
    const congregation = visit?.congregation || '';
    const isLocalSpeaker = congregation.toLowerCase().includes('lyon');
    const isZoom = visit?.locationType === 'zoom';
    const visitStatus = visit?.status || 'pending';
    const visitId = visit?.id || 'unknown';
    const visitName = visit?.nom || 'Visite sans nom';

    // Gestion des erreurs pour les styles de statut
    const statusClasses = {
        confirmed: { border: 'border-green-500' },
        pending: { border: 'border-amber-500' },
        cancelled: { border: 'border-red-500' },
    };
    
    const currentStatusClasses = statusClasses[visitStatus as keyof typeof statusClasses] || statusClasses.pending;

    // Gestion des erreurs pour les communications
    const comms = visit?.communicationStatus || {};
    const prep = comms.preparation || {};
    const reminder7 = comms.reminder7days || {};
    const thanks = comms.thanks || {};

    // Pré-calculer les valeurs ARIA pour éviter les erreurs de linter strict
    const menuExpanded = isMenuOpen ? 'true' : 'false';
    const menuLabel = isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu';

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
        <div className={`bg-card-light dark:bg-card-dark rounded-xl shadow-lg flex border-l-8 ${currentStatusClasses?.border || 'border-amber-500'} transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 w-full items-center">
                
                {/* Column 1: Date & Speaker Info */}
                <div className="md:col-span-5 flex items-center space-x-4 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark pb-4 md:pb-0 md:pr-6">
                    <div className="flex flex-col items-center justify-center text-center p-2 rounded-lg w-20 flex-shrink-0">
                        <span className="text-sm font-bold text-primary dark:text-primary-light">
                            {visit.visitDate ? formatMonth(visit.visitDate) : '--'}
                        </span>
                        <span className="text-4xl font-bold text-text-main dark:text-text-main-dark tracking-tight">
                            {visit.visitDate ? formatDay(visit.visitDate) : '--'}
                        </span>
                        <span className="text-xs text-text-muted dark:text-text-muted-dark capitalize">
                            {visit.visitDate ? formatWeekday(visit.visitDate) : '--'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                            <Avatar item={visit} size="w-12 h-12" />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-bold text-secondary dark:text-primary-light truncate" title={visitName}>
                                        {visitName}
                                    </h3>
                                    {isZoom && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">Zoom</span>}
                                    {isLocalSpeaker && !isZoom && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">Local</span>}
                                </div>
                                <p className="text-sm text-text-muted dark:text-text-muted-dark truncate" title={congregation}>
                                    {congregation || 'Aucune congrégation'}
                                </p>
                            </div>
                        </div>
                        {visit.talkTheme && (
                            <div className="mt-2 text-sm text-text-muted dark:text-text-muted-dark line-clamp-2">
                                <span className="font-medium">Sujet :</span> {visit.talkTheme}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Host & Communication Status */}
                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark pb-4 md:pb-0 md:px-6">
                    <div className="h-full flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-text-muted dark:text-text-muted-dark">Accueil</h4>
                            {isLocalSpeaker ? (
                                <div className="flex items-center text-green-600 dark:text-green-400">
                                    <LocalSpeakerIcon className="w-5 h-5 mr-2" />
                                    <span className="font-semibold">Sur place (Orateur local)</span>
                                </div>
                            ) : hostName === UNASSIGNED_HOST ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                                        <span className="font-semibold">À définir</span>
                                    </div>
                                    <button 
                                        onClick={() => onEdit(visit)} 
                                        className="w-full text-center py-1.5 px-3 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-md text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
                                    >
                                        Assigner
                                    </button>
                                </div>
                            ) : hostName === 'Zoom' ? (
                                <div className="flex items-center text-blue-600 dark:text-blue-400">
                                    <ZoomMeetingIcon className="w-5 h-5 mr-2" />
                                    <span className="font-semibold">Zoom</span>
                                </div>
                            ) : hostName === 'Streaming' ? (
                                <div className="flex items-center text-purple-600 dark:text-purple-400">
                                    <StreamingIcon className="w-5 h-5 mr-2" />
                                    <span className="font-semibold">Streaming</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-2 w-full">
                                    <div>
                                        <p className="text-sm text-text-muted dark:text-text-muted-dark">Accueil par :</p>
                                        <p className="font-bold text-lg text-text-main dark:text-text-main-dark truncate" title={hostName}>
                                            {hostName}
                                        </p>
                                        {!hostExists && (
                                            <div title="Cet hôte a été supprimé. Veuillez modifier la visite." className="flex items-center justify-center text-amber-600 dark:text-amber-400 mt-1">
                                                <ExclamationTriangleIcon className="w-5 h-5" />
                                                <span className="text-xs ml-1">Hôte supprimé</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-text-muted dark:text-text-muted-dark">Communication</h4>
                            <div className="grid grid-cols-3 gap-2">
                                <ChecklistItem 
                                    label="Préparation" 
                                    done={!!prep.sent} 
                                    icon={DocumentTextIcon} 
                                />
                                <ChecklistItem 
                                    label="Rappel 7j" 
                                    done={!!reminder7.sent} 
                                    icon={BellIcon} 
                                />
                                <ChecklistItem 
                                    label="Remerciement" 
                                    done={!!thanks.sent} 
                                    icon={SparklesIcon} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Actions */}
                <div className="md:col-span-3 flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => onEdit(visit)} 
                            className="p-2 text-text-muted hover:text-primary dark:text-text-muted-dark dark:hover:text-primary-light transition-colors"
                            aria-label="Modifier la visite"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                className="p-2 text-text-muted hover:text-primary dark:text-text-muted-dark dark:hover:text-primary-light transition-colors"
                                aria-expanded={menuExpanded}
                                aria-label={menuLabel}
                                type="button"
                            >
                                <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>
                            
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-border-light dark:border-border-dark">
                                    <button 
                                        onClick={() => { onComplete(visit); setIsMenuOpen(false); }} 
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        type="button"
                                        aria-label={`Marquer la visite comme terminée`}
                                    >
                                        <CheckIcon className="w-4 h-4 mr-2" />
                                        <span>Terminer la visite</span>
                                    </button>
                                    <button 
                                        onClick={() => { onDelete(visitId); setIsMenuOpen(false); }} 
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        type="button"
                                        aria-label={`Supprimer la visite de ${visitName}`}
                                    >
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        <span>Supprimer</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col w-full space-y-2">
                        <button 
                            onClick={() => onOpenMessageGenerator(visit, 'speaker')} 
                            className="w-full flex items-center justify-center py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
                            type="button"
                        >
                            <EnvelopeIcon className="w-4 h-4 mr-1.5" />
                            <span>Contacter l'orateur</span>
                        </button>
                        
                        <button 
                            onClick={() => onOpenMessageGenerator(visit, 'host')} 
                            disabled={hostName === UNASSIGNED_HOST || isLocalSpeaker || isZoom} 
                            className="w-full flex items-center justify-center py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            type="button"
                            aria-disabled={hostName === UNASSIGNED_HOST || isLocalSpeaker || isZoom}
                            aria-label={hostName === UNASSIGNED_HOST || isLocalSpeaker || isZoom ? 'Option non disponible' : `Contacter l'hôte ${hostName}`}
                        >
                            <EnvelopeIcon className="w-4 h-4 mr-1.5" />
                            <span>Contacter l'hôte</span>
                        </button>
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
                const visitDate = new Date(v.visitDate + 'T00:00:00');
                return visitDate >= now && visitDate <= endOfWeek;
            });
        }

        if (dateFilter === 'month') {
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            return statusFilteredVisits.filter(v => {
                const visitDate = new Date(v.visitDate + 'T00:00:00');
                return visitDate >= now && visitDate <= endOfMonth;
            });
        }

        if (dateFilter === '2months') {
            const twoMonthsFromNow = new Date(now);
            twoMonthsFromNow.setMonth(now.getMonth() + 2);
            twoMonthsFromNow.setHours(23, 59, 59, 999);
            return statusFilteredVisits.filter(v => {
                const visitDate = new Date(v.visitDate + 'T00:00:00');
                return visitDate >= now && visitDate <= twoMonthsFromNow;
            });
        }

        return statusFilteredVisits;
    }, [visits, dateFilter, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark">Visites à venir</h2>
                <div className="flex flex-wrap gap-2">
                    <FilterButton
                        label="Toutes"
                        value="all"
                        active={dateFilter === 'all'}
                        onClick={(v) => setDateFilter(v as DateFilterType)}
                    />
                    <FilterButton
                        label="Cette semaine"
                        value="week"
                        active={dateFilter === 'week'}
                        onClick={(v) => setDateFilter(v as DateFilterType)}
                    />
                    <FilterButton
                        label="Ce mois"
                        value="month"
                        active={dateFilter === 'month'}
                        onClick={(v) => setDateFilter(v as DateFilterType)}
                    />
                    <FilterButton
                        label="2 prochains mois"
                        value="2months"
                        active={dateFilter === '2months'}
                        onClick={(v) => setDateFilter(v as DateFilterType)}
                    />
                </div>
            </div>
            
            <div className="mt-6">
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
        </div>
    );
};