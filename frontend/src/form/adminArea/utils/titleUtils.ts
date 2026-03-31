interface TitleLike {
  title?: string;
  working_title?: string;
}

const normalized = (value?: string): string => {
  return value?.trim() || '';
};

export const getAdminTitle = (item: TitleLike): string => {
  return normalized(item.working_title) || normalized(item.title) || 'Unbenannt';
};

export const getFrontendTitle = (item: TitleLike): string => {
  return normalized(item.title) || normalized(item.working_title) || 'Unbenannt';
};
