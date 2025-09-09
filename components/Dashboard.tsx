import React, { useMemo } from 'react';
import { Visit } from '../types';
import { useData } from '../contexts/DataContext';
import { UNASSIGNED_HOST } from '../constants';
import { 
    ExclamationTriangleIcon, 
    PlusIcon, 
    UserIcon, 
    HomeIcon, 
    UserGroupIcon, 
    CalendarDaysIcon, 
    CheckCircleIcon, 
    ArrowRightIcon,
    BellIcon,
    StarIcon
} from './Icons';
import { Avatar } from './Avatar';

interface DashboardProps {
    onScheduleVisitClick: () => void;
    onAddSpeakerClick: () => void;
    onAddHostClick: () => void;
    onEditVisitClick: (visit: Visit) => void;
}

const QuickStatCard: React.FC<{ title: string; value: string | number; icon: React.FC<any>; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-lg flex items-center space-x-4">
        <div className={`p-4 rounded-lg ${color}`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
            <p className="text-3xl font-bold text-text-main dark:text-text-main-dark">{value}</p>
            <h3 className="text-sm font-medium text-text-muted dark:text-text-muted-dark">{title}</h3>
        </div>
    </div>
);

const daysUntil = (dateStr: string) => {
    const visitDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = visitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const NextVisitCard: React.FC<{ visit: Visit; onEditVisitClick: (visit: Visit) => void; }> = ({ visit, onEditVisitClick }) => {
    const daysRemaining = daysUntil(visit.visitDate);

    const countdownText = () => {
        if (daysRemaining < 0) return "Visite passée";
        if (daysRemaining === 0) return "Aujourd'hui";
        if (daysRemaining === 1) return "Demain";
        return `Dans ${daysRemaining} jours`;
    };

    return (
        <div className="bg-gradient-to-br from-primary to-secondary dark:from-primary-dark dark:to-secondary p-6 rounded-2xl shadow-2xl text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2">Prochaine Visite</h2>
                    <div className="flex items-center gap-4">
                        <Avatar item={visit} size="w-16 h-16" className="ring-2 ring-white/50"/>
                        <div>
                            <p className="text-3xl font-bold">{visit.nom}</p>
                            <p className="opacity-90">{visit.congregation}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg text-center shrink-0">
                    <p className="text-3xl font-bold">{new Date(visit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit' })}</p>
                    <p className="text-sm uppercase font-semibold">{new Date(visit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}</p>
                </div>
            </div>
            <div className="mt-6 border-t border-white/20 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 text-sm">
                    <div className="font-bold text-lg">{countdownText()}</div>
                    <div><span className="opacity-80">Accueil :</span> {visit.host}</div>
                    <div><span className="opacity-80">Heure :</span> {visit.visitTime}</div>
                </div>
                <button
                    onClick={() => onEditVisitClick(visit)}
                    className="w-full sm:w-auto shrink-0 bg-white text-primary font-bold px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105"
                >
                    Voir les détails
                </button>
            </div>
        </div>
    );
};


const ShortcutButton: React.FC<{ label: string; onClick: () => void; icon: React.FC<any>; }> = ({ label, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className="flex items-center p-4 bg-card-light dark:bg-card-dark rounded-xl shadow-lg w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
        <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <span className="ml-4 font-semibold text-text-main dark:text-text-main-dark flex-grow">{label}</span>
        <ArrowRightIcon className="w-5 h-5 ml-auto text-text-muted dark:text-text-muted-dark" />
    </button>
);

const TimelineItem: React.FC<{ 
    item: { type: 'visit' | 'reminder'; date: Date; visit: Visit }; 
    isFirst: boolean;
    onEditVisitClick: (visit: Visit) => void;
}> = ({ item, isFirst, onEditVisitClick }) => {
    const Icon = item.type === 'visit' ? CalendarDaysIcon : BellIcon;
    const color = item.type === 'visit' ? 'bg-primary' : 'bg-amber-500';

    const title = item.type === 'visit' 
        ? `Visite de ${item.visit.nom}`
        : `Rappel J-7 pour ${item.visit.nom}`;
    
    const description = item.visit.congregation;

    return (
        <div className="flex items-start">
            <div className="flex flex-col items-center mr-4">
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center ring-4 ring-light dark:ring-dark`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {!isFirst && <div className="w-0.5 h-16 bg-border-light dark:border-border-dark -mt-1"></div>}
            </div>
            <div 
                className="bg-gray-50 dark:bg-dark p-4 rounded-lg w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onEditVisitClick(item.visit)}
            >
                <p className="font-semibold text-text-main dark:text-text-main-dark">{title}</p>
                <p className="text-sm text-text-muted dark:text-text-muted-dark">{item.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="text-sm text-text-muted dark:text-text-muted-dark">{description}</p>
            </div>
        </div>
    );
};

const InsightCard: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode; }> = ({ title, icon: Icon, children }) => (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark flex items-center mb-4">
            <Icon className="w-6 h-6 mr-3 text-primary" />
            {title}
        </h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onScheduleVisitClick, onAddSpeakerClick, onAddHostClick, onEditVisitClick }) => {
    const { hosts, speakers, archivedVisits, upcomingVisits } = useData();

    const visitsNeedingHost = useMemo(() =>
        upcomingVisits.filter(v => v.host === UNASSIGNED_HOST && v.status !== 'cancelled' && v.locationType !== 'zoom' && !v.congregation.toLowerCase().includes('lyon')),
        [upcomingVisits]
    );

    const nextVisit = upcomingVisits[0];
    
    const timelineEvents = useMemo(() => {
        const events: { type: 'visit' | 'reminder'; date: Date; visit: Visit }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        upcomingVisits.forEach(visit => {
            const visitDate = new Date(visit.visitDate + 'T00:00:00');
            events.push({ type: 'visit', date: visitDate, visit });
            
            const reminderDate = new Date(visitDate);
            reminderDate.setDate(visitDate.getDate() - 7);
            
            if (reminderDate >= today && !visit.communicationStatus?.preparation?.speaker) {
                 events.push({ type: 'reminder', date: reminderDate, visit });
            }
        });

        return events
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 5); // Limit to the next 5 events
    }, [upcomingVisits]);

    const topSpeakers = useMemo(() => {
        const speakerVisitCounts = archivedVisits.reduce((acc, visit) => {
            acc[visit.id] = (acc[visit.id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(speakerVisitCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([speakerId, count]) => ({
                speaker: speakers.find(s => s.id === speakerId),
                count
            }))
            .filter(item => item.speaker);
    }, [archivedVisits, speakers]);

    const topHosts = useMemo(() => {
        const allHostedVisits = [...archivedVisits, ...upcomingVisits].filter(v => v.host !== UNASSIGNED_HOST);
        const hostVisitCounts = allHostedVisits.reduce((acc, visit) => {
            if (visit.host) { // Ensure host is defined
                acc[visit.host] = (acc[visit.host] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(hostVisitCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hostName, count]) => ({
                host: hosts.find(h => h.nom === hostName),
                count
            }))
            .filter(item => item.host);
    }, [archivedVisits, upcomingVisits, hosts]);


    return (
        <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-secondary dark:text-primary-light">Tableau de Bord</h1>

             {nextVisit && <NextVisitCard visit={nextVisit} onEditVisitClick={onEditVisitClick} />}

            {visitsNeedingHost.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-r-lg p-6">
                    <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                        Actions Requises
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visitsNeedingHost.map(visit => (
                            <div key={visit.visitId} className="flex flex-col sm:flex-row justify-between items-center p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg">
                                <div>
                                    <p className="font-semibold text-text-main dark:text-text-main-dark">{visit.nom}</p>
                                    <p className="text-sm text-text-muted dark:text-text-muted-dark">{new Date(visit.visitDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                </div>
                                <button onClick={() => onEditVisitClick(visit)} className="w-full mt-2 sm:mt-0 sm:w-auto shrink-0 flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm">
                                    Assigner un accueil
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-4">Aperçu rapide</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <QuickStatCard title="Orateurs" value={speakers.length} icon={UserGroupIcon} color="bg-blue-500" />
                    <QuickStatCard title="Contacts d'accueil" value={hosts.length} icon={HomeIcon} color="bg-green-500" />
                    <QuickStatCard title="Visites à venir" value={upcomingVisits.length} icon={CalendarDaysIcon} color="bg-amber-500" />
                    <QuickStatCard title="Visites archivées" value={archivedVisits.length} icon={CheckCircleIcon} color="bg-indigo-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-4">Chronologie des Événements</h2>
                    <div className="space-y-4">
                        {timelineEvents.length > 0 ? timelineEvents.map((item, index) => (
                            <TimelineItem key={`${item.visit.visitId}-${item.type}`} item={item} isFirst={index === timelineEvents.length - 1} onEditVisitClick={onEditVisitClick} />
                        )) : (
                             <p className="text-center text-text-muted dark:text-text-muted-dark py-8 bg-card-light dark:bg-card-dark rounded-xl shadow-lg">Aucun événement à venir.</p>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-4">Aperçu Analytique</h2>
                    <InsightCard title="Orateurs les plus sollicités" icon={StarIcon}>
                        {topSpeakers.length > 0 ? topSpeakers.map(({ speaker, count }) => speaker && (
                            <div key={speaker.id} className="flex items-center justify-between bg-gray-50 dark:bg-dark p-3 rounded-md">
                                <div className="flex items-center gap-3">
                                    <Avatar item={speaker} size="w-10 h-10"/>
                                    <div>
                                        <p className="font-semibold text-text-main dark:text-text-main-dark">{speaker.nom}</p>
                                        <p className="text-xs text-text-muted dark:text-text-muted-dark">{speaker.congregation}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-lg text-primary dark:text-primary-light">{count}</span>
                            </div>
                        )) : <p className="text-sm text-text-muted dark:text-text-muted-dark">Aucune visite archivée pour établir des statistiques.</p>}
                    </InsightCard>

                     <InsightCard title="Champions de l'hospitalité" icon={HomeIcon}>
                        {topHosts.length > 0 ? topHosts.map(({ host, count }) => host && (
                            <div key={host.nom} className="flex items-center justify-between bg-gray-50 dark:bg-dark p-3 rounded-md">
                                <div className="flex items-center gap-3">
                                    <Avatar item={host} size="w-10 h-10"/>
                                    <div>
                                        <p className="font-semibold text-text-main dark:text-text-main-dark">{host.nom}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-lg text-green-500">{count}</span>
                            </div>
                        )) : <p className="text-sm text-text-muted dark:text-text-muted-dark">Aucune visite avec accueil assigné pour le moment.</p>}
                    </InsightCard>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-4">Raccourcis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ShortcutButton label="Programmer une visite" onClick={onScheduleVisitClick} icon={PlusIcon} />
                    <ShortcutButton label="Ajouter un orateur" onClick={onAddSpeakerClick} icon={UserIcon} />
                    <ShortcutButton label="Ajouter un contact d'accueil" onClick={onAddHostClick} icon={HomeIcon} />
                </div>
            </div>
        </div>
    );
};