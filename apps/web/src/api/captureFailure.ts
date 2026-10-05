export const captureFailure = async (operation: () => Promise<string | null>): Promise<string | null> => {
  try {
    return await operation();
    // oxlint-disable-next-line architecture/no-raw-exceptions -- Browser APIs such as WebAuthn report cancellation by throwing; this adapter turns that into a message.
  } catch (thrown) {
    return thrown instanceof Error ? thrown.message : String(thrown);
  }
};
