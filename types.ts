export interface TalkHistory {
  date: string;
  talkNo: string | null;
  theme: string | null;
}

export interface Speaker {
  id: string;
  nom: string;
  congregation: string;
  talkHistory: TalkHistory[];
  telephone?: string;
  notes?: string;
  photoUrl?: string;
}

// Type for the raw speaker data before processing
export interface SpeakerRaw {
    id: string;
    nom: string;
    congregation: string;
    talkHistory: TalkHistoryRaw[];
    telephone?: string;
    notes?: string;
    photoUrl?: string;
}

// Type for the raw talk history within SpeakerRaw
export interface TalkHistoryRaw {
    date: string;
    talkNo: string | null;
    theme: string | null;
}


export interface UnavailabilityPeriod {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface Host {
  nom: string;
  telephone: string;
  gender: 'male' | 'female';
  address?: string;
  unavailability: UnavailabilityPeriod[];
  photoUrl?: string;
}

export interface Visit {
  // From Speaker
  id: string; // speaker id
  nom: string;
  congregation: string;
  telephone?: string;
  photoUrl?: string;
  
  // Visit specific
  visitId: string;
  visitDate: string;
  visitTime: string;
  host: string;
  accommodation: string;
  meals: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  attachments?: { name: string; dataUrl: string; size: number }[];
  locationType?: 'physical' | 'zoom' | 'streaming';
  communicationStatus?: {
    preparation?: { speaker?: string; host?: string }; // ISO date strings
    reminder7days?: { speaker?: string; host?: string };
    reminder2days?: { speaker?: string; host?: string };
    thanks?: { speaker?: string; host?: string };
  };
  
  // Talk details for this visit
  talkNoOrType: string | null;
  talkTheme: string | null;
}


export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type Language = 'fr' | 'cv';
export type MessageType = 'preparation' | 'reminder-7' | 'reminder-2' | 'thanks' | 'needs';
export type MessageRole = 'speaker' | 'host';

export type CustomMessageTemplates = Partial<{
  [lang in Language]: Partial<{
    [type in MessageType]: Partial<{
      [role in MessageRole]: string;
    }>;
  }>;
}>;

export type CustomHostRequestTemplates = Partial<{
  [lang in Language]: string;
}>;