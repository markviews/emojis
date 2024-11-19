import { useState, useRef } from "react";

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
    const [notificationText, setNotification] = useState("");
    const isVisible = notificationText !== "";

    ShowNotificationInternal = (message: string, duration: number = 1000) => {
        setNotification(message);

        // clear timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // hide notification after duration
        timeoutRef.current = setTimeout(() => {
            setNotification("");
        }, duration);
    };

    // apply animation based on visibility
    return (
        <div
            className={`notification ${isVisible ? "notification-show" : "notification-hide"}`}
        >
            {notificationText}
        </div>
    );
}
