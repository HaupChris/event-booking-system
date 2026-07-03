import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext, TokenContext } from '../../../contexts/AuthContext';
import {
  alpha,
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ThemedFormLayout from '../layouts/ThemedFormLayout';
import FormCard from '../display/FormCard';
import MissionHeading from '../display/MissionHeading';
import { useBrandingPack } from '../../../branding/useBrandingPack';
import { OrnateInput } from '../../../form/userArea/TestDesignFormPrimitives';

interface LoginPageProps {
  title: string;
  endpoint: string;
  redirectPath: string;
  setIsAdmin?: (value: boolean) => void;
  showRecoveryLink?: boolean;
  variant?: 'festival' | 'admin';
  missionBriefing?: string;
  footerId?: string;
  loginLabel?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
  title,
  endpoint,
  redirectPath,
  setIsAdmin,
  showRecoveryLink = false,
  variant = 'festival',
  missionBriefing,
  footerId,
  loginLabel = 'Zur Show!',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useContext(AuthContext);
  const { setToken } = useContext(TokenContext);
  const navigate = useNavigate();
  const brandingPack = useBrandingPack();

  const getLoginErrorMessage = (status: number) => {
    if (status === 401) {
      return 'Falsches Passwort';
    }

    if (status === 429) {
      return 'Zu viele Anmeldeversuche. Bitte warte kurz und versuche es erneut.';
    }

    if (status >= 500) {
      return 'Serverfehler. Bitte versuche es in ein paar Minuten erneut.';
    }

    return 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setAuth(true);

        // Set admin flag if needed
        if (setIsAdmin) {
          setIsAdmin(true);
        }

        navigate(redirectPath);
      } else {
        setError(getLoginErrorMessage(response.status));
      }
    } catch (error) {
      setError('Server nicht erreichbar. Bitte pruefe, ob das Backend laeuft.');
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  if (variant === 'admin') {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 2,
              borderColor: alpha('#1f2937', 0.2),
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
              {title}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                id="password-input"
                label="Passwort"
                placeholder="Passwort"
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoFocus
                fullWidth
                required
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                {loginLabel}
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <ThemedFormLayout
          title={title}
          missionBriefing={
            missionBriefing ??
            'Bitte gib das Zugangspasswort ein, um den Registrierungsbereich zu betreten.'
          }
          footerId={footerId ?? 'EINLASS-KONTROLLE'}
          maxWidth={560}
        >
          <Box sx={{ maxWidth: 420, mx: 'auto', width: '100%' }}>
            <MissionHeading title="Zugang zum Festivalbereich" icon={<LockOpenIcon />} />
            <FormCard selected={true} sx={{ mt: 0 }}>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 1, pb: 1 }}>
                <OrnateInput
                  label="Passwort *"
                  type="password"
                  value={password}
                  placeholder="Passwort"
                  icon={<VpnKeyIcon fontSize="large" />}
                  size="compact"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 0,
                    mb: 1,
                    fontFamily: brandingPack.typography.accent,
                    textTransform: 'none',
                  }}
                >
                  {loginLabel}
                </Button>

                {showRecoveryLink && (
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <MuiLink
                      component={RouterLink}
                      to="/profile/recover"
                      underline="hover"
                      sx={{
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        fontFamily: brandingPack.typography.body,
                      }}
                    >
                      Profil-Link vergessen?
                    </MuiLink>
                  </Box>
                )}

                {error && (
                  <Alert variant="outlined" severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </FormCard>
          </Box>
        </ThemedFormLayout>
      </Box>
    </Container>
  );
};

export default LoginPage;
