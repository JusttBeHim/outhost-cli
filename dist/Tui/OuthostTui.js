import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp, useWindowSize } from "ink";
import { Select } from "../components/ui/select/index.js";
import { KeyHint } from "../component/components/ui/key-hint/index.js";
import { darkTheme } from "../component/components/ui/_core.js";
import { Spinner } from "../components/ui/spinner/index.js";
import { StatusIndicator } from "../components/ui/status-indicator/index.js";
import { Deployment } from "../deploy/deployment.js";
import { TextInput } from "../components/ui/text-input/index.js";
import { Help } from "../Commands/Help.js";
import { Status } from "../Commands/Status.js";
const outhostTheme = {
    ...darkTheme,
    colors: {
        ...darkTheme.colors,
        primary: "#a855f7",
        focus: "#a855f7",
    },
};
function getStatusColor(code) {
    if (code >= 200 && code < 300)
        return 'green';
    if (code >= 300 && code < 400)
        return 'cyan';
    if (code >= 400 && code < 500)
        return 'yellow';
    return 'red';
}
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
    const [showHelp, setShowHelp] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [deployStep, setDeployStep] = useState('NONE');
    const [pathInput, setPathInput] = useState('');
    const [deployState, setDeployState] = useState(null);
    const [deployment, setDeployment] = useState(null);
    const { exit } = useApp();
    const { columns } = useWindowSize();
    const handleExit = () => {
        if (deployment)
            deployment.cleanup();
        process.stdout.write("\x1b[?1049l\x1b[?25h");
        exit();
        process.exit(0);
    };
    useEffect(() => {
        const onExit = () => {
            if (deployment)
                deployment.cleanup();
            process.stdout.write("\x1b[?1049l\x1b[?25h");
        };
        process.on("exit", onExit);
        return () => {
            process.off("exit", onExit);
        };
    }, [deployment]);
    useInput((input, key) => {
        if (input === "q" || input === "Q") {
            handleExit();
            return;
        }
        if (showHelp && (input === "b" || input === "B" || key.escape)) {
            setShowHelp(false);
            return;
        }
        if (showStatus && (input === "b" || input === "B" || key.escape)) {
            setShowStatus(false);
            return;
        }
    });
    const startDeployment = (targetPath) => {
        setDeployStep('DEPLOYING');
        const dep = new Deployment();
        setDeployment(dep);
        dep.deploy(targetPath, (data) => {
            setDeployState(data);
        });
    };
    const handleDeployModeSelect = (item) => {
        if (item.value === 'cwd') {
            startDeployment(process.cwd());
        }
        else {
            setDeployStep('ENTER_PATH');
        }
    };
    const handlePathSubmit = (val) => {
        if (!val.trim())
            return;
        startDeployment(val.trim());
    };
    const handleSelect = (item) => {
        if (item.value === "exit") {
            handleExit();
        }
        else if (item.value === "deploy") {
            setNotification(null);
            setShowHelp(false);
            setShowStatus(false);
            setDeployStep('SELECT_MODE');
        }
        else if (item.value === "help") {
            setDeployState(null);
            setNotification(null);
            setShowStatus(false);
            setShowHelp(true);
        }
        else if (item.value === "status") {
            setDeployState(null);
            setNotification(null);
            setShowHelp(false);
            setShowStatus(true);
        }
    };
    return (_jsxs(Box, { flexDirection: "column", paddingX: 1, paddingY: 1, children: [_jsx(Header, { columns: columns }), showHelp ? (_jsx(Help, { onBack: () => setShowHelp(false) })) : showStatus ? (_jsx(Status, { onBack: () => setShowStatus(false) })) : (_jsxs(_Fragment, { children: [deployStep === 'NONE' && (_jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { bold: true, color: "#6d0bc9", children: "NAVIGATION" }), _jsx(Box, { marginTop: 1, children: _jsx(Select, { items: SELECT_ITEMS, onSelect: handleSelect, theme: outhostTheme }) })] })), deployStep === 'SELECT_MODE' && (_jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { bold: true, color: "#6d0bc9", children: "Where do you want to deploy?" }), _jsx(Box, { marginTop: 1, children: _jsx(Select, { items: [
                                        { label: 'Select this directory', value: 'cwd' },
                                        { label: 'Enter path', value: 'path' }
                                    ], onSelect: handleDeployModeSelect, theme: outhostTheme }) })] })), deployStep === 'ENTER_PATH' && (_jsx(Box, { flexDirection: "column", marginY: 1, children: _jsx(TextInput, { label: "Directory Path:", placeholder: "/path/to/website", value: pathInput, onChange: setPathInput, onSubmit: handlePathSubmit, focus: true, theme: outhostTheme }) })), deployStep === 'DEPLOYING' && deployState && (_jsx(Box, { flexDirection: "column", marginY: 1, children: deployState.state === "DEPLOYED" ? (_jsxs(Box, { flexDirection: "column", children: [_jsx(StatusIndicator, { status: "online", label: "Deployment successful", theme: outhostTheme }), _jsxs(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 2, children: [deployState.targetPath && (_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Directory: " }), _jsx(Text, { color: "yellow", children: deployState.targetPath })] })), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Local:     " }), _jsx(Text, { color: "cyan", children: deployState.localUrl })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Public:    " }), _jsx(Text, { color: "#a855f7", bold: true, children: deployState.publicUrl })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Live Reload: " }), _jsx(Text, { color: "green", children: "Active" })] })] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "#6d0bc9", children: "REQUEST LOGS" }), _jsx(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 2, children: !deployState.logs || deployState.logs.length === 0 ? (_jsx(Text, { color: "gray", children: "Waiting for incoming requests..." })) : (deployState.logs.slice(-6).map((log) => (_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: "gray", children: log.timestamp }), _jsx(Text, { color: "cyan", bold: true, children: log.method.padEnd(4) }), _jsx(Text, { color: getStatusColor(log.statusCode), bold: true, children: log.statusCode }), _jsx(Text, { color: "white", children: log.path }), _jsxs(Text, { color: "gray", children: ["(", log.durationMs, "ms)"] })] }, log.id)))) })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Press Q to stop the deployment and quit." }) })] })) : deployState.state === "FAILED" ? (_jsx(StatusIndicator, { status: "error", label: deployState.message || "Deployment failed", theme: outhostTheme })) : (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { flexDirection: "row", children: _jsx(Spinner, { label: deployState.message || "", theme: outhostTheme }) }), deployState.targetPath && (_jsxs(Box, { marginTop: 1, paddingLeft: 2, children: [_jsx(Text, { color: "gray", children: "Directory: " }), _jsx(Text, { color: "yellow", children: deployState.targetPath })] }))] })) })), notification && deployStep === 'NONE' && (_jsx(Box, { marginY: 1, children: _jsxs(Text, { color: "yellow", children: ["\u2139 ", notification] }) })), _jsx(Box, { marginTop: 1, children: _jsx(KeyHint, { keys: [
                                { key: "↑↓", label: "Move" },
                                { key: "Enter", label: "Select" },
                                { key: "q", label: "Quit" },
                            ], theme: outhostTheme }) })] }))] }));
}
//# sourceMappingURL=OuthostTui.js.map