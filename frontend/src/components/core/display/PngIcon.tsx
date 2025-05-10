import React from 'react';
import { SxProps, Theme } from '@mui/material/styles';

// Define the prop types
interface CustomPngIconProps {
  /**
   * The icon image imported directly
   * This is required for webpack/vite to properly bundle the image
   */
  icon: string;
  /**
   * The size of the icon
   * @default 'medium'
   */
  fontSize?: 'inherit' | 'small' | 'medium' | 'large' | number;
  /**
   * The color of the icon (affects container, not the PNG)
   */
  color?: string;
  /**
   * MUI system sx prop for advanced styling
   */
  sx?: SxProps<Theme>;
  /**
   * Additional className
   */
  className?: string;
  /**
   * onClick handler
   */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * CustomPngIcon component
 * Usage: <CustomPngIcon icon={importedIcon} fontSize="small" color="primary" />
 */
const CustomPngIcon: React.FC<CustomPngIconProps> = ({
  icon,
  fontSize = 'medium',
  color,
  sx,
  className,
  onClick,
  ...otherProps
}) => {
  // Convert MUI sizing to pixel values
  const sizeMap: Record<string, number> = {
    inherit: 0, // Will be determined by parent
    small: 20,
    medium: 24,
    large: 35,
  };

  // Determine the size based on fontSize prop
  const getSize = (): number | string => {
    if (typeof fontSize === 'number') return fontSize;
    if (fontSize === 'inherit') return '1em';
    return sizeMap[fontSize] || 24;
  };

  const size = getSize();

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color: color, // This won't affect PNG directly but maintains API consistency
        ...(sx as any)?.style, // Extract style from sx if exists
      }}
      onClick={onClick}
      {...otherProps}
    >
      <img
        src={icon}
        alt="Icon"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default CustomPngIcon;