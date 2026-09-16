import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Text, Box } from 'ink';
import { darkTheme } from '../_core.js';
export const KeyHint = ({ keys, theme = darkTheme, }) => (_jsx(Box, { gap: 2, children: keys.map(({ key, label }) => (_jsxs(Box, { gap: 1, children: [_jsxs(Text, { bold: true, dimColor: true, children: ["[", key, "]"] }), _jsx(Text, { color: theme.colors.muted, children: label })] }, key))) }));
//# sourceMappingURL=KeyHint.js.map