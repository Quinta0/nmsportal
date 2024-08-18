import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';

const glyphs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

const BiDirectionalTranslator = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<string[]>(Array(12).fill('0'));
    const [isHexToGlyph, setIsHexToGlyph] = useState(true);

    const getGlyphImagePath = (glyph: string) => {
        const basePath = process.env.NODE_ENV === 'production' ? '/nmsportal' : '';
        return `${basePath}/glyphs/glyph${parseInt(glyph, 16) + 1}.webp`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setInput(value);
        if (isHexToGlyph) {
            if (value.length === 12 && value.split('').every(char => glyphs.includes(char))) {
                setOutput(value.split(''));
            } else {
                setOutput(Array(12).fill('0'));
            }
        } else {
            const hexValue = value.split('').map(glyph => {
                const index = glyphs.indexOf(glyph);
                return index !== -1 ? glyphs[index] : '0';
            }).join('');
            setOutput([hexValue]);
        }
    };

    const toggleTranslationDirection = () => {
        setIsHexToGlyph(!isHexToGlyph);
        setInput('');
        setOutput(isHexToGlyph ? [''] : Array(12).fill('0'));
    };

    return (
        <div className="space-y-4">
            <Button onClick={toggleTranslationDirection} className="w-full mb-4">
                {isHexToGlyph ? "Switch to Glyph to Hex" : "Switch to Hex to Glyph"}
            </Button>
            <Input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={isHexToGlyph ? "Enter 12 character address (0-9, A-F)" : "Enter glyphs"}
                className="mb-4"
            />
            {isHexToGlyph ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                    {output.map((glyph, index) => (
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
                <Input
                    type="text"
                    value={output[0]}
                    readOnly
                    className="mb-4"
                />
            )}
        </div>
    );
};

export default BiDirectionalTranslator;