import React, { createContext, useState, useCallback, ReactNode, useContext } from 'react';
import { ExclamationTriangleIcon } from '../components/Icons';

// --- Confirm Modal Component ---
interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[99]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
          <div className="relative bg-card-light dark:bg-card-dark rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full animate-fade-in-up">
            <div className="bg-card-light dark:bg-card-dark px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-bold text-text-main dark:text-text-main-dark" id="modal-title">Confirmation requise</h3>
                  <div className="mt-2">
                    <p className="text-sm text-text-muted dark:text-text-muted-dark whitespace-pre-wrap">{message}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-dark/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-border-light dark:border-border-dark">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onConfirm}
              >
                Confirmer
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-border-dark shadow-sm px-4 py-2 bg-card-light dark:bg-card-dark text-base font-medium text-text-main dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onCancel}
              >
                Annuler
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};


// --- Context & Provider ---
type ConfirmFunction = (message: string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | undefined>(undefined);

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  resolve: ((value: boolean) => void) | null;
}

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    message: '',
    resolve: null,
  });

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationState({ isOpen: true, message, resolve });
    });
  }, []);
  
  const handleAction = (value: boolean) => {
    if (confirmationState.resolve) {
      confirmationState.resolve(value);
    }
    setConfirmationState({ isOpen: false, message: '', resolve: null });
  };
  
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        isOpen={confirmationState.isOpen}
        message={confirmationState.message}
        onConfirm={() => handleAction(true)}
        onCancel={() => handleAction(false)}
      />
    </ConfirmContext.Provider>
  );
};

// --- Hook ---
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};