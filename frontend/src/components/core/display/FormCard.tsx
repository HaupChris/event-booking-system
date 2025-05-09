// src/components/core/display/FormCard.tsx
import React, {ReactNode, useState} from 'react';
import {
    Paper,
    Box,
    Typography,
    Divider,
    alpha,
    Tooltip,
    IconButton,
    ClickAwayListener
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import {spacePalette} from '../../styles/theme';
import {SxProps, Theme} from "@mui/material/styles";

interface FormCardProps {
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    description?: string;
    footer?: ReactNode;
    selected?: boolean;
    elevation?: number;
    sx?: SxProps<Theme>;
    tooltipText?: string;
    tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end';
}

const FormCard: React.FC<FormCardProps> = ({
                                               title,
                                               icon,
                                               children,
                                               description,
                                               footer,
                                               selected = false,
                                               elevation = 2,
                                               sx,
                                               tooltipText,
                                               tooltipPlacement = 'top'
                                           }) => {
    // State to manage tooltip open state for mobile
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const handleTooltipClose = () => {
        setTooltipOpen(false);
    };

    const handleTooltipOpen = () => {
        setTooltipOpen(true);
    };

    return (
        <Paper
            elevation={elevation}
            sx={{
                backgroundColor: alpha('#020c1b', 0.7),
                borderRadius: '10px',
                border: selected ? '2px solid' : '1px solid',
                borderColor: selected ? spacePalette.primary.main : alpha(spacePalette.primary.main, 0.3),
                position: 'relative',
                overflow: 'hidden',
                boxShadow: selected
                    ? `0 0 12px ${alpha(spacePalette.primary.main, 0.3)}`
                    : 'none',
                ...sx
            }}
        >
            {/* Optional scanning animation for selected items */}
            {selected && (
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    zIndex: 1,
                    overflow: 'hidden',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: '2px',
                        background: `linear-gradient(to right, transparent, ${spacePalette.primary.main}, transparent)`,
                        top: 0,
                        animation: 'scanDown 2s infinite',
                    },
                    '@keyframes scanDown': {
                        '0%': {transform: 'translateY(0)'},
                        '100%': {transform: 'translateY(100%)'}
                    }
                }}/>
            )}

            {/* Card Header */}
            {(title || icon) && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    pb: description ? 1 : 2,
                    position: 'relative',
                    zIndex: 2,
                }}>
                    {icon && (
                        <Box sx={{
                            mr: 1.5,
                            color: spacePalette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            {icon}
                        </Box>
                    )}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1
                    }}>
                        {title && (
                            <Typography
                                variant="h6"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                    fontWeight: 'medium',
                                }}
                            >
                                {title}
                            </Typography>
                        )}

                        {/* Info icon with tooltip */}
                        {tooltipText && (
                            <ClickAwayListener onClickAway={handleTooltipClose}>
                                <div style={{display: 'inline-block', marginLeft: '8px'}}>
                                    <Tooltip
                                        title={
                                            <Typography sx={{fontSize: '0.875rem', p: 0.5}}>
                                                {tooltipText}
                                            </Typography>
                                        }
                                        placement={tooltipPlacement}
                                        arrow
                                        open={tooltipOpen}
                                        onClose={handleTooltipClose}
                                        disableFocusListener
                                        disableHoverListener
                                        disableTouchListener
                                        // Set a fixed position to prevent clipping issues
                                        PopperProps={{
                                            // Keep this false to prevent portal issues
                                            disablePortal: false,
                                            // Important: These styles ensure the tooltip appears on top of everything
                                            sx: {
                                                zIndex: 9999, // Very high z-index to ensure it's on top
                                            },
                                            // This modifiers object helps position the tooltip properly
                                            modifiers: [
                                                {
                                                    name: 'preventOverflow',
                                                    options: {
                                                        boundary: document.body, // Use the entire body as boundary
                                                    },
                                                },
                                            ],
                                        }}
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: 'background.paper',
                                                    color: 'text.primary',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                                    border: '1px solid',
                                                    borderColor: alpha(spacePalette.primary.main, 0.2),
                                                    borderRadius: 1,
                                                    p: 1.5,
                                                    maxWidth: 250,
                                                }
                                            }
                                        }}
                                    >
                                        <IconButton
                                            onClick={handleTooltipOpen}
                                            size="small"
                                            sx={{
                                                p: 0.5,
                                                color: alpha(spacePalette.primary.main, 0.8),
                                                '&:hover': {
                                                    color: spacePalette.primary.main,
                                                    backgroundColor: alpha(spacePalette.primary.main, 0.1),
                                                }
                                            }}
                                        >
                                            <InfoIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </ClickAwayListener>
                        )}
                    </Box>
                </Box>
            )}

            {/* Description (optional) */}
            {description && (
                <Box sx={{px: 2, pb: 2, position: 'relative', zIndex: 2}}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: alpha('#fff', 0.7),
                            pl: icon ? 5 : 0, // Align with title
                        }}
                    >
                        {description}
                    </Typography>
                </Box>
            )}

            {/*/!* Divider if header exists *!/*/}
            {/*{(title || icon || description) && (*/}
            {/*  <Divider sx={{*/}
            {/*    borderColor: alpha(spacePalette.primary.main, 0.2),*/}
            {/*    position: 'relative',*/}
            {/*    zIndex: 2,*/}
            {/*  }}/>*/}
            {/*)}*/}

            {/* Main Content */}
            <Box sx={{
                position: 'relative',
                zIndex: 2,
                marginY: 2,
            }}>
                {children}
            </Box>

            {/* Footer (optional) */}
            {footer && (
                <>
                    <Divider sx={{
                        borderColor: alpha(spacePalette.primary.main, 0.2),
                        position: 'relative',
                        zIndex: 2,
                    }}/>
                    <Box sx={{
                        p: 2,
                        position: 'relative',
                        zIndex: 2,
                        backgroundColor: alpha('#010a18', 0.5),
                    }}>
                        {footer}
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default FormCard;