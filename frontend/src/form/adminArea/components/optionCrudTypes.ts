export interface OptionFormState {
  title: string;
  working_title: string;
  price: string;
  amount: string;
  num_needed: string;
  requires_workshift: boolean;
  description: string;
}

export const DEFAULT_OPTION_FORM: OptionFormState = {
  title: '',
  working_title: '',
  price: '0',
  amount: '0',
  num_needed: '1',
  requires_workshift: true,
  description: '',
};
