import React, { useState, useEffect, useCallback } from 'react';
import { Visit, Language, MessageType, MessageRole } from '../types';
import { messageTemplates } from '../constants';
import { XIcon, CopyIcon, WhatsAppIcon, ChevronDownIcon, SaveIcon, ArrowUturnLeftIcon, SparklesIcon, SpinnerIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/DataContext';
import { LanguageSelector } from './LanguageSelector';
import { GoogleGenAI } from '@google/genai';

interface MessageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  role: MessageRole;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  messageType?: MessageType;
}

const formatFullDate = (dateString: string) => {
    // Appending 'T00:00:00' ensures the date string is parsed in the local timezone, not as UTC midnight.
    return new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const MessageGeneratorModal: React.FC<MessageGeneratorModalProps> = ({
  isOpen,
  onClose,
  visit,
  role,
  language,
  onLanguageChange,
  messageType: initialMessageType
}) => {
  const { speakers, hosts, customTemplates, saveCustomTemplate, deleteCustomTemplate, logCommunication } = useData();
  const [messageType, setMessageType] = useState<MessageType>(initialMessageType || 'needs');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const [isCustomTemplateLoaded, setIsCustomTemplateLoaded] = useState(false);
  const [originalTemplateText, setOriginalTemplateText] = useState('');
  
  const speaker = speakers.find(s => s.id === visit.id);
  const host = hosts.find(h => h.nom === visit.host);
  const currentRecipient = role === 'speaker' ? speaker : host;

  const generateMessage = useCallback(() => {
    const customTemplate = customTemplates[language]?.[messageType]?.[role];
    const defaultTemplate = messageTemplates[language]?.[messageType]?.[role] || "Modèle de message non disponible.";

    const template = customTemplate || defaultTemplate;
    setIsCustomTemplateLoaded(!!customTemplate);

    let generated = template;

    if (role === 'host' && host?.gender === 'female') {
        generated = generated.replace(/Frère/g, 'Sœur').replace(/frère/g, 'sœur');
        generated = generated.replace(/frères/g, 'sœurs');
        generated = generated.replace(/Irmon/g, 'Irmã');
        generated = generated.replace(/irmons/g, 'irmãs');
    }

    generated = generated.replace(/{speakerName}/g, visit.nom);
    generated = generated.replace(/{hostName}/g, visit.host);
    generated = generated.replace(/{visitDate}/g, formatFullDate(visit.visitDate));
    generated = generated.replace(/{visitTime}/g, visit.visitTime);
    generated = generated.replace(/{speakerPhone}/g, speaker?.telephone || '(non renseigné)');
    generated = generated.replace(/{hostPhone}/g, host?.telephone || '(non renseigné)');
    generated = generated.replace(/{hostAddress}/g, host?.address || '(non renseignée)');
    
    setMessageText(generated);
    setOriginalTemplateText(generated);
  }, [language, messageType, role, visit, speaker, host, customTemplates]);

  useEffect(() => {
    if (isOpen) {
        setMessageType(initialMessageType || 'needs');
    }
  }, [isOpen, initialMessageType]);

   useEffect(() => {
    if (isOpen) {
      generateMessage();
    }
  }, [messageType, language, generateMessage, isOpen]);

  const isModified = messageText !== originalTemplateText;

  const handleSave = () => {
    if (!isModified) {
        addToast("Aucune modification à enregistrer.", 'info');
        return;
    }
    saveCustomTemplate(language, messageType, role, messageText);
    setOriginalTemplateText(messageText);
    setIsCustomTemplateLoaded(true);
  };

  const handleRestoreDefault = () => {
    deleteCustomTemplate(language, messageType, role);
  };

  const handleActionAndConfirm = () => {
    logCommunication(visit.visitId, messageType, role);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(messageText).then(() => {
      setCopied(true);
      addToast("Message copié !", 'success');
      setTimeout(() => setCopied(false), 2000);
      handleActionAndConfirm();
    });
  };

  const handleSendWhatsApp = () => {
    if (!currentRecipient?.telephone) {
      addToast(`Le numéro de téléphone pour ${currentRecipient?.nom} n'est pas renseigné.`, 'error');
      return;
    }
    const phoneNumber = currentRecipient.telephone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(messageText);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    handleActionAndConfirm();
  };

  const handleGenerateWithAI = async () => {
    if (!currentRecipient) return;
    setIsGenerating(true);
    addToast("L'IA rédige un brouillon...", 'info');
    try {
        if (!process.env.API_KEY) {
            throw new Error("La clé API n'est pas configurée.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const messageTypeOptions: { value: MessageType, label: string }[] = [
            { value: 'needs', label: language === 'fr' ? 'Besoins' : 'Nesesidadi' },
            { value: 'preparation', label: language === 'fr' ? 'Préparation' : 'Preparason' },
            { value: 'reminder-7', label: language === 'fr' ? 'Rappel J-7' : 'Lembreti D-7' },
            { value: 'reminder-2', label: language === 'fr' ? 'Rappel J-2' : 'Lembreti D-2' },
            { value: 'thanks', label: language === 'fr' ? 'Remerciements' : 'Agradesimentu' },
        ];

        const prompt = `
            Rédige un message court et amical pour WhatsApp.
            Langue : ${language === 'fr' ? 'Français' : 'Créole capverdien'}.
            Type de message : ${messageTypeOptions.find(o => o.value === messageType)?.label}.
            Destinataire : ${currentRecipient.nom} (${role}).
            Orateur : ${visit.nom} de la congrégation de ${visit.congregation}.
            ${ speaker?.notes && role === 'host' ? `Préférences/Notes importantes sur l'orateur: ${speaker.notes}` : '' }
            Date de la visite : ${formatFullDate(visit.visitDate)} à ${visit.visitTime}.
            Personne pour l'accueil : ${visit.host}.
            
            Instructions :
            - Sois chaleureux et naturel.
            - N'ajoute pas de salutation finale comme "Fraternellement", je l'ajouterai moi-même.
            - Si c'est un message de préparation pour l'orateur, mentionne qui s'occupe de l'accueil.
            - Si c'est un message pour la personne qui s'occupe de l'accueil, rappelle-lui le nom de l'orateur.
            ${ speaker?.notes && role === 'host' ? `- Incorpore subtilement les préférences/notes de l'orateur dans ton message à l'hôte. Par exemple, si l'orateur est allergique aux chats, mentionne-le gentiment.` : '' }
            - Si c'est un rappel, sois bref.
            - Si ce sont des remerciements, sois sincère et encourageant.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const generatedText = response.text;
        setMessageText(generatedText);
        addToast("Brouillon généré par l'IA !", 'success');
    } catch (error) {
        console.error("Error generating AI message:", error);
        addToast(error instanceof Error && error.message.includes("API key") 
            ? "Erreur: La clé API n'est pas configurée ou est invalide."
            : "Erreur lors de la génération du message.", 'error');
    } finally {
        setIsGenerating(false);
    }
};
  
  const messageTypeOptions: { value: MessageType, label: string }[] = [
      { value: 'needs', label: language === 'fr' ? 'Besoins' : 'Nesesidadi' },
      { value: 'preparation', label: language === 'fr' ? 'Préparation' : 'Preparason' },
      { value: 'reminder-7', label: language === 'fr' ? 'Rappel J-7' : 'Lembreti D-7' },
      { value: 'reminder-2', label: language === 'fr' ? 'Rappel J-2' : 'Lembreti D-2' },
      { value: 'thanks', label: language === 'fr' ? 'Remerciements' : 'Agradesimentu' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full sm:max-w-lg max-h-full flex flex-col animate-fade-in-up">
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-secondary dark:text-primary-light">Générer un message</h2>
                    <p className="text-text-muted dark:text-text-muted-dark">
                        Pour : {currentRecipient?.nom} ({role === 'speaker' ? 'Orateur' : 'Accueil'})
                    </p>
                </div>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Fermer la fenêtre de génération de message"
                >
                    <XIcon className="w-6 h-6" aria-hidden="true" />
                    <span className="sr-only">Fermer</span>
                </button>
            </div>

            <div className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-2">
                        Langue du message
                    </label>
                    <LanguageSelector lang={language} setLang={onLanguageChange} isContained={true} />
                </div>
                <div>
                     <div className="flex justify-between items-center">
                        <label htmlFor="messageType" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">
                            Type de message
                        </label>
                        <button
                            type="button"
                            onClick={handleGenerateWithAI}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-primary dark:text-primary-light font-semibold rounded-md hover:bg-primary/10 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        >
                            {isGenerating ? <SpinnerIcon className="w-4 h-4"/> : <SparklesIcon className="w-4 h-4" />}
                            {isGenerating ? 'Génération...' : 'Suggérer avec IA'}
                        </button>
                    </div>
                     <div className="relative mt-1">
                        <select
                            id="messageType"
                            value={messageType}
                            onChange={(e) => setMessageType(e.target.value as MessageType)}
                            className="block w-full appearance-none border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark text-base"
                        >
                            {messageTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="messageContent" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">
                        Contenu du message
                    </label>
                    <textarea
                        id="messageContent"
                        rows={10}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="mt-1 block w-full border border-border-light dark:border-border-dark rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-card-light dark:bg-dark text-base"
                    />
                </div>
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-dark px-6 py-4 mt-auto border-t border-border-light dark:border-border-dark">
             {isCustomTemplateLoaded && (
                <div className="flex items-center justify-between mb-3 p-2 bg-primary/10 rounded-md text-sm text-primary dark:text-primary-light">
                    <p>Vous utilisez un modèle personnalisé.</p>
                    <button onClick={handleRestoreDefault} className="flex items-center gap-1 font-semibold hover:underline">
                        <ArrowUturnLeftIcon className="w-4 h-4" /> Rétablir le modèle par défaut
                    </button>
                </div>
            )}
            <div className="flex flex-col sm:flex-row-reverse gap-3">
                <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    disabled={!currentRecipient?.telephone}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <WhatsAppIcon className="w-5 h-5 mr-2" />
                    Envoyer via WhatsApp
                </button>
                <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="w-full inline-flex justify-center rounded-md border border-primary shadow-sm px-4 py-2 bg-primary/10 text-base font-medium text-primary dark:text-primary-light hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm"
                >
                    <CopyIcon className="w-5 h-5 mr-2" />
                    {copied ? 'Copié !' : 'Copier'}
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="w-full inline-flex justify-center rounded-md border border-secondary shadow-sm px-4 py-2 bg-secondary/10 text-base font-medium text-secondary dark:text-secondary hover:bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary sm:w-auto sm:text-sm"
                >
                    <SaveIcon className="w-5 h-5 mr-2" />
                    Enregistrer le modèle
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};