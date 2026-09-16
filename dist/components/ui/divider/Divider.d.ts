import React from 'react';
import type { InkUITheme } from '../_core.js';
export type DividerStyle = 'single' | 'double' | 'dashed' | 'bold';
export interface DividerProps {
    title?: string;
    style?: DividerStyle;
    /** Defaults to terminal width */
    width?: number;
    theme?: InkUITheme;
}
export declare const Divider: React.FC<DividerProps>;
//# sourceMappingURL=Divider.d.ts.map