// The internal-network address each run container was given when its egress was allowed,
// kept so revoking can find the gateway allowlist after the container is gone.
export type ContainerAddresses = {
  readonly remember: (containerId: string, sourceIp: string) => void;
  readonly forget: (containerId: string) => string | undefined;
};

export const createContainerAddresses = (): ContainerAddresses => {
  const addresses = new Map<string, string>();

  return {
    remember: (containerId, sourceIp) => {
      addresses.set(containerId, sourceIp);
    },
    forget: (containerId) => {
      const sourceIp = addresses.get(containerId);
      addresses.delete(containerId);
      return sourceIp;
    },
  };
};
