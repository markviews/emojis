import { auth } from './firebase';
import { useState, useEffect } from 'react';

function SettingsPage({
    setActiveTab,
}: {
    setActiveTab: (tab: string) => void;
}) {
    const [showEditButton, setShowEditButton] = useState(() => {
        return JSON.parse(localStorage.getItem('showEditButton') || 'true');
    });
    const [showPublicEmojis, setShowPublicEmojis] = useState(() => {
        return JSON.parse(localStorage.getItem('showPublicEmojis') || 'true');
    });

    const [showSearch, setShowSearch] = useState(() => {
        return JSON.parse(localStorage.getItem('showSearch') || 'true');
    });

    const handleToggle = (
        key: string,
        setter: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setter(prevState => {
            const newValue = !prevState;
            localStorage.setItem(key, JSON.stringify(newValue));
            return newValue;
        });
    };

    useEffect(() => {
        // Sync initial state with localStorage values
        localStorage.setItem('showEditButton', JSON.stringify(showEditButton));
        localStorage.setItem('showPublicEmojis', JSON.stringify(showPublicEmojis));
        localStorage.setItem('showSearch', JSON.stringify(showSearch));
    }, [showEditButton, showPublicEmojis, showSearch]);

    return (
        <div>
            <h2>Settings</h2>

            <div className="settings-item">
                <label>
                    <input
                        type="checkbox"
                        checked={showSearch}
                        onChange={() => handleToggle('showSearch', setShowSearch)}
                    />
                    Show search
                </label>
            </div>

            <div className="settings-item">
                <label>
                    <input
                        type="checkbox"
                        checked={showEditButton}
                        onChange={() => handleToggle('showEditButton', setShowEditButton)}
                    />
                    Show edit button
                </label>
            </div>

            <div className="settings-item">
                <label>
                    <input
                        type="checkbox"
                        checked={showPublicEmojis}
                        onChange={() => handleToggle('showPublicEmojis', setShowPublicEmojis)}
                    />
                    Show public emojis
                </label>
            </div>

            <br />
            Signed in as: {auth.currentUser?.email}
            <br />
            <button
                onClick={() => {
                    auth.signOut();
                    setActiveTab('login');
                }}
            >
                Sign out
            </button>
        </div>
    );
}

export default SettingsPage;
