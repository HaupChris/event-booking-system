import React from 'react';
import { useThemeMode } from '../../styles/theme';
import SelectionOptionWithImageDefault from './SelectionOptionWithImageDefault';
import SelectionOptionWithImageCircus from './SelectionOptionWithImageCircus';

export interface SelectionOptionWithImageProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  price: number;
  description: string;
  imageSource: string;
}

function SelectionOptionWithImage(props: SelectionOptionWithImageProps) {
  const { mode } = useThemeMode();

  if (mode === 'circus') {
    return <SelectionOptionWithImageCircus {...props} />;
  }

  return <SelectionOptionWithImageDefault {...props} />;
}

export default SelectionOptionWithImage;
