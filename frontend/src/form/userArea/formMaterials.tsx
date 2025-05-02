import React from "react";
import { Box, Checkbox, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { CircularProgressWithLabel } from "../components/circularProgressWithLabel";
import "../../css/formMaterials.css";
import { Material } from "./interface";

export interface MaterialFormProps {
    updateMaterialIds: (material_ids: Array<number>) => void;
    currentBooking: {
        material_ids: Array<number>;
    };
    formValidation: { [key: string]: string | undefined };
    formContent: {
        materials: Array<Material>;
    };
}

function MaterialsForm(props: MaterialFormProps) {
    function handleToggle(material_id: number) {
        if (props.currentBooking.material_ids.indexOf(material_id) === -1) {
            props.updateMaterialIds([...props.currentBooking.material_ids, material_id]);
        } else {
            props.updateMaterialIds(props.currentBooking.material_ids.filter((id) => id !== material_id));
        }
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={0} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Welche Materialien kannst du zum Festival mitbringen?
                </Typography>
                <Typography variant="body2" paragraph>
                    Deine Unterstützung hilft uns, das Festival zu einem unvergesslichen Erlebnis zu machen. Bitte wähle die Materialien aus, die du mitbringen kannst.
                </Typography>

                <List dense className={'material-list'}>
                    {props.formContent.materials
                        .filter((material) => material.num_needed > material.num_booked || props.currentBooking.material_ids.includes(material.id))
                        .sort((a, b) => (b.num_needed - b.num_booked) - (a.num_needed - a.num_booked))
                        .map((material: Material) => {
                            const labelId = `checkbox-list-secondary-label-${material.id}`;
                            const num_booked = material.num_booked + (props.currentBooking.material_ids.includes(material.id) ? 1 : 0);

                            return (
                                <ListItem
                                    key={material.id}
                                    secondaryAction={
                                        <Checkbox
                                            edge="end"
                                            onChange={() => handleToggle(material.id)}
                                            checked={props.currentBooking.material_ids.indexOf(material.id) !== -1}
                                            inputProps={{'aria-labelledby': labelId}}
                                        />
                                    }
                                    disablePadding
                                    sx={{
                                        mb: 1,
                                        border: props.currentBooking.material_ids.includes(material.id) ? '1px solid' : 'none',
                                        borderColor: 'secondary.main',
                                        borderRadius: 1,
                                        bgcolor: props.currentBooking.material_ids.includes(material.id) ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                    }}
                                >
                                    <ListItemButton onClick={() => handleToggle(material.id)}>
                                        <ListItemAvatar>
                                            <CircularProgressWithLabel valueCurrent={num_booked} valueMax={material.num_needed}/>
                                        </ListItemAvatar>
                                        <ListItemText id={labelId}
                                                    primary={
                                                        <Typography variant={"subtitle1"}>
                                                            {material.title}
                                                        </Typography>
                                                    }/>
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                </List>
            </Paper>
        </Box>
    );
}

export default MaterialsForm;