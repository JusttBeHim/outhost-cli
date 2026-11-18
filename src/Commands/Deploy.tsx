import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { Select } from '../components/ui/select/index.js';
import type { SelectItem } from '../components/ui/select/index.js';
import { TextInput } from '../components/ui/text-input/index.js';
import { Spinner } from '../components/ui/spinner/index.js';
import { StatusIndicator } from '../components/ui/status-indicator/index.js';
import { darkTheme } from '../component/components/ui/_core.js';
import { Deployment } from '../deploy/deployment.js';
import type { DeployStateData } from '../deploy/deployment.js';

type Step = 'SELECT_MODE' | 'ENTER_PATH' | 'DEPLOYING';

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'green';
  if (code >= 300 && code < 400) return 'cyan';
  if (code >= 400 && code < 500) return 'yellow';
  return 'red';
}

export function DeployApp({ initialPath }: { initialPath?: string | undefined }) {
  const [step, setStep] = useState<Step>(initialPath ? 'DEPLOYING' : 'SELECT_MODE');
  const [pathInput, setPathInput] = useState('');
  const [deployState, setDeployState] = useState<DeployStateData | null>(null);
  const { exit } = useApp();
  const [deployment, setDeployment] = useState<Deployment | null>(null);

  const startDeployment = (targetPath: string) => {
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
              {deployState.targetPath && (
                <Text>
                  <Text color="gray">Directory: </Text>
                  <Text color="yellow">{deployState.targetPath}</Text>
                </Text>
              )}
              <Text>
                <Text color="gray">Local:     </Text>
                <Text color="cyan">{deployState.localUrl}</Text>
              </Text>
              <Text>
                <Text color="gray">Public:    </Text>
                <Text color="#a855f7" bold>{deployState.publicUrl}</Text>
              </Text>
              <Text>
                <Text color="gray">Live Reload: </Text>
                <Text color="green">Active</Text>
              </Text>
            </Box>
            <Box flexDirection="column" marginTop={1}>
              <Text bold color="#6d0bc9">
                REQUEST LOGS
              </Text>
              <Box flexDirection="column" marginTop={1} paddingLeft={2}>
                {!deployState.logs || deployState.logs.length === 0 ? (
                  <Text color="gray">Waiting for incoming requests...</Text>
                ) : (
                  deployState.logs.slice(-6).map((log) => (
                    <Box key={log.id} flexDirection="row" gap={1}>
                      <Text color="gray">{log.timestamp}</Text>
                      <Text color="cyan" bold>{log.method.padEnd(4)}</Text>
                      <Text color={getStatusColor(log.statusCode)} bold>
                        {log.statusCode}
                      </Text>
                      <Text color="white">{log.path}</Text>
                      <Text color="gray">({log.durationMs}ms)</Text>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
            <Box marginTop={1}>
              <Text color="gray">Press Ctrl+C or Q to stop the deployment and exit.</Text>
            </Box>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Box flexDirection="row">
              <Spinner label={deployState.message || 'Deploying project...'} theme={darkTheme} />
            </Box>
            {deployState.targetPath && (
              <Box marginTop={1} paddingLeft={2}>
                <Text color="gray">Directory: </Text>
                <Text color="yellow">{deployState.targetPath}</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }

  return null;
}

export function startDeployCommand(targetPath?: string) {
  process.stdout.write("\x1b[?1049h");
  process.stdout.write("\x1b[2J\x1b[H");

  render(<DeployApp initialPath={targetPath} />);
}
