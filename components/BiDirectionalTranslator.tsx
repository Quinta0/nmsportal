import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';

const glyphs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

const BiDirectionalTranslator = () => {
    const [mode, setMode] = useState<'hexToGlyph' | 'glyphToHex'>('hexToGlyph');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const getGlyphImagePath = (glyph: string) => {
        const basePath = process.env.NODE_ENV === 'production' ? '/nmsportal' : '';
        return `${basePath}/glyphs/glyph${parseInt(glyph, 16) + 1}.webp`;
    };

    const handleGlyphClick = (glyph: string) => {
        if (mode === 'glyphToHex') {
            const newInput = input.length < 12 ? input + glyph : input;
            setInput(newInput);
            // Immediately update the output (hex result)
            const hexOutput = newInput.split('').map(g => {
                const index = glyphs.indexOf(g);
                return index !== -1 ? index.toString(16).toUpperCase() : '0';
            }).join('');
            setOutput(hexOutput);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        if (mode === 'hexToGlyph') {
            const sanitizedValue = value.replace(/[^0-9A-F]/g, '').slice(0, 12);
            setInput(sanitizedValue);
        }
    };

    const handleTranslate = () => {
        if (mode === 'hexToGlyph') {
            // Convert hex to glyphs
            const glyphOutput = input.split('').map(char => {
                const index = parseInt(char, 16);
                return index >= 0 && index < 16 ? glyphs[index] : '0';
            }).join('');
            setOutput(glyphOutput);
        }
    };

    const toggleMode = () => {
        setMode(prev => prev === 'hexToGlyph' ? 'glyphToHex' : 'hexToGlyph');
        setInput('');
        setOutput('');
    };

    return (
        <div className="space-y-4">
            <Button onClick={toggleMode} className="w-full mb-4">
                {mode === 'hexToGlyph' ? "Switch to Glyph to Hex" : "Switch to Hex to Glyph"}
            </Button>

            {mode === 'hexToGlyph' ? (
                <>
                    <Input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Enter 12 character address (0-9, A-F)"
                        className="mb-4"
                    />
                    <Button onClick={handleTranslate} className="w-full mb-4">
                        Translate
                    </Button>
                </>
            ) : (
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {glyphs.map((glyph) => (
                        <div key={glyph}
                             className="w-full aspect-square flex items-center justify-center bg-gray-800 rounded cursor-pointer"
                             onClick={() => handleGlyphClick(glyph)}>
                            <Image
                                src={getGlyphImagePath(glyph)}
                                alt={`Glyph ${glyph}`}
                                width={40}
                                height={40}
                                layout="responsive"
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-bold mb-2">Result:</h3>
                {mode === 'hexToGlyph' ? (
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {output.split('').map((glyph, index) => (
                            <div key={index} className="w-full aspect-square flex items-center justify-center bg-gray-800 rounded">
                                <Image
                                    src={getGlyphImagePath(glyph)}
                                    alt={`Glyph ${glyph}`}
                                    width={40}
                                    height={40}
                                    layout="responsive"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <Input
                            type="text"
                            value={output}
                            readOnly
                            className="mb-4"
                        />
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {input.split('').map((glyph, index) => (
                                <div key={index} className="w-full aspect-square flex items-center justify-center bg-gray-800 rounded">
                                    <Image
                                        src={getGlyphImagePath(glyph)}
                                        alt={`Glyph ${glyph}`}
                                        width={40}
                                        height={40}
                                        layout="responsive"
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BiDirectionalTranslator;