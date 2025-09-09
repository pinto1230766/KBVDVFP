import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Speaker, Visit, MessageRole, Language, Host, MessageType } from './types';
import { UpcomingVisits } from './components/UpcomingVisits';
import { SpeakerList } from './components/SpeakerList';
import { ScheduleVisitModal } from './components/ScheduleVisitModal';
import { CalendarView } from './components/CalendarView';
import { MessagingCenter } from './components/MessagingCenter';
import { SpeakerDetailsModal } from './components/SpeakerDetailsModal';
import { Settings } from './components/Settings';
import { AppLogoIcon, CalendarIcon, ListViewIcon, EnvelopeIcon, CogIcon, MoonIcon, SunIcon, SearchIcon, DashboardIcon } from './components/Icons';
import { useToast } from './contexts/ToastContext';
import { useConfirm } from './contexts/ConfirmContext';
import { MessageGeneratorModal } from './components/MessageGeneratorModal';
import { useData } from './contexts/DataContext';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HostDetailsModal } from './components/HostDetailsModal';
import { Dashboard } from './components/Dashboard';
import { HostList } from './components/HostList';

type ViewMode = 'list' | 'calendar';
type Tab = 'dashboard' | 'planning' | 'messaging' | 'settings';

const App: React.FC = () => {
    const { 
        upcomingVisits,
        deleteVisit,
        completeVisit,
        importData,
        resetData
    } = useData();
    
    // Modals State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
    const [speakerToSchedule, setSpeakerToSchedule] = useState<Speaker | null>(null);
    
    const [isSpeakerDetailsModalOpen, setIsSpeakerDetailsModalOpen] = useState(false);
    const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

    const [isMessageGeneratorModalOpen, setIsMessageGeneratorModalOpen] = useState(false);
    const [messageModalData, setMessageModalData] = useState<{ visit: Visit; role: MessageRole; messageType?: MessageType } | null>(null);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    
    const [isHostDetailsModalOpen, setIsHostDetailsModalOpen] = useState(false);
    const [selectedHost, setSelectedHost] = useState<Host | null>(null);


    // UI & Settings State
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [messagingLanguage, setMessagingLanguage] = useState<Language>('fr');
    const [isImporting, setIsImporting] = useState(false);
    const [isSpeakerListExpanded, setIsSpeakerListExpanded] = useState(false);
    const [isHostListExpanded, setIsHostListExpanded] = useState(false);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as 'light' | 'dark';
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });
    
    const { addToast } = useToast();
    const confirm = useConfirm();
    const speakerListRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleScheduleVisit = useCallback((speaker: Speaker) => {
        setSpeakerToSchedule(speaker);
        setEditingVisit(null);
        setIsScheduleModalOpen(true);
    }, []);

    const handleEditVisit = useCallback((visit: Visit) => {
        setEditingVisit(visit);
        setSpeakerToSchedule(null);
        setIsScheduleModalOpen(true);
    }, []);

    const handleDeleteVisit = useCallback(async (visitId: string) => {
        if(await confirm("Êtes-vous sûr de vouloir supprimer cette visite ?")) {
           deleteVisit(visitId);
        }
    }, [confirm, deleteVisit]);
    
    const handleCompleteVisit = useCallback(async (visit: Visit) => {
        if (!await confirm(`Voulez-vous marquer la visite de ${visit.nom} comme terminée ?\nCela mettra à jour sa date de dernière visite et retirera cette planification.`)) {
            return;
        }
        completeVisit(visit);
    }, [confirm, completeVisit]);
    
    const handleAddSpeaker = () => {
        setSelectedSpeaker(null);
        setIsSpeakerDetailsModalOpen(true);
    };

    const handleEditSpeaker = (speaker: Speaker) => {
        setSelectedSpeaker(speaker);
        setIsSpeakerDetailsModalOpen(true);
    };
    
    const handleAddHost = () => {
        setSelectedHost(null);
        setIsHostDetailsModalOpen(true);
    };

    const handleEditHost = (host: Host) => {
        setSelectedHost(host);
        setIsHostDetailsModalOpen(true);
    };
    
    const handleImportData = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (await confirm("Êtes-vous sûr de vouloir importer ces données ? Cela écrasera toutes les données actuelles.")) {
            setIsImporting(true);
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                importData(data);
            } catch (error) {
                console.error("Failed to import data:", error);
                addToast(`Erreur lors de l'importation : ${error instanceof Error ? error.message : 'Format non valide.'}`, 'error');
            } finally {
                setIsImporting(false);
                event.target.value = '';
            }
        } else {
             event.target.value = '';
        }
    }, [confirm, addToast, importData]);
    
    const handleResetData = useCallback(async () => {
        if (await confirm("ATTENTION : Cette action est irréversible.\nToutes les visites, orateurs et frères pour l'accueil seront supprimés. Voulez-vous continuer ?")) {
            resetData();
        }
    }, [confirm, resetData]);

    const handleOpenMessageGenerator = (visit: Visit, role: MessageRole, messageType?: MessageType) => {
        setMessageModalData({ visit, role, messageType });
        setIsMessageGeneratorModalOpen(true);
    };

    const handleScheduleFromShortcut = useCallback(() => {
        setActiveTab('planning');
        setIsSpeakerListExpanded(true);
        // Use timeout to ensure the list has rendered before scrolling
        setTimeout(() => {
            speakerListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard 
                    onScheduleVisitClick={handleScheduleFromShortcut}
                    onAddSpeakerClick={handleAddSpeaker}
                    onAddHostClick={handleAddHost}
                    onEditVisitClick={handleEditVisit}
                />;
            case 'planning':
                return (
                    <>
                        {viewMode === 'list' ? (
                            <UpcomingVisits
                                visits={upcomingVisits}
                                onEdit={handleEditVisit}
                                onDelete={handleDeleteVisit}
                                onComplete={handleCompleteVisit}
                                onOpenMessageGenerator={handleOpenMessageGenerator}
                                onScheduleFirst={handleScheduleFromShortcut}
                            />
                        ) : (
                            <CalendarView
                                onEditVisit={handleEditVisit}
                            />
                        )}
                        <div ref={speakerListRef}>
                            <SpeakerList
                                onSchedule={handleScheduleVisit}
                                onAddSpeaker={handleAddSpeaker}
                                onEditSpeaker={handleEditSpeaker}
                                isExpanded={isSpeakerListExpanded}
                                onToggleExpand={() => setIsSpeakerListExpanded(prev => !prev)}
                            />
                        </div>
                        <div>
                            <HostList
                                onAddHost={handleAddHost}
                                onEditHost={handleEditHost}
                                isExpanded={isHostListExpanded}
                                onToggleExpand={() => setIsHostListExpanded(prev => !prev)}
                            />
                        </div>
                    </>
                );
            case 'messaging':
                return <MessagingCenter
                    onOpenMessageGenerator={handleOpenMessageGenerator}
                    language={messagingLanguage}
                    onLanguageChange={setMessagingLanguage}
                />;
            case 'settings':
                return <Settings
                    onImport={handleImportData}
                    onResetData={handleResetData}
                    isImporting={isImporting}
                 />;
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{ icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center py-2 sm:py-3 text-sm font-medium border-b-4 transition-colors ${
                isActive
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white'
            }`}
        >
            <Icon className="w-6 h-6 mb-1 sm:mb-0 sm:mr-2" />
            <span className="text-[10px] sm:text-sm">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen text-text-main dark:text-text-main-dark transition-colors duration-300 flex flex-col">
            <header className="bg-primary dark:bg-primary-dark shadow-md sticky top-0 z-40 sm:relative">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3 sm:py-4 relative">
                        <div className="flex items-center space-x-3">
                            <img 
                                src="/icons/logo.png" 
                                alt="Logo" 
                                className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                                onError={(e) => {
                                    // Si l'image ne charge pas, afficher l'icône par défaut
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = '/icons/icon.png'; // Assurez-vous que cette icône existe
                                }}
                            />
                        </div>

                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block pointer-events-none">
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight whitespace-nowrap">
                                Gestion des Orateurs Visiteurs
                            </h1>
                            <p className="text-xs md:text-sm text-white/80 text-center">
                                Groupe Témoin de Jéhovah Capverdien - Lyon
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4">
                             <button onClick={() => setIsSearchModalOpen(true)} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors" title="Recherche globale">
                                <SearchIcon className="w-6 h-6" />
                            </button>
                            {activeTab === 'planning' && (
                                <div className="hidden sm:flex items-center bg-white/10 dark:bg-black/20 p-1 rounded-lg">
                                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors text-white ${viewMode === 'list' ? 'bg-white/20' : ''}`} title="Vue Liste">
                                        <ListViewIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md transition-colors text-white ${viewMode === 'calendar' ? 'bg-white/20' : ''}`} title="Vue Calendrier">
                                        <CalendarIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                             <button onClick={toggleTheme} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors" title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}>
                                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                     <nav className="border-t border-white/20 hidden sm:block">
                        <div className="flex justify-around">
                             <TabButton icon={DashboardIcon} label="Tableau de Bord" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                             <TabButton icon={CalendarIcon} label="Planning" isActive={activeTab === 'planning'} onClick={() => setActiveTab('planning')} />
                             <TabButton icon={EnvelopeIcon} label="Messages" isActive={activeTab === 'messaging'} onClick={() => setActiveTab('messaging')} />
                             <TabButton icon={CogIcon} label="Paramètres" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                        </div>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow pb-24 sm:pb-8">
                {renderContent()}
            </main>
            
            {/* Mobile Bottom Navigation */}
            <nav className="sm:hidden mobile-bottom-nav bg-primary dark:bg-primary-dark border-t border-white/20 pb-[env(safe-area-inset-bottom)]">
                <div className="flex justify-around">
                    <TabButton icon={DashboardIcon} label="Tableau de Bord" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <TabButton icon={CalendarIcon} label="Planning" isActive={activeTab === 'planning'} onClick={() => setActiveTab('planning')} />
                    <TabButton icon={EnvelopeIcon} label="Messages" isActive={activeTab === 'messaging'} onClick={() => setActiveTab('messaging')} />
                    <TabButton icon={CogIcon} label="Paramètres" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </div>
            </nav>

            <footer className="hidden sm:block bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark py-4 text-center text-xs text-text-muted dark:text-text-muted-dark mt-auto">
                <p>&copy; {new Date().getFullYear()} Pinto Francisco - Version 1.03</p>
            </footer>

            {isScheduleModalOpen && (speakerToSchedule || editingVisit) && (
                <ScheduleVisitModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    visit={editingVisit}
                    speaker={speakerToSchedule}
                />
            )}
            
            {isSpeakerDetailsModalOpen && (
                <SpeakerDetailsModal
                    isOpen={isSpeakerDetailsModalOpen}
                    onClose={() => setIsSpeakerDetailsModalOpen(false)}
                    speaker={selectedSpeaker}
                />
            )}

            {isHostDetailsModalOpen && (
                <HostDetailsModal
                    isOpen={isHostDetailsModalOpen}
                    onClose={() => setIsHostDetailsModalOpen(false)}
                    host={selectedHost}
                />
            )}
            
            {isMessageGeneratorModalOpen && messageModalData && (
                <MessageGeneratorModal
                    isOpen={isMessageGeneratorModalOpen}
                    onClose={() => setIsMessageGeneratorModalOpen(false)}
                    visit={messageModalData.visit}
                    role={messageModalData.role}
                    messageType={messageModalData.messageType}
                    language={messagingLanguage}
                    onLanguageChange={setMessagingLanguage}
                />
            )}

            {isSearchModalOpen && (
                <GlobalSearchModal
                    isOpen={isSearchModalOpen}
                    onClose={() => setIsSearchModalOpen(false)}
                    onEditVisit={(visit) => {
                        setIsSearchModalOpen(false);
                        handleEditVisit(visit);
                    }}
                    onEditSpeaker={(speaker) => {
                        setIsSearchModalOpen(false);
                        handleEditSpeaker(speaker);
                    }}
                     onEditHost={(host) => {
                        setIsSearchModalOpen(false);
                        handleEditHost(host);
                    }}
                />
            )}
        </div>
    );
};

export default App;