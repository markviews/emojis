import React, { useState } from "react";
import './LoginPage.css';
import { IoInformationCircleOutline } from "react-icons/io5";
import { auth, errorToString } from './firebase';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"

function LoginPage() {
    const [state, setState] = useState('login');
    return (
        <div className="login-page">
            <div className="p-8 rounded-lg shadow-lg w-96" style={{ backgroundColor: "#313338", color: "var(--foreground)" }}>

                {state === 'login' && <LoginBox setState={setState} />}
                {state === 'forgotPassword' && <ForgotPassword setState={setState} />}
                {state.startsWith('signup') && <SignupPage setState={setState} state={state} />}
            </div>
        </div>
    );
}

function Signup(email: string, password: string, setError: (state: string) => void) {
    createUserWithEmailAndPassword(auth, email, password).then(() => {
        
    }).catch((error) => {
        setError(errorToString(error.code));
    });
}

function Signin(email: string, password: string, setError: (state: string) => void) {

    if (email.length == 0 || password.length == 0) {
        setError("Email and password required");
        return;
    }

    signInWithEmailAndPassword(auth, email, password).then(() => {
        
    }).catch((error) => {
        setError(errorToString(error.code));
    });
}

function ForgotPassword({ setState }: { setState: (state: string) => void }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

    const handlePasswordReset = () => {
        if (email.length === 0) {
            setError("Email is required");
            return;
        }

        sendPasswordResetEmail(auth, email)
            .then(() => {
                setMessage("Password reset email sent! Check your inbox.");
                setError('');
                setIsDisabled(true); // Disable the button
            })
            .catch((error) => {
                setError(errorToString(error.code));
                setMessage('');
            });
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-8 text-center">
                Reset Password
            </h2>
            
            {error && (
                <div className="infoBox">
                    <IoInformationCircleOutline />
                    {error}
                </div>
            )}
            {message && (
                <div className="infoBox" style={{ color: "white" }}>
                    <IoInformationCircleOutline />
                    {message}
                </div>
            )}
            
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
            </label>
            <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                required
                className="w-full p-3 mt-1 text-black rounded bg-gray-200 focus:outline-none focus:ring focus:ring-indigo-500"
                disabled={isDisabled} // Disable the input if needed
            />
            
            <button
                onClick={handlePasswordReset}
                type="button"
                className="w-full p-3 mt-4 rounded transition duration-300"
                style={{
                    backgroundColor: isDisabled ? "gray" : "var(--button-bg)",
                    color: "var(--button-text)",
                    cursor: isDisabled ? "not-allowed" : "pointer"
                }}
                disabled={isDisabled} // Disable the button
            >
                {isDisabled ? "Email Sent" : "Send Reset Email"}
            </button>

            <div className="text-center mt-6 text-sm text-gray-400">
                Remembered your password?{" "}
                <a onClick={() => setState('login')} className="text-indigo-400 hover:underline">
                    Sign in
                </a>
            </div>
        </>
    );
}


function LoginBox({ setState }: { setState: (state: string) => void }) {
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [error, setError] = useState('');

    return (
        <>
            <h2 className="text-2xl font-bold mb-8 text-center">
                Welcome back!
            </h2>
            <div>
                {error && (
                    <div className="infoBox">
                        <IoInformationCircleOutline />
                        {error}
                    </div>
                )}

                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                </label>
                <input
                    onChange={(e) => setemail(e.target.value)}
                    type="email"
                    id="email"
                    required
                    className="w-full p-3 mt-1 text-black rounded bg-gray-200 focus:outline-none focus:ring focus:ring-indigo-500"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                </label>
                <input
                    onChange={(e) => setpassword(e.target.value)}
                    type="password"
                    id="password"
                    required
                    className="w-full p-3 mt-1 text-black rounded bg-gray-200 focus:outline-none focus:ring focus:ring-indigo-500"
                />
            </div>
            <button
                onClick={() => Signin(email, password, setError)}
                type="submit"
                className="w-full p-3 mt-4 rounded transition duration-300"
                style={{
                    backgroundColor: "var(--button-bg)",
                    color: "var(--button-text)"
                }}
            >
                Log In
            </button>

            <div className="text-center mt-6 text-sm text-gray-400">
                <a onClick={() => setState('forgotPassword')} className="text-indigo-400 hover:underline">
                    Forgot password?
                </a>
            </div>

            <div className="text-center mt-2 text-sm text-gray-400">
                Need an account?{" "}
                <a onClick={() => setState('signup')} className="text-indigo-400 hover:underline">
                    Sign up
                </a>
            </div>
        </>
    );
}



function SignupPage(
    { state, setState }: {
        state: string;
        setState: (state: string) => void;
    }) {
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [password2, setpassword2] = useState('');
    const [error, setError] = useState('');
    
    return (
        <>

            {state == 'signup' &&
                <>
                    <h2 className="text-2xl font-bold mb-8 text-center">
                        Sign up
                    </h2>

                    {error && <>
                        <div className="infoBox">
                            <IoInformationCircleOutline />
                            {error}
                        </div>
                    </>}

                    {password != '' && password2 != '' && password != password2 && <>
                        <div className="infoBox">
                            <IoInformationCircleOutline />
                            Passwords do not match
                        </div>
                    </>}

                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email
                    </label>
                    <input
                        onChange={(e) => setemail(e.target.value)}
                        type="email"
                        id="email"
                        className="w-full p-3 mt-1 text-black rounded bg-gray-200 focus:outline-none focus:ring focus:ring-indigo-500"
                    />

                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                        Password
                    </label>
                    <input
                        onChange={(e) => setpassword(e.target.value)}
                        type="password"
                        id="password"
                        className="w-full p-3 mt-1 text-black rounded bg-gray-200 focus:outline-none focus:ring focus:ring-indigo-500"
                    />

                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                        Repeat password
                    </label>
                    <input
                        onChange={(e) => setpassword2(e.target.value)}
                        type="password"
                        id="password"
                        className="w-full p-3 mt-1 text-black rounded bg-gray-200 focus:outline-none focus:ring focus:ring-indigo-500"
                    />

                    <button
                        type="submit"
                        className="w-full p-3 mt-4 rounded transition duration-300"
                        style={{
                            backgroundColor: "var(--button-bg)",
                            color: "var(--button-text)"
                        }}
                        onClick={() => Signup(email, password, setError)}
                    >
                        Sign Up
                    </button>

                    <div className="text-center mt-6 text-sm text-gray-400">
                        Already have an account? <a onClick={() => setState('login')} className="text-indigo-400 hover:underline">Sign in</a>
                    </div>

                </>
            }

        </>
    );
}

export default LoginPage;
