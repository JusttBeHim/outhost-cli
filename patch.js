const fs = require('fs');
const content = fs.readFileSync('src/Tui/Outhost.tsx', 'utf-8');

const newContent = content.replace(
  'import { KeyHint } from "../component/components/ui/key-hint/index.js";',
  'import { KeyHint } from "../component/components/ui/key-hint/index.js";\nimport { Divider } from "../components/ui/divider/index.js";\nimport { TextInput } from "../components/ui/text-input/index.js";'
).replace(
  'const { exit } = useApp();',
  'const [commandInput, setCommandInput] = useState("");\n  const { exit } = useApp();'
).replace(
  /      \{notification && \(\n        <Box marginY=\{1\}>\n          <Text color="yellow">ℹ \{notification\}<\/Text>\n        <\/Box>\n      \)\}/,
  `      <Box flexDirection="column">\n        <Divider theme={outhostTheme} />\n        <Box paddingX={1}>\n          <TextInput\n            value={commandInput}\n            onChange={setCommandInput}\n            theme={outhostTheme}\n          />\n        </Box>\n        <Divider theme={outhostTheme} />\n      </Box>\n\n      {notification && (\n        <Box marginY={1}>\n          <Text color="yellow">ℹ {notification}</Text>\n        </Box>\n      )}`
);

fs.writeFileSync('src/Tui/Outhost.tsx', newContent);
