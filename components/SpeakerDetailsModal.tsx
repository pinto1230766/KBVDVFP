import React, { useState, useEffect, useMemo } from 'react';
import { Speaker, TalkHistory } from '../types';
import { XIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/DataContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { Avatar } from './Avatar';
import { resizeImage } from '../utils/image';

interface SpeakerDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    speaker: Speaker | null;
}

export const SpeakerDetailsModal: React.FC<SpeakerDetailsModalProps> = ({ isOpen, onClose, speaker }) => {
    const { visits, addSpeaker, updateSpeaker, deleteSpeaker } = useData();
    const [activeTab, setActiveTab] = useState<'details' | 'visits'>('details');
    const { addToast } = useToast();
    const confirm = useConfirm();
    
    // Form state
    const [nom, setNom] = useState('');
    const [congregation, setCongregation] = useState('');
    const [telephone, setTelephone] = useState<string | undefined>('');
    const [notes, setNotes] = useState<string | undefined>('');
    const [photoUrl, setPhotoUrl] = useState<string | undefined | null>(null);
    const [talkHistory, setTalkHistory] = useState<TalkHistory[]>([]);


    const isAdding = speaker === null;
    
    const speakerScheduledVisits = useMemo(() => {
        if (!speaker) return [];
        return visits
            .filter(v => v.id === speaker.id)
            .sort((a, b) => new Date(a.visitDate + 'T00:00:00').getTime() - new Date(b.visitDate + 'T00:00:00').getTime());
    }, [speaker, visits]);

    useEffect(() => {
        if (isOpen) {
            setActiveTab('details');
            if (isAdding) {
                setNom('');
                setCongregation('');
                setTelephone('');
                setNotes('');
                setPhotoUrl(null);
                setTalkHistory([]);
            } else if (speaker) {
                setNom(speaker.nom);
                setCongregation(speaker.congregation);
                setTelephone(speaker.telephone);
                setNotes(speaker.notes);
                setPhotoUrl(speaker.photoUrl);
                setTalkHistory(speaker.talkHistory || []);
            }
        }
    }, [speaker, isOpen, isAdding]);

    if (!isOpen) return null;

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addToast('Veuillez sélectionner un fichier image.', 'error');
            return;
        }

        try {
            const resizedDataUrl = await resizeImage(file);
            setPhotoUrl(resizedDataUrl);
            addToast('Photo mise à jour.', 'success');
        } catch (error) {
            console.error("Error resizing image", error);
            addToast("Erreur lors du traitement de l'image.", 'error');
        }
    };
    
    const removePhoto = () => {
        setPhotoUrl(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const speakerData: Speaker = {
            id: speaker?.id || crypto.randomUUID(),
            nom,
            congregation,
            telephone: telephone || undefined,
            notes: notes || undefined,
            photoUrl: photoUrl || undefined,
            talkHistory,
        };

        if (isAdding) {
            addSpeaker(speakerData);
        } else {
            updateSpeaker(speakerData);
        }
        onClose();
    };
    
     const handleDelete = async () => {
        if (!speaker) return;

        const upcomingVisitsCount = speakerScheduledVisits.length;
        let confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement "${speaker.nom}" ?`;
        if (upcomingVisitsCount > 0) {
            const visitPlural = upcomingVisitsCount > 1 ? 's' : '';
            confirmMessage += `\n\nATTENTION : Cet orateur a ${upcomingVisitsCount} visite${visitPlural} programmée${visitPlural} qui seron également supprimée${visitPlural}.`;
        }
        confirmMessage += "\n\nCette action est irréversible.";

        if (await confirm(confirmMessage)) {
            deleteSpeaker(speaker.id);
            onClose();
        }
    };

    const formatDateForDisplay = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(`${dateString}T00:00:00`).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const sortedTalkHistory = [...talkHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const statusInfo: {[key: string]: { icon: React.FC<any>, color: string }} = {
        confirmed: { icon: CheckCircleIcon, color: 'text-green-500' },
        pending: { icon: ClockIcon, color: 'text-amber-500' },
        cancelled: { icon: XCircleIcon, color: 'text-red-500' },
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full sm:max-w-lg max-h-full overflow-y-auto animate-fade-in-up">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                             <h2 className="text-2xl font-bold text-secondary dark:text-primary-light">{isAdding ? "Ajouter un orateur" : "Détails de l'orateur"}</h2>
                            <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                         {!isAdding && (
                            <div className="border-b border-border-light dark:border-border-dark mt-4">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('details')}
                                        className={`${ activeTab === 'details' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                    >
                                        Détails
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('visits')}
                                        className={`${ activeTab === 'visits' ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent text-text-muted dark:text-text-muted-dark hover:text-text-main dark:hover:text-text-main-dark' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                    >
                                        Visites programmées ({speakerScheduledVisits.length})
                                    </button>
                                </nav>
                            </div>
                        )}

                        <div className="mt-6">
                            {activeTab === 'details' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Photo</label>
                                        <div className="mt-2 flex items-center space-x-4">
                                            <Avatar item={{ nom: nom || '?', photoUrl: photoUrl }} size="w-16 h-16" />
                                            <div className="space-x-2">
                                                <label htmlFor="photo-upload" className="cursor-pointer px-3 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    Changer
                                                </label>
                                                <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                                {photoUrl && (
                                                    <button type="button" onClick={removePhoto} className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50">
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="nom" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Nom complet</label>
                                        <input type="text" id="nom" value={nom} onChange={(e) => setNom(e.target.value)} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" required />
                                    </div>
                                    <div>
                                        <label htmlFor="congregation" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Congrégation</label>
                                        <input type="text" id="congregation" value={congregation} onChange={(e) => setCongregation(e.target.value)} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" required />
                                    </div>
                                    <div>
                                        <label htmlFor="telephone" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Téléphone</label>
                                        <input type="tel" id="telephone" value={telephone || ''} onChange={(e) => setTelephone(e.target.value)} placeholder="+33612345678" className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" />
                                    </div>
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Notes / Préférences</label>
                                        <textarea id="notes" rows={3} value={notes || ''} onChange={(e) => setNotes(e.target.value)} placeholder="Ex. : Allergies, préférences alimentaires, transport..." className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" />
                                    </div>

                                    <div className="pt-4 border-t border-border-light dark:border-border-dark">
                                        <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark">Historique des discours passés</h3>
                                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {sortedTalkHistory.length > 0 ? sortedTalkHistory.map((talk, index) => (
                                                <div key={index} className="p-2 bg-gray-50 dark:bg-dark rounded-md">
                                                    <p className="font-semibold text-sm">{formatDateForDisplay(talk.date)}</p>
                                                    <p className="text-xs text-text-muted dark:text-text-muted-dark">
                                                        {talk.talkNo && `(${talk.talkNo})`} {talk.theme || "Thème non spécifié"}
                                                    </p>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-text-muted dark:text-text-muted-dark text-center py-2">Aucun historique.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : ( // activeTab === 'visits'
                                <div>
                                    {speakerScheduledVisits.length > 0 ? (
                                        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                            {speakerScheduledVisits.map(visit => {
                                                const StatusIcon = statusInfo[visit.status].icon;
                                                const statusColor = statusInfo[visit.status].color;
                                                return (
                                                <li key={visit.visitId} className="p-3 bg-gray-50 dark:bg-dark rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-text-main dark:text-text-main-dark">{formatDateForDisplay(visit.visitDate)}</p>
                                                            <p className="text-sm text-text-muted dark:text-text-muted-dark">Accueil par : {visit.host}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                                                            <span className={`text-xs font-semibold ${statusColor}`}>{visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            );})}
                                        </ul>
                                    ) : (
                                        <p className="text-center text-text-muted dark:text-text-muted-dark py-4">Aucune visite programmée pour cet orateur.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark px-6 py-4 flex justify-between items-center border-t border-border-light dark:border-border-dark">
                        <div>
                            {!isAdding && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-700">
                                Annuler
                            </button>
                            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark border border-transparent rounded-md text-sm font-medium text-white">
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};