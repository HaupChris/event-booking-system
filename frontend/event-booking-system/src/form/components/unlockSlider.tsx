import React, { useState} from 'react';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/system';

const IPhoneUnlockSlider = styled(Slider)(({ theme }) => ({
  width: 250,
  color: '#52af77',
  height: 8,
  padding: '15px 0',
  display: 'block',
  '& .MuiSlider-rail': {
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.palette.grey[300],
  },
  '& .MuiSlider-track': {
    height: 50,
    borderRadius: 25,
  },
  '& .MuiSlider-thumb': {
    width: 50,
    height: 50,
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(34, 193, 195, 0.16)',
    },
    '& .Mui-active': {
      boxShadow: '0 0 0 14px rgba(34, 193, 195, 0.16)',
    },
  },
}))

const UnlockSlider: React.FC = () => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (_: any, newValue: number | number[]) => {
    let newValueAsNumber = Array.isArray(newValue) ? newValue[0] : newValue;
    setValue(newValueAsNumber);
    if (newValueAsNumber === 100) {
      alert('Phone Unlocked');
      setValue(0);
    }
  };

  return (
    <IPhoneUnlockSlider
      value={value}
      onChange={handleChange}
      aria-label="iPhone slider"
    />
  );
};

export default UnlockSlider;
