import type { FC } from "react";

import type { ModelProvider, ModelSummary } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Field } from "../../ui/Field/Field.tsx";
import { SelectInput } from "../../ui/Field/SelectInput.tsx";
import { TextInput } from "../../ui/Field/TextInput.tsx";
import { Heading, MutedText } from "../../ui/Heading/Heading.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { StatusBadge } from "../../ui/StatusBadge/StatusBadge.tsx";
import { settingsList, settingsMeta, settingsRow } from "../settings.css.ts";
import { PROVIDER_KIND_LABELS, PROVIDER_KINDS, PROVIDER_URL_PLACEHOLDERS } from "./models.constants.ts";
import { useModelsSection, type ModelsSectionModel } from "./ModelsSection.hook.ts";

export type ModelsSectionProps = {
  readonly workspaceId: string;
  readonly providers: readonly ModelProvider[];
  readonly models: readonly ModelSummary[];
  readonly defaultModel: string | null;
};

export const ModelsSection: FC<ModelsSectionProps> = ({ workspaceId, providers, models, defaultModel }) => {
  const model = useModelsSection(workspaceId, defaultModel ?? models[0]?.reference ?? "");
  const isDefaultAvailable = defaultModel === null || models.some((candidate) => candidate.reference === defaultModel);

  return (
    <Card>
      <Heading level="section">Models</Heading>
      <MutedText>Where runs get their model. Add a provider, then choose the model new runs use. Keys are kept in the vault.</MutedText>
      {providers.length === 0 ? <EmptyState>No model provider is configured, so runs cannot start yet.</EmptyState> : null}
      <ul className={settingsList}>
        {providers.map((provider) => (
          <li key={provider.id} className={settingsRow}>
            <span>
              {provider.name} <span className={settingsMeta}>({provider.id} · {PROVIDER_KIND_LABELS[provider.kind]}{provider.baseUrl === null ? "" : ` · ${provider.baseUrl}`})</span>
            </span>
            <Stack direction="row" gap="sm">
              <StatusBadge tone={provider.hasApiKey ? "ok" : "queued"} label={credentialLabel(provider)} />
              {provider.source === "settings" ? (
                <Button tone="ghost" onClick={model.handleRemoveClick(provider.id)}>
                  Remove
                </Button>
              ) : null}
            </Stack>
          </li>
        ))}
      </ul>
      <DefaultModelField model={model} models={models} defaultModel={defaultModel} isDefaultAvailable={isDefaultAvailable} />
      <ProviderForm model={model} />
      <ErrorNotice message={model.errorMessage} />
    </Card>
  );
};

type DefaultModelFieldProps = {
  readonly model: ModelsSectionModel;
  readonly models: readonly ModelSummary[];
  readonly defaultModel: string | null;
  readonly isDefaultAvailable: boolean;
};

const DefaultModelField: FC<DefaultModelFieldProps> = ({ model, models, defaultModel, isDefaultAvailable }) => {
  const showsUnavailable = !isDefaultAvailable && defaultModel !== null;
  return (
  <Field label="Default model" hint={isDefaultAvailable ? "Used by agents whose preset says `default`." : `${defaultModel ?? ""} is set but no configured provider serves it, so runs fail until this changes.`}>
    <Stack direction="row" gap="sm">
      <SelectInput value={model.selectedDefault} onChange={model.handleDefaultChange} disabled={models.length === 0}>
        {showsUnavailable ? <option value={defaultModel}>{defaultModel} (unavailable)</option> : null}
        {models.map((candidate) => (
          <option key={candidate.reference} value={candidate.reference}>
            {candidate.reference}
          </option>
        ))}
      </SelectInput>
      <Button tone="primary" disabled={model.isBusy || model.selectedDefault.length === 0} onClick={model.handleSaveDefaultClick}>
        Save
      </Button>
    </Stack>
  </Field>
  );
};

const credentialLabel = (provider: ModelProvider): string => {
  if (provider.source === "environment") return "From environment";
  return provider.hasApiKey ? "Key saved" : "No key";
};

type ProviderFormProps = {
  readonly model: ModelsSectionModel;
};

const ProviderForm: FC<ProviderFormProps> = ({ model }) => (
  <Stack>
    <Heading level="section">Add or update a provider</Heading>
    <Field label="Kind">
      <SelectInput value={model.kind} onChange={model.handleKindChange}>
        {PROVIDER_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {PROVIDER_KIND_LABELS[kind]}
          </option>
        ))}
      </SelectInput>
    </Field>
    {model.needsId ? (
      <Field label="Provider id" hint="Lowercase letters, digits and hyphens; the first half of model references such as gateway/gpt-5.">
        <TextInput value={model.providerId} onChange={model.handleProviderIdChange} placeholder="gateway" />
      </Field>
    ) : null}
    <Field label="Name" hint="Shown in lists; defaults to the id.">
      <TextInput value={model.name} onChange={model.handleNameChange} />
    </Field>
    {model.needsUrl ? (
      <Field label="Base URL">
        <TextInput value={model.baseUrl} onChange={model.handleBaseUrlChange} placeholder={PROVIDER_URL_PLACEHOLDERS[model.kind]} />
      </Field>
    ) : null}
    <Field label="API key" hint={model.kind === "lmStudio" ? "Leave empty for a local server." : "Leave empty to keep the saved key."}>
      <TextInput type="password" value={model.apiKey} onChange={model.handleApiKeyChange} autoComplete="off" />
    </Field>
    <div>
      <Button disabled={model.isBusy || (model.needsUrl && model.baseUrl.trim().length === 0) || (model.needsId && model.providerId.trim().length === 0)} onClick={model.handleSaveProviderClick}>
        Save provider
      </Button>
    </div>
  </Stack>
);
