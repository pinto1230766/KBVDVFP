import React, { createContext, useContext, useMemo, useCallback, ReactNode, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Speaker, Visit, Host, CustomMessageTemplates, CustomHostRequestTemplates, Language, MessageType, MessageRole, UnavailabilityPeriod, TalkHistory } from '../types';
import { initialSpeakers, initialHosts, UNASSIGNED_HOST, initialVisits } from '../constants';
import { useToast } from './ToastContext';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Define the shape of the data and actions provided by the context.
interface DataContextType {
  speakers: Speaker[];
  visits: Visit[];
  hosts: Host[];
  archivedVisits: Visit[];
  customTemplates: CustomMessageTemplates;
  customHostRequestTemplates: CustomHostRequestTemplates;
  googleSheetId: string;
  googleApiKey: string;
  isSyncing: boolean;
  
  upcomingVisits: Visit[];
  
  // Actions
  setGoogleSheetId: (id: string) => void;
  setGoogleApiKey: (key: string) => void;
  syncWithGoogleSheets: () => Promise<void>;
  addSpeaker: (speakerData: Speaker) => void;
  updateSpeaker: (speakerData: Speaker) => void;
  deleteSpeaker: (speakerId: string) => void;
  addVisit: (visitData: Visit) => void;
  updateVisit: (visitData: Visit) => void;
  deleteVisit: (visitId: string) => void;
  completeVisit: (visit: Visit) => void;
  deleteArchivedVisit: (visitId: string) => void;
  addHost: (hostData: Host) => boolean;
  updateHost: (hostName: string, updatedData: Partial<Host>) => void;
  deleteHost: (hostName: string) => void;
  saveCustomTemplate: (language: Language, messageType: MessageType, role: MessageRole, text: string) => void;
  deleteCustomTemplate: (language: Language, messageType: MessageType, role: MessageRole) => void;
  saveCustomHostRequestTemplate: (language: Language, text: string) => void;
  deleteCustomHostRequestTemplate: (language: Language) => void;
  logCommunication: (visitId: string, messageType: MessageType, role: MessageRole) => void;
  exportData: () => void;
  importData: (data: any) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Normalizes a name for more robust comparison by removing spaces, hyphens, periods, and diacritics.
const normalizeName = (name: string) => {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        // Decompose accented characters into base characters and combining marks
        .normalize("NFD") 
        // Remove the combining marks (diacritics)
        .replace(/[\u0300-\u036f]/g, "")
        // Remove spaces, hyphens, and periods
        .replace(/[\s-.]/g, '');
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addToast } = useToast();

    // State management using the custom useLocalStorage hook.
    const [speakers, setSpeakers] = useLocalStorage<Speaker[]>('speakers', initialSpeakers);
    const [visits, setVisits] = useLocalStorage<Visit[]>('visits', initialVisits);
    const [hosts, setHosts] = useLocalStorage<Host[]>('hosts', initialHosts);
    const [archivedVisits, setArchivedVisits] = useLocalStorage<Visit[]>('archivedVisits', []);
    const [customTemplates, setCustomTemplates] = useLocalStorage<CustomMessageTemplates>('customMessageTemplates', {});
    const [customHostRequestTemplates, setCustomHostRequestTemplates] = useLocalStorage<CustomHostRequestTemplates>('customHostRequestTemplates', {});
    const [googleSheetId, setGoogleSheetId] = useLocalStorage<string>('googleSheetId', '1drIzPPi6AohCroSyUkF1UmMFxuEtMACBF4XATDjBOcg');
    const [googleApiKey, setGoogleApiKey] = useLocalStorage<string>('googleApiKey', 'AIzaSyC2llqldfKnDeZ9Y1SwRXC8QE0f8Ds6lNI');
    const [isSyncing, setIsSyncing] = useState(false);

    // One-time effect to migrate speaker data to include talkHistory
    useEffect(() => {
        if (speakers.length > 0 && !('talkHistory' in speakers[0])) {
            const migratedSpeakers = speakers.map((s: any) => {
                const newSpeaker: Speaker = {
                    id: s.id,
                    nom: s.nom,
                    congregation: s.congregation,
                    telephone: s.telephone,
                    notes: s.notes,
                    photoUrl: s.photoUrl,
                    talkHistory: [],
                };
                if (s.lastVisitDate) {
                    newSpeaker.talkHistory.push({
                        date: s.lastVisitDate,
                        talkNo: s.lastTalkNoOrType,
                        theme: s.latestDPTheme,
                    });
                }
                return newSpeaker;
            });
            setSpeakers(migratedSpeakers);
            addToast("Données des orateurs migrées vers le nouveau format d'historique.", 'info');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // One-time effect to migrate host data structure from status/unavailableUntil to unavailability array
    useEffect(() => {
        const firstHost = hosts[0];
        // Check if the old 'status' property exists, indicating old data structure
        if (firstHost && 'status' in firstHost) {
            const migratedHosts = hosts.map((host: any) => {
                const newHost: Host = {
                    nom: host.nom,
                    telephone: host.telephone,
                    address: host.address,
                    photoUrl: host.photoUrl,
                    gender: host.gender || 'male',
                    unavailability: host.unavailability || [],
                };

                // Migrate simple status to unavailability period
                if (host.status === 'unavailable' && host.unavailableUntil) {
                    newHost.unavailability.push({
                        id: crypto.randomUUID(),
                        startDate: '2024-01-01', // An arbitrary start date in the past for migration
                        endDate: host.unavailableUntil,
                        reason: 'Importé depuis l\'ancien système',
                    });
                }
                return newHost;
            });
            setHosts(migratedHosts);
            addToast("Données d'accueil migrées vers le nouveau système de disponibilité.", 'info');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // One-time effect to migrate host data structure to include gender
    useEffect(() => {
        if (hosts.length > 0 && !('gender' in hosts[0])) {
            const migratedHosts = hosts.map((host: any) => ({
                ...host,
                gender: 'male' // Default to male for old data
            }));
            setHosts(migratedHosts);
            addToast("Données d'accueil migrées pour inclure le genre.", 'info');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

     // One-time effect to migrate visits data structure
    useEffect(() => {
        if (visits.length > 0 && 'latestDPTheme' in visits[0]) {
            const migratedVisits = visits.map((oldVisit: any) => {
                const newVisit: Visit = {
                    // Speaker fields
                    id: oldVisit.id,
                    nom: oldVisit.nom,
                    congregation: oldVisit.congregation,
                    telephone: oldVisit.telephone,
                    photoUrl: oldVisit.photoUrl,
                    // Visit fields
                    visitId: oldVisit.visitId,
                    visitDate: oldVisit.visitDate,
                    visitTime: oldVisit.visitTime,
                    host: oldVisit.host,
                    accommodation: oldVisit.accommodation,
                    meals: oldVisit.meals,
                    notes: oldVisit.notes,
                    status: oldVisit.status,
                    attachments: oldVisit.attachments,
                    // New talk fields - empty initially for old visits, can be edited later
                    talkNoOrType: null,
                    talkTheme: null,
                };
                return newVisit;
            });
            setVisits(migratedVisits);
            addToast("Données de visites migrées vers le nouveau format.", 'info');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // One-time effect to migrate preparationMessageSentOn to communicationStatus
    useEffect(() => {
        if (visits.some(v => 'preparationMessageSentOn' in v && (v as any).preparationMessageSentOn)) {
            const migratedVisits = visits.map((v: any) => {
                if (v.preparationMessageSentOn) {
                    const newStatus = {
                        ...v.communicationStatus,
                        preparation: { 
                            ...v.communicationStatus?.preparation,
                            speaker: v.preparationMessageSentOn,
                            host: v.preparationMessageSentOn,
                        },
                    };
                    const newVisit = { ...v, communicationStatus: newStatus };
                    delete newVisit.preparationMessageSentOn;
                    return newVisit;
                }
                if (!v.communicationStatus) {
                    return { ...v, communicationStatus: {} };
                }
                return v;
            });
            setVisits(migratedVisits as Visit[]);
            addToast("Données de communication migrées.", 'info');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derived state, memoized for performance.
    const upcomingVisits = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return [...visits]
            .filter(v => new Date(v.visitDate + 'T00:00:00') >= today)
            .sort((a, b) => new Date(a.visitDate + 'T00:00:00').getTime() - new Date(b.visitDate + 'T00:00:00').getTime());
    }, [visits]);

    // --- Actions (wrapped in useCallback for performance) ---

    const addSpeaker = useCallback((speakerData: Speaker) => {
        setSpeakers(prev => [...prev, speakerData].sort((a, b) => a.nom.localeCompare(b.nom)));
        addToast("Orateur ajouté.", 'success');
    }, [setSpeakers, addToast]);

    const updateSpeaker = useCallback((speakerData: Speaker) => {
        setSpeakers(prev => prev.map(s => s.id === speakerData.id ? speakerData : s).sort((a, b) => a.nom.localeCompare(b.nom)));
        addToast("Orateur mis à jour.", 'success');
    }, [setSpeakers, addToast]);

    const deleteSpeaker = useCallback((speakerId: string) => {
        const speakerToDelete = speakers.find(s => s.id === speakerId);
        if (!speakerToDelete) return;

        setSpeakers(prev => prev.filter(s => s.id !== speakerId));
        // Also remove any scheduled visits for this speaker
        setVisits(prev => prev.filter(v => v.id !== speakerId));
        addToast(`"${speakerToDelete.nom}" et ses visites associées ont été supprimés.`, 'success');
    }, [speakers, setSpeakers, setVisits, addToast]);

    const addVisit = useCallback((visitData: Visit) => {
        const visitWithStatus = { ...visitData, communicationStatus: {} };
        setVisits(prev => [...prev, visitWithStatus]);
        addToast("Visite programmée avec succès.", 'success');
    }, [setVisits, addToast]);

    const updateVisit = useCallback((visitData: Visit) => {
        setVisits(prev => prev.map(v => v.visitId === visitData.visitId ? visitData : v));
        addToast("Visite mise à jour avec succès.", 'success');
    }, [setVisits, addToast]);
    
    const deleteVisit = useCallback((visitId: string) => {
        setVisits(prev => prev.filter(v => v.visitId !== visitId));
        addToast("Visite supprimée.", 'success');
    }, [setVisits, addToast]);
    
    const completeVisit = useCallback((visit: Visit) => {
        setSpeakers(prevSpeakers => {
            return prevSpeakers.map(s => {
                if (s.id === visit.id) {
                    const newHistoryEntry: TalkHistory = {
                        date: visit.visitDate,
                        talkNo: visit.talkNoOrType,
                        theme: visit.talkTheme,
                    };
                    const newTalkHistory = [...(s.talkHistory || []), newHistoryEntry];
                    // Sort and remove duplicates just in case
                    const uniqueHistory = Array.from(new Set(newTalkHistory.map(h => h.date)))
                        .map(date => newTalkHistory.find(h => h.date === date)!)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    return { ...s, talkHistory: uniqueHistory };
                }
                return s;
            });
        });
        
        // Move visit to archives
        setArchivedVisits(prev => [visit, ...prev]);
        // Remove from active visits
        setVisits(prev => prev.filter(v => v.visitId !== visit.visitId));
        addToast(`Visite de ${visit.nom} marquée comme terminée et archivée.`, 'success');
    }, [setSpeakers, setVisits, setArchivedVisits, addToast]);
    
    const deleteArchivedVisit = useCallback((visitId: string) => {
        setArchivedVisits(prev => prev.filter(v => v.visitId !== visitId));
        addToast("Visite supprimée définitivement de l'archive.", 'info');
    }, [setArchivedVisits, addToast]);
    
    const addHost = useCallback((newHost: Host) => {
        if (newHost.nom && !hosts.some(h => h.nom.toLowerCase() === newHost.nom.toLowerCase())) {
            setHosts(prev => [...prev, newHost].sort((a, b) => a.nom.localeCompare(b.nom)));
            // Toast is handled in the modal to provide better context
            return true;
        }
        // Error toast is handled in the modal
        return false;
    }, [hosts, setHosts]);

    const updateHost = useCallback((hostName: string, updatedData: Partial<Host>) => {
        setHosts(prev => prev.map(h => h.nom === hostName ? { ...h, ...updatedData } : h));
        addToast(`Informations pour "${hostName}" mises à jour.`, 'info');
    }, [setHosts, addToast]);

    const deleteHost = useCallback((hostName: string) => {
        const assignedVisits = visits.filter(v => v.host === hostName && v.status !== 'cancelled');
        
        setHosts(prev => prev.filter(h => h.nom !== hostName));

        if (assignedVisits.length > 0) {
            setVisits(prevVisits => 
                prevVisits.map(v => 
                    v.host === hostName ? { ...v, host: UNASSIGNED_HOST } : v
                )
            );
            const count = assignedVisits.length;
            const visitPlural = count > 1 ? 's' : '';
            addToast(`"${hostName}" supprimé. ${count} visite${visitPlural} associée${visitPlural} a/ont été mise${visitPlural} à jour.`, 'success');
        } else {
            addToast(`"${hostName}" a été supprimé.`, 'success');
        }
    }, [visits, setHosts, setVisits, addToast]);
    
    const logCommunication = useCallback((visitId: string, messageType: MessageType, role: MessageRole) => {
        const currentDate = new Date().toISOString();
        setVisits(prevVisits => 
            prevVisits.map(visit => {
                if (visit.visitId === visitId) {
                    const updatedCommunicationStatus = { ...visit.communicationStatus };
                    if (messageType === 'preparation') {
                        updatedCommunicationStatus.preparation = { ...updatedCommunicationStatus.preparation, [role]: currentDate };
                    } else if (messageType === 'reminder-7') {
                        updatedCommunicationStatus.reminder7days = { ...updatedCommunicationStatus.reminder7days, [role]: currentDate };
                    } else if (messageType === 'reminder-2') {
                        updatedCommunicationStatus.reminder2days = { ...updatedCommunicationStatus.reminder2days, [role]: currentDate };
                    } else if (messageType === 'thanks') {
                        updatedCommunicationStatus.thanks = { ...updatedCommunicationStatus.thanks, [role]: currentDate };
                    } else if (messageType === 'needs') {
                        updatedCommunicationStatus.needs = { ...updatedCommunicationStatus.needs, [role]: currentDate };
                    }
                    return { ...visit, communicationStatus: updatedCommunicationStatus };
                }
                return visit;
            })
        );
    }, [setVisits]);

    const saveCustomTemplate = useCallback((language: Language, messageType: MessageType, role: MessageRole, text: string) => {
        setCustomTemplates(prev => {
            const newTemplates = JSON.parse(JSON.stringify(prev));
            if (!newTemplates[language]) newTemplates[language] = {};
            if (!newTemplates[language]![messageType]) newTemplates[language]![messageType] = {};
            newTemplates[language]![messageType]![role] = text;
            return newTemplates;
        });
        addToast("Modèle de message sauvegardé !", 'success');
    }, [setCustomTemplates, addToast]);

    const deleteCustomTemplate = useCallback((language: Language, messageType: MessageType, role: MessageRole) => {
        setCustomTemplates(prev => {
            const newTemplates = JSON.parse(JSON.stringify(prev));
            if (newTemplates[language]?.[messageType]?.[role]) {
                delete newTemplates[language]![messageType]![role];
                if (Object.keys(newTemplates[language]![messageType]!).length === 0) delete newTemplates[language]![messageType];
                if (Object.keys(newTemplates[language]!).length === 0) delete newTemplates[language];
            }
            return newTemplates;
        });
        addToast("Modèle par défaut restauré.", 'info');
    }, [setCustomTemplates, addToast]);
    
    const saveCustomHostRequestTemplate = useCallback((language: Language, text: string) => {
        setCustomHostRequestTemplates(prev => ({ ...prev, [language]: text }));
        addToast("Modèle de message de demande d'accueil sauvegardé !", 'success');
    }, [setCustomHostRequestTemplates, addToast]);

    const deleteCustomHostRequestTemplate = useCallback((language: Language) => {
        setCustomHostRequestTemplates(prev => {
            const newTemplates = { ...prev };
            delete newTemplates[language];
            return newTemplates;
        });
        addToast("Modèle par défaut restauré pour la demande d'accueil.", 'info');
    }, [setCustomHostRequestTemplates, addToast]);

    const exportData = useCallback(async () => {
        try {
            const data = {
                speakers,
                visits,
                hosts,
                archivedVisits,
                customTemplates,
                customHostRequestTemplates,
                googleSheetId,
                googleApiKey,
            };

            const dataStr = JSON.stringify(data, null, 2);
            const fileName = `kbv-backup-${new Date().toISOString().split('T')[0]}.json`;

            if (Capacitor.isNativePlatform()) {
                // Sur Android, enregistrer dans le dossier Documents
                try {
                    const result = await Filesystem.writeFile({
                        path: `Documents/${fileName}`,
                        data: dataStr,
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8,
                        recursive: true
                    });
                    
                    addToast(`Sauvegarde réussie dans le dossier Documents : ${fileName}`, 'success');
                } catch (error) {
                    console.error('Erreur lors de la sauvegarde sur le stockage local:', error);
                    addToast('Erreur lors de la sauvegarde sur le stockage local', 'error');
                    
                    // Fallback au téléchargement standard en cas d'erreur
                    downloadFile(dataStr, fileName);
                }
            } else {
                // Sur le web, utiliser le téléchargement standard
                downloadFile(dataStr, fileName);
                addToast('Données exportées avec succès !', 'success');
            }
        } catch (error) {
            console.error('Erreur lors de l\'export des données:', error);
            addToast('Erreur lors de l\'export des données', 'error');
        }
    }, [speakers, visits, hosts, archivedVisits, customTemplates, customHostRequestTemplates, googleSheetId, googleApiKey, addToast]);

    // Fonction utilitaire pour le téléchargement de fichier
    const downloadFile = (data: string, fileName: string) => {
        const dataBlob = new Blob([data], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(dataUrl);
    };

    const importData = useCallback((data: any) => {
        if (!data.speakers || !data.visits || !data.hosts) {
            throw new Error("Fichier de sauvegarde non valide ou corrompu.");
        }
        // Sanitize imported host data
        const migratedHosts = (data.hosts || []).map((h: any) => ({
            nom: h.nom || '', // Ensure nom is a string
            telephone: h.telephone,
            gender: h.gender || 'male',
            address: h.address || '',
            photoUrl: h.photoUrl,
            unavailability: h.unavailability || [],
        }));
        
        // Sanitize imported speaker data
        const sanitizedSpeakers = (data.speakers || []).map((s: any) => ({
            ...s,
            nom: s.nom || '',
            congregation: s.congregation || '',
        }));

        setSpeakers(sanitizedSpeakers);
        setVisits(data.visits);
        setHosts(migratedHosts);
        setArchivedVisits(data.archivedVisits || []);
        setCustomTemplates(data.customTemplates || {});
        setCustomHostRequestTemplates(data.customHostRequestTemplates || {});
        setGoogleSheetId(data.googleSheetId || data.googleSheetUrl || '');
        setGoogleApiKey(data.googleApiKey || '');
        if (data.notifiedVisits) {
            localStorage.setItem('notifiedVisits', JSON.stringify(data.notifiedVisits));
        }
        addToast("Données importées avec succès !", 'success');
    }, [setSpeakers, setVisits, setHosts, setArchivedVisits, setCustomTemplates, setCustomHostRequestTemplates, setGoogleSheetId, setGoogleApiKey, addToast]);

    const resetData = useCallback(() => {
        setSpeakers(initialSpeakers);
        setVisits([]);
        setHosts(initialHosts);
        setArchivedVisits([]);
        setCustomTemplates({});
        setCustomHostRequestTemplates({});
        setGoogleSheetId('');
        setGoogleApiKey('');
        localStorage.removeItem('notifiedVisits');
        addToast("Toutes les données ont été réinitialisées.", 'success');
    }, [setSpeakers, setVisits, setHosts, setArchivedVisits, setCustomTemplates, setCustomHostRequestTemplates, setGoogleSheetId, setGoogleApiKey, addToast]);
    
    const fetchSheetData = async (tabName: string, sheetId: string, apiKey: string) => {
        if (!apiKey) throw new Error("La clé API Google n'est pas configurée dans les paramètres.");
        const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(`'${tabName}'`)}?key=${apiKey}`;
        const response = await fetch(fetchUrl, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) {
            const error = data.error?.message || "Une erreur inconnue est survenue.";
            throw new Error(`Impossible de récupérer les données pour l'onglet "${tabName}".\n\nCause : ${error}`);
        }
        return data.values || [];
    };

    const getAvailableSheets = async (sheetId: string, apiKey: string) => {
        if (!apiKey) throw new Error("La clé API Google n'est pas configurée dans les paramètres.");
        const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`;
        const response = await fetch(fetchUrl, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) {
            const error = data.error?.message || "Une erreur inconnue est survenue.";
            throw new Error(`Impossible d'accéder au Google Sheet.\n\nCause : ${error}`);
        }
        return data.sheets?.map((sheet: any) => sheet.properties.title) || [];
    };
    const syncWithGoogleSheets = useCallback(async () => {
        if (!googleSheetId || !googleApiKey) {
            addToast("L'ID du Google Sheet ou la clé API n'est pas configuré(e).", 'error');
            return;
        }
        setIsSyncing(true);
        addToast("Synchronisation avec Google Sheets en cours...", 'info');
        try {
            // D'abord, lister tous les onglets disponibles
            const availableSheets = await getAvailableSheets(googleSheetId, googleApiKey);
            addToast(`Onglets disponibles: ${availableSheets.join(', ')}`, 'info');
            
            // Lire tous les onglets disponibles pour récupérer toute la programmation
            let allSheetData: any[] = [];
            let usedSheets: string[] = [];
            
            for (const sheetName of availableSheets) {
                try {
                    const data = await fetchSheetData(sheetName, googleSheetId, googleApiKey);
                    if (data && data.length > 0) {
                        // Chercher les lignes qui contiennent des données de visite (avec dates dans n'importe quelle colonne)
                        const validRows = data.filter(row => {
                            if (!row || row.length === 0) return false;
                            // Chercher une date au format JJ/MM/AAAA dans n'importe quelle colonne
                            return row.some(cell => {
                                const cellStr = String(cell || '').trim();
                                return /^\d{2}\/\d{2}\/\d{4}$/.test(cellStr);
                            });
                        });
                        
                        if (validRows.length > 0) {
                            allSheetData.push(...validRows);
                            usedSheets.push(sheetName);
                            addToast(`${validRows.length} visites trouvées dans "${sheetName}"`, 'info');
                        }
                    }
                } catch (error) {
                    // Continuer avec l'onglet suivant
                    continue;
                }
            }
            
            if (allSheetData.length === 0) {
                throw new Error(`Aucune donnée trouvée dans les onglets disponibles: ${availableSheets.join(', ')}`);
            }
            
            addToast(`Onglets traités: ${usedSheets.join(', ')}`, 'success');
            const sheetData = allSheetData;
            if (sheetData.length < 2) {
                addToast("La feuille trouvée est vide ou ne contient aucune donnée.", 'warning');
                setIsSyncing(false);
                return;
            }

            // --- Étape 1 : Extraire et synchroniser les orateurs depuis la feuille de planning ---
            let updatedSpeakers = [...speakers];
            let speakersAddedCount = 0;
            let speakersUpdatedCount = 0;
            const speakersFromSheet = new Map<string, { nom: string, congregation: string }>();

            // Fonction pour trouver les indices des colonnes dans chaque ligne
            const findColumnIndices = (row: any[]) => {
                let dateIdx = -1, speakerIdx = -1, congIdx = -1;
                
                for (let i = 0; i < row.length; i++) {
                    const cell = String(row[i] || '').trim();
                    
                    // Chercher la date
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(cell)) {
                        dateIdx = i;
                    }
                    // Chercher l'orateur (colonne suivant la date, ou contenant un nom)
                    else if (dateIdx !== -1 && i === dateIdx + 1 && cell.length > 2) {
                        speakerIdx = i;
                    }
                    // Chercher la congrégation (colonne suivant l'orateur, ou contenant "KBV")
                    else if (speakerIdx !== -1 && i === speakerIdx + 1 && cell.length > 2) {
                        congIdx = i;
                    }
                }
                
                return { dateIdx, speakerIdx, congIdx };
            };
            
            addToast(`Traitement de ${sheetData.length} lignes de données consolidées`, 'info');

            for (const row of sheetData) {
                const { dateIdx, speakerIdx, congIdx } = findColumnIndices(row);
                if (speakerIdx !== -1) {
                    const name = row[speakerIdx]?.trim();
                    if (name) {
                        const congregation = (congIdx > -1 && row[congIdx]) ? row[congIdx].trim() : 'Non spécifiée';
                        if (!speakersFromSheet.has(normalizeName(name))) {
                            speakersFromSheet.set(normalizeName(name), { nom: name, congregation });
                        }
                    }
                }
            }

            const existingSpeakersMap = new Map(updatedSpeakers.map(s => [normalizeName(s.nom), s]));

            speakersFromSheet.forEach((sheetSpeaker, normalizedName) => {
                const existingSpeaker = existingSpeakersMap.get(normalizedName);
                if (existingSpeaker) {
                    if (existingSpeaker.congregation !== sheetSpeaker.congregation) {
                        existingSpeaker.congregation = sheetSpeaker.congregation;
                        speakersUpdatedCount++;
                    }
                } else {
                    const newSpeaker: Speaker = { id: crypto.randomUUID(), nom: sheetSpeaker.nom, congregation: sheetSpeaker.congregation, talkHistory: [] };
                    updatedSpeakers.push(newSpeaker);
                    speakersAddedCount++;
                }
            });

            // --- Étape 2 : Synchroniser le Planning ---
            let finalVisits = [...visits];
            let visitsAddedCount = 0;
            let visitsUpdatedCount = 0;
            let visitsDeletedCount = 0;

            const allSpeakersMap = new Map(updatedSpeakers.map(s => [normalizeName(s.nom), s]));
            const existingVisitsMap = new Map(visits.map(v => [v.visitDate, v]));
            const sheetVisitDates = new Set<string>();
            const processedVisits = new Set<string>(); // Pour éviter les doublons

            let processedRows = 0;
            let validDates = 0;
            
            for (const row of sheetData) {
                processedRows++;
                const { dateIdx, speakerIdx, congIdx } = findColumnIndices(row);
                
                if (dateIdx === -1 || speakerIdx === -1) {
                    addToast(`Ligne ${processedRows} ignorée: données manquantes`, 'info');
                    continue;
                }

                const dateStr = row[dateIdx]?.trim();
                const speakerName = row[speakerIdx]?.trim();
                
                addToast(`Ligne ${processedRows}: Date="${dateStr}", Orateur="${speakerName}"`, 'info');
                
                const dateParts = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (!dateParts) {
                    addToast(`Format de date invalide: "${dateStr}" (attendu: JJ/MM/AAAA)`, 'warning');
                    continue;
                }
                
                validDates++;

                const [, day, month, year] = dateParts;
                const visitDate = `${year}-${month}-${day}`;
                const visitKey = `${visitDate}-${normalizeName(speakerName)}`;
                
                // Vérifier si cette visite a déjà été traitée
                if (processedVisits.has(visitKey)) {
                    addToast(`Visite dupliquée ignorée: ${speakerName} le ${visitDate}`, 'info');
                    continue;
                }
                
                processedVisits.add(visitKey);
                sheetVisitDates.add(visitDate);

                let speakerInfo = allSpeakersMap.get(normalizeName(speakerName));
                if (!speakerInfo) {
                    // Créer automatiquement l'orateur s'il n'existe pas
                    const congregation = (congIdx > -1 && row[congIdx]) ? row[congIdx].trim() : 'Non spécifiée';
                    const newSpeaker: Speaker = { 
                        id: crypto.randomUUID(), 
                        nom: speakerName, 
                        congregation: congregation, 
                        talkHistory: [] 
                    };
                    updatedSpeakers.push(newSpeaker);
                    allSpeakersMap.set(normalizeName(speakerName), newSpeaker);
                    speakerInfo = newSpeaker;
                    speakersAddedCount++;
                    addToast(`Orateur créé automatiquement: ${speakerName}`, 'info');
                }

                const existingVisit = existingVisitsMap.get(visitDate);
                if (existingVisit) {
                    if (normalizeName(existingVisit.nom) !== normalizeName(speakerName)) {
                        const updatedVisitData = { ...existingVisit, ...speakerInfo };
                        finalVisits = finalVisits.map(v => v.visitId === updatedVisitData.visitId ? updatedVisitData : v);
                        visitsUpdatedCount++;
                    }
                } else {
                    const newVisit: Visit = { ...speakerInfo, visitId: crypto.randomUUID(), visitDate, visitTime: '14:30', host: UNASSIGNED_HOST, accommodation: '', meals: '', status: 'pending', notes: undefined, attachments: [], communicationStatus: {}, talkNoOrType: null, talkTheme: null, locationType: 'physical' };
                    finalVisits.push(newVisit);
                    visitsAddedCount++;
                    addToast(`Visite créée: ${speakerName} le ${visitDate}`, 'success');
                }
            }

            // Ne supprimer que les visites qui ont des dates correspondantes dans la feuille mais avec un orateur différent
            // Cela évite de supprimer toutes les visites futures qui ne sont pas encore dans la feuille
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Seulement supprimer les visites futures qui ont la même date qu'une entrée dans la feuille
            // mais qui ne correspondent plus (changement d'orateur par exemple)
            const visitsToDelete = visits.filter(v => {
                const visitDate = new Date(v.visitDate);
                return visitDate >= today && 
                       sheetVisitDates.has(v.visitDate) && 
                       !finalVisits.some(fv => fv.visitDate === v.visitDate && fv.visitId === v.visitId);
            });
            
            if (visitsToDelete.length > 0) {
                const idsToDelete = new Set(visitsToDelete.map(v => v.visitId));
                finalVisits = finalVisits.filter(v => !idsToDelete.has(v.visitId));
                visitsDeletedCount = idsToDelete.size;
            }

            addToast(`Diagnostic: ${processedRows} lignes traitées, ${validDates} dates valides trouvées`, 'info');

            // --- Étape 3 : Appliquer les changements ---
            setSpeakers(updatedSpeakers.sort((a, b) => a.nom.localeCompare(b.nom)));
            setVisits(finalVisits);

            const summary = [
                `${speakersAddedCount} orateur(s) ajouté(s)`,
                `${speakersUpdatedCount} orateur(s) mis à jour`,
                `${visitsAddedCount} visite(s) ajoutée(s)`,
                `${visitsUpdatedCount} visite(s) mise(s) à jour`,
                `${visitsDeletedCount} visite(s) supprimée(s)`
            ].join(', ') + '.';
            addToast(summary, 'success', 8000);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
            addToast(`Échec de la synchronisation : ${errorMessage}`, 'error');
        } finally {
            setIsSyncing(false);
        }
    }, [googleSheetId, googleApiKey, addToast, speakers, visits, setSpeakers, setVisits]);

const value: DataContextType = {
    speakers,
    visits,
    hosts,
    archivedVisits,
    customTemplates,
    customHostRequestTemplates,
    googleSheetId,
    googleApiKey,
    isSyncing,
    upcomingVisits,
    setGoogleSheetId,
    setGoogleApiKey,
    syncWithGoogleSheets,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    addVisit,
    updateVisit,
    deleteVisit,
    completeVisit,
    deleteArchivedVisit,
    addHost,
    updateHost,
    deleteHost,
    saveCustomTemplate,
    deleteCustomTemplate,
    saveCustomHostRequestTemplate,
    deleteCustomHostRequestTemplate,
    logCommunication,
    exportData,
    importData,
    resetData,
};

return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use the DataContext.
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};