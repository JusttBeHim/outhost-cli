import React from 'react';
import type { InkUITheme } from '../_core.js';
export interface KeyHintItem {
    /** Displayed in brackets, e.g. "Enter", "↑↓", "Space" */
    key: string;
    /** Description label, e.g. "Select", "Navigate", "Toggle" */
    label: string;
}
export interface KeyHintProps {
    keys: KeyHintItem[];
    theme?: InkUITheme;
}
export declare const KeyHint: React.FC<KeyHintProps>;
//# sourceMappingURL=KeyHint.d.ts.map