import { auth } from './firebase';

function SettingsPage() {

    return (
        <div>
            {auth.currentUser?.email}
        </div>
    );
}

export default SettingsPage;