/**
 * Profile Recovery
 * ================
 * Component for recovering profile link via email
 */

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { recoverProfile } from '../../services/profileService';

const ProfileRecovery: React.FC = () => {
  const navigate = useNavigate();
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
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <EmailIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Profil wiederherstellen
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gib deine E-Mail-Adresse ein, um deinen Profil-Link zu erhalten
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Wenn diese E-Mail-Adresse bei uns registriert ist, wirst du in Kürze eine E-Mail mit
              deinem Profil-Link erhalten.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Bitte überprüfe auch deinen Spam-Ordner.
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="E-Mail-Adresse"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="deine@email.de"
            autoFocus
            sx={{ mb: 3 }}
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
            sx={{ mb: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
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
          >
            Zurück zur Startseite
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Hinweis:</strong> Aus Sicherheitsgründen wird nicht angezeigt, ob die
            E-Mail-Adresse in unserem System existiert. Du erhältst nur eine E-Mail, wenn die
            Adresse bei uns registriert ist.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Anfragen sind auf 3 pro Stunde limitiert
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileRecovery;
