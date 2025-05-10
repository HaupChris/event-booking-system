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
import {userAreaTexts} from "../constants/texts";


function AwarenessCodeForm() {
    const icons = [
        <PngIcon icon={Awareness} fontSize={64}/>,
        <PngIcon icon={NoRacism} fontSize={64}/>,
        <PngIcon icon={Consent} fontSize={64}/>,
        <PngIcon icon={Partiality} fontSize={64}/>,
        <PngIcon icon={Fotos} fontSize={64}/>,
        <Balance color={"secondary"} fontSize={"large"}/>,
    ];

    return <SpacePanelLayout
        missionBriefing={userAreaTexts.awarenessCodeForm.missionBriefing}
        footerId={userAreaTexts.awarenessCodeForm.footerId}
    >
        {/* Code Rules List */}
        <List sx={{width: '100%'}}>
            {userAreaTexts.awarenessCodeForm.codeRules.map((item, index) => (
                <FormCard
                    sx={{mt: 2}}
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
                                            {icons[index]}
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