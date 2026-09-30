import React from 'react';
import type { SpinnerType, InkUITheme } from '../_core.js';
export interface SpinnerProps {
    /** Text shown after the spinner frame */
    label?: string;
    /** Animation style — dots | line | arc | bounce */
    type?: SpinnerType;
    /** Frame interval in milliseconds */
    interval?: number;
    /** Theme override — defaults to darkTheme */
    theme?: InkUITheme;
}
export declare const Spinner: React.FC<SpinnerProps>;
//# sourceMappingURL=Spinner.d.ts.map