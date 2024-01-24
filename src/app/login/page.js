"use client"
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseConfig, {app} from "../../config/firebaseConfig";
import { useRouter } from 'next/navigation';

import './login-styles.css'

const ERROR_MESSAGE = "The username or password is incorrect.";

// try to initialize firebase
try{
    var auth = getAuth(app);
} catch (e) {
    console.log("Error authenticating.")
    console.log(auth.app.name)
    console.log(e);

}

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loginError, setLoginError] = useState('');

    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // User successfully logged in
                const user = userCredential.user;
                console.log('User logged in:', user);
                router.push('/dashboard');   
                
            })
            .catch((error) => {
                // Error occurred during login
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Login error:', errorCode, errorMessage);
                setLoginError(errorMessage); // Add this line
            });
    };

    return (

        <form onSubmit={handleLogin} className='text-black'>
            <div className='flex flex-col'>
                <div>
                
                    <input
                        type='email'
                        id='email'
                        placeholder='Email Address'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type='password'
                        id='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type='submit' className='text-white bg-blue-500 hover:bg-blue-700 rounded font-sans h-10 w-20 mx-4'>Login</button>
                </div>
                <div className=''>
                {loginError && <p className='flash text-red-500'>{loginError}</p>}
                </div>
            </div>
        </form>
    );
};

export default LoginPage;