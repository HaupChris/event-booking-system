// frontend/src/form/artistArea/artistMaterials.tsx

import React from 'react';
import { Box, Checkbox, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { CircularProgressWithLabel } from "../components/circularProgressWithLabel";
import { ArtistFormProps } from './artistFormContainer';
import { ArtistMaterial } from '../artistArea/interface';

interface ArtistMaterialFormProps extends ArtistFormProps {
    updateArtistMaterialIds: (material_ids: Array<number>) => void;
}

function ArtistMaterialsForm(props: ArtistMaterialFormProps) {
    function handleToggle(material_id: number) {
        if (props.currentBooking.artist_material_ids.indexOf(material_id) === -1) {
            props.updateArtistMaterialIds([...props.currentBooking.artist_material_ids, material_id]);
        } else {
            props.updateArtistMaterialIds(props.currentBooking.artist_material_ids.filter((id) => id !== material_id));
        }
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Materialien für Künstler
                </Typography>
                <Typography variant="body2" paragraph>
                    Als Künstler hast du die Möglichkeit, bestimmte Materialien mitzubringen, die für unsere Veranstaltung hilfreich sind. Bitte wähle aus, welche Materialien du mitbringen kannst.
                </Typography>

                <List dense className={'material-list'}>
                    {props.formContent.artist_materials?.map((material: ArtistMaterial) => {
                        const labelId = `checkbox-list-secondary-label-${material.id}`;
                        const num_booked = material.num_booked + (props.currentBooking.artist_material_ids.includes(material.id) ? 1 : 0);

                        return (
                            <ListItem
                                key={material.id}
                                secondaryAction={
                                    <Checkbox
                                        edge="end"
                                        onChange={() => handleToggle(material.id)}
                                        checked={props.currentBooking.artist_material_ids.indexOf(material.id) !== -1}
                                        inputProps={{'aria-labelledby': labelId}}
                                    />
                                }
                                disablePadding
                            >
                                <ListItemButton onClick={() => handleToggle(material.id)}>
                                    <ListItemAvatar>
                                        <CircularProgressWithLabel valueCurrent={num_booked} valueMax={material.num_needed}/>
                                    </ListItemAvatar>
                                    <ListItemText
                                        id={labelId}
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

export default ArtistMaterialsForm;