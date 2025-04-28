import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoading(false);
                router.push('/');
            } else {
                setIsLoading(false);
                router.push('/login');
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <div>{children}</div>;
};

export default AuthRoute;
