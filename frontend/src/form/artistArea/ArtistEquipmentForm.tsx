import React from 'react';
import {Box, Typography} from '@mui/material';
import {ArtistFormProps} from './ArtistRegistrationFormContainer';
import SpacePanelLayout from '../../components/core/layouts/SpacePanelLayout';
import {artistAreaTexts} from '../constants/texts';
import SettingsIcon from '@mui/icons-material/Settings';
import MissionHeading from '../../components/core/display/MissionHeading';
import FormField from '../../components/core/inputs/FormField';
import FormCard from '../../components/core/display/FormCard';

function ArtistEquipmentForm(props: ArtistFormProps) {
    return (
        <SpacePanelLayout
            missionBriefing={artistAreaTexts.technicalRequirementsForm.missionBriefing}
            footerId={artistAreaTexts.technicalRequirementsForm.footerId}
        >
            <MissionHeading
                title={artistAreaTexts.technicalRequirementsForm.title}
                icon={<SettingsIcon/>}
            />

            <FormCard>
                <Box sx={{px: 2, pb: 2}}>
                    <FormField
                        multiline
                        rows={5}
                        label={artistAreaTexts.technicalRequirementsForm.equipmentLabel}
                        placeholder={artistAreaTexts.technicalRequirementsForm.equipmentPlaceholder}
                        value={props.currentBooking.equipment}
                        onChange={(e) => props.updateBooking('equipment', e.target.value)}
                        error={!!props.formValidation.equipment}
                        helperText={props.formValidation.equipment || ""}
                    />

                    <FormField
                        multiline
                        rows={4}
                        label={artistAreaTexts.specialRequestsForm.specialRequestsLabel}
                        placeholder={artistAreaTexts.specialRequestsForm.specialRequestsPlaceholder}
                        value={props.currentBooking.special_requests}
                        onChange={(e) => props.updateBooking('special_requests', e.target.value)}
                    />
                </Box>
            </FormCard>

            <FormCard
                title="Verfügbare Ausrüstung am Veranstaltungsort"
                sx={{mt: 3}}
            >
                <Box sx={{px: 2, pb: 2}}>
                    <Typography variant="body2" paragraph>
                        Folgendes Equipment steht grundsätzlich zur Verfügung (Details können variieren):
                    </Typography>

                    <Typography variant="subtitle2" sx={{mt: 2}}>Hauptbühne:</Typography>
                    <ul>
                        <li>XDJ-XZ</li>
                        <li>1x XDJ 1000</li>
                        <li>1x Reloop rp7000</li>
                    </ul>

                    <Typography variant="subtitle2" sx={{mt: 2}}>Bandbühne:</Typography>
                    <ul>
                        <li><a href="https://www.thomann.de/de/yamaha_stagepas_1k_stereo_bundle.htm" target="_blank"
                               style={{color: "#00ffff"}}>
                            Yamaha Stagepas 1K Stereo Bundle
                        </a></li>
                        <li>
                            <a href="https://www.behringer.com/product.html?modelCode=0605-AAD" target="_blank"
                               style={{color: "#00ffff"}}>
                                Behringer XR18 Wireless Mixer
                            </a>
                        </li>
                    </ul>

                    <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                        Bitte beachte: Spezielle Ausrüstung muss selbst mitgebracht werden oder im Vorfeld abgestimmt
                        werden.
                    </Typography>
                </Box>
            </FormCard>
        </SpacePanelLayout>
    );
}

export default ArtistEquipmentForm;