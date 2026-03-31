import React, { useState } from 'react';
import { Box, Button, Container, LinearProgress, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import { OrnateInput, confettiPieces } from './TestDesignFormPrimitives';

const TestDesignFormStep: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: 'Dev.',
    lastName: 'Tester',
    email: 'dev.user.1774986106406@example.com',
    phone: '01701234567',
  });

  const progress = 40;

  const ornateButtonSx = {
    width: '100%',
    py: 1.4,
    mb: 4,
    borderRadius: '14px',
    color: '#e8d4b0',
    border: '2px solid #cda163',
    background:
      'linear-gradient(180deg, rgba(87,53,26,0.95) 0%, rgba(52,29,14,0.95) 50%, rgba(30,16,10,0.95) 100%)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(245,216,155,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    fontFamily: "'Merriweather', serif",
    fontWeight: 700,
    fontSize: { xs: '0.9rem', sm: '1rem' },
    '&:hover': {
      borderColor: '#e0ba79',
      background:
        'linear-gradient(180deg, rgba(102,65,34,0.96) 0%, rgba(66,38,20,0.96) 50%, rgba(35,19,12,0.96) 100%)',
    },
  };

  const handleInputChange =
    (field: keyof typeof formData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleDevAutoFill = () => {
    setFormData({
      firstName: 'Dev.',
      lastName: 'Tester',
      email: 'dev.user.1774986106406@example.com',
      phone: '01701234567',
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid #9a6c36',
        background:
          'radial-gradient(circle at 50% -15%, #3e1925 0%, #231019 45%, #16090f 80%, #13070c 100%)',
        position: 'relative',
        py: { xs: 3, sm: 4 },
        px: { xs: 1.5, sm: 2.5 },
      }}
    >
      {confettiPieces.map((piece) => (
        <Box
          key={`${piece.top}-${piece.left ?? 'na'}-${piece.right ?? 'na'}-${piece.color}`}
          sx={{
            position: 'absolute',
            top: piece.top,
            left: piece.left,
            right: piece.right,
            width: piece.size,
            height: piece.size,
            borderRadius: piece.size % 2 === 0 ? '50%' : 0,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotate})`,
            opacity: 0.95,
            pointerEvents: 'none',
          }}
        />
      ))}

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ position: 'relative', mt: 0.5, mb: 5.5 }}>
          <Box
            sx={{
              position: 'absolute',
              top: -36,
              left: `${progress}%`,
              transform: 'translateX(-50%)',
              fontSize: { xs: '1.4rem', sm: '2rem' },
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))',
            }}
          >
            🤸
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 14,
              borderRadius: 8,
              backgroundColor: '#3f281f',
              border: '1px solid #8c6539',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #e8bf61 0%, #d7a33e 45%, #b9821f 100%)',
                borderRadius: 8,
              },
            }}
          />
        </Box>

        <Typography
          component="h1"
          sx={{
            mb: 3.2,
            textAlign: 'center',
            color: '#b04a3d',
            fontFamily: "'Rye', cursive",
            fontSize: { xs: '2.1rem', sm: '4.75rem' },
            letterSpacing: '0.02em',
            textShadow:
              '-1px -1px 0 #e4bc76, 1px -1px 0 #e4bc76, -1px 1px 0 #e4bc76, 1px 1px 0 #e4bc76, 0 6px 16px rgba(0,0,0,0.6)',
          }}
        >
          PERSOENLICHE DATEN
        </Typography>

        <Box
          sx={{
            mb: 4.5,
            px: { xs: 2, sm: 3.2 },
            py: 1.45,
            background: 'linear-gradient(180deg, #3c6fb1 0%, #2e5e98 100%)',
            border: '1px solid #d9b062',
            clipPath: 'polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%)',
            color: '#f5efe3',
            textAlign: 'center',
            fontFamily: "'Merriweather', serif",
            fontStyle: 'italic',
            fontSize: { xs: '1.05rem', sm: '1.5rem' },
            lineHeight: 1.35,
            textShadow: '0 2px 3px rgba(0,0,0,0.45)',
          }}
        >
          ★ Bitte gib deine Kontaktinformationen fuer die Festival-Registrierung ein. ★
        </Box>

        <Box sx={{ mb: 3.1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.75 }}>
            <PersonIcon sx={{ color: '#64B5F6', fontSize: { xs: 28, sm: 34 } }} />
            <Typography
              sx={{
                color: '#e8d2ab',
                fontFamily: "'Rye', cursive",
                fontSize: { xs: '2rem', sm: '3.3rem' },
                lineHeight: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.55)',
              }}
            >
              Persoenliche Daten
            </Typography>
          </Box>
          <Typography
            sx={{
              color: '#e5cf9f',
              ml: { xs: 5, sm: 6.4 },
              fontFamily: "'Merriweather', serif",
              fontSize: { xs: '1.2rem', sm: '2rem' },
            }}
          >
            Do, 28.08. - So, 31.08.2025
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={handleDevAutoFill}
          startIcon={<TheaterComedyIcon />}
          sx={ornateButtonSx}
        >
          VORHANG AUF: DATEN AUTOMATISCH FUELLEN
        </Button>

        <Box component="form" noValidate autoComplete="off">
          <OrnateInput
            label="Vorname *"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            icon={<PersonIcon fontSize="large" />}
          />
          <OrnateInput
            label="Nachname *"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            icon={<WorkIcon fontSize="large" />}
          />
          <OrnateInput
            label="E-Mail (fuer deine Bestaetigung) *"
            value={formData.email}
            onChange={handleInputChange('email')}
            icon={<AlternateEmailIcon fontSize="large" />}
            type="email"
          />
          <OrnateInput
            label="Telefon *"
            value={formData.phone}
            onChange={handleInputChange('phone')}
            icon={<PhoneAndroidIcon fontSize="large" />}
            type="tel"
          />
        </Box>
      </Container>
    </Box>
  );
};

export default TestDesignFormStep;
