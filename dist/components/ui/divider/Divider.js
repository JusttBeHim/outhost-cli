import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Text, Box, useStdout } from 'ink';
import { darkTheme } from '../_core.js';
const CHARS = {
    single: '─',
    double: '═',
    dashed: '╌',
    bold: '━',
};
export const Divider = ({ title, style = 'single', width, theme = darkTheme, }) => {
    const { stdout } = useStdout();
    const totalWidth = width ?? (stdout?.columns ?? 80);
    const char = CHARS[style];
    let line;
    if (title) {
        // ── Title ───────────────────────
        const prefix = char + char + ' ';
        const suffix = ' ';
        const remaining = totalWidth - prefix.length - title.length - suffix.length;
        line = prefix + title + suffix + char.repeat(Math.max(0, remaining));
    }
    else {
        line = char.repeat(totalWidth);
    }
    return (_jsx(Box, { children: _jsx(Text, { color: theme.colors.border, children: line }) }));
};
//# sourceMappingURL=Divider.js.map