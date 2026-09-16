import React from 'react';
import type { InkUITheme } from '../_core.js';
export interface SelectItem<T = string> {
    label: string;
    value: T;
    disabled?: boolean;
}
export interface SelectProps<T = string> {
    /** List of options */
    items: SelectItem<T>[];
    /** Called when the user presses Enter on an enabled item */
    onSelect: (item: SelectItem<T>) => void;
    /** Whether this select captures keyboard input */
    focus?: boolean;
    /** Theme override — defaults to darkTheme */
    theme?: InkUITheme;
}
export declare function Select<T = string>({ items, onSelect, focus, theme, }: SelectProps<T>): React.JSX.Element;
//# sourceMappingURL=Select.d.ts.map