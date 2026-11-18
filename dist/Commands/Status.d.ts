import React from "react";
import type { InkUITheme } from "../component/components/ui/_core.js";
export declare const outhostTheme: InkUITheme;
export interface StatusProps {
    onBack?: () => void;
    isStandalone?: boolean;
}
export declare function Status({ onBack, isStandalone }: StatusProps): React.JSX.Element;
export declare function startStatusCommand(): void;
//# sourceMappingURL=Status.d.ts.map