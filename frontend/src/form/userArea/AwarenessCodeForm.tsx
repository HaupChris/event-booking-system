import React from "react";
import {
    Box,
    Typography,
    alpha,
    List,
    ListItem,
    Avatar,
    ListItemText, useMediaQuery, useTheme
} from "@mui/material";
import PngIcon from "../../components/core/display/PngIcon";
import Awareness from "../../assets/icons/awareness.png";
import Consent from "../../assets/icons/consent.png";
import Fotos from "../../assets/icons/fotos.png";
import NoRacism from "../../assets/icons/no-racism.png";
import Partiality from "../../assets/icons/partiality.png";
import {Balance} from "@mui/icons-material";
import FormCard from "../../components/core/display/FormCard";
import ThemedFormLayout from "../../components/core/layouts/ThemedFormLayout";
import {userAreaTexts} from "../constants/texts";


function AwarenessCodeForm() {
    const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const icons = [
        <PngIcon icon={Awareness} fontSize={isXs? 52: 64}/>,
        <PngIcon icon={NoRacism} fontSize={isXs? 52: 64}/>,
        <PngIcon icon={Consent} fontSize={isXs? 52: 64}/>,
        <PngIcon icon={Partiality} fontSize={isXs? 52: 64}/>,
        <PngIcon icon={Fotos} fontSize={isXs? 52: 64}/>,
        <Balance color={"secondary"} fontSize={"large"}/>,
    ];

    return <ThemedFormLayout
        missionBriefing={userAreaTexts.awarenessCodeForm.missionBriefing}
        footerId={userAreaTexts.awarenessCodeForm.footerId}
    >
        {/* Code Rules List */}
        <List sx={{width: '100%'}}>
            {userAreaTexts.awarenessCodeForm.codeRules.map((item, index) => (
                <FormCard
                    key={index}
                    sx={{mt: 2, pl:0, pr: 2}}
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
                     radial-gradient(circle, ${theme.palette.primary.main} 1px, transparent 1px),
                     linear-gradient(to right, transparent 4px, ${theme.palette.primary.main} 1px, transparent 1px),
                     linear-gradient(to bottom, transparent 4px, ${theme.palette.primary.main} 1px, transparent 1px)
                   `,
                        backgroundSize: '20px 20px, 10px 10px, 10px 10px',
                        backgroundPosition: '0 0, 10px 0, 0 10px',
                        transform: 'rotate(15deg)',
                    }}/>

                    <ListItem
                        sx={{
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
                                        color: theme.palette.primary.main,
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
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    flexDirection: "row",
                                    gap: 1,
                                }}>
                                    {/* Modified ListItemAvatar */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minWidth: {xs: 80, sm: 120},
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                border: '1px solid',
                                                borderColor: alpha(theme.palette.primary.main, 0.5),
                                                boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`,
                                                width: {xs:70, sm:100},
                                                height: {xs:70, sm:100}
                                            }}
                                        >
                                            {icons[index]}
                                        </Avatar>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        component="div"
                                        sx={{
                                            color: alpha(theme.palette.text.primary, 0.8),
                                            lineHeight: 1.6,
                                            flex: 1,
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
    </ThemedFormLayout>
}

export default AwarenessCodeForm;