import {Booking, TicketOption} from "../../../form/userArea/interface";
import {alpha, Box, FormControlLabel, Paper, Radio, Typography} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import SignalWifiStatusbarConnectedNoInternet4Icon from "@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4";
import React from "react";

function TicketOptionComponent(props: { currentBooking: Booking, option: TicketOption, soldOut: boolean }) {
    return <Paper

        elevation={0}
        sx={{
            mb: 2,
            backgroundColor: alpha("#020c1b", 0.7),
            borderRadius: "8px",
            border: "1px solid",
            borderColor: props.currentBooking.ticket_id === props.option.id
                ? "#1e88e5"
                : alpha("#90caf9", 0.3),
            position: "relative",
            overflow: "hidden",
            width: "100%",
            // Glow effect for selected
            boxShadow: props.currentBooking.ticket_id === props.option.id
                ? `0 0 12px ${alpha("#1e88e5", 0.3)}`
                : "none",
        }}
    >
        {/* Status indicator LED */}
        <Box sx={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: props.soldOut ? "#f44336" : "#4caf50",
            boxShadow: `0 0 6px ${props.soldOut ? "#f44336" : "#4caf50"}`,
            zIndex: 10,
        }}/>

        {/* Futuristic scanner line animation for selected ticket */}
        {props.currentBooking.ticket_id === props.option.id && (
            <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                zIndex: 1,
                overflow: "hidden",
                "&::after": {
                    content: "\"\"",
                    position: "absolute",
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(to right, transparent, #64b5f6, transparent)",
                    top: 0,
                    animation: "scanDown 2s infinite",
                },
                "@keyframes scanDown": {
                    "0%": {transform: "translateY(0)"},
                    "100%": {transform: "translateY(100%)"}
                }
            }}/>
        )}

        <FormControlLabel
            sx={{
                p: 0,
                m: 0,
                width: "100%",
                height: "100%",
                "& .MuiFormControlLabel-label": {
                    width: "100%",
                    opacity: props.soldOut ? 0.6 : 1,
                }
            }}
            disabled={props.soldOut}
            value={props.option.id}
            control={
                <Radio
                    sx={{
                        position: "absolute",
                        top: {xs: 12, sm: 14},
                        left: {xs: 8, sm: 12},
                        color: alpha("#90caf9", 0.6),
                        "&.Mui-checked": {
                            color: "#64b5f6",
                        },
                        zIndex: 2,
                    }}
                />
            }
            label={
                <Box sx={{
                    pt: 2.5,
                    pb: 2,
                    px: {xs: 1.5, sm: 2},
                    pl: {xs: 5, sm: 6},
                    position: "relative",
                    zIndex: 1,
                }}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: {xs: "wrap", sm: "nowrap"},
                            gap: {xs: 1, sm: 0}
                        }}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                width: {xs: "100%", sm: "auto"}
                            }}>
                                <FlightTakeoffIcon sx={{
                                    color: "#64b5f6",
                                    fontSize: "1.1rem",
                                    mr: 1,
                                    ml: 1,
                                    flexShrink: 0
                                }}/>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: alpha("#fff", 0.9),
                                        fontWeight: "medium",
                                        fontSize: {xs: "0.95rem", sm: "1rem"}
                                    }}
                                >
                                    {props.option.title}
                                </Typography>
                            </Box>

                            {props.soldOut ? (
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    bgcolor: alpha("#f44336", 0.1),
                                    p: 0.5,
                                    px: 1,
                                    borderRadius: "4px",
                                    border: "1px solid",
                                    borderColor: alpha("#f44336", 0.3),
                                    flexShrink: 0,
                                    ml: "auto"
                                }}>
                                    <SignalWifiStatusbarConnectedNoInternet4Icon
                                        sx={{
                                            fontSize: "0.8rem",
                                            mr: 0.5,
                                            color: "#f44336"
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#f44336",
                                            fontWeight: "medium",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            fontSize: "0.7rem"
                                        }}
                                    >
                                        Ausgebucht
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    bgcolor: alpha("#1e88e5", 0.1),
                                    p: 0.5,
                                    px: 1.5,
                                    borderRadius: "4px",
                                    border: "1px solid",
                                    borderColor: alpha("#1e88e5", 0.3),
                                    flexShrink: 0,
                                    ml: "auto"
                                }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: "#64b5f6",
                                            fontWeight: "bold",
                                            fontSize: {xs: "1.1rem", sm: "1.25rem"}
                                        }}
                                    >
                                        {props.option.price}€
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            }
        />
    </Paper>;
}

export default TicketOptionComponent;
