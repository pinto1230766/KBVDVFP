import React, { useState, useEffect, useMemo } from 'react';
import { Speaker, Visit, Host } from '../types';
import { XIcon, PlusIcon, PaperclipIcon, TrashIcon, InformationCircleIcon, SparklesIcon, ExclamationTriangleIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';
import { UNASSIGNED_HOST } from '../constants';
import { useData } from '../contexts/DataContext';
import { publicTalks } from '../public_talks';
import { GoogleGenAI } from '@google/genai';

interface ScheduleVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    visit: Visit | null;
    speaker: Speaker | null;
}

const isHostUnavailableForDate = (host: Host, date: string): boolean => {
    if (!date || !host.unavailability) return false;
    const visitD = new Date(`${date}T00:00:00`);
    return host.unavailability.some(period => {
        const start = new Date(`${period.startDate}T00:00:00`);
        const end = new Date(`${period.endDate}T00:00:00`);
        return visitD >= start && visitD <= end;
    });
};

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({ isOpen, onClose, visit, speaker }) => {
    const { hosts, visits, addHost, addVisit, updateVisit } = useData();
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('14:30');
    const [host, setHost] = useState('');
    const [accommodation, setAccommodation] = useState('');
    const [meals, setMeals] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<'confirmed' | 'pending' | 'cancelled' | 'completed'>('pending');
    const [attachments, setAttachments] = useState<{ name: string; dataUrl: string; size: number }[]>([]);
    const [talkNoOrType, setTalkNoOrType] = useState<string | null>('');
    const [talkTheme, setTalkTheme] = useState<string | null>('');
    const [locationType, setLocationType] = useState<'physical' | 'zoom' | 'streaming'>('physical');
    const [isGenerating, setIsGenerating] = useState(false);
    const [dateConflict, setDateConflict] = useState<Visit | null>(null);
    const [noAccommodationNeeded, setNoAccommodationNeeded] = useState(false);
    const [noMealsNeeded, setNoMealsNeeded] = useState(false);
    const { addToast } = useToast();
    
    const currentSpeaker = visit || speaker;
    const isEditing = !!visit;
    
    const isLocalSpeaker = useMemo(() => 
        currentSpeaker?.congregation.toLowerCase().includes('lyon'),
        [currentSpeaker]
    );

    useEffect(() => {
        if (visit) {
            setVisitDate(visit.visitDate);
            setVisitTime(visit.visitTime);
            setHost(visit.host);
            setAccommodation(visit.accommodation);
            setNoAccommodationNeeded(visit.accommodation === 'Logé par famille/amis' || visit.accommodation === 'PAS BESOIN');
            setMeals(visit.meals === 'Repas pris en charge par famille/amis' ? 'Repas pris en charge par famille/amis' : visit.meals);
            setNoMealsNeeded(visit.meals === 'Repas pris en charge par famille/amis');
            setNotes(visit.notes || '');
            setStatus(visit.status || 'pending');
            setAttachments(visit.attachments || []);
            setTalkNoOrType(visit.talkNoOrType || '');
            setTalkTheme(visit.talkTheme || '');
            setLocationType(visit.locationType || 'physical');
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            
            setVisitDate(`${year}-${month}-${day}`);
            setVisitTime('14:30');
            setHost(UNASSIGNED_HOST);
            setAccommodation(isLocalSpeaker ? 'Sur place' : '');
            setNoAccommodationNeeded(false);
            setMeals(isLocalSpeaker ? 'Sur place' : '');
            setNoMealsNeeded(false);
            setNotes('');
            setStatus('pending'); // Default status for new visit
            setAttachments([]);
            setTalkNoOrType('');
            setTalkTheme('');
            setLocationType('physical');
        }
    }, [visit, isOpen, hosts, isLocalSpeaker]);
    
     useEffect(() => {
        if (!currentSpeaker || !visitDate) {
            setDateConflict(null);
            return;
        }
        const conflictingVisit = visits.find(v => 
            v.id === currentSpeaker.id && 
            v.visitDate === visitDate &&
            v.visitId !== (visit?.visitId || '')
        );
        setDateConflict(conflictingVisit || null);
    }, [visitDate, currentSpeaker, visits, visit]);

    if (!isOpen) return null;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            addToast("Seuls les fichiers PDF sont autorisés.", 'error');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            addToast(`Le fichier est trop volumineux. La taille maximale est de ${MAX_FILE_SIZE / 1024 / 1024} Mo.`, 'error');
            e.target.value = '';
            return;
        }

        const totalAttachmentsSize = attachments.reduce((acc, curr) => acc + curr.size, 0);
        if (totalAttachmentsSize + file.size > 5 * 1024 * 1024) { // 5MB total limit for localStorage
            addToast("L'ajout de ce fichier dépasserait la limite de stockage totale. Veuillez supprimer d'autres pièces jointes.", 'error');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setAttachments(prev => [...prev, { name: file.name, dataUrl: reader.result as string, size: file.size }]);
            addToast(`"${file.name}" a été ajouté.`, 'success');
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset file input
    };

    const removeAttachment = (indexToRemove: number) => {
        const fileName = attachments[indexToRemove]?.name;
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
        addToast(`"${fileName}" a été supprimé.`, 'info');
    };

    const handleTalkNoChange = (value: string) => {
        setTalkNoOrType(value);
        const talkNumber = parseInt(value, 10);
        if (!isNaN(talkNumber)) {
            const foundTalk = publicTalks.find(t => t.number === talkNumber);
            if (foundTalk) {
                setTalkTheme(foundTalk.theme);
            } else {
                setTalkTheme('');
            }
        } else {
             setTalkTheme('');
        }
    };

    const handleGenerateNotes = async () => {
        if (!currentSpeaker) return;
        setIsGenerating(true);
        addToast("Génération de notes par l'IA...", 'info');
        try {
            // IMPORTANT: The API key should be set in the environment variables.
            if (!process.env.API_KEY) {
                throw new Error("La clé API n'est pas configurée.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Génère des notes de préparation pour une visite d'un orateur. Sois concis et amical.
            
            Orateur : ${currentSpeaker.nom}
            Congrégation : ${currentSpeaker.congregation}
            Préférences connues de l'orateur : ${currentSpeaker.notes || 'Aucune'}
            Notes existantes pour la visite : ${notes || 'Aucune'}
            
            Rédige quelques points clés pour l'accueil, en suggérant de confirmer les détails de voyage, les préférences pour les repas et l'hébergement si nécessaire.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
    
            const generatedText = response.text;
            
            setNotes(prevNotes => prevNotes ? `${prevNotes}\n\n---\n${generatedText}` : generatedText);
            addToast("Notes générées avec succès !", 'success');
    
        } catch (error) {
            console.error("Error generating notes:", error);
            addToast(error instanceof Error && error.message.includes("API key") 
                ? "Erreur: La clé API n'est pas configurée ou est invalide."
                : "Erreur lors de la génération des notes.", 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && visit) {
            const updatedVisit: Visit = {
                ...visit, // Conserve toutes les propriétés existantes
                visitDate,
                visitTime,
                host: locationType === 'zoom' ? 'Zoom' : locationType === 'streaming' ? 'Streaming' : host,
                accommodation: locationType === 'zoom' ? 'Zoom' : locationType === 'streaming' ? 'Streaming' : (isLocalSpeaker ? 'Sur place' : accommodation),
                meals: locationType === 'zoom' || locationType === 'streaming' ? 'N/A' : (isLocalSpeaker ? 'Sur place' : meals),
                notes,
                status,
                attachments,
                talkNoOrType,
                talkTheme,
                locationType,
            };
            updateVisit(updatedVisit);
        } else if (speaker) {
            const newVisit: Visit = {
                ...speaker,
                visitDate,
                visitTime,
                host: locationType === 'zoom' ? 'Zoom' : locationType === 'streaming' ? 'Streaming' : host,
                accommodation: locationType === 'zoom' ? 'Zoom' : locationType === 'streaming' ? 'Streaming' : (isLocalSpeaker ? 'Sur place' : accommodation),
                meals: locationType === 'zoom' || locationType === 'streaming' ? 'N/A' : (isLocalSpeaker ? 'Sur place' : meals),
                notes,
                status: status || 'pending',
                attachments: attachments || [],
                talkNoOrType,
                talkTheme,
                locationType,
                visitId: crypto.randomUUID(),
                communicationStatus: {},
            };
            addVisit(newVisit);
        }
        onClose();
    };

    const handleAddNewHost = () => {
        const newHostName = window.prompt("Entrez le nom du nouveau contact pour l'accueil :");
        if (newHostName && newHostName.trim() !== '') {
            const trimmedHost = newHostName.trim();
            const success = addHost({ nom: trimmedHost, telephone: '', address: '', unavailability: [], gender: 'male' });
            if (success) {
                setHost(trimmedHost); // Select the newly added host
                addToast(`"${trimmedHost}" ajouté. Pensez à compléter les informations (genre, tél.) dans les paramètres.`, 'info');
            } else {
                addToast(`"${trimmedHost}" existe déjà dans la liste. Vous pouvez le gérer dans les paramètres.`, 'warning');
                setHost(trimmedHost);
            }
        }
    };
    
    const { availableHosts, unavailableHosts } = useMemo(() => {
        const available: Host[] = [];
        const unavailable: Host[] = [];

        for (const h of hosts) {
            if (isHostUnavailableForDate(h, visitDate)) {
                unavailable.push(h);
            } else {
                available.push(h);
            }
        }

        available.sort((a, b) => a.nom.localeCompare(b.nom));
        unavailable.sort((a, b) => a.nom.localeCompare(b.nom));

        return { availableHosts: available, unavailableHosts: unavailable };
    }, [hosts, visitDate]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full sm:max-w-lg max-h-full overflow-y-auto animate-fade-in-up">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-secondary dark:text-primary-light">{isEditing ? 'Modifier la visite' : 'Programmer une visite'}</h2>
                                <p className="text-text-muted dark:text-text-muted-dark mt-1">
                                    pour <span className="font-semibold">{currentSpeaker?.nom}</span>
                                </p>
                            </div>
                            <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" title="Fermer la modale" aria-label="Fermer la modale">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="visitDate" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Date</label>
                                    <input type="date" id="visitDate" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" required />
                                </div>
                                <div>
                                    <label htmlFor="visitTime" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Heure</label>
                                    <input type="time" id="visitTime" value={visitTime} onChange={(e) => setVisitTime(e.target.value)} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" required />
                                </div>
                            </div>

                             {dateConflict && (
                                <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm flex items-start space-x-3">
                                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                                    <p><strong>Attention :</strong> Cet orateur est déjà programmé pour une autre visite à cette date.</p>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label htmlFor="talkNoOrType" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">
                                        N° Discours
                                    </label>
                                    <input
                                        type="text"
                                        id="talkNoOrType"
                                        value={talkNoOrType || ''}
                                        onChange={(e) => handleTalkNoChange(e.target.value)}
                                        className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark"
                                        placeholder="Ex: 123 ou DS"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="talkTheme" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">
                                        Thème du discours
                                    </label>
                                    <input
                                        type="text"
                                        id="talkTheme"
                                        value={talkTheme || ''}
                                        onChange={(e) => setTalkTheme(e.target.value)}
                                        className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark"
                                        placeholder="Le thème s'affiche automatiquement"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Type de visite</label>
                                <div className="mt-2 flex space-x-4">
                                    <div className="flex items-center">
                                        <input id="type-physical" name="locationType" type="radio" value="physical" checked={locationType === 'physical'} onChange={() => setLocationType('physical')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600" />
                                        <label htmlFor="type-physical" className="ml-3 block text-sm font-medium text-text-main dark:text-text-main-dark">Présentiel</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="type-zoom" name="locationType" type="radio" value="zoom" checked={locationType === 'zoom'} onChange={() => setLocationType('zoom')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600" />
                                        <label htmlFor="type-zoom" className="ml-3 block text-sm font-medium text-text-main dark:text-text-main-dark">Zoom</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="type-streaming" name="locationType" type="radio" value="streaming" checked={locationType === 'streaming'} onChange={() => setLocationType('streaming')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600" />
                                        <label htmlFor="type-streaming" className="ml-3 block text-sm font-medium text-text-main dark:text-text-main-dark">Streaming</label>
                                    </div>
                                </div>
                            </div>
                            
                            {locationType === 'physical' && (
                                <>
                                    <div>
                                        <label htmlFor="host" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Accueil par</label>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <select id="host" value={host} onChange={(e) => setHost(e.target.value)} className="block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark">
                                                <option value="PAS BESOIN">PAS BESOIN</option>
                                                <option value={UNASSIGNED_HOST}>{UNASSIGNED_HOST}</option>
                                                <optgroup label="Disponible">
                                                    {availableHosts.map(h => <option key={h.nom} value={h.nom}>{h.nom}</option>)}
                                                </optgroup>
                                                {unavailableHosts.length > 0 && (
                                                    <optgroup label="Indisponible">
                                                        {unavailableHosts.map(h => <option key={h.nom} value={h.nom} disabled>{h.nom}</option>)}
                                                    </optgroup>
                                                )}
                                            </select>
                                            <button 
                                                type="button" 
                                                onClick={handleAddNewHost} 
                                                disabled={host === 'PAS BESOIN'}
                                                className={`p-2 rounded-md flex-shrink-0 w-full flex items-center justify-center ${host === 'PAS BESOIN' ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20'}`} 
                                                title={host === 'PAS BESOIN' ? "Désactivé car 'PAS BESOIN' est sélectionné" : "Ajouter un nouveau contact pour l'accueil"}
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                Ajouter
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {!isLocalSpeaker ? (
                                        <>
                                            <div>
                                                <div className="flex items-center mb-2">
                                                    <input
                                                        type="checkbox"
                                                        id="noAccommodationNeeded"
                                                        checked={accommodation === 'Logé par famille/amis'}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setAccommodation('Logé par famille/amis');
                                                            } else {
                                                                setAccommodation('');
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="noAccommodationNeeded" className="ml-2 block text-sm text-text-muted dark:text-text-muted-dark">
                                                        Pas besoin d'hébergement: l'orateur sera logé par la famille ou des amis
                                                    </label>
                                                </div>
                                                <input
                                                    type="text"
                                                    id="accommodation"
                                                    value={accommodation}
                                                    onChange={(e) => setAccommodation(e.target.value)}
                                                    className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark"
                                                    placeholder="Ex: PAS BESOIN, Chez l'hôte, Hôtel, Autre..."
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center mb-2">
                                                    <input
                                                        type="checkbox"
                                                        id="noMealsNeeded"
                                                        checked={meals === 'Repas pris en charge par famille/amis'}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setMeals('Repas pris en charge par famille/amis');
                                                            } else {
                                                                setMeals('');
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="noMealsNeeded" className="ml-2 block text-sm text-text-muted dark:text-text-muted-dark">
                                                        Pas besoin de repas: les repas seront pris en charge par la famille ou des amis
                                                    </label>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    id="meals" 
                                                    value={meals} 
                                                    onChange={(e) => setMeals(e.target.value)} 
                                                    className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" 
                                                    placeholder="Ex: Samedi soir, Dimanche midi..."
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm flex items-start space-x-3">
                                            <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                                            <p>L'hébergement et les repas sont automatiquement définis sur "Sur place" pour les orateurs de Lyon.</p>
                                        </div>
                                    )}
                                </>
                            )}
                            

                             <div>
                                <label htmlFor="notes" className="flex justify-between items-center text-sm font-medium text-text-muted dark:text-text-muted-dark">
                                    <span>Notes</span>
                                    <button
                                        type="button"
                                        onClick={handleGenerateNotes}
                                        disabled={isGenerating}
                                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-primary dark:text-primary-light font-semibold rounded-md hover:bg-primary/10 disabled:opacity-50 disabled:cursor-wait transition-colors"
                                        title="Générer des suggestions de notes avec l'IA"
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        {isGenerating ? 'Génération...' : 'Suggérer avec IA'}
                                    </button>
                                </label>
                                <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" placeholder="Toute information supplémentaire..."></textarea>
                            </div>
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Statut</label>
                                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as 'confirmed' | 'pending' | 'cancelled' | 'completed')} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark">
                                    <option value="pending">En attente</option>
                                    <option value="confirmed">Confirmé</option>
                                    <option value="completed">Terminé</option>
                                    <option value="cancelled">Annulé</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Pièces jointes (PDF, max 2Mo/fichier)</label>
                                <div className="mt-2">
                                    <label htmlFor="file-upload" className="w-full flex justify-center px-4 py-2 border-2 border-border-light dark:border-border-dark border-dashed rounded-md cursor-pointer hover:border-primary dark:hover:border-primary-light">
                                        <div className="space-y-1 text-center">
                                            <PaperclipIcon className="mx-auto h-8 w-8 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                <span>Ajouter un fichier</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {attachments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {attachments.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-dark rounded-md text-sm">
                                                <a href={file.dataUrl} download={file.name} className="truncate text-primary dark:text-primary-light hover:underline" title={file.name}>
                                                    {file.name}
                                                </a>
                                                <button type="button" onClick={() => removeAttachment(index)} className="ml-3 p-1 text-red-500 hover:text-red-700" title="Supprimer la pièce jointe" aria-label="Supprimer la pièce jointe">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark px-6 py-4 flex justify-end space-x-3 border-t border-border-light dark:border-border-dark">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-700">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark border border-transparent rounded-md text-sm font-medium text-white">
                            {isEditing ? 'Enregistrer les modifications' : 'Programmer la visite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};