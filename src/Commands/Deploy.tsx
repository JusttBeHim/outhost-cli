import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp } from 'ink';
import { Select } from '../components/ui/select/index.js';
import type { SelectItem } from '../components/ui/select/index.js';
import { TextInput } from '../components/ui/text-input/index.js';
import { Spinner } from '../components/ui/spinner/index.js';
import { StatusIndicator } from '../components/ui/status-indicator/index.js';
import { darkTheme } from '../component/components/ui/_core.js';
import { Deployment } from '../deploy/deployment.js';
import type { DeployStateData } from '../deploy/deployment.js';

type Step = 'SELECT_MODE' | 'ENTER_PATH' | 'DEPLOYING';

export function DeployApp() {
  const [step, setStep] = useState<Step>('SELECT_MODE');
  const [pathInput, setPathInput] = useState('');
  const [deployState, setDeployState] = useState<DeployStateData | null>(null);
  const { exit } = useApp();
  const [deployment, setDeployment] = useState<Deployment | null>(null);

  useEffect(() => {
    return () => {
      if (deployment) {
        deployment.cleanup();
      }
    };
  }, [deployment]);

  const handleModeSelect = (item: SelectItem<string>) => {
    if (item.value === 'cwd') {
      startDeployment(process.cwd());
    } else {
      setStep('ENTER_PATH');
    }
  };

  const handlePathSubmit = (val: string) => {
    if (!val.trim()) return;
    startDeployment(val.trim());
  };

  const startDeployment = (targetPath: string) => {
    setStep('DEPLOYING');
    const dep = new Deployment();
    setDeployment(dep);
    
    dep.deploy(targetPath, (data) => {
      setDeployState(data);
    });
  };

  if (step === 'SELECT_MODE') {
    return (
      <Box flexDirection="column" margin={1}>
        <Text bold>Choose a directory to deploy:</Text>
        <Box marginTop={1}>
          <Select
            items={[
              { label: 'Select this directory', value: 'cwd' },
              { label: 'Enter path', value: 'path' }
            ]}
            onSelect={handleModeSelect}
            theme={darkTheme}
          />
        </Box>
      </Box>
    );
  }

  if (step === 'ENTER_PATH') {
    return (
      <Box flexDirection="column" margin={1}>
        <TextInput
          label="Directory Path:"
          placeholder="/path/to/website"
          value={pathInput}
          onChange={setPathInput}
          onSubmit={handlePathSubmit}
          focus={true}
          theme={darkTheme}
        />
      </Box>
    );
  }

  if (step === 'DEPLOYING' && deployState) {
    return (
      <Box flexDirection="column" margin={1}>
        {deployState.state === 'FAILED' ? (
          <StatusIndicator status="error" label={deployState.message || 'Deployment failed'} theme={darkTheme} />
        ) : deployState.state === 'DEPLOYED' ? (
          <Box flexDirection="column">
            <StatusIndicator status="online" label="Deployment Live" theme={darkTheme} />
            <Box flexDirection="column" marginTop={1} paddingLeft={2}>
              <Text>
                <Text color="gray">Local:  </Text>
                <Text color="cyan">{deployState.localUrl}</Text>
              </Text>
              <Text>
                <Text color="gray">Public: </Text>
                <Text color="#a855f7" bold>{deployState.publicUrl}</Text>
              </Text>
            </Box>
            <Box marginTop={1}>
              <Text color="gray">Press Ctrl+C to stop the deployment and exit.</Text>
            </Box>
          </Box>
        ) : (
          <Box flexDirection="row">
            <Spinner label={deployState.message || 'Deploying project...'} theme={darkTheme} />
          </Box>
        )}
      </Box>
    );
  }

  return null;
}

export function startDeployCommand() {
  process.stdout.write("\x1b[?1049h");
  process.stdout.write("\x1b[2J\x1b[H");

  render(<DeployApp />);
}
