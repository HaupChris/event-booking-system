import React, { useState } from 'react';
import type { SxProps, Theme } from '@mui/material';
import {
  Paper,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useThemeMode } from '../../styles/theme';
import { useBrandingPack } from '../../../branding/useBrandingPack';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  id?: string; // Optional ID for each item
}

interface WWFAQProps {
  items: FAQItem[];
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  sx?: SxProps<Theme>;
  defaultExpandedIndex?: number;
}

const WWFAQ: React.FC<WWFAQProps> = ({
  items,
  title = '',
  description,
  icon = <QuestionAnswerIcon />,
  sx,
  defaultExpandedIndex = -1,
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  const [expanded, setExpanded] = useState<string | false>(
    defaultExpandedIndex >= 0 && defaultExpandedIndex < items.length
      ? `panel-${defaultExpandedIndex}`
      : false
  );

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const primaryColor = isCircusMode ? '#d8b87a' : theme.palette.primary.main;

  return (
    <Paper
      elevation={2}
      sx={{
        background: isCircusMode ? 'rgba(28, 12, 12, 0.78)' : alpha('#020c1b', 0.7),
        borderRadius: '14px',
        border: isCircusMode
          ? `2px solid ${alpha('#d8b87a', 0.55)}`
          : `1px solid ${alpha(primaryColor, 0.2)}`,
        boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: 'relative',
        ...sx,
      }}
    >
      {/* Header Section */}
      {(title || description) && (
        <Box sx={{ p: 3, pb: description ? 2 : 3 }}>
          {title && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: description ? 1.5 : 0 }}>
              {icon && (
                <Box
                  sx={{
                    color: isCircusMode ? '#e6c586' : primaryColor,
                    mr: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {icon}
                </Box>
              )}
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  color: isCircusMode ? '#f4ead6' : alpha('#fff', 0.9),
                  fontWeight: 'medium',
                  fontFamily: brandingPack.typography.heading,
                }}
              >
                {title}
              </Typography>
            </Box>
          )}

          {description && (
            <Typography
              variant="body2"
              sx={{
                color: isCircusMode ? alpha('#e5cf9f', 0.95) : alpha('#fff', 0.7),
                ml: icon ? 4.5 : 0,
                fontFamily: brandingPack.typography.body,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      )}

      {/* FAQ Accordion Items */}
      <Box sx={{ px: 2, pb: 2, pt: title || description ? 0 : 2 }}>
        {items.map((item, index) => {
          const panelId = item.id || `panel-${index}`;
          return (
            <Accordion
              key={panelId}
              expanded={expanded === panelId}
              onChange={handleChange(panelId)}
              sx={{
                background: 'transparent',
                boxShadow: 'none',
                '&:before': {
                  display: 'none', // Remove the default divider
                },
                border: isCircusMode
                  ? `1px solid ${alpha('#d8b87a', 0.45)}`
                  : `1px solid ${alpha(primaryColor, 0.2)}`,
                borderRadius: '10px !important', // Important to override Material UI's style
                overflow: 'hidden',
                '&.Mui-expanded': {
                  borderColor: isCircusMode ? alpha('#d8b87a', 0.72) : alpha(primaryColor, 0.5),
                  boxShadow: isCircusMode
                    ? `0 0 10px ${alpha('#d8b87a', 0.22)}`
                    : `0 0 10px ${alpha(primaryColor, 0.2)}`,
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: isCircusMode ? '#e6c586' : primaryColor }} />
                }
                aria-controls={`${panelId}-content`}
                id={`${panelId}-header`}
                sx={{
                  borderBottom:
                    expanded === panelId
                      ? isCircusMode
                        ? `1px solid ${alpha('#d8b87a', 0.35)}`
                        : `1px solid ${alpha(primaryColor, 0.2)}`
                      : 'none',
                  backgroundColor:
                    expanded === panelId
                      ? isCircusMode
                        ? alpha('#d8b87a', 0.12)
                        : alpha(primaryColor, 0.1)
                      : isCircusMode
                        ? alpha('#2a120f', 0.5)
                        : alpha('#000', 0.2),
                  '&:hover': {
                    backgroundColor: isCircusMode
                      ? alpha('#d8b87a', 0.12)
                      : alpha(primaryColor, 0.1),
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
                  <Box
                    sx={
                      isCircusMode
                        ? {
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            border: '1px solid',
                            borderColor: alpha('#dfbf84', 0.9),
                            background:
                              'radial-gradient(circle at 35% 30%, rgba(72,38,24,0.95) 0%, rgba(38,18,14,0.95) 100%)',
                            color: '#e6c586',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '& .MuiSvgIcon-root': {
                              fontSize: '0.92rem',
                            },
                          }
                        : { color: primaryColor, display: 'flex', alignItems: 'center' }
                    }
                  >
                    <QuestionAnswerIcon />
                  </Box>

                  <Typography
                    sx={{
                      color:
                        expanded === panelId
                          ? primaryColor
                          : isCircusMode
                            ? '#f4ead6'
                            : alpha('#fff', 0.9),
                      fontWeight: expanded === panelId ? 'medium' : 'normal',
                      fontFamily: isCircusMode
                        ? '"Merriweather", serif'
                        : brandingPack.typography.body,
                    }}
                  >
                    {item.question}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  backgroundColor: isCircusMode ? alpha('#2a120f', 0.45) : alpha('#000', 0.2),
                  padding: 3,
                  pt: 2,
                  color: isCircusMode ? alpha('#e5cf9f', 0.95) : alpha('#fff', 0.8),
                  fontFamily: brandingPack.typography.body,
                  '& a': {
                    color: primaryColor,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                {typeof item.answer === 'string' ? (
                  <Typography variant="body2">{item.answer}</Typography>
                ) : (
                  item.answer
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Paper>
  );
};

export default WWFAQ;
