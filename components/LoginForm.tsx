import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [friendCode, setFriendCode] = useState('');
    const { signIn, signUp } = useAuth();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signIn(email, password);
        } catch (error) {
            console.error('Failed to sign in', error);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signUp(email, password, friendCode);
        } catch (error) {
            console.error('Failed to sign up', error);
        }
    };

    return (
        <Tabs defaultValue="signin" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <Button type="submit" className="w-full">Sign In</Button>
                </form>
            </TabsContent>
            <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <Input
                        type="text"
                        value={friendCode}
                        onChange={(e) => setFriendCode(e.target.value)}
                        placeholder="NMS Friend Code"
                        required
                    />
                    <Button type="submit" className="w-full">Sign Up</Button>
                </form>
            </TabsContent>
        </Tabs>
    );
};

export default LoginForm;