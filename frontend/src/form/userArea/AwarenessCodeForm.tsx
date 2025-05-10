import React from "react";
import {
    Box,
    Typography,
    alpha,
    List,
    ListItem,
    Avatar,
    ListItemText
} from "@mui/material";
import PngIcon from "../../components/core/display/PngIcon";
import Awareness from "../../assets/icons/awareness.png";
import Consent from "../../assets/icons/consent.png";
import Fotos from "../../assets/icons/fotos.png";
import NoRacism from "../../assets/icons/no-racism.png";
import Partiality from "../../assets/icons/partiality.png";
import {Balance} from "@mui/icons-material";
import FormCard from "../../components/core/display/FormCard";
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";


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
            text: 'Wir möchten eine geschlechterneutrale und inklusive Sprache verwenden. Alle Menschen sollen unabhängig von ihrer Gender-Identität angesprochen werden. Frage nach den Pronomen oder benutze den Namen, statt ein Pronomen zu verwenden.',
            icon: <Balance color={"secondary"} fontSize={"large"}/>
        }
    ];

    return <SpacePanelLayout
        missionBriefing={"UFür ein gelungenes Festival ist es wichtig, dass wir alle aufeinander achten und" +
            " respektvoll miteinander umgehen. Unser Awareness-Code hilft uns, eine sichere und angenehme " +
            "Atmosphäre für alle zu schaffen."}
        footerId={" WWWW-CREW-CODEX // ID-2025"}
    >
        {/* Code Rules List */}
        <List sx={{width: '100%'}}>
            {items.map((item) => (
                <FormCard
                    sx={{mt:2}}
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
                            p: {xs: 2, sm: 3},
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        <ListItemText
                            sx={{ml: 2}}
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
                </FormCard>
            ))}
        </List>
    </SpacePanelLayout>
}

export default AwarenessCodeForm;