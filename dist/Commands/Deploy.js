import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp } from 'ink';
import { Select } from '../components/ui/select/index.js';
import { TextInput } from '../components/ui/text-input/index.js';
import { Spinner } from '../components/ui/spinner/index.js';
import { StatusIndicator } from '../components/ui/status-indicator/index.js';
import { darkTheme } from '../component/components/ui/_core.js';
import { Deployment } from '../deploy/deployment.js';
export function DeployApp() {
    const [step, setStep] = useState('SELECT_MODE');
    const [pathInput, setPathInput] = useState('');
    const [deployState, setDeployState] = useState(null);
    const { exit } = useApp();
    const [deployment, setDeployment] = useState(null);
    useEffect(() => {
        return () => {
            if (deployment) {
                deployment.cleanup();
            }
        };
    }, [deployment]);
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
    const startDeployment = (targetPath) => {
        setStep('DEPLOYING');
        const dep = new Deployment();
        setDeployment(dep);
        dep.deploy(targetPath, (data) => {
            setDeployState(data);
        });
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
        return (_jsx(Box, { flexDirection: "column", margin: 1, children: deployState.state === 'FAILED' ? (_jsx(StatusIndicator, { status: "error", label: deployState.message || 'Deployment failed', theme: darkTheme })) : deployState.state === 'DEPLOYED' ? (_jsxs(Box, { flexDirection: "column", children: [_jsx(StatusIndicator, { status: "online", label: "Deployment Live", theme: darkTheme }), _jsxs(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 2, children: [_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Local:  " }), _jsx(Text, { color: "cyan", children: deployState.localUrl })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Public: " }), _jsx(Text, { color: "#a855f7", bold: true, children: deployState.publicUrl })] })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: "Press Ctrl+C to stop the deployment and exit." }) })] })) : (_jsx(Box, { flexDirection: "row", children: _jsx(Spinner, { label: deployState.message || 'Deploying project...', theme: darkTheme }) })) }));
    }
    return null;
}
export function startDeployCommand() {
    process.stdout.write("\x1b[?1049h");
    process.stdout.write("\x1b[2J\x1b[H");
    render(_jsx(DeployApp, {}));
}
//# sourceMappingURL=Deploy.js.map