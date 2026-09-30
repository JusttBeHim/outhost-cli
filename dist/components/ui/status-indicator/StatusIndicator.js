import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { darkTheme } from '../_core.js';
const PULSE_FRAMES = ['●', '◉', '●', '○'];
function statusColor(status, theme) {
    switch (status) {
        case 'online': return theme.colors.success;
        case 'offline': return theme.colors.error;
        case 'error': return theme.colors.error;
        case 'warning': return theme.colors.warning;
        case 'loading': return theme.colors.warning;
        case 'idle': return theme.colors.muted;
    }
}
function staticDot(status) {
    switch (status) {
        case 'online': return '●';
        case 'offline': return '○';
        case 'error': return '●';
        case 'warning': return '⚠';
        case 'loading': return '◉';
        case 'idle': return '○';
    }
}
export const StatusIndicator = ({ status, label, pulse, theme = darkTheme, }) => {
    const shouldAnimate = pulse ?? status === 'loading';
    const [frame, setFrame] = useState(0);
    useEffect(() => {
        if (!shouldAnimate)
            return;
        const t = setInterval(() => setFrame((f) => (f + 1) % PULSE_FRAMES.length), 400);
        return () => clearInterval(t);
    }, [shouldAnimate]);
    const dot = shouldAnimate ? PULSE_FRAMES[frame] : staticDot(status);
    const color = statusColor(status, theme);
    return (_jsxs(Box, { gap: 1, children: [_jsx(Text, { color: color, children: dot }), _jsx(Text, { children: label })] }));
};
//# sourceMappingURL=StatusIndicator.js.map