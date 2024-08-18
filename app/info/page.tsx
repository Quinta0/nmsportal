"use client"
import React from 'react';
import Header from '@/components/Header';
import { Separator } from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {router} from "next/client";
import {useRouter} from "next/navigation";
import { ChevronsLeft } from 'lucide-react';

export default function InfoPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-12 py-8">
                <div className="flex items-center mb-6">
                    <ChevronsLeft onClick={() => router.back()} className="mr-4" />
                    <h1 className="text-3xl font-bold">No Man's Sky Portal Address Tool - Information</h1>
                </div>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">What is this tool?</h2>
                    <p>This tool helps No Man's Sky players generate, translate, and share portal addresses. It consists
                        of three main features:</p>
                    <ul className="list-disc pl-5 mt-2">
                        <li><strong>Generator:</strong> Create random portal addresses or input your own.</li>
                        <li><strong>Translator:</strong> Convert between hexadecimal addresses and glyph symbols.</li>
                        <li><strong>Gallery:</strong> Share and discover interesting locations with the community.</li>
                    </ul>
                </section>
                <Separator className="mb-8"/>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">How to use the Generator</h2>
                    <p>The generator allows you to create random portal addresses or input your own. You can also add descriptions, tags, and images to share in the gallery.</p>
                </section>
                <Separator className="mb-8"/>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">How to use the Translator</h2>
                    <p>The translator converts between hexadecimal addresses and glyph symbols. You can toggle between translating from hex to glyphs or from glyphs to hex.</p>
                </section>
                <Separator className="mb-8"/>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">What is the Gallery?</h2>
                    <p>The gallery is a community-driven feature where players can share interesting locations they've discovered. You can add your own discoveries or browse and vote on others' finds.</p>
                </section>
                <Separator className="mb-8"/>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Why do I need to enter my NMS friendship code?</h2>
                    <p>Your NMS friendship code is used to identify your contributions to the gallery and to prevent duplicate voting. It's not shared publicly and is only used within the tool.</p>
                </section>
                <Separator className="mb-8"/>
                <section>
                    <h2 className="text-2xl font-semibold mb-4">How Portal Addresses Work</h2>
                    <p>In No Man's Sky, portal addresses consist of 12 glyphs chosen from a set of 16 possible glyphs. The first glyph represents the planetary index, the next two the solar system index, followed by one for the planet index, and the remaining eight for specific X, Y, and Z coordinates within that system. By inputting a specific sequence of glyphs, players can teleport to corresponding locations across the vast game world.</p>
                </section>
                <Separator className="mb-8"/>
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Special Thanks</h2>
                    <p>Thanks to the The Games Hub and the No Man's Sky community for their support and inspiration.</p>
                    <p>And to Rask Rex for helping me with lots of feedback!</p>
                </section>
            </main>
        </div>
    );
}