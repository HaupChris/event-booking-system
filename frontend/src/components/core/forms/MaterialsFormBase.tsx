import React from "react";
import {
    Box,
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Typography,
    alpha,
    CircularProgress,
    Chip,
} from "@mui/material";
import InventoryIcon from '@mui/icons-material/Inventory';
import BackpackIcon from '@mui/icons-material/Backpack';
import SpacePanelLayout from "../layouts/SpacePanelLayout";
import FormCard from "../display/FormCard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {spacePalette} from "../../styles/theme";
import {Material} from "../../../form/userArea/interface";


interface MaterialsTextProps {
    missionBriefing: string;
    footerId: string;
    title: string;
    materialsTitle: string;
    bringingItems: (count: number) => string;
}

interface MaterialsFormBaseProps {
    currentBooking: {
        [key: string]: any; // Add index signature for dynamic property access
    };
    updateBooking: (key: any, value: any) => void;
    formContent: {
        materials?: Material[];
        [key: string]: any; // Allow other properties
    };
    texts: MaterialsTextProps;
    materialsPropName?: string;
}

function MaterialsFormBase(props: MaterialsFormBaseProps) {
    const { texts, materialsPropName = "material_ids" } = props;

    function handleToggle(material_id: number) {
        if (props.currentBooking[materialsPropName].indexOf(material_id) === -1) {
            props.updateBooking(materialsPropName, [...props.currentBooking[materialsPropName], material_id])
        } else {
            props.updateBooking(materialsPropName,
                props.currentBooking[materialsPropName].filter((id: number) => id !== material_id));
        }
    }

    // Get dynamic styling for the capacity indicator
    const getCapacityColor = (numBooked: number, numNeeded: number) => {
        if (numBooked >= numNeeded) return spacePalette.status.error;
        if (numBooked / numNeeded > 0.7) return spacePalette.status.warning;
        return spacePalette.status.success;
    };

    // Get materials array from appropriate prop in formContent
    const materials = props.formContent.materials || [];

    return <SpacePanelLayout
        missionBriefing={texts.missionBriefing}
        footerId={texts.footerId}
    >
        <FormCard
            elevation={2}
            sx={{border: "None"}}
            title={texts.materialsTitle}
            icon={<BackpackIcon sx={{color: spacePalette.primary.main, mr: 1, fontSize: '1.5rem'}}/>}
        >
            {props.currentBooking[materialsPropName].length > 0 && (
                <FormCard
                    selected={true}
                    icon={<InventoryIcon sx={{color: spacePalette.primary.main, fontSize: '1.2rem', mr: 1}}/>}
                    title={texts.bringingItems(props.currentBooking[materialsPropName].length)}
                ><Box sx={{paddingX: 2}}>
                    {materials
                        .filter(material => props.currentBooking[materialsPropName].includes(material.id))
                        .map(material => (
                            <Chip
                                key={material.id}
                                label={material.title}
                                color="primary"
                                size="small"
                                icon={<CheckCircleIcon/>}
                                sx={{
                                    fontWeight: 'medium',
                                    bgcolor: alpha('#1e88e5', 0.2),
                                    '& .MuiChip-label': {px: 1},
                                    margin: 0.5
                                }}
                                onDelete={() => handleToggle(material.id)}
                            />
                        ))
                    }
                </Box>
                </FormCard>
            )}

            {/* Materials List */}
            <List dense className={'material-list'}>
                {materials
                    .filter((material) => material.num_needed > material.num_booked || props.currentBooking[materialsPropName].includes(material.id))
                    .sort((a, b) => (b.num_needed - b.num_booked) - (a.num_needed - a.num_booked))
                    .map((material: Material) => {
                        const labelId = `checkbox-list-secondary-label-${material.id}`;
                        const isSelected = props.currentBooking[materialsPropName].indexOf(material.id) !== -1;
                        const num_booked = material.num_booked + (isSelected ? 1 : 0);
                        const capacityColor = getCapacityColor(num_booked, material.num_needed);

                        return (
                            <Paper
                                elevation={2}
                                key={material.id}
                                sx={{
                                    mb: 2,
                                    backgroundColor: alpha('#020c1b', 0.7),
                                    borderRadius: '8px',
                                    border: isSelected ? '2px solid' : '1px solid',
                                    borderColor: isSelected ? '#1e88e5' : alpha('#90caf9', 0.3),
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: isSelected
                                        ? `0 0 12px ${alpha('#1e88e5', 0.3)}`
                                        : 'none',
                                }}
                            >
                                {/* Futuristic scanner line animation for selected option */}
                                {isSelected && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '100%',
                                        zIndex: 1,
                                        overflow: 'hidden',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            width: '100%',
                                            height: '2px',
                                            background: 'linear-gradient(to right, transparent, #1e88e5, transparent)',
                                            top: 0,
                                            animation: 'scanDown 2s infinite',
                                        },
                                        '@keyframes scanDown': {
                                            '0%': {transform: 'translateY(0)'},
                                            '100%': {transform: 'translateY(100%)'}
                                        }
                                    }}/>
                                )}

                                <ListItem
                                    disablePadding
                                    sx={{
                                        position: 'relative',
                                        zIndex: 2,
                                    }}
                                >
                                    <ListItemButton
                                        onClick={() => handleToggle(material.id)}
                                        sx={{
                                            py: 1.5,
                                            px: {xs: 2, sm: 2.5},
                                            '&:hover': {
                                                backgroundColor: alpha('#1e88e5', 0.1),
                                            }
                                        }}
                                    >
                                        {/* Progress Circle */}
                                        <Box sx={{
                                            position: 'relative',
                                            mr: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={num_booked > 0 ? (num_booked / material.num_needed) * 100 : 0}
                                                size={46}
                                                thickness={4}
                                                sx={{
                                                    color: capacityColor,
                                                    backgroundColor: alpha('#000', 0.3),
                                                    borderRadius: '50%'
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    top: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    component="div"
                                                    sx={{
                                                        color: alpha('#fff', 0.9),
                                                        fontWeight: 'medium'
                                                    }}
                                                >
                                                    {`${num_booked}/${material.num_needed}`}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <ListItemText
                                            id={labelId}
                                            primary={
                                                <Typography
                                                    variant={"subtitle1"}
                                                    sx={{
                                                        color: alpha('#fff', 0.9),
                                                        fontWeight: isSelected ? 'medium' : 'normal'
                                                    }}
                                                >
                                                    {material.title}
                                                </Typography>
                                            }
                                        />
                                        <Checkbox
                                            edge="end"
                                            onChange={() => handleToggle(material.id)}
                                            checked={isSelected}
                                            inputProps={{'aria-labelledby': labelId}}
                                            sx={{
                                                color: alpha('#64b5f6', 0.7),
                                                '&.Mui-checked': {
                                                    color: '#64b5f6',
                                                },
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </Paper>
                        );
                    })}
            </List>
        </FormCard>
    </SpacePanelLayout>
}

export default MaterialsFormBase;