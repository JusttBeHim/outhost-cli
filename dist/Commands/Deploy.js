import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { Select } from '../components/ui/select/index.js';
import { TextInput } from '../components/ui/text-input/index.js';
import { Spinner } from '../components/ui/spinner/index.js';
import { StatusIndicator } from '../components/ui/status-indicator/index.js';
import { darkTheme } from '../component/components/ui/_core.js';
import { Deployment } from '../deploy/deployment.js';
function getStatusColor(code) {
    if (code >= 200 && code < 300)
        return 'green';
    if (code >= 300 && code < 400)
        return 'cyan';
    if (code >= 400 && code < 500)
        return 'yellow';
    return 'red';
}
export function DeployApp({ initialPath }) {
    const [step, setStep] = useState(initialPath ? 'DEPLOYING' : 'SELECT_MODE');
    const [pathInput, setPathInput] = useState('');
    const [deployState, setDeployState] = useState(null);
    const { exit } = useApp();
    const [deployment, setDeployment] = useState(null);
    const startDeployment = (targetPath) => {
        setStep('DEPLOYING');
        const dep = new Deployment();
        setDeployment(dep);
        dep.deploy(targetPath, (data) => {
            setDeployState(data);
        });
    };
    useEffect(() => {
        if (initialPath) {
            startDeployment(initialPath);
        }
    }, [initialPath]);
    useEffect(() => {
        const onExit = () => {
            if (deployment) {
                deployment.cleanup();
            }
            process.stdout.write("\x1b[?1049l\x1b[?25h");
        };
        process.on("exit", onExit);
        return () => {
            process.off("exit", onExit);
            if (deployment) {
                deployment.cleanup();
            }
        };
    }, [deployment]);
    useInput((input) => {
        if (input === 'q' || input === 'Q') {
            if (deployment) {
                deployment.cleanup();
            }
            process.stdout.write("\x1b[?1049l\x1b[?25h");
            exit();
            process.exit(0);
        }
    });
    const handleModeSelect = (item) => {
        if (item.value === 'cwd') {
            startDeployment(process.cwd());
        }
        else {
            setStep('ENTER_PATH');
        }
    };
    const handlePathSubmit = (val) => {
        if (!val.trim())
            return;
        startDeployment(val.trim());
    };
    if (step === 'SELECT_MODE') {
        return (_jsxs(Box, { flexDirection: "column", margin: 1, children: [_jsx(Text, { bold: true, children: "Choose a directory to deploy:" }), _jsx(Box, { marginTop: 1, children: _jsx(Select, { items: [
                            { label: 'Select this directory', value: 'cwd' },
                            { label: 'Enter path', value: 'path' }
                        ], onSelect: handleModeSelect, theme: darkTheme }) })] }));
    }
    if (step === 'ENTER_PATH') {
        return (_jsx(Box, { flexDirection: "column", margin: 1, children: _jsx(TextInput, { label: "Directory Path:", placeholder: "/path/to/website", value: pathInput, onChange: setPathInput, onSubmit: handlePathSubmit, focus: true, theme: darkTheme }) }));
    }
    if (step === 'DEPLOYING' && deployState) {
        return (_jsx(Box, { flexDirection: "column", margin: 1, children: deployState.state === 'FAILED' ? (_jsx(StatusIndicator, { status: "error", label: deployState.message || 'Deployment failed', theme: darkTheme })) : deployState.state === 'DEPLOYED' ? (_jsxs(Box, { flexDirection: "column", children: [_jsx(StatusIndicator, { status: "online", label: "Deployment Live", theme: darkTheme }), _jsxs(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 2, children: [deployState.targetPath && (_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Directory: " }), _jsx(Text, { color: "yellow", children: deployState.targetPath })] })), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Local:     " }), _jsx(Text, { color: "cyan", children: deployState.localUrl })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Public:    " }), _jsx(Text, { color: "#a855f7", bold: true, children: deployState.publicUrl })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Live Reload: " }), _jsx(Text, { color: "green", children: "Active" })] })] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "#6d0bc9", children: "REQUEST LOGS" }), _jsx(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 2, children: !deployState.logs || deployState.logs.length === 0 ? (_jsx(Text, { color: "gray", children: "Waiting for incoming requests..." })) : (deployState.logs.slice(-6).map((log) => (_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: "gray", children: log.timestamp }), _jsx(Text, { color: "cyan", bold: true, children: log.method.padEnd(4) }), _jsx(Text, { color: getStatusColor(log.statusCode), bold: true, children: log.statusCode }), _jsx(Text, { color: "white", children: log.path }), _jsxs(Text, { color: "gray", children: ["(", log.durationMs, "ms)"] })] }, log.id)))) })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Press Ctrl+C or Q to stop the deployment and exit." }) })] })) : (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { flexDirection: "row", children: _jsx(Spinner, { label: deployState.message || 'Deploying project...', theme: darkTheme }) }), deployState.targetPath && (_jsxs(Box, { marginTop: 1, paddingLeft: 2, children: [_jsx(Text, { color: "gray", children: "Directory: " }), _jsx(Text, { color: "yellow", children: deployState.targetPath })] }))] })) }));
    }
    return null;
}
export function startDeployCommand(targetPath) {
    process.stdout.write("\x1b[?1049h");
    process.stdout.write("\x1b[2J\x1b[H");
    render(_jsx(DeployApp, { initialPath: targetPath }));
}
//# sourceMappingURL=Deploy.js.map