/**
 * Profile Recovery
 * ================
 * Component for recovering profile link via email
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Alert,
  CircularProgress,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { recoverProfile } from '../../services/profileService';
import ThemedFormLayout from '../core/layouts/ThemedFormLayout';
import FormCard from '../core/display/FormCard';
import MissionHeading from '../core/display/MissionHeading';
import { useBrandingPack } from '../../branding/useBrandingPack';

const ProfileRecovery: React.FC = () => {
  const navigate = useNavigate();
  const brandingPack = useBrandingPack();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorStatus = (errorValue: unknown): number | undefined => {
    if (!errorValue || typeof errorValue !== 'object') {
      return undefined;
    }

    const maybeResponse = (errorValue as { response?: { status?: unknown } }).response;
    if (!maybeResponse) {
      return undefined;
    }

    return typeof maybeResponse.status === 'number' ? maybeResponse.status : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      setLoading(false);
      return;
    }

    try {
      await recoverProfile(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      const status = getErrorStatus(err);
      // Don't expose whether email exists (security best practice)
      // But show technical errors
      if (status === 429) {
        setError('Zu viele Anfragen. Bitte versuche es in einer Stunde erneut.');
      } else if (typeof status === 'number' && status >= 500) {
        setError('Serverfehler. Bitte versuche es später erneut.');
      } else if (status === undefined) {
        setError('Server nicht erreichbar. Bitte pruefe die Verbindung und versuche es erneut.');
      } else {
        // Generic success message even on error (security)
        setSuccess(true);
        setEmail('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
      <ThemedFormLayout
        title="Profil wiederherstellen"
        missionBriefing="Wenn du deinen Profil-Link verloren hast, schicken wir dir einen neuen Zugang per E-Mail."
        footerId="PROFIL-RETTUNG"
        maxWidth={560}
      >
        <Box sx={{ maxWidth: 440, mx: 'auto' }}>
          <MissionHeading
            title="Profil-Link erneut anfordern"
            subtitle="Sicherer Versand an deine registrierte E-Mail-Adresse"
            icon={<EmailIcon />}
          />

          <FormCard selected={true} sx={{ mt: 0 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ px: 1, pb: 1 }}>
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Wenn diese E-Mail-Adresse bei uns registriert ist, wirst du in Kürze eine E-Mail
                    mit deinem Profil-Link erhalten.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Bitte überprüfe auch deinen Spam-Ordner.
                  </Typography>
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="E-Mail-Adresse"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="deine@email.de"
                autoFocus
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !email}
                sx={{ mb: 1.25, textTransform: 'none', fontFamily: brandingPack.typography.accent }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={22} sx={{ mr: 1 }} />
                    Wird gesendet...
                  </>
                ) : (
                  'Profil-Link anfordern'
                )}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                disabled={loading}
                sx={{ textTransform: 'none', fontFamily: brandingPack.typography.body }}
              >
                Zurück zur Startseite
              </Button>

              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: alpha('#d8b87a', 0.35),
                  backgroundColor: 'action.hover',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  <strong>Hinweis:</strong> Aus Sicherheitsgründen wird nicht angezeigt, ob die
                  E-Mail-Adresse in unserem System existiert. Du erhältst nur eine E-Mail, wenn die
                  Adresse bei uns registriert ist.
                </Typography>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1.5, display: 'block', textAlign: 'center' }}
              >
                Anfragen sind auf 3 pro Stunde limitiert
              </Typography>
            </Box>
          </FormCard>
        </Box>
      </ThemedFormLayout>
    </Container>
  );
};

export default ProfileRecovery;
