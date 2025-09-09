import React, { useState, useMemo, useEffect } from 'react';
import { Visit, MessageRole, Language, MessageType, Host } from '../types';
import { WhatsAppIcon, CopyIcon, UserIcon, SaveIcon, ArrowUturnLeftIcon, ChevronDownIcon, SearchIcon } from './Icons';
import { BrotherSearch } from './BrotherSearch';
import { hostRequestMessageTemplates, UNASSIGNED_HOST } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/DataContext';
import { LanguageSelector } from './LanguageSelector';

interface MessagingCenterProps {
    onOpenMessageGenerator: (visit: Visit, role: MessageRole, messageType?: MessageType) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
};

const RGPD_MESSAGE = `\n\n---\n🔒 _Conformément au RGPD, merci de traiter ces informations personnelles avec soin et de ne pas diffuser largement._`;

const HostRequestMessageCard: React.FC<{
  language: Language;
  title: string;
  message: string;
  setMessage: (msg: string) => void;
  originalMessage: string;
  visitListString: string;
  isCustomTemplate: boolean;
  onSave: (lang: Language, text: string) => void;
  onRestore: (lang: Language) => void;
}> = ({ language, title, message, setMessage, originalMessage, visitListString, isCustomTemplate, onSave, onRestore }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const isModified = message !== originalMessage;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      addToast(`Message (${title}) copié !`, 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sendGroupMessageViaWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleSaveTemplate = () => {
    if (!isModified) return;
    let templateToSave = message.replace(RGPD_MESSAGE, '').replace(visitListString, '{visitList}');
    onSave(language, templateToSave.trim());
  };

  return (
    <div className="bg-gray-50 dark:bg-dark p-4 rounded-lg flex flex-col">
      <h3 className="text-lg font-bold text-text-main dark:text-text-main-dark mb-3">{title}</h3>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={10}
        className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark flex-grow"
        aria-label={`Message de demande d'accueil en ${title}`}
      />
      {isCustomTemplate && (
        <div className="flex items-center justify-between mt-3 p-2 bg-primary/10 rounded-md text-sm text-primary dark:text-primary-light">
          <p>Modèle perso.</p>
          <button onClick={() => onRestore(language)} className="flex items-center gap-1 font-semibold hover:underline">
            <ArrowUturnLeftIcon className="w-4 h-4" /> Rétablir
          </button>
        </div>
      )}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button type="button" onClick={sendGroupMessageViaWhatsApp} className="flex-1 inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-3 py-2 bg-green-600 text-sm font-medium text-white hover:bg-green-700">
          <WhatsAppIcon className="w-4 h-4 mr-2" /> WhatsApp
        </button>
        <button type="button" onClick={copyToClipboard} className="flex-1 inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-border-dark shadow-sm px-3 py-2 bg-white dark:bg-card-dark text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
          <CopyIcon className="w-4 h-4 mr-2" /> {copied ? 'Copié !' : 'Copier'}
        </button>
        <button type="button" onClick={handleSaveTemplate} disabled={!isModified} className="flex-1 inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-border-dark shadow-sm px-3 py-2 bg-white dark:bg-card-dark text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <SaveIcon className="w-4 h-4 mr-2" /> Enregistrer
        </button>
      </div>
    </div>
  );
};

export const MessagingCenter: React.FC<MessagingCenterProps> = ({ onOpenMessageGenerator, language, onLanguageChange }) => {
    const { upcomingVisits, speakers, hosts, customHostRequestTemplates, saveCustomHostRequestTemplate, deleteCustomHostRequestTemplate } = useData();
    const [includeRgpd, setIncludeRgpd] = useState(true);
    const [selectedVisitId, setSelectedVisitId] = useState<string>('');
    
    // States for host request messages
    const [frenchMessage, setFrenchMessage] = useState('');
    const [capeVerdeanMessage, setCapeVerdeanMessage] = useState('');
    const [originalFrenchMessage, setOriginalFrenchMessage] = useState('');
    const [originalCapeVerdeanMessage, setOriginalCapeVerdeanMessage] = useState('');

    const activeVisits = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(now.getMonth() + 2);
        twoMonthsFromNow.setHours(23, 59, 59, 999);

        return upcomingVisits.filter(v => {
            const visitDate = new Date(v.visitDate + 'T00:00:00');
            return v.status !== 'cancelled' && 
                   visitDate >= now && 
                   visitDate <= twoMonthsFromNow;
        });
    }, [upcomingVisits]);

    useEffect(() => {
        if (activeVisits.length > 0 && !selectedVisitId) {
            setSelectedVisitId(activeVisits[0].visitId);
        } else if (activeVisits.length === 0) {
            setSelectedVisitId('');
        }
    }, [activeVisits, selectedVisitId]);

    const selectedVisit = useMemo(() => activeVisits.find(v => v.visitId === selectedVisitId), [activeVisits, selectedVisitId]);
    const selectedSpeaker = useMemo(() => speakers.find(s => s.id === selectedVisit?.id), [speakers, selectedVisit]);
    const selectedHost = useMemo(() => hosts.find(h => h.nom === selectedVisit?.host), [hosts, selectedVisit]);

    const visitsNeedingHosts = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(now.getMonth() + 2);
        twoMonthsFromNow.setHours(23, 59, 59, 999);

        return upcomingVisits.filter(v => {
            const visitDate = new Date(v.visitDate + 'T00:00:00');
            const isLocalSpeaker = v.congregation.toLowerCase().includes('lyon');
            return v.host === UNASSIGNED_HOST && 
                   !isLocalSpeaker && 
                   v.status !== 'cancelled' &&
                   visitDate >= now && 
                   visitDate <= twoMonthsFromNow;
        });
    }, [upcomingVisits]);

    const frenchVisitListString = useMemo(() => {
        if (visitsNeedingHosts.length === 0) return '';
        return visitsNeedingHosts.map(visit => {
            return `*${visit.nom}* (${visit.congregation})\n*Date :* ${formatDate(visit.visitDate)}\n*Besoins :* À confirmer`;
        }).join('\n\n');
    }, [visitsNeedingHosts]);

    const capeVerdeanVisitListString = useMemo(() => {
        if (visitsNeedingHosts.length === 0) return '';
        return visitsNeedingHosts.map(visit => {
            return `*${visit.nom}* (${visit.congregation})\n*Data:* ${formatDate(visit.visitDate)}\n*Besoins:* À confirmer`;
        }).join('\n\n');
    }, [visitsNeedingHosts]);

    useEffect(() => {
        // French
        const frTemplate = customHostRequestTemplates['fr'] || hostRequestMessageTemplates['fr'];
        let frGenerated = frTemplate.replace('{visitList}', frenchVisitListString);
        if (includeRgpd) { frGenerated += RGPD_MESSAGE; }
        setFrenchMessage(frGenerated);
        setOriginalFrenchMessage(frGenerated);

        // Cape Verdean
        const cvTemplate = customHostRequestTemplates['cv'] || hostRequestMessageTemplates['cv'];
        let cvGenerated = cvTemplate.replace('{visitList}', capeVerdeanVisitListString);
        if (includeRgpd) { cvGenerated += RGPD_MESSAGE; }
        setCapeVerdeanMessage(cvGenerated);
        setOriginalCapeVerdeanMessage(cvGenerated);
    }, [visitsNeedingHosts, includeRgpd, customHostRequestTemplates, frenchVisitListString, capeVerdeanVisitListString]);


    return (
        <div className="space-y-8">
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-secondary dark:text-primary-light mb-2">Recherche de frères pour l'accueil</h2>
                        <p className="text-text-muted dark:text-text-muted-dark">Générez un message pour trouver des frères et sœurs disponibles pour l'accueil des orateurs.</p>
                    </div>
                </div>

                <div className="border-t border-b border-border-light dark:border-border-dark py-4 my-6">
                    <h3 className="text-sm font-semibold text-text-main dark:text-text-main-dark mb-3">Visites concernées :</h3>
                    {visitsNeedingHosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visitsNeedingHosts.map(visit => (
                                <div key={visit.visitId} className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-dark rounded-lg">
                                    <div>
                                        <p className="font-semibold">{visit.nom}</p>
                                        <p className="text-text-muted dark:text-text-muted-dark">{visit.congregation}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">{formatDate(visit.visitDate)}</p>
                                        <p className="text-amber-600 dark:text-amber-400 font-semibold text-xs">Besoins en attente de confirmation</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-text-muted dark:text-text-muted-dark">Aucune visite à venir ne nécessite de recherche d'accueil pour le moment.</p>
                    )}
                </div>

                <div className="flex items-center">
                    <input type="checkbox" id="rgpd-checkbox" checked={includeRgpd} onChange={(e) => setIncludeRgpd(e.target.checked)} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" />
                    <label htmlFor="rgpd-checkbox" className="ml-2 block text-sm text-text-main dark:text-text-main-dark">Inclure la note de confidentialité</label>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <HostRequestMessageCard
                        language="fr"
                        title="Français"
                        message={frenchMessage}
                        setMessage={setFrenchMessage}
                        originalMessage={originalFrenchMessage}
                        visitListString={frenchVisitListString}
                        isCustomTemplate={!!customHostRequestTemplates['fr']}
                        onSave={saveCustomHostRequestTemplate}
                        onRestore={deleteCustomHostRequestTemplate}
                    />
                    <HostRequestMessageCard
                        language="cv"
                        title="Capverdien"
                        message={capeVerdeanMessage}
                        setMessage={setCapeVerdeanMessage}
                        originalMessage={originalCapeVerdeanMessage}
                        visitListString={capeVerdeanVisitListString}
                        isCustomTemplate={!!customHostRequestTemplates['cv']}
                        onSave={saveCustomHostRequestTemplate}
                        onRestore={deleteCustomHostRequestTemplate}
                    />
                </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6">
                <h2 className="text-3xl font-bold text-secondary dark:text-primary-light mb-2">Messagerie Rapide</h2>
                <p className="text-text-muted dark:text-text-muted-dark mb-6">Générez des messages de préparation, de rappel ou de remerciement.</p>
                <LanguageSelector lang={language} setLang={onLanguageChange} />
                <div className="mt-4">
                    <label htmlFor="visit-select" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Sélectionner une visite</label>
                    <div className="relative mt-1">
                        <select id="visit-select" value={selectedVisitId} onChange={e => setSelectedVisitId(e.target.value)} className="block w-full appearance-none border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark">
                            {activeVisits.length > 0 ? (
                                activeVisits.map(v => <option key={v.visitId} value={v.visitId}>{formatDate(v.visitDate)} - {v.nom}</option>)
                            ) : (
                                <option disabled>Aucune visite à venir</option>
                            )}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDownIcon className="w-5 h-5 text-gray-400" /></div>
                    </div>
                </div>

                {selectedVisit && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border-light dark:border-border-dark">
                        <div>
                            <p className="font-semibold flex items-center"><UserIcon className="w-5 h-5 mr-2 text-text-muted"/>Orateur</p>
                            <p className="mt-1 font-bold text-lg">{selectedSpeaker?.nom}</p>
                            <p className="text-sm text-text-muted dark:text-text-muted-dark">{selectedSpeaker?.telephone || <span className="text-red-500">N° manquant</span>}</p>
                            <button onClick={() => onOpenMessageGenerator(selectedVisit, 'speaker')} disabled={!selectedSpeaker} className="mt-3 w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-semibold disabled:opacity-50">Générer un message</button>
                        </div>
                        <div>
                            <p className="font-semibold flex items-center"><UserIcon className="w-5 h-5 mr-2 text-text-muted"/>Accueil</p>
                            <p className="mt-1 font-bold text-lg">{selectedHost?.nom || 'À définir'}</p>
                            <p className="text-sm text-text-muted dark:text-text-muted-dark">{selectedHost?.telephone || <span className="text-red-500">{selectedHost ? 'N° manquant' : ''}</span>}</p>
                            <button onClick={() => onOpenMessageGenerator(selectedVisit, 'host')} disabled={!selectedHost} className="mt-3 w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 font-semibold disabled:opacity-50">Générer un message</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6">
                <h2 className="text-3xl font-bold text-secondary dark:text-primary-light mb-2">Centre de Rappels</h2>
                <p className="text-text-muted dark:text-text-muted-dark mb-6">Gérez les rappels à J-7 pour les visites à venir.</p>
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeVisits.length > 0 ? (
                        activeVisits.map(visit => {
                            const visitHost = hosts.find(h => h.nom === visit.host);
                            const [selectedReminderHost, setSelectedReminderHost] = useState<Host | null>(visitHost || null);
                            
                            const handleHostSelect = (host: Host) => {
                                setSelectedReminderHost(host);
                                // Mettre à jour le message avec le nouvel hôte
                                setTimeout(() => {
                                    onOpenMessageGenerator({
                                        ...visit,
                                        host: host.nom
                                    }, 'host', 'reminder-7');
                                }, 100);
                            };
                            
                            return (
                                <div key={visit.visitId} className="p-4 bg-gray-50 dark:bg-dark rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{visit.nom}</h3>
                                            <p className="text-sm text-text-muted dark:text-text-muted-dark">{formatDate(visit.visitDate)}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="text-center sm:text-left">
                                            <p className="font-semibold mb-2">Orateur</p>
                                            <button 
                                                onClick={() => onOpenMessageGenerator(visit, 'speaker', 'reminder-7')} 
                                                className="w-full sm:w-auto px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-semibold"
                                            >
                                                Envoyer le rappel J-7
                                            </button>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <div className="mb-2">
                                                <p className="font-semibold">Accueil</p>
                                                <BrotherSearch<Host>
                                                    items={hosts}
                                                    onSelect={handleHostSelect}
                                                    placeholder="Rechercher un frère..."
                                                    getItemName={(h) => h.nom}
                                                    getItemDetails={(h) => h.telephone || 'Téléphone non renseigné'}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => onOpenMessageGenerator({
                                                    ...visit,
                                                    host: selectedReminderHost?.nom || visit.host
                                                }, 'host', 'reminder-7')} 
                                                disabled={!selectedReminderHost}
                                                className="w-full sm:w-auto px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-semibold disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                                            >
                                                Envoyer le rappel J-7
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center py-8 text-text-muted dark:text-text-muted-dark col-span-full">
                            Aucune visite à venir pour envoyer des rappels.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};