import type { ConfigurableFormStep, FormStepDescriptions } from '../userArea/interface';

export const getStepDescription = (
  stepDescriptions: FormStepDescriptions | undefined,
  step: ConfigurableFormStep,
  fallback: string
): string => {
  const override = stepDescriptions?.[step]?.trim();
  return override || fallback;
};
