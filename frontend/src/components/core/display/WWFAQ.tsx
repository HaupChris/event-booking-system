import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  SxProps,
  Theme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { spacePalette } from '../../styles/theme';

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
  title = "",
  description,
  icon = <QuestionAnswerIcon />,
  sx,
  defaultExpandedIndex = -1
}) => {
  const [expanded, setExpanded] = useState<string | false>(
    defaultExpandedIndex >= 0 && defaultExpandedIndex < items.length
      ? `panel-${defaultExpandedIndex}`
      : false
  );

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        background: alpha('#020c1b', 0.7),
        borderRadius: '14px',
        border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`,
        boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: 'relative',
        ...sx
      }}
    >
      {/* Header Section */}
      {(title || description) && (
        <Box sx={{ p: 3, pb: description ? 2 : 3 }}>
          {title && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: description ? 1.5 : 0 }}>
              {icon && (
                <Box sx={{
                  color: spacePalette.primary.main,
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {icon}
                </Box>
              )}
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  color: alpha('#fff', 0.9),
                  fontWeight: 'medium'
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
                color: alpha('#fff', 0.7),
                ml: icon ? 4.5 : 0,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      )}

      {/* FAQ Accordion Items */}
      <Box sx={{ px: 2, pb: 2, pt: (title || description) ? 0 : 2 }}>
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
                border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`,
                borderRadius: '10px !important', // Important to override Material UI's style
                overflow: 'hidden',
                '&.Mui-expanded': {
                  borderColor: alpha(spacePalette.primary.main, 0.5),
                  boxShadow: `0 0 10px ${alpha(spacePalette.primary.main, 0.2)}`,
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: spacePalette.primary.main }} />
                }
                aria-controls={`${panelId}-content`}
                id={`${panelId}-header`}
                sx={{
                  borderBottom: expanded === panelId
                    ? `1px solid ${alpha(spacePalette.primary.main, 0.2)}`
                    : 'none',
                  backgroundColor: expanded === panelId
                    ? alpha(spacePalette.primary.main, 0.1)
                    : alpha('#000', 0.2),
                  '&:hover': {
                    backgroundColor: alpha(spacePalette.primary.main, 0.1),
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                  },
                }}
              >
                <Typography
                  sx={{
                    color: expanded === panelId
                      ? spacePalette.primary.main
                      : alpha('#fff', 0.9),
                    fontWeight: expanded === panelId ? 'medium' : 'normal',
                  }}
                >
                  {item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  backgroundColor: alpha('#000', 0.2),
                  padding: 3,
                  pt: 2,
                  color: alpha('#fff', 0.8),
                  '& a': {
                    color: spacePalette.primary.main,
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