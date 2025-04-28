'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
const Login = () => {
    const router = useRouter();

    // Initialize Google Auth Provider
    const googleProvider = new GoogleAuthProvider();

    const [authing, setAuthing] = useState(false);
    const [error, setError] = useState('');

    const signInWithGoogle = async () => {
        setAuthing(true);

        signInWithPopup(auth, googleProvider)
            .then((res) => {
                console.log(res.user.uid);
                router.push('/home');
            })
            .catch((err) => {
                console.log(err);
                setError(err.message);
                setAuthing(false);
            });
    };

    return (
        <div className="w-screen h-screen flex">
            {/* Left half of the screen - background styling */}
            <div className="w-1/2 h-full flex flex-col bg-[#282c34] items-center justify-center"></div>

            {/* Right half of the screen - login form */}
            <div className="w-1/2 h-full bg-[#1a1a1a] flex flex-col p-20 justify-center">
                <div className="w-full flex flex-col max-w-[450px] mx-auto">
                    {/* Header section with title and welcome message */}
                    <div className="w-full flex flex-col mb-10 text-white">
                        <h3 className="text-4xl font-bold mb-2">Login</h3>
                        <p className="text-lg mb-4">Welcome! Please enter your details.</p>
                    </div>
                    {/* Display error message if there is one */}
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    {/* Button to log in with Google */}
                    <button
                        className="w-full bg-white text-black font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer mt-7 gap-4"
                        onClick={signInWithGoogle}
                        disabled={authing}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="24"
                            height="24"
                            viewBox="0 0 48 48"
                        >
                            <path
                                fill="#fbc02d"
                                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                            ></path>
                            <path
                                fill="#e53935"
                                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                            ></path>
                            <path
                                fill="#4caf50"
                                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                            ></path>
                            <path
                                fill="#1565c0"
                                d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                            ></path>
                        </svg>
                        Log In With Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
