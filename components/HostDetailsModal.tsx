import React, { useState, useEffect } from 'react';
import { Host, UnavailabilityPeriod } from '../types';
import { XIcon, PlusIcon, TrashIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/DataContext';
import { Avatar } from './Avatar';
import { resizeImage } from '../utils/image';

interface HostDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    host: Host | null;
}

export const HostDetailsModal: React.FC<HostDetailsModalProps> = ({ isOpen, onClose, host }) => {
    const { hosts, addHost, updateHost } = useData();
    const { addToast } = useToast();
    
    // Form state
    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [photoUrl, setPhotoUrl] = useState<string | undefined | null>(null);
    const [unavailability, setUnavailability] = useState<UnavailabilityPeriod[]>([]);
    const [newPeriod, setNewPeriod] = useState({ startDate: '', endDate: '' });

    const isAdding = host === null;

    useEffect(() => {
        if (isOpen) {
            if (isAdding) {
                setNom('');
                setTelephone('');
                setAddress('');
                setGender('male');
                setPhotoUrl(null);
                setUnavailability([]);
            } else if (host) {
                setNom(host.nom);
                setTelephone(host.telephone);
                setAddress(host.address || '');
                setGender(host.gender || 'male');
                setPhotoUrl(host.photoUrl);
                setUnavailability(host.unavailability || []);
            }
            setNewPeriod({ startDate: '', endDate: '' });
        }
    }, [host, isOpen, isAdding]);

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

    const handleAddPeriod = () => {
        if (!newPeriod.startDate || !newPeriod.endDate) {
            addToast("Veuillez sélectionner une date de début et de fin.", 'error');
            return;
        }
        if (new Date(newPeriod.startDate) > new Date(newPeriod.endDate)) {
            addToast("La date de début ne peut pas être après la date de fin.", 'error');
            return;
        }
        setUnavailability([...unavailability, { ...newPeriod, id: crypto.randomUUID() }]);
        setNewPeriod({ startDate: '', endDate: '' });
    };

    const handleRemovePeriod = (id: string) => {
        setUnavailability(unavailability.filter(p => p.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedNom = nom.trim();
        if (!trimmedNom) {
            addToast("Le nom est obligatoire.", 'error');
            return;
        }

        if (isAdding) {
            if (hosts.some(h => h.nom.toLowerCase() === trimmedNom.toLowerCase())) {
                addToast(`Un contact d'accueil nommé "${trimmedNom}" existe déjà.`, 'error');
                return;
            }
            
            const success = addHost({
                nom: trimmedNom,
                telephone: telephone.trim(),
                address: address.trim(),
                gender,
                photoUrl: photoUrl || undefined,
                unavailability: unavailability,
            });

            if(success) {
                addToast(`"${trimmedNom}" ajouté à la liste d'accueil.`, 'success');
                onClose();
            } else {
                addToast(`"${trimmedNom}" existe déjà.`, 'error');
            }
        } else if(host) {
            updateHost(host.nom, {
                nom: trimmedNom, // Although disabled, good practice to include it
                telephone: telephone.trim(),
                address: address.trim(),
                gender,
                photoUrl: photoUrl || undefined,
                unavailability: unavailability,
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full sm:max-w-lg max-h-full overflow-y-auto animate-fade-in-up">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                             <h2 className="text-2xl font-bold text-secondary dark:text-primary-light">{isAdding ? "Ajouter un contact d'accueil" : "Modifier les informations"}</h2>
                            <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Photo</label>
                                <div className="mt-2 flex items-center space-x-4">
                                    <Avatar item={{ nom: nom || '?', photoUrl: photoUrl }} size="w-16 h-16" />
                                    <div className="space-x-2">
                                        <label htmlFor="photo-upload-host" className="cursor-pointer px-3 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-700">
                                            Changer
                                        </label>
                                        <input id="photo-upload-host" name="photo-upload-host" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                        {photoUrl && (
                                            <button type="button" onClick={removePhoto} className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50">
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="nom-host" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Nom complet</label>
                                <input type="text" id="nom-host" value={nom} onChange={(e) => setNom(e.target.value)} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" required disabled={!isAdding} title={!isAdding ? "Le nom ne peut pas être modifié." : ""} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Genre</label>
                                <div className="mt-2 flex space-x-4">
                                    <div className="flex items-center">
                                        <input id="gender-male" name="gender" type="radio" value="male" checked={gender === 'male'} onChange={() => setGender('male')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600" />
                                        <label htmlFor="gender-male" className="ml-3 block text-sm font-medium text-text-main dark:text-text-main-dark">Frère</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="gender-female" name="gender" type="radio" value="female" checked={gender === 'female'} onChange={() => setGender('female')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600" />
                                        <label htmlFor="gender-female" className="ml-3 block text-sm font-medium text-text-main dark:text-text-main-dark">Sœur</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="telephone-host" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Téléphone</label>
                                <input type="tel" id="telephone-host" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+33612345678" className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" />
                            </div>
                            <div>
                                <label htmlFor="address-host" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Adresse</label>
                                <textarea id="address-host" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Rue de l'Exemple, 69000 Lyon" className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" />
                            </div>
                            
                            <div className="pt-4 border-t border-border-light dark:border-border-dark">
                                <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark">Périodes d'indisponibilité</h3>
                                <div className="mt-2 space-y-2">
                                    {unavailability.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-dark rounded-md">
                                            <p className="text-sm">
                                                Du {new Date(`${p.startDate}T00:00:00`).toLocaleDateString('fr-FR')} au {new Date(`${p.endDate}T00:00:00`).toLocaleDateString('fr-FR')}
                                            </p>
                                            <button type="button" onClick={() => handleRemovePeriod(p.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    {unavailability.length === 0 && <p className="text-sm text-text-muted dark:text-text-muted-dark">Aucune période d'indisponibilité définie.</p>}
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Du</label>
                                        <input type="date" id="startDate" value={newPeriod.startDate} onChange={e => setNewPeriod({...newPeriod, startDate: e.target.value})} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">Au</label>
                                        <input type="date" id="endDate" value={newPeriod.endDate} onChange={e => setNewPeriod({...newPeriod, endDate: e.target.value})} className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <button type="button" onClick={handleAddPeriod} className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-main dark:text-text-main-dark font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                            <PlusIcon className="w-5 h-5 mr-2" />
                                            Ajouter la période
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark px-6 py-4 flex justify-end space-x-3 border-t border-border-light dark:border-border-dark">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md text-sm font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-700">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark border border-transparent rounded-md text-sm font-medium text-white">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};