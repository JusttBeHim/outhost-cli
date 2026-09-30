import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Box, Text, useInput, useApp, useStdin } from 'ink';
import { darkTheme } from '../_core.js';
const InputDisplay = ({ value, placeholder, password, isFocused, cursor, theme, }) => {
    const display = password ? '*'.repeat(value.length) : value;
    const isEmpty = value.length === 0;
    const cursorBlock = (char) => (_jsx(Text, { color: theme.colors.focus, inverse: true, children: char }, "cursor"));
    if (!isFocused) {
        return isEmpty ? (_jsx(Text, { color: theme.colors.muted, children: placeholder })) : (_jsx(Text, { children: display }));
    }
    if (isEmpty) {
        if (placeholder.length === 0)
            return cursorBlock(' ');
        return (_jsxs(Box, { children: [cursorBlock(placeholder[0]), _jsx(Text, { color: theme.colors.muted, children: placeholder.slice(1) }, "rest")] }));
    }
    const before = display.slice(0, cursor);
    const at = display[cursor] ?? ' ';
    const after = display.slice(cursor + 1);
    return (_jsxs(Box, { children: [before ? _jsx(Text, { children: before }, "before") : null, cursorBlock(at), after ? _jsx(Text, { children: after }, "after") : null] }));
};
const FocusedInput = ({ value, onChange, onSubmit, placeholder = '', password = false, theme, }) => {
    const { exit } = useApp();
    const [cursor, setCursor] = useState(value.length);
    useInput((input, key) => {
        if (key.ctrl && input === 'c') {
            exit();
            return;
        }
        if (key.leftArrow) {
            setCursor((c) => Math.max(0, c - 1));
            return;
        }
        if (key.rightArrow) {
            setCursor((c) => Math.min(value.length, c + 1));
            return;
        }
        if (key.backspace || key.delete) {
            if (cursor === 0)
                return;
            onChange(value.slice(0, cursor - 1) + value.slice(cursor));
            setCursor((c) => c - 1);
            return;
        }
        if (key.return) {
            onSubmit?.(value);
            return;
        }
        if (key.ctrl || key.meta || key.escape)
            return;
        onChange(value.slice(0, cursor) + input + value.slice(cursor));
        setCursor((c) => c + input.length);
    });
    return (_jsx(InputDisplay, { value: value, placeholder: placeholder, password: password, isFocused: true, cursor: cursor, theme: theme }));
};
// ─── public component ─────────────────────────────────────────────────────────
export const TextInput = ({ value, onChange, onSubmit, placeholder = '', password = false, focus = true, label, theme = darkTheme, }) => {
    const { isRawModeSupported } = useStdin();
    const canFocus = focus && isRawModeSupported;
    return (_jsxs(Box, { children: [label ? _jsxs(Text, { color: theme.colors.muted, children: [label, " "] }) : null, _jsx(Text, { color: theme.colors.border, children: '❯ ' }), canFocus ? (onSubmit ? (_jsx(FocusedInput, { value: value, onChange: onChange, onSubmit: onSubmit, placeholder: placeholder, password: password, focus: focus, theme: theme })) : (_jsx(FocusedInput, { value: value, onChange: onChange, placeholder: placeholder, password: password, focus: focus, theme: theme }))) : (_jsx(InputDisplay, { value: value, placeholder: placeholder, password: password, isFocused: false, cursor: value.length, theme: theme }))] }));
};
//# sourceMappingURL=TextInput.js.map