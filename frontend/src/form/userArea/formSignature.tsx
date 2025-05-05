import React from "react";
import SignaturePad from "../components/signature";
import { FormProps } from "./formContainer";
import {
    Box,
    Typography,
    Paper,
    alpha,
    Divider
} from "@mui/material";
import DrawIcon from '@mui/icons-material/Draw';
import GavelIcon from '@mui/icons-material/Gavel';

function FormSignature(props: FormProps) {
    return (
        <Box sx={{ width: '98%', maxWidth: 600, mx: 'auto' }}>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    p: 0,
                    borderRadius: '14px',
                    background: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid',
                    borderColor: alpha('#64b5f6', 0.2),
                }}
            >
                {/* Decorative top pattern */}
                <Box sx={{
                    width: '100%',
                    height: '6px',
                    background: 'linear-gradient(90deg, #1e88e5, #64b5f6, #bbdefb, #1e88e5)',
                    backgroundSize: '300% 100%',
                    animation: 'gradientMove 12s linear infinite',
                    '@keyframes gradientMove': {
                        '0%': { backgroundPosition: '0% 0%' },
                        '100%': { backgroundPosition: '300% 0%' },
                    }
                }} />

                {/* Mission Briefing */}
                <Box sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: alpha('#000', 0.3),
                    borderLeft: '4px solid',
                    borderColor: '#1e88e5',
                    mx: { xs: 1, sm: 2 },
                    my: 2,
                    borderRadius: '0 8px 8px 0',
                }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: alpha('#fff', 0.9),
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                        }}
                    >
                        <span style={{ color: '#64b5f6' }}>MISSION:</span> Vor Beginn deiner interstellaren Reise bestätige bitte die Sicherheitshinweise mit deiner digitalen Signatur.
                    </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Header Section */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <GavelIcon sx={{ color: '#64b5f6', mr: 1, fontSize: '1.5rem' }} />
                        <Typography variant="h6" sx={{
                            color: alpha('#fff', 0.9),
                            fontWeight: 'medium',
                        }}>
                            Bestätigung der Teilnahmebedingungen
                        </Typography>
                    </Box>

                    {/* Legal Text */}
                    <Paper
                        elevation={2}
                        sx={{
                            mb: 3,
                            mt: 2,
                            p: 2.5,
                            backgroundColor: alpha('#020c1b', 0.7),
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: alpha('#90caf9', 0.3),
                            position: 'relative',
                        }}
                    >
                        {/* Circuit background decoration */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '200px',
                            height: '200px',
                            opacity: 0.03,
                            zIndex: 0,
                            backgroundImage: `
                                radial-gradient(circle, #64b5f6 1px, transparent 1px),
                                linear-gradient(to right, transparent 4px, #64b5f6 1px, transparent 1px),
                                linear-gradient(to bottom, transparent 4px, #64b5f6 1px, transparent 1px)
                            `,
                            backgroundSize: '20px 20px, 10px 10px, 10px 10px',
                            backgroundPosition: '0 0, 10px 0, 0 10px',
                            transform: 'rotate(15deg)',
                        }} />

                        <Typography
                            variant="body2"
                            align="justify"
                            sx={{
                                color: alpha('#fff', 0.8),
                                lineHeight: 1.7,
                                position: 'relative',
                                zIndex: 1,
                                letterSpacing: '0.01em'
                            }}
                        >
                            Hiermit bestätige ich, dass ich auf eigene Gefahr am "Weiher Wald und Weltall-Wahn 2025" vom 29.08.2025 bis zum 01.09.2025 teilnehme.
                            Der Veranstalter haftet bei Personen-, Sach- und Vermögensschäden nicht für leichte Fahrlässigkeit. Dies gilt sowohl für eigene Handlungen, als auch für Handlungen
                            seiner Vertreter, Erfüllungsgehilfen oder Dritter, derer sich der Veranstalter im Zusammenhang mit der Durchführung der Veranstaltung bedient.
                        </Typography>
                    </Paper>

                    {/* Signature Section */}
                    <Box sx={{
                        mt: 4,
                        mb: 2
                    }}>
                        <Divider sx={{
                            mb: 3,
                            borderColor: alpha('#64b5f6', 0.3)
                        }} />

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <DrawIcon sx={{ color: '#64b5f6', mr: 1 }} />
                            <Typography
                                variant="subtitle1"
                                align="center"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                }}
                            >
                                Bitte unterschreibe hier:
                            </Typography>
                        </Box>

                        {/* Signature Box with Styled Border */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                p: 1,
                                border: '1px dashed',
                                borderColor: alpha('#64b5f6', 0.5),
                                borderRadius: '10px',
                                background: alpha('#000', 0.2),
                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                                mb: 1
                            }}
                        >
                            <SignaturePad
                                currentSignature={props.currentBooking.signature}
                                updateCurrentSignature={(signature: string) => props.updateBooking("signature", signature)}
                            />
                        </Box>

                        {/* Error indicator if validation fails */}
                        {props.formValidation.signature && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#f44336',
                                    display: 'block',
                                    textAlign: 'center',
                                    mt: 1
                                }}
                            >
                                {props.formValidation.signature}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Footer with space station ID */}
                <Box sx={{
                    p: 1.5,
                    backgroundColor: '#041327',
                    borderTop: '1px solid',
                    borderColor: alpha('#64b5f6', 0.2),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: 'monospace',
                            color: alpha('#fff', 0.7),
                            letterSpacing: '1px',
                            fontSize: '0.7rem'
                        }}
                    >
                        WWWW-AUTHORIZATION-PROTOCOL // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default FormSignature;