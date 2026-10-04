import type { Standard } from "@work-os/domain/standards/Standard";
import { stringify } from "yaml";

export type StandardFiles = {
  readonly standardMarkdown: string;
  readonly methodMarkdown: string;
};

export const serializeStandard = (standard: Standard): StandardFiles => {
  const frontmatter = {
    id: standard.id,
    describes: standard.describes,
    consumer: standard.consumer,
    agent: standard.agentId,
    skills: standard.skills,
    capabilities: standard.capabilities,
    egress: standard.egress,
    checks: standard.checks,
    review: standard.review,
    ...(standard.inputHint === undefined ? {} : { input: standard.inputHint }),
  };
  return {
    standardMarkdown: `---\n${stringify(frontmatter).trim()}\n---\n\n${standard.criteria.trim()}\n`,
    methodMarkdown: standard.method.trim().length === 0 ? "" : `${standard.method.trim()}\n`,
  };
};
