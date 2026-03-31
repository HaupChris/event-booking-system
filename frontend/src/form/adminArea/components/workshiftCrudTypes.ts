export interface WorkshiftFormState {
  title: string;
  working_title: string;
  description: string;
  multiple_selection_possible: string;
}

export interface TimeslotFormState {
  title: string;
  working_title: string;
  start_time: string;
  end_time: string;
  num_needed: string;
}

export const DEFAULT_WORKSHIFT_FORM: WorkshiftFormState = {
  title: '',
  working_title: '',
  description: '',
  multiple_selection_possible: '1',
};

export const DEFAULT_TIMESLOT_FORM: TimeslotFormState = {
  title: '',
  working_title: '',
  start_time: '',
  end_time: '',
  num_needed: '1',
};
