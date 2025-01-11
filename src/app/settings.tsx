import { auth } from './firebase';

function SettingsPage() {

    return (
        <div>
            <h1>Settings</h1>
            <button onClick={() => auth.signOut()}>Sign out</button>
            {auth.currentUser?.email}
        </div>
    );
}

export default SettingsPage;