/**
 * FAQs
 * ====
 * Frequently Asked Questions component
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';

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
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <HelpIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Häufig gestellte Fragen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hier findest du Antworten auf die häufigsten Fragen
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
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
            <Alert severity="info">
              Derzeit sind keine FAQs verfügbar.
            </Alert>
          )}

          {!loading && !error && categories.map((category) => (
            <Box key={category.id} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                {category.name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {category.faqs.map((faq) => (
                <Accordion
                  key={`faq-${faq.id}`}
                  expanded={expanded === `panel${faq.id}`}
                  onChange={handleChange(`panel${faq.id}`)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${faq.id}-content`}
                    id={`panel${faq.id}-header`}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 4, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Weitere Fragen?</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Wenn deine Frage hier nicht beantwortet wurde, wende dich gerne an das Orga-Team per E-Mail.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default FAQs;
