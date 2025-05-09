import React from "react";
import {
    Box,
    Typography,
    Paper,
    alpha,
    List,
    ListItem,
    Avatar,
    ListItemAvatar,
    ListItemText
} from "@mui/material";
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DiversityIcon from '@mui/icons-material/Diversity3';
import PngIcon from "../../components/core/display/PngIcon";
import Awareness from "../../assets/icons/awareness.png";
import Consent from "../../assets/icons/consent.png";
import Fotos from "../../assets/icons/fotos.png";
import NoRacism from "../../assets/icons/no-racism.png";
import Partiality from "../../assets/icons/partiality.png";
import {Balance} from "@mui/icons-material";


function AwarenessCodeForm() {
    const items = [
        {
            title: 'Achtsamkeit, Verantwortung und Fürsorge\n',
            text: 'Alle sollen sich wohlfühlen. Sei rücksichtsvoll mit dir und anderen. Achte auf deine Bedürfnisse (Wasser, Schlaf, Essen, Ruhe) und respektiere deine Konsumgrenzen. Frage nach, ob es anderen gut geht, und gehe sorgfältig mit Dingen und der Natur um. Sollest du das Festivalgelände verlassen, informiere deine Freund*innen darüber. ',
            icon: <PngIcon icon={Awareness} fontSize={64}/>
        },
        {
            title: 'Keine Diskriminierung',
            text: 'Sexismus, Rassismus, Queerfeindlichkeit und Gewalt führen zum Ausschluss. Wir setzen uns für Antidiskriminierung und Vielfalt ein.',
            icon: <PngIcon icon={NoRacism} fontSize={64}/>
        },
        {
            title: 'Respektiere Grenzen / Konsensprinzip',
            text: 'Achte auf Konsens – nur „Ja heißt ja“!, „Vielleicht heißt nicht ja“ und „Nichts sagen heißt nicht ja“. Jede:r hat unterschiedliche Grenzen, daher müssen diese immer erfragt und respektiert werden.',
            icon: <PngIcon icon={Consent} fontSize={64}/>
        },
        {
            title: 'Parteilichkeit bei Grenzüberschreitungen',
            text: 'Betroffene entscheiden, was eine Grenzüberschreitung ist. Wir solidarisieren uns mit der betroffenen Person und glauben ihrer Darstellung der Situation. ',
            icon: <PngIcon icon={Partiality} fontSize={64}/>
        },
        {
            title: 'Umgang mit Bildern und Fotos\n',
            text: 'Frag immer, bevor du Fotos machst, besonders bei sensiblen Inhalten. Teile keine sensiblen Fotos ohne Zustimmung.',
            icon: <PngIcon icon={Fotos} fontSize={64}/>
        },
        {
            title: 'Geschlechtergerechte Sprache',
            text:'Wir möchten eine geschlechterneutrale und inklusive Sprache verwenden. Alle Menschen sollen unabhängig von ihrer Gender-Identität angesprochen werden. Frage nach den Pronomen oder benutze den Namen, statt ein Pronomen zu verwenden.',
            icon: <Balance color={"secondary"} fontSize={"large"}/>
        }
    ];

    return (
        <Box sx={{width: '98%', maxWidth: 700, mx: 'auto'}}>
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
                        '0%': {backgroundPosition: '0% 0%'},
                        '100%': {backgroundPosition: '300% 0%'},
                    }
                }}/>

                {/* Mission Briefing */}
                <Box sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: alpha('#000', 0.3),
                    borderLeft: '4px solid',
                    borderColor: '#1e88e5',
                    mx: {xs: 1, sm: 2},
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
                        <span style={{color: '#64b5f6'}}>MISSION:</span> Unser gemeinsamer Verhaltenskodex für eine
                        sichere und respektvolle Reise durch die Galaxis.
                    </Typography>
                </Box>

                <Box sx={{p: {xs: 2, sm: 3}}}>
                    {/* Header Section */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <DiversityIcon sx={{color: '#64b5f6', mr: 1, fontSize: '1.5rem'}}/>
                        <Typography variant="h5" sx={{
                            color: alpha('#fff', 0.9),
                            fontWeight: 'medium',
                        }}>
                            Crew-Kodex
                        </Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            mb: 4,
                            color: alpha('#fff', 0.7),
                            lineHeight: 1.6
                        }}
                    >
                        Für ein gelungenes Festival ist es wichtig, dass wir alle aufeinander achten und respektvoll
                        miteinander umgehen. Unser Awareness-Code hilft uns, eine sichere und angenehme Atmosphäre für
                        alle zu schaffen.
                    </Typography>

                    {/* Code Rules List */}
                    <List sx={{width: '100%'}}>
                        {items.map((item, index) => (
                            <Paper
                                key={index}
                                elevation={2}
                                sx={{
                                    mb: 3,
                                    backgroundColor: alpha('#020c1b', 0.7),
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: alpha('#90caf9', 0.3),
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                {/* Circuit background decoration */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '150px',
                                    height: '150px',
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
                                }}/>

                                <ListItem
    sx={{
        p: { xs: 2, sm: 3 },
        position: 'relative',
        zIndex: 1,
    }}
>
    <ListItemText
        sx={{ ml: 2 }}
        primary={
            <Typography
                variant="h6"
                component="div"
                sx={{
                    color: '#64b5f6',
                    fontWeight: 'medium',
                    mb: 1,
                }}
            >
                {item.title}
            </Typography>
        }
        secondary={
            <Box sx={{
                display: "flex",
                alignItems: "center", // This aligns items vertically in the center
                justifyContent: "flex-start",
                flexDirection: "row",
                gap: 2, // Add some spacing between avatar and text
            }}>
                {/* Modified ListItemAvatar */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center", // Vertical center alignment
                        justifyContent: "center", // Horizontal center alignment
                        minWidth: 120, // Give it some minimum width
                    }}
                >
                    <Avatar
                        sx={{
                            bgcolor: alpha('#1e88e5', 0.1),
                            border: '1px solid',
                            borderColor: alpha('#64b5f6', 0.5),
                            boxShadow: '0 0 10px rgba(100, 181, 246, 0.2)',
                            width: 100,
                            height: 100
                        }}
                    >
                        {item.icon}
                    </Avatar>
                </Box>

                <Typography
                    variant="body2"
                    component="div"
                    sx={{
                        color: alpha('#fff', 0.8),
                        lineHeight: 1.6,
                        flex: 1, // This allows the text to take up remaining space
                    }}
                >
                    {item.text}
                </Typography>
            </Box>
        }
    />
</ListItem>
                            </Paper>
                        ))}
                    </List>
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
                        WWWW-CREW-GUIDELINES // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default AwarenessCodeForm;