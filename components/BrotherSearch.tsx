import React, { useState, useMemo } from 'react';
import { Speaker, Host } from '../types';
import { SearchIcon } from './Icons';

interface BrotherSearchProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  placeholder?: string;
  getItemName: (item: T) => string;
  getItemDetails?: (item: T) => string;
  className?: string;
}

export function BrotherSearch<T>({
  items,
  onSelect,
  placeholder = 'Rechercher un frère...',
  getItemName,
  getItemDetails,
  className = ''
}: BrotherSearchProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      const name = getItemName(item).toLowerCase();
      return name.includes(term);
    }).slice(0, 5); // Limiter à 5 résultats pour l'affichage
  }, [items, searchTerm, getItemName]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setSearchTerm('');
    setIsFocused(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-primary focus:border-primary bg-card-light dark:bg-dark"
          aria-label={placeholder}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      {isFocused && searchTerm && filteredItems.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-card-dark rounded-md shadow-lg border border-border-light dark:border-border-dark max-h-60 overflow-auto">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onMouseDown={() => handleSelect(item)}
            >
              <div className="font-medium text-text-main dark:text-text-main-dark">
                {getItemName(item)}
              </div>
              {getItemDetails && (
                <div className="text-sm text-text-muted dark:text-text-muted-dark">
                  {getItemDetails(item)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
