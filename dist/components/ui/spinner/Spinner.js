import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { spinnerFrames, darkTheme } from '../_core.js';
export const Spinner = ({ label = '', type = 'dots', interval = 80, theme = darkTheme, }) => {
    const frames = spinnerFrames[type];
    const [frame, setFrame] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setFrame((prev) => (prev + 1) % frames.length);
        }, interval);
        return () => clearInterval(timer);
    }, [frames.length, interval]);
    return (_jsxs(Box, { children: [_jsx(Text, { color: theme.colors.primary, children: frames[frame] }), label ? _jsxs(Text, { children: [" ", label] }) : null] }));
};
//# sourceMappingURL=Spinner.js.map