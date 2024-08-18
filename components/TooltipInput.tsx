import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input, InputProps } from "@/components/ui/input";
import { Info } from 'lucide-react';

interface TooltipInputProps extends InputProps {
    tooltipText: string;
}

const TooltipInput: React.FC<TooltipInputProps> = ({ tooltipText, ...props }) => {
    return (
        <div className="relative flex items-center">
            <Input {...props} />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="w-4 h-4 absolute right-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltipText}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default TooltipInput;