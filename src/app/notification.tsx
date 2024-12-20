import { useState, useRef, useEffect } from "react";

let ShowNotificationInternal: (str: string, duration?: number) => void;

export function ShowNotification(str: string, duration?: number) {
    if (ShowNotificationInternal) {
        ShowNotificationInternal(str, duration);
    } else {
        console.error("Tried to show notification before component was mounted...");
    }
}

export default function Notification() {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [notificationText, setNotification] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            // Clear timeout on unmount
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    ShowNotificationInternal = (message: string, duration: number = 1000) => {
        setNotification(message);

        // Clear timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Hide notification after duration
        timeoutRef.current = setTimeout(() => {
            setNotification(null); // Set to null to completely remove from DOM
        }, duration);
    };

    // Do not render anything if notificationText is null
    if (!notificationText) {
        return null;
    }

    return (
        <div className="notification notification-show">
            {notificationText}
        </div>
    );
}
