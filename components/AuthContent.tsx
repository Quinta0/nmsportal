import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const GlyphGenerator = dynamic(() => import('./GlyphGenerator'), { ssr: false });

const AuthContent = () => {
    const auth = useAuth();

    return (
        <>
            {auth?.user ? (
                <>
                    <Button onClick={auth.logOut} className="mb-4">Log Out</Button>
                    <GlyphGenerator/>
                </>
            ) : (
                <LoginForm />
            )}
        </>
    );
};

export default AuthContent;