export declare const spacing: {
    readonly none: 0;
    readonly xs: 1;
    readonly sm: 1;
    readonly md: 2;
    readonly lg: 3;
    readonly xl: 4;
};
export declare const borderStyles: {
    readonly single: {
        readonly topLeft: '┌';
        readonly top: '─';
        readonly topRight: '┐';
        readonly left: '│';
        readonly right: '│';
        readonly bottomLeft: '└';
        readonly bottom: '─';
        readonly bottomRight: '┘';
        readonly topT: '┬';
        readonly bottomT: '┴';
        readonly leftT: '├';
        readonly rightT: '┤';
        readonly cross: '┼';
    };
    readonly double: {
        readonly topLeft: '╔';
        readonly top: '═';
        readonly topRight: '╗';
        readonly left: '║';
        readonly right: '║';
        readonly bottomLeft: '╚';
        readonly bottom: '═';
        readonly bottomRight: '╝';
        readonly topT: '╦';
        readonly bottomT: '╩';
        readonly leftT: '╠';
        readonly rightT: '╣';
        readonly cross: '╬';
    };
    readonly rounded: {
        readonly topLeft: '╭';
        readonly top: '─';
        readonly topRight: '╮';
        readonly left: '│';
        readonly right: '│';
        readonly bottomLeft: '╰';
        readonly bottom: '─';
        readonly bottomRight: '╯';
        readonly topT: '┬';
        readonly bottomT: '┴';
        readonly leftT: '├';
        readonly rightT: '┤';
        readonly cross: '┼';
    };
    readonly bold: {
        readonly topLeft: '┏';
        readonly top: '━';
        readonly topRight: '┓';
        readonly left: '┃';
        readonly right: '┃';
        readonly bottomLeft: '┗';
        readonly bottom: '━';
        readonly bottomRight: '┛';
        readonly topT: '┳';
        readonly bottomT: '┻';
        readonly leftT: '┣';
        readonly rightT: '┫';
        readonly cross: '╋';
    };
    readonly ascii: {
        readonly topLeft: '+';
        readonly top: '-';
        readonly topRight: '+';
        readonly left: '|';
        readonly right: '|';
        readonly bottomLeft: '+';
        readonly bottom: '-';
        readonly bottomRight: '+';
        readonly topT: '+';
        readonly bottomT: '+';
        readonly leftT: '+';
        readonly rightT: '+';
        readonly cross: '+';
    };
};
export type BorderStyle = keyof typeof borderStyles;
export declare const spinnerFrames: {
    readonly dots: readonly ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    readonly line: readonly ['−', '\\', '|', '/'];
    readonly arc: readonly ['◜', '◠', '◝', '◞', '◡', '◟'];
    readonly bounce: readonly ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
};
export type SpinnerType = keyof typeof spinnerFrames;
export interface InkUITheme {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        muted: string;
        text: string;
        textInverse: string;
        border: string;
        focus: string;
        selection: string;
    };
    border: 'single' | 'double' | 'rounded' | 'bold' | 'ascii';
}
export declare const darkTheme: InkUITheme;
export declare const lightTheme: InkUITheme;
//# sourceMappingURL=_core.d.ts.map