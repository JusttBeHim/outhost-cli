import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp, useWindowSize } from "ink";
import { Select } from "../components/ui/select/index.js";
import { KeyHint } from "../component/components/ui/key-hint/index.js";
import { darkTheme } from "../component/components/ui/_core.js";
const outhostTheme = {
    ...darkTheme,
    colors: {
        ...darkTheme.colors,
        primary: "#a855f7",
        focus: "#a855f7",
    },
};
const SELECT_ITEMS = [
    { label: "Deploy Project", value: "deploy" },
    { label: "Help & Commands", value: "help" },
    { label: "System Status", value: "status" },
    { label: "Exit OutHost", value: "exit" },
];
const BANNER_LINES = [
    "  ___        _   _   _           _   ",
    " / _ \\ _   _| |_| | | | ___  ___| |_ ",
    "| | | | | | | __| |_| |/ _ \\/ __| __|",
    "| |_| | |_| | |_|  _  | (_) \\__ \\ |_ ",
    " \\___/ \\__,_|\\__|_| |_|\\___/|___/\\__|",
];
function Header({ columns }) {
    const isNarrow = typeof columns === "number" && columns < 60;
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Box, { flexDirection: isNarrow ? "column" : "row", justifyContent: isNarrow ? "flex-start" : "space-between", children: [_jsx(Box, { flexDirection: "column", children: BANNER_LINES.map((line, idx) => (_jsx(Text, { color: "#a855f7", bold: true, children: line }, idx))) }), _jsx(Box, { marginTop: isNarrow ? 1 : 0, children: _jsx(Text, { color: "purple", bold: true, children: "\u25CF ONLINE" }) })] }), _jsxs(Box, { marginTop: 1, flexDirection: "row", flexWrap: "wrap", children: [_jsx(Text, { bold: true, color: "white", children: "OutHost CLI" }), _jsx(Text, { color: "gray", children: " v1.0.0" }), _jsx(Text, { color: "dim", children: " \u2014 Self-Hosted Application Platform" })] })] }));
}
export function Outhost() {
    const [notification, setNotification] = useState(null);
    const { exit } = useApp();
    const { columns } = useWindowSize();
    const handleExit = () => {
        process.stdout.write("\x1b[?1049l\x1b[?25h");
        exit();
        process.exit(0);
    };
    useEffect(() => {
        const onExit = () => {
            process.stdout.write("\x1b[?1049l\x1b[?25h");
        };
        process.on("exit", onExit);
        return () => {
            process.off("exit", onExit);
        };
    }, []);
    useInput((input, key) => {
        if (input === "q" || input === "Q") {
            handleExit();
            return;
        }
    });
    const handleSelect = (item) => {
        if (item.value === "exit") {
            handleExit();
        }
        else if (item.value === "deploy") {
            setNotification("Deployment module is not connected yet. Command logic coming soon.");
        }
        else if (item.value === "help") {
            setNotification("Help overview active. Run 'outhost --help' in terminal for more info.");
        }
        else if (item.value === "status") {
            setNotification("Local environment status verified. All systems nominal.");
        }
    };
    return (_jsxs(Box, { flexDirection: "column", paddingX: 1, paddingY: 1, children: [_jsx(Header, { columns: columns }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { bold: true, color: "#a855f7", children: "NAVIGATION" }), _jsx(Box, { marginTop: 1, children: _jsx(Select, { items: SELECT_ITEMS, onSelect: handleSelect, theme: outhostTheme }) })] }), notification && (_jsx(Box, { marginY: 1, children: _jsxs(Text, { color: "yellow", children: ["\u2139 ", notification] }) })), _jsx(Box, { marginTop: 1, children: _jsx(KeyHint, { keys: [
                        { key: "↑↓", label: "Move" },
                        { key: "Enter", label: "Select" },
                        { key: "q", label: "Quit" },
                    ], theme: outhostTheme }) })] }));
}
//# sourceMappingURL=Outhost.js.map