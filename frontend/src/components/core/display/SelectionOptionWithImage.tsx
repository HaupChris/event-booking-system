import FormCard from "./FormCard";
import {alpha, Avatar, Box, ListItem, ListItemButton, Typography} from "@mui/material";
import portholeImage from "../../../img/rocket_porthole.png";
import React from "react";
import SpaIcon from '@mui/icons-material/Spa';
import {Park} from "@mui/icons-material"; // For vegan

interface IProps {
    selected: boolean
    onClick: () => void
    title: string
    price: number
    description: string
    imageSource: string
}

function SelectionOptionWithImage(props: IProps) {
    // Check if description contains vegetarian or vegan keywords
    const isVegetarian = props.description.toLowerCase().includes("vegetarisch") || props.title.toLowerCase().includes("vegetarisch");
    const isVegan = props.description.toLowerCase().includes("vegan") || props.title.toLowerCase().includes("vegan");
    const descriptionText = props.description.split("//")[0]

    const DietBadge = () => {
        return <Box sx={{
            display: "flex",
            alignItems: "center",
            color: isVegan ? "white": "info",
            p: 0.5,
            px: 1.5,
            borderRadius: "4px",
            border: "1px solid",
            borderColor: alpha("#1e88e5", 0.3),
            ml: 2
        }}>
            <Typography
                sx={{
                    color: "#64b5f6",
                    fontWeight: "bold",
                    fontSize: "1.25rem"
                }}
            >
                {
                    isVegan?
                <><Park/> vegan</>:
                    <><SpaIcon/> vegetarisch</>
                }
            </Typography>
        </Box>

    }

    return <FormCard selected={props.selected} sx={{marginTop: 3}}>
        {/* Futuristic scanner line animation for selected option */}
        {props.selected && (
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

        <ListItem
            disablePadding
            sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                position: "relative", // Added for badge positioning
            }}
        >


            <ListItemButton
                onClick={props.onClick}
                sx={{
                    p: {xs: 2, sm: 3},
                    width: "100%",
                    position: "relative",
                    zIndex: 2,
                    "&:hover": {
                        backgroundColor: alpha("#1e88e5", 0.1),
                    }
                }}
            >
                {/* Mobile Layout - Column */}
                <Box sx={{
                    width: "100%",
                    display: {xs: "flex", sm: "none"},
                    flexDirection: "column",
                }}>
                    {/* Title */}
                    <Typography
                        variant="h6"
                        sx={{
                            color: alpha("#fff", 0.9),
                            fontWeight: "medium",
                            mb: 1.5
                        }}
                    >
                        {props.title}
                    </Typography>

                    {/* Image and description row */}
                    <Box sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        width: "100%",

                    }}>
                        {/* Avatar */}
                        <Box sx={{position: "relative", ml: 2, mr: 5, mt: 2}}>
                            <Avatar
                                alt={props.title}
                                src={props.imageSource}
                                // variant="rounded"  // Changed to reduce pixelation
                                sx={{
                                    width: 100,
                                    height: 100,
                                    border: "2px solid",
                                    borderColor: alpha("#1e88e5", 0.3),
                                    // objectFit: "cover", // Added to improve image display
                                }}
                            />
                            <img
                                src={portholeImage}
                                alt="porthole"
                                style={{
                                    position: "absolute",
                                    top: -25,
                                    left: -25,
                                    width: 150,
                                    height: 150,
                                    zIndex: 1,
                                }}
                            />
                        </Box>

                        {/* Description */}
                        <Typography
                            variant="body2"
                            sx={{
                                color: alpha("#fff", 0.7),
                                flexGrow: 1,
                            }}
                        >
                            {descriptionText}
                        </Typography>
                    </Box>
                    <Box sx={{
                        alignSelf: "flex-end",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        justifyContent: "end"
                    }}>

                        {/* Price tag */}
                        <Box sx={{
                            alignSelf: "flex-end",
                            bgcolor: alpha("#1e88e5", 0.1),
                            mb: 2,
                            p: 0.5,
                            px: 1.5,
                            borderRadius: "4px",
                            border: "1px solid",
                            borderColor: alpha("#1e88e5", 0.3),
                        }}>
                            {/* Diet Badge positioned relative to the ListItem */}

                            <Typography
                                variant="h6"
                                sx={{
                                    color: "#64b5f6",
                                    fontWeight: "bold",
                                    fontSize: "1.1rem"
                                }}
                            >
                                {props.price}€
                            </Typography>

                        </Box>

                        <DietBadge/>
                    </Box>
                </Box>

                {/* Desktop Layout - Row */}
                <Box sx={{
                    width: "100%",
                    display: {xs: "none", sm: "flex"},
                    alignItems: "center",
                }}>
                    {/* Avatar */}
                    <Box sx={{position: "relative", mr: 3}}>
                        <Avatar
                            alt={props.title}
                            src={props.imageSource}
                            sx={{
                                width: 80,
                                height: 80,
                                border: "2px solid",
                                borderColor: alpha("#1e88e5", 0.3),
                                objectFit: "cover", // Added to improve image display
                            }}
                        />
                        <img
                            src={portholeImage}
                            alt="porthole"
                            style={{
                                position: "absolute",
                                top: -12,
                                left: -12,
                                width: 104,
                                height: 104,
                                zIndex: 1,
                            }}
                        />
                    </Box>

                    {/* Content */}
                    <Box sx={{flexGrow: 1}}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: alpha("#fff", 0.9),
                                fontWeight: "medium",
                                mb: 0.5
                            }}
                        >
                            {props.title}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: alpha("#fff", 0.7),
                            }}
                        >
                            {props.description}
                        </Typography>
                    </Box>

                    {/* Price tag */}
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        bgcolor: alpha("#1e88e5", 0.1),
                        p: 0.5,
                        px: 1.5,
                        borderRadius: "4px",
                        border: "1px solid",
                        borderColor: alpha("#1e88e5", 0.3),
                        ml: 2
                    }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "#64b5f6",
                                fontWeight: "bold",
                                fontSize: "1.25rem"
                            }}
                        >
                            {props.price}€
                        </Typography>
                    </Box>
                </Box>
            </ListItemButton>
        </ListItem>
    </FormCard>;
}

export default SelectionOptionWithImage;