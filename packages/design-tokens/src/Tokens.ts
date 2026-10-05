type StatusToken = {
  readonly base: string;
  readonly soft: string;
  readonly solid: string;
  readonly on: string;
  readonly mark: string;
};

export type Tokens = {
  readonly color: {
    readonly bg: string;
    readonly surface: string;
    readonly panel: string;
    readonly card: string;
    readonly card2: string;
    readonly line: string;
    readonly line2: string;
    readonly ink: string;
    readonly ink2: string;
    readonly ink3: string;
    readonly accent: string;
    readonly accentInk: string;
    readonly accentSoft: string;
    readonly queued: string;
  };
  readonly status: {
    readonly ok: StatusToken;
    readonly review: StatusToken;
    readonly run: StatusToken;
    readonly danger: StatusToken;
  };
  readonly radius: { readonly md: string; readonly sm: string };
  readonly font: { readonly display: string; readonly body: string; readonly mono: string };
  readonly shadow: { readonly card: string };
  readonly space: { readonly xs: string; readonly sm: string; readonly md: string; readonly lg: string; readonly xl: string };
  readonly size: { readonly text: string; readonly small: string; readonly title: string; readonly heading: string; readonly sidebar: string };
};
