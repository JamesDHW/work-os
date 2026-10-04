export type RandomSource = {
  readonly createId: () => string;
  readonly createToken: () => string;
  readonly createPairingCode: () => string;
  readonly hashToken: (token: string) => string;
};
