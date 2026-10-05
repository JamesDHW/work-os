import { useRouter } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";

import type { Standard } from "../../api/apiTypes.ts";
import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { toReviewMode, toSaveStandardRequest, toStandardForm, type StandardForm, type StandardTextField } from "../standardForm.ts";

type TextControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type StandardEditorModel = {
  readonly form: StandardForm;
  readonly errorMessage: string | null;
  readonly savedMessage: string | null;
  readonly isBusy: boolean;
  readonly handleTextChange: (field: StandardTextField) => (event: ChangeEvent<TextControl>) => void;
  readonly handleReviewChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handleCapabilityToggle: (capabilityId: string) => (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleSaveClick: () => Promise<void>;
};

export const useStandardEditor = (workspaceId: string, standard: Standard): StandardEditorModel => {
  const router = useRouter();
  const [form, setForm] = useState<StandardForm>(() => toStandardForm(standard));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const save = async (): Promise<void> => {
    setIsBusy(true);
    const params = { path: { workspaceId, standardId: standard.id } };
    const result = await apiClient.PUT("/api/w/{workspaceId}/standards/{standardId}", { params, body: toSaveStandardRequest(standard.id, form) });
    setIsBusy(false);
    const failure = describeFailure(result);
    setErrorMessage(failure);
    setSavedMessage(failure === null ? "Saved and committed to the workspace package." : null);
    await router.invalidate();
  };

  const handleTextChange = (field: StandardTextField) => (event: ChangeEvent<TextControl>): void => {
    const { value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [field]: value }));
  };

  const handleReviewChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const review = toReviewMode(event.target.value);
    if (review === undefined) return;

    setForm((previousForm) => ({ ...previousForm, review }));
  };

  const handleCapabilityToggle = (capabilityId: string) => (event: ChangeEvent<HTMLInputElement>): void => {
    const { checked: isChecked } = event.target;
    setForm((previousForm) => {
      const capabilities = isChecked ? [...previousForm.capabilities, capabilityId] : previousForm.capabilities.filter((existingId) => existingId !== capabilityId);
      return { ...previousForm, capabilities };
    });
  };

  return { form, errorMessage, savedMessage, isBusy, handleTextChange, handleReviewChange, handleCapabilityToggle, handleSaveClick: save };
};
