import React from 'react';
import type { InkUITheme } from '../_core.js';
export interface TextInputProps {
    /** Controlled value */
    value: string;
    /** Called on every keystroke with the new value */
    onChange: (value: string) => void;
    /** Called when Enter is pressed */
    onSubmit?: (value: string) => void;
    /** Shown when value is empty */
    placeholder?: string;
    /** Mask input characters as * */
    password?: boolean;
    /** Whether this input captures keyboard input */
    focus?: boolean;
    /** Optional label rendered to the left */
    label?: string;
    /** Theme override — defaults to darkTheme */
    theme?: InkUITheme;
}
export declare const TextInput: React.FC<TextInputProps>;
//# sourceMappingURL=TextInput.d.ts.map