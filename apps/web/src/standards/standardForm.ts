import type { SaveStandardRequest, Standard } from "../api/apiTypes.ts";
import { REVIEW_MODES, STANDARD_TEXT_FIELDS } from "./standards.constants.ts";

export type ReviewMode = Standard["review"];

export type StandardForm = {
  readonly describes: string;
  readonly consumer: string;
  readonly agentId: string;
  readonly skills: string;
  readonly capabilities: readonly string[];
  readonly egress: string;
  readonly checks: string;
  readonly review: ReviewMode;
  readonly inputHint: string;
  readonly criteria: string;
  readonly method: string;
};

export type StandardTextField = (typeof STANDARD_TEXT_FIELDS)[number];

const toLines = (text: string): readonly string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const toCheck = (line: string): Standard["checks"][number] => {
  const separator = line.indexOf(": ");
  if (separator === -1) return { name: line, command: line };

  return { name: line.slice(0, separator).trim(), command: line.slice(separator + 2).trim() };
};

export const toReviewMode = (value: string): ReviewMode | undefined => REVIEW_MODES.find((mode) => mode === value);

export const toStandardTextField = (name: string): StandardTextField | undefined => STANDARD_TEXT_FIELDS.find((field) => field === name);

export const toStandardForm = (standard: Standard): StandardForm => ({
  describes: standard.describes,
  consumer: standard.consumer,
  agentId: standard.agentId,
  skills: standard.skills.join(", "),
  capabilities: standard.capabilities,
  egress: standard.egress.join("\n"),
  checks: standard.checks.map((check) => `${check.name}: ${check.command}`).join("\n"),
  review: standard.review,
  inputHint: standard.inputHint ?? "",
  criteria: standard.criteria,
  method: standard.method,
});

export const toSaveStandardRequest = (id: string, form: StandardForm): SaveStandardRequest => {
  const inputHint = form.inputHint.trim();
  const optionalFields = inputHint.length > 0 ? { inputHint } : {};
  return { id, ...optionalFields, ...toRequiredFields(form) };
};

const toRequiredFields = (form: StandardForm): Omit<SaveStandardRequest, "id" | "inputHint"> => ({
  describes: form.describes.trim(),
  consumer: form.consumer.trim(),
  agentId: form.agentId,
  skills: form.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0),
  capabilities: [...form.capabilities],
  egress: [...toLines(form.egress)],
  checks: toLines(form.checks).map(toCheck),
  review: form.review,
  criteria: form.criteria,
  method: form.method,
});
