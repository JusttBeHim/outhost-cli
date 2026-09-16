import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Box, Text, useInput, useApp, useStdin } from 'ink';
import { darkTheme } from '../_core.js';
function ListDisplay({ items, activeIndex, isFocused, theme, }) {
    return (_jsx(Box, { flexDirection: "column", children: items.map((item, i) => {
            const isActive = i === activeIndex;
            const isDisabled = item.disabled === true;
            let labelColor;
            if (isDisabled) {
                labelColor = theme.colors.muted;
            }
            else if (isActive && isFocused) {
                labelColor = theme.colors.focus;
            }
            else {
                labelColor = theme.colors.text;
            }
            const indicator = isActive && isFocused ? '❯ ' : '  ';
            return (_jsxs(Box, { children: [_jsx(Text, { color: isActive && isFocused ? theme.colors.focus : theme.colors.muted, children: indicator }), _jsx(Text, { color: labelColor, dimColor: isDisabled, children: item.label }), isDisabled ? (_jsx(Text, { color: theme.colors.muted, children: ' (disabled)' })) : null] }, String(item.value)));
        }) }));
}
function FocusedSelect({ items, onSelect, theme }) {
    const { exit } = useApp();
    // Start on the first non-disabled item
    const firstEnabled = items.findIndex((it) => !it.disabled);
    const [index, setIndex] = useState(Math.max(0, firstEnabled));
    const move = (dir) => {
        setIndex((prev) => {
            let next = prev + dir;
            // Wrap around, skip disabled
            for (let i = 0; i < items.length; i++) {
                const wrapped = ((next % items.length) + items.length) % items.length;
                if (!items[wrapped].disabled)
                    return wrapped;
                next += dir;
            }
            return prev; // all disabled — stay put
        });
    };
    useInput((input, key) => {
        if (key.ctrl && input === 'c') {
            exit();
            return;
        }
        if (key.upArrow) {
            move(-1);
            return;
        }
        if (key.downArrow) {
            move(1);
            return;
        }
        if (key.return) {
            const item = items[index];
            if (item && !item.disabled)
                onSelect(item);
            return;
        }
    });
    return _jsx(ListDisplay, { items: items, activeIndex: index, isFocused: true, theme: theme });
}
// ─── public component ─────────────────────────────────────────────────────────
export function Select({ items, onSelect, focus = true, theme = darkTheme, }) {
    const { isRawModeSupported } = useStdin();
    const canFocus = focus && isRawModeSupported;
    if (canFocus) {
        return _jsx(FocusedSelect, { items: items, onSelect: onSelect, theme: theme });
    }
    const firstEnabled = Math.max(0, items.findIndex((it) => !it.disabled));
    return (_jsx(ListDisplay, { items: items, activeIndex: firstEnabled, isFocused: false, theme: theme }));
}
//# sourceMappingURL=Select.js.map