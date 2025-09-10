import React from 'react';

interface AvatarProps {
    item: { nom?: string; photoUrl?: string | null };
    size?: string;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ item, size = 'w-10 h-10', className = '' }) => {
    // Vérification des props
    if (!item) {
        console.error('Avatar: item is missing or undefined');
        return (
            <div className={`${size} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold flex-shrink-0 ${className}`}>
                ?
            </div>
        );
    }

    // Gestion du nom manquant ou invalide
    const name = item.nom || '?';
    
    // Génération des initiales avec vérification des cas limites
    const initials = name
        .trim()
        .split(/\s+/)
        .filter(part => part.length > 0)
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';

    // Vérification de l'URL de la photo
    if (item.photoUrl) {
        try {
            // Vérification que l'URL est valide
            new URL(item.photoUrl);
            return (
                <img 
                    src={item.photoUrl} 
                    alt={name} 
                    className={`${size} rounded-full object-cover flex-shrink-0 ${className}`} 
                    onError={(e) => {
                        // En cas d'erreur de chargement de l'image, afficher les initiales
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = `w-full h-full rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center text-primary-dark dark:text-white font-bold ${size} ${className}`;
                        fallback.textContent = initials;
                        target.parentNode?.replaceChild(fallback, target);
                    }}
                />
            );
        } catch (e) {
            console.error('Invalid photo URL:', item.photoUrl, e);
            // En cas d'URL invalide, continuer avec l'affichage des initiales
        }
    }

    // Affichage des initiales par défaut
    return (
        <div 
            className={`${size} rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center text-primary-dark dark:text-white font-bold flex-shrink-0 ${className}`}
            title={name}
        >
            {initials}
        </div>
    );
};
