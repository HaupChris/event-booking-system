/**
 * FAQs
 * ====
 * Frequently Asked Questions component
 */

import React, { useState, useEffect } from 'react';
import {
  alpha,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import FormCard from '../core/display/FormCard';
import MissionHeading from '../core/display/MissionHeading';
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  display_order: number;
}

interface FAQCategory {
  id: number;
  name: string;
  display_order: number;
  faqs: FAQItem[];
}

const FAQs: React.FC = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';
  const [expanded, setExpanded] = useState<string | false>(false);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/faqs');
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError('Fehler beim Laden der FAQs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <FormCard selected={true} sx={{ mt: 0 }}>
      <MissionHeading
        title="Haeufig gestellte Fragen"
        subtitle="Antworten auf die wichtigsten Themen rund ums Festival"
        icon={<HelpIcon />}
      />

      <Box sx={{ mt: 1 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && categories.length === 0 && (
          <Alert severity="info">Derzeit sind keine FAQs verfügbar.</Alert>
        )}

        {!loading &&
          !error &&
          categories.map((category) => (
            <Box key={category.id} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  mt: 2,
                  mb: 1,
                  fontWeight: 600,
                  fontFamily: isCircusMode ? brandingPack.typography.heading : undefined,
                }}
              >
                {category.name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {category.faqs.map((faq) => (
                <Accordion
                  key={`faq-${faq.id}`}
                  expanded={expanded === `panel${faq.id}`}
                  onChange={handleChange(`panel${faq.id}`)}
                  sx={{
                    mb: 1,
                    backgroundColor: isCircusMode ? 'rgba(28, 12, 12, 0.72)' : undefined,
                    border: '1px solid',
                    borderColor: isCircusMode ? alpha('#cda163', 0.5) : 'divider',
                    borderRadius: '10px !important',
                    '&:before': { display: 'none' },
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      color: isCircusMode ? '#d8b87a' : undefined,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${faq.id}-content`}
                    id={`panel${faq.id}-header`}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="medium"
                      sx={{ fontFamily: isCircusMode ? brandingPack.typography.body : undefined }}
                    >
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        color: isCircusMode ? alpha('#f4ead6', 0.92) : theme.palette.text.secondary,
                        fontFamily: isCircusMode ? brandingPack.typography.body : undefined,
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
      </Box>

      <Box sx={{ mt: 4, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: isCircusMode ? brandingPack.typography.body : undefined }}
        >
          <strong>Weitere Fragen?</strong>
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, fontFamily: isCircusMode ? brandingPack.typography.body : undefined }}
        >
          Wenn deine Frage hier nicht beantwortet wurde, wende dich gerne an das Orga-Team per
          E-Mail.
        </Typography>
      </Box>
    </FormCard>
  );
};

export default FAQs;
