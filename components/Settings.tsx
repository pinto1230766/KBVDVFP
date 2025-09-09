import React, { useState, useMemo, useEffect } from 'react';
import { DownloadIcon, UploadIcon, SpinnerIcon, QuestionMarkCircleIcon, ExclamationTriangleIcon, ExternalLinkIcon, UserPlusIcon, CalendarDaysIcon, SaveIcon } from './Icons';
import { useData } from '../contexts/DataContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { ArchivedVisits } from './ArchivedVisits';
import { useToast } from '../contexts/ToastContext';

interface SettingsProps {
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onResetData: () => void;
    isImporting: boolean;
}

const InstallationHelp: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const InstructionCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
        <div className="bg-gray-50 dark:bg-dark p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-text-main dark:text-text-main-dark flex items-center mb-2">
                <i className={`fab ${icon} w-6 mr-3 text-primary`}></i>
                {title}
            </h4>
            <div className="text-sm text-text-muted dark:text-text-muted-dark max-w-none">
                {children}
            </div>
        </div>
    );
    
    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <QuestionMarkCircleIcon className="w-8 h-8 text-primary"/>
                    <div>
                        <h2 className="text-2xl font-bold text-secondary dark:text-primary-light">Aide à l'installation</h2>
                        <p className="text-text-muted dark:text-text-muted-dark">Comment installer l'application sur votre appareil.</p>
                    </div>
                </div>
                {!isExpanded && (
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="px-4 py-2 bg-primary/10 text-primary dark:text-primary-light dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 font-semibold rounded-lg transition-colors text-sm"
                    >
                        Afficher les instructions
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="mt-6 border-t border-border-light dark:border-border-dark pt-6 space-y-4 animate-fade-in-up">
                    <InstructionCard title="PC Windows/Mac (Chrome, Edge)" icon="fa-chrome">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Ouvrez l'application dans votre navigateur.</li>
                            <li>Regardez dans la <strong>barre d'adresse</strong>, à droite. Vous devriez voir une petite icône (un écran avec une flèche vers le bas).</li>
                            <li>Cliquez sur cette icône, puis sur <strong>"Installer"</strong>.</li>
                            <li>L'application s'ouvrira dans sa propre fenêtre et une icône sera ajoutée sur votre bureau ou dans votre menu Démarrer.</li>
                        </ol>
                    </InstructionCard>
                    
                    <InstructionCard title="PC Windows/Mac (Firefox)" icon="fa-firefox">
                        <p>Firefox sur ordinateur a un support limité pour l'installation directe. Voici une alternative pour créer un raccourci :</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-2">
                            <li>Redimensionnez la fenêtre de Firefox pour voir votre bureau en arrière-plan.</li>
                            <li>Cliquez sur l'icône de cadenas (🔒) dans la barre d'adresse.</li>
                            <li>Maintenez le clic et faites glisser cette icône sur votre bureau.</li>
                            <li>Un raccourci vers l'application sera créé sur votre bureau.</li>
                        </ol>
                    </InstructionCard>

                    <InstructionCard title="Android (Chrome, Samsung, Firefox)" icon="fa-android">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Ouvrez l'application dans votre navigateur.</li>
                            <li>Appuyez sur le <strong>bouton de menu du navigateur</strong> (généralement trois points verticaux).</li>
                            <li>Dans le menu qui s'ouvre, cherchez et appuyez sur l'option <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong>.</li>
                            <li>Confirmez l'ajout.</li>
                            <li>L'icône de l'application apparaîtra sur votre écran d'accueil.</li>
                        </ol>
                    </InstructionCard>

                    <InstructionCard title="iPhone / iPad (Safari)" icon="fa-apple">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Ouvrez l'application dans <strong>Safari</strong>.</li>
                            <li>Appuyez sur le <strong>bouton Partager</strong> (une icône de carré avec une flèche vers le haut).</li>
                            <li>Faites défiler la liste des options et appuyez sur <strong>"Sur l'écran d'accueil"</strong>.</li>
                            <li>Confirmez le nom et appuyez sur <strong>"Ajouter"</strong>.</li>
                        </ol>
                    </InstructionCard>
                     <div className="text-right mt-4">
                        <button onClick={() => setIsExpanded(false)} className="font-semibold text-primary dark:text-primary-light hover:underline text-sm">Masquer les instructions</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const GoogleSheetsSync: React.FC = () => {
    const { googleSheetId, setGoogleSheetId, googleApiKey, setGoogleApiKey, syncWithGoogleSheets, isSyncing } = useData();
    const { addToast } = useToast();
    const confirm = useConfirm();
    
    // Local state for the input fields
    const [localSheetIdInput, setLocalSheetIdInput] = useState(googleSheetId);
    const [localApiKey, setLocalApiKey] = useState(googleApiKey);

    // Sync local state if context changes (e.g., after an import)
    useEffect(() => {
        setLocalSheetIdInput(googleSheetId);
        setLocalApiKey(googleApiKey);
    }, [googleSheetId, googleApiKey]);

    const hasChanges = useMemo(() => {
        let currentSheetId = localSheetIdInput.trim();
        const match = currentSheetId.match(/\/d\/(.*?)\//);
        if (match && match[1]) {
            currentSheetId = match[1];
        }
        return currentSheetId !== googleSheetId || localApiKey.trim() !== googleApiKey;
    }, [localSheetIdInput, localApiKey, googleSheetId, googleApiKey]);
    
    const handleSaveSettings = () => {
        let finalSheetId = localSheetIdInput.trim();
        const match = finalSheetId.match(/\/d\/(.*?)\//);
        if (match && match[1]) {
            finalSheetId = match[1];
        }

        setGoogleSheetId(finalSheetId);
        setGoogleApiKey(localApiKey.trim());
        addToast("Paramètres de synchronisation enregistrés.", 'success');
    };

    const handleSync = async () => {
        if (hasChanges) {
            addToast("Veuillez enregistrer vos modifications avant de synchroniser.", 'warning');
            return;
        }
        if (await confirm("Cela va synchroniser les données avec votre Google Sheet.\n\n- Les informations seront mises à jour.\n\nContinuer ?")) {
            syncWithGoogleSheets();
        }
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 relative">
            {isSyncing && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center rounded-xl z-10">
                    <SpinnerIcon className="w-12 h-12 text-primary" />
                    <p className="mt-4 text-lg font-semibold text-text-main dark:text-text-main-dark animate-pulse">Synchronisation en cours...</p>
                </div>
            )}
            <h2 className="text-2xl font-bold text-secondary dark:text-primary-light mb-2">Synchronisation Google Sheets</h2>
            <p className="text-text-muted dark:text-text-muted-dark mb-6">Mettez à jour les données directement depuis une feuille de calcul Google.</p>
            
            <div className="space-y-4">
                 <div>
                    <label htmlFor="sheet-id" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">ID ou URL du Google Sheet</label>
                    <input
                        type="text"
                        id="sheet-id"
                        value={localSheetIdInput}
                        onChange={(e) => setLocalSheetIdInput(e.target.value)}
                        placeholder="Collez l'ID ou l'URL de votre feuille ici"
                        className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark"
                    />
                </div>
                 <div>
                    <label htmlFor="api-key" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">API Key Google (optionnel)</label>
                    <input
                        type="password"
                        id="api-key"
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark"
                    />
                </div>
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={!hasChanges || isSyncing}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <SaveIcon className="w-5 h-5 mr-2" />
                        {hasChanges ? "Enregistrer les modifications" : "Enregistré"}
                    </button>
                </div>
            </div>

            <div className="mt-6">
                 <button
                    onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${googleSheetId}/edit`, '_blank')}
                    disabled={!googleSheetId}
                    className="w-full sm:w-auto flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <ExternalLinkIcon className="w-5 h-5 mr-3" />
                    Ouvrir le Google Sheet
                </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark">
                <div className="bg-gray-50 dark:bg-dark p-4 rounded-lg text-center">
                    <div className="flex justify-center items-center gap-2">
                         <UserPlusIcon className="w-8 h-8 mx-auto text-primary" />
                         <CalendarDaysIcon className="w-8 h-8 mx-auto text-purple-500" />
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-text-main dark:text-text-main-dark">Synchronisation Complète</h3>
                    <p className="text-sm text-text-muted dark:text-text-muted-dark my-2">Met à jour les orateurs et le planning en se basant uniquement sur l'onglet <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">PRUGRAMA DISKURSU</code> de votre feuille Google Sheets.</p>
                    <button
                        onClick={handleSync}
                        disabled={!googleSheetId || isSyncing}
                        className="w-full mt-3 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        Synchroniser avec Google Sheets
                    </button>
                </div>
            </div>
             <p className="mt-6 text-xs text-text-muted dark:text-text-muted-dark bg-gray-100 dark:bg-dark p-3 rounded-md">
                <strong className="text-text-main dark:text-text-main-dark">Important :</strong> Votre Google Sheet doit contenir une feuille (onglet) nommée `PRUGRAMA DISKURSU`. Pour le rendre accessible, allez dans Partager → Accès général → Tous les utilisateurs disposant du lien → Lecteur.
            </p>
        </div>
    );
};

export const Settings: React.FC<SettingsProps> = ({ onImport, onResetData, isImporting }) => {
    const { exportData } = useData();

    return (
        <div className="space-y-8">
            <InstallationHelp />
            
            <GoogleSheetsSync />

            <ArchivedVisits />

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 relative">
                 {isImporting && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center rounded-xl z-10">
                        <SpinnerIcon className="w-12 h-12 text-primary" />
                        <p className="mt-4 text-lg font-semibold text-text-main dark:text-text-main-dark animate-pulse">Importation en cours...</p>
                    </div>
                )}
                <h2 className="text-2xl font-bold text-secondary dark:text-primary-light mb-2">Gestion des données</h2>
                <p className="text-text-muted dark:text-text-muted-dark mb-6">Sauvegardez vos données dans un fichier ou restaurez-les depuis une sauvegarde.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={exportData}
                        className="flex-1 flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform duration-200 hover:scale-105"
                    >
                        <DownloadIcon className="w-5 h-5 mr-3" />
                        Exporter les données
                    </button>
                    
                    <label className="flex-1 flex justify-center items-center px-6 py-3 border border-border-light dark:border-border-dark text-base font-medium rounded-md text-text-main dark:text-text-main-dark bg-card-light dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform duration-200 hover:scale-105">
                        <UploadIcon className="w-5 h-5 mr-3" />
                        <span>Importer les données</span>
                        <input type="file" accept=".json" className="hidden" onChange={onImport} />
                    </label>
                </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-secondary dark:text-primary-light mb-2">Confidentialité et RGPD</h2>
                <div className="text-text-muted dark:text-text-muted-dark space-y-2 text-sm">
                    <p><strong>Stockage des données :</strong> Toutes les informations que vous saisissez (orateurs, visites, hôtes) sont stockées <strong>uniquement sur votre propre appareil</strong>, dans le stockage local de votre navigateur (`localStorage`).</p>
                    <p><strong>Aucune donnée n'est envoyée ou stockée sur un serveur externe.</strong> Cela garantit une confidentialité maximale. Si vous effacez les données de votre navigateur pour ce site, toutes les informations seront perdues, sauf si vous les avez exportées.</p>
                    <p><strong>Utilisation des informations :</strong> Les noms et congrégations sont utilisés pour la planification. Lors de la génération de messages, il vous est rappelé de traiter ces informations personnelles avec soin, conformément au RGPD.</p>
                </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg p-6">
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-8 h-8"/>
                    Zone de danger
                </h2>
                <p className="text-red-700 dark:text-red-400 mb-6">Ces actions sont irréversibles. Soyez sûr avant de continuer.</p>
                <button
                    onClick={onResetData}
                    className="w-full sm:w-auto flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Réinitialiser toutes les données
                </button>
            </div>
        </div>
    );
};