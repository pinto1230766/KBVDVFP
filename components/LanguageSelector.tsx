import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  lang: Language;
  setLang: (l: Language) => void;
  isContained?: boolean; // Style variant for modals
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ lang, setLang, isContained = false }) => {
    const baseClasses = "grid grid-cols-2 gap-x-2 rounded-lg p-1";
    const containerClasses = isContained 
        ? "bg-gray-100 dark:bg-dark" 
        : "border border-border-light dark:border-border-dark bg-gray-100 dark:bg-dark";

    const buttonBaseClasses = "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors w-full";
    const activeClasses = "bg-white dark:bg-card-dark shadow text-primary dark:text-primary-light";
    const inactiveClasses = "text-text-muted dark:text-text-muted-dark hover:bg-gray-200 dark:hover:bg-gray-700";

    // Pré-calculer les valeurs ARIA pour éviter les erreurs de linter strict
    const frenchPressed = lang === 'fr' ? 'true' : 'false';
    const capverdianPressed = lang === 'cv' ? 'true' : 'false';

    return (
        <div className={`${baseClasses} ${containerClasses}`}>
            <button
                onClick={() => setLang('fr')}
                className={`${buttonBaseClasses} ${lang === 'fr' ? activeClasses : inactiveClasses}`}
                {...(lang === 'fr' ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
            >
                Français
            </button>
            <button
                onClick={() => setLang('cv')}
                className={`${buttonBaseClasses} ${lang === 'cv' ? activeClasses : inactiveClasses}`}
                {...(lang === 'cv' ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
            >
                Capverdien
            </button>
        </div>
    );
};
