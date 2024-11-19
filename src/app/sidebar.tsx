import { auth } from './firebase';

function Sidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {

    return (
        <div className="sidebar">
            <div className="tabs">

                <div
                    className={`tab ${activeTab === "emojis" ? "active" : ""}`}
                    onClick={() => setActiveTab("emojis")}
                >
                    Emojis
                </div>
                <div
                    className={`tab ${activeTab === "settings" ? "active" : ""}`}
                    onClick={() => setActiveTab("settings")}
                >
                    Settings
                </div>
                <button
                    className="button"
                    onClick={() => auth.signOut()}
                >Logout</button>

            </div>
        </div>
    );
}

export default Sidebar;