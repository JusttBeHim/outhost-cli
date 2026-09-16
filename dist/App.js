import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { render } from "ink";
import { Outhost } from "./Tui/OuthostTui.js";
import { OuthostCommand } from "./Outhost.js";
function App() {
    return _jsx(Outhost, {});
}
export function startApp() {
    process.stdout.write("\x1b[?1049h");
    process.stdout.write("\x1b[2J\x1b[H");
    render(_jsx(App, {}));
    process.stdin.resume();
}
//# sourceMappingURL=App.js.map