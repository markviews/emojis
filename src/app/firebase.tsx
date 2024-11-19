import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyCj1DEsmJVmvk19KEtFcqZaDZO5XIaTHlc",
    authDomain: "emojis-f3a0c.firebaseapp.com",
    projectId: "emojis-f3a0c",
    storageBucket: "emojis-f3a0c.firebasestorage.app",
    messagingSenderId: "340183324364",
    appId: "1:340183324364:web:126af52e9988d47d7d5469"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const db = getFirestore(app);

export default function FirebaseHandler({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Auth state changed " + user.email);

            if (activeTab === 'login') {
                setActiveTab('emojis');
            }
            
        } else {
            console.log("Auth state changed to null");
            setActiveTab('login');
        }
    });

    return null;
}

function errorToString(error: string) {
    const msgDict: { [key: string]: string } = {
        "auth/admin-restricted-operation": "Admin only operation",
        "auth/argument-error": "Argument error",
        "auth/app-not-authorized": "App not authorized",
        "auth/app-not-installed": "App not installed",
        "auth/captcha-check-failed": "Captcha check failed",
        "auth/code-expired": "Code expired",
        "auth/cordova-not-ready": "Cordova not ready",
        "auth/cors-unsupported": "CORS unsupported",
        "auth/credential-already-in-use": "Credential already in use",
        "auth/custom-token-mismatch": "Credential mismatch",
        "auth/requires-recent-login": "Credential too old, login again",
        "auth/dependent-sdk-initialized-before-auth": "Dependent SDK initialized before Auth",
        "auth/dynamic-link-not-activated": "Dynamic link not activated",
        "auth/email-change-needs-verification": "Email change needs verification",
        "auth/email-already-in-use": "Email already in use",
        "auth/emulator-config-failed": "Emulator config failed",
        "auth/expired-action-code": "Expired action code",
        "auth/cancelled-popup-request": "Expired popup request",
        "auth/internal-error": "Internal error",
        "auth/invalid-api-key": "Invalid API key",
        "auth/invalid-app-credential": "Invalid app credential",
        "auth/invalid-app-id": "Invalid app ID",
        "auth/invalid-user-token": "Invalid Auth",
        "auth/invalid-auth-event": "Invalid auth event",
        "auth/invalid-cert-hash": "Invalid cert hash",
        "auth/invalid-verification-code": "Invalid code",
        "auth/invalid-continue-uri": "Invalid continue URI",
        "auth/invalid-cordova-configuration": "Invalid Cordova configuration",
        "auth/invalid-custom-token": "Invalid custom token",
        "auth/invalid-dynamic-link-domain": "Invalid dynamic link domain",
        "auth/invalid-email": "Invalid email",
        "auth/invalid-emulator-scheme": "Invalid emulator scheme",
        "auth/invalid-credential": "Invalid password",
        "auth/invalid-message-payload": "Invalid message payload",
        "auth/invalid-multi-factor-session": "Invalid MFA session",
        "auth/invalid-oauth-client-id": "Invalid OAuth client ID",
        "auth/invalid-oauth-provider": "Invalid OAuth provider",
        "auth/invalid-action-code": "Invalid OOB code",
        "auth/unauthorized-domain": "Invalid origin",
        "auth/wrong-password": "Invalid password",
        "auth/invalid-persistence-type": "Invalid persistence",
        "auth/invalid-phone-number": "Invalid phone number",
        "auth/invalid-provider-id": "Invalid provider ID",
        "auth/invalid-recipient-email": "Invalid recipient email",
        "auth/invalid-sender": "Invalid sender",
        "auth/invalid-verification-id": "Invalid session info",
        "auth/invalid-tenant-id": "Invalid tenant ID",
        "auth/multi-factor-info-not-found": "MFA info not found",
        "auth/multi-factor-auth-required": "MFA required",
        "auth/missing-android-pkg-name": "Missing Android package name",
        "auth/missing-app-credential": "Missing app credential",
        "auth/auth-domain-config-required": "Missing Auth domain",
        "auth/missing-verification-code": "Missing code",
        "auth/missing-continue-uri": "Missing continue URI",
        "auth/missing-iframe-start": "Missing iframe start",
        "auth/missing-ios-bundle-id": "Missing iOS bundle ID",
        "auth/missing-or-invalid-nonce": "Missing or invalid nonce",
        "auth/missing-multi-factor-info": "Missing MFA info",
        "auth/missing-multi-factor-session": "Missing MFA session",
        "auth/missing-phone-number": "Missing phone number",
        "auth/missing-verification-id": "Missing session info",
        "auth/app-deleted": "Module destroyed",
        "auth/account-exists-with-different-credential": "Need confirmation",
        "auth/network-request-failed": "Network request failed",
        "auth/null-user": "Null user",
        "auth/no-auth-event": "No auth event",
        "auth/no-such-provider": "No such provider",
        "auth/operation-not-allowed": "Operation not allowed",
        "auth/operation-not-supported-in-this-environment": "Operation not supported",
        "auth/popup-blocked": "Popup blocked",
        "auth/popup-closed-by-user": "Popup closed by user",
        "auth/provider-already-linked": "Provider already linked",
        "auth/quota-exceeded": "Quota exceeded",
        "auth/redirect-cancelled-by-user": "Redirect cancelled by user",
        "auth/redirect-operation-pending": "Redirect operation pending",
        "auth/rejected-credential": "Rejected credential",
        "auth/second-factor-already-in-use": "Second factor already enrolled",
        "auth/maximum-second-factor-count-exceeded": "Second factor limit exceeded",
        "auth/tenant-id-mismatch": "Tenant ID mismatch",
        "auth/timeout": "Timeout",
        "auth/user-token-expired": "Token expired",
        "auth/too-many-requests": "Too many attempts, try later",
        "auth/unauthorized-continue-uri": "Unauthorized domain",
        "auth/unsupported-first-factor": "Unsupported first factor",
        "auth/unsupported-persistence-type": "Unsupported persistence",
        "auth/unsupported-tenant-operation": "Unsupported tenant operation",
        "auth/unverified-email": "Unverified email",
        "auth/user-cancelled": "User cancelled",
        "auth/user-not-found": "User not found",
        "auth/user-disabled": "User disabled",
        "auth/user-mismatch": "User mismatch",
        "auth/user-signed-out": "User signed out",
        "auth/weak-password": "Weak password",
        "auth/web-storage-unsupported": "Web storage unsupported",
        "auth/already-initialized": "Already initialized",
        "auth/recaptcha-not-enabled": "Recaptcha not enabled",
        "auth/missing-recaptcha-token": "Missing Recaptcha token",
        "auth/invalid-recaptcha-token": "Invalid Recaptcha token",
        "auth/invalid-recaptcha-action": "Invalid Recaptcha action",
        "auth/missing-client-type": "Missing client type",
        "auth/missing-recaptcha-version": "Missing Recaptcha version",
        "auth/invalid-recaptcha-version": "Invalid Recaptcha version",
        "auth/invalid-req-type": "Invalid request type"
    }

    if (msgDict[error]) {
        return msgDict[error];
    }

    return error;
}

export { auth, errorToString, functions, db };