/**
 * FAQs
 * ====
 * Frequently Asked Questions component
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Wie kann ich meinen Profil-Link wiederfinden?',
    answer: 'Dein Profil-Link wurde dir per E-Mail zugeschickt. Überprüfe deine E-Mails (auch den Spam-Ordner). Falls du die E-Mail nicht findest, kannst du auf der Startseite einen neuen Link anfordern.',
  },
  {
    question: 'Kann ich meine Schichtzuweisung ändern?',
    answer: 'Du kannst zugewiesene Schichten annehmen oder ablehnen. Bei Ablehnung kannst du einen Grund und alternative Präferenzen angeben. Das Orga-Team wird dann versuchen, eine passende Alternative zu finden.',
  },
  {
    question: 'Was mache ich, wenn ich offline bin?',
    answer: 'Die Profil-Seite funktioniert auch offline! Alle wichtigen Informationen werden lokal gespeichert. Änderungen (wie Schicht-Annahmen) werden automatisch synchronisiert, sobald du wieder online bist.',
  },
  {
    question: 'Wie kann ich meine Buchungsdetails ändern?',
    answer: 'Für Änderungen an deiner Buchung (Ticket, Verpflegung, etc.) wende dich bitte direkt an das Orga-Team per E-Mail.',
  },
  {
    question: 'Wann erhalte ich Neuigkeiten zum Festival?',
    answer: 'Alle aktuellen Informationen werden im Neuigkeiten-Bereich veröffentlicht. Neue Nachrichten werden mit einem Badge markiert.',
  },
  {
    question: 'Wo finde ich Informationen zur Anreise?',
    answer: 'Informationen zur Anreise findest du in den Neuigkeiten unter der Kategorie "Anreise". Außerdem kannst du die Mitfahrbörse nutzen, um Fahrgemeinschaften zu bilden.',
  },
  {
    question: 'Was passiert bei schlechtem Wetter?',
    answer: 'Das Wiesenwahn Festival findet bei jedem Wetter statt! Aktuelle Wetterinformationen und eventuelle Anpassungen werden rechtzeitig über die Neuigkeiten bekannt gegeben.',
  },
  {
    question: 'Kann ich die Profil-Seite als App installieren?',
    answer: 'Ja! Die Profil-Seite kann als Progressive Web App (PWA) auf deinem Smartphone installiert werden. Beim ersten Besuch erscheint eine Installationsaufforderung, oder du kannst sie manuell über das Browser-Menü hinzufügen.',
  },
];

const FAQs: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

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
          {faqs.map((faq, index) => (
            <Accordion
              key={`faq-${index}`}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
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
