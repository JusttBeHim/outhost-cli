import React from 'react';
import type { InkUITheme } from '../_core.js';
export type StatusValue = 'online' | 'offline' | 'loading' | 'warning' | 'error' | 'idle';
export interface StatusIndicatorProps {
    status: StatusValue;
    label: string;
    /** Animate the dot — auto-enabled for loading status */
    pulse?: boolean;
    theme?: InkUITheme;
}
export declare const StatusIndicator: React.FC<StatusIndicatorProps>;
//# sourceMappingURL=StatusIndicator.d.ts.map