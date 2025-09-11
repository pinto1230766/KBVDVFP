import { useState, useEffect } from 'react';
import { Visit } from '../types';

const formatDate = (dateString: string) => {
    // Appending 'T00:00:00' ensures the date string is parsed in the local timezone, not as UTC midnight.
    // This prevents off-by-one day errors in different timezones.
    return new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const useVisitNotifications = (
    visits: Visit[],
    notificationPermission: NotificationPermission
): Record<string, { status: 'sent' | 'scheduled'; sentAt?: string }> => {
    
    const [notificationStatus, setNotificationStatus] = useState<Record<string, { status: 'sent' | 'scheduled'; sentAt?: string }>>({});

    useEffect(() => {
        const notifiedVisits: Record<string, string> = JSON.parse(localStorage.getItem('notifiedVisits') || '{}');
        const newStatus: Record<string, { status: 'sent' | 'scheduled'; sentAt?: string }> = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const futureVisits = visits.filter(v => new Date(v.visitDate + 'T00:00:00') >= today && v.status !== 'cancelled');
        
        futureVisits.forEach(visit => {
            // Appending 'T00:00:00' ensures dates are parsed consistently in the user's local timezone.
            const visitDate = new Date(visit.visitDate + 'T00:00:00');
            
            const sevenDaysBefore = new Date(visitDate);
            sevenDaysBefore.setDate(visitDate.getDate() - 7);
            const j7Key = visit.visitId + '_j7';
            
            if (today.getTime() === sevenDaysBefore.getTime() && !notifiedVisits[j7Key]) {
                if (notificationPermission === 'granted') {
                    new Notification(`Rappel J-7: Visite de ${visit.nom}`, {
                        body: `Le ${formatDate(visit.visitDate)} à ${visit.visitTime}.\nAccueil par : ${visit.host}`,
                        tag: j7Key,
                    });
                    notifiedVisits[j7Key] = new Date().toISOString();
                }
            }
            
            // Note: J-1 notifications were removed for simplicity based on previous refactoring.
            // You can add them back here using a similar logic if needed.

            const lastNotificationTimestamp = notifiedVisits[j7Key]; // Only check J-7
            if (lastNotificationTimestamp) {
                newStatus[visit.visitId] = { status: 'sent', sentAt: lastNotificationTimestamp };
            } else {
                newStatus[visit.visitId] = { status: 'scheduled' };
            }
        });
        
        localStorage.setItem('notifiedVisits', JSON.stringify(notifiedVisits));
        setNotificationStatus(newStatus);
    }, [visits, notificationPermission]);

    return notificationStatus;
};

export default useVisitNotifications;
