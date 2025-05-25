import React from 'react';
import {Typography, Box, alpha, Divider} from '@mui/material';
import {ArtistBooking, ArtistFormContent, ArtistMaterial} from "./interface";
import SpacePanelLayout from "../../components/core/layouts/SpacePanelLayout";
import {artistAreaTexts} from "../constants/texts";
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BackpackIcon from '@mui/icons-material/Backpack';
import SettingsIcon from '@mui/icons-material/Settings';
import EuroIcon from '@mui/icons-material/Euro';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import InfoPair from "../../components/core/display/InfoPair";
import {spacePalette} from "../../components/styles/theme";
import FormCard from "../../components/core/display/FormCard";
import WorkIcon from "@mui/icons-material/Work";

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
    return array.find(item => item.id === id);
}

interface ArtistSummaryProps {
    currentBooking: ArtistBooking;
    formContent: ArtistFormContent;
}

function ArtistSummaryForm({currentBooking, formContent}: ArtistSummaryProps) {
    const {
        first_name,
        last_name,
        email,
        phone,
        ticket_id,
        beverage_id,
        food_id,
        equipment,
        special_requests,
        performance_details,
        artist_material_ids,
        total_price
    } = currentBooking;

    const ticket = findItemById(formContent.ticket_options, ticket_id);
    const beverage = findItemById(formContent.beverage_options, beverage_id);
    const food = findItemById(formContent.food_options, food_id);

    let parsedPerformanceDetails: any = {};
    try {
        if (performance_details) {
            parsedPerformanceDetails = JSON.parse(performance_details);
        }
    } catch (e) {
        // console.error("Failed to parse performance details:", e);
    }

    const artistMaterials = artist_material_ids?.map(id =>
        findItemById(formContent.artist_materials || [], id)
    ).filter(Boolean) as ArtistMaterial[];

    return <SpacePanelLayout
        missionBriefing={artistAreaTexts.summaryForm.missionBriefing}
        footerId={artistAreaTexts.summaryForm.footerId}
    >
        <FormCard
            title={artistAreaTexts.summaryForm.artistContribution}
            icon={<EuroIcon/>}
            selected={true}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{color: spacePalette.primary.main}}
                >
                    {total_price}€
                </Typography>
            </Box>
        </FormCard>

        <FormCard
            title={artistAreaTexts.summaryForm.personalData}
            icon={<PersonIcon/>}
        >
            <Box sx={{px: 2}}>
                <InfoPair label="Vorname" value={first_name}/>
                <InfoPair label="Nachname" value={last_name}/>
                <InfoPair label="Email" value={email}/>
                <InfoPair label="Telefon" value={phone}/>
            </Box>
        </FormCard>
        {currentBooking.profession_ids?.length > 0 ? (
            <FormCard
                title={artistAreaTexts.summaryForm.professionsTitle}
                icon={<WorkIcon/>}
            >
                <Box sx={{px: 2}}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        p: 1.5,
                        bgcolor: alpha('#000', 0.2),
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: alpha(spacePalette.primary.main, 0.2)
                    }}>
                        {currentBooking.profession_ids.map(id => {
                            const profession = formContent.professions?.find(p => p.id === id);
                            return profession ? (
                                <Box key={id} sx={{
                                    bgcolor: alpha(spacePalette.primary.main, 0.1),
                                    border: '1px solid',
                                    borderColor: alpha(spacePalette.primary.main, 0.3),
                                    borderRadius: '4px',
                                    px: 1.5,
                                    py: 0.5
                                }}>
                                    <Typography variant="body2" sx={{color: alpha('#fff', 0.9)}}>
                                        {profession.title}
                                    </Typography>
                                </Box>
                            ) : null;
                        })}
                    </Box>
                </Box>
            </FormCard>
        ) : null}

        <FormCard
            title={artistAreaTexts.summaryForm.performanceDetails}
            icon={<MusicNoteIcon/>}
        >
            <Box sx={{px: 2}}>
                {parsedPerformanceDetails.preferredDay && (
                    <InfoPair label="Bevorzugter Tag" value={parsedPerformanceDetails.preferredDay}/>
                )}
                {parsedPerformanceDetails.preferredTime && (
                    <InfoPair label="Bevorzugte Zeit" value={parsedPerformanceDetails.preferredTime}/>
                )}
                {parsedPerformanceDetails.duration && (
                    <InfoPair label="Set-Dauer" value={`${parsedPerformanceDetails.duration} Minuten`}/>
                )}
                {parsedPerformanceDetails.genre && (
                    <InfoPair label="Genre/Musikstil" value={parsedPerformanceDetails.genre}/>
                )}
                {parsedPerformanceDetails.description && (
                    <InfoPair label="Beschreibung" value={parsedPerformanceDetails.description}/>
                )}
                {parsedPerformanceDetails.bandMembers && (
                    <InfoPair label="Bandmitglieder" value={parsedPerformanceDetails.bandMembers}/>
                )}
            </Box>
        </FormCard>

        <FormCard
            title={artistAreaTexts.summaryForm.participationOption}
            icon={<ConfirmationNumberIcon/>}
        >
            <Box sx={{px: 2}}>
                <InfoPair
                    label="Ticket"
                    value={ticket ?
                        `${ticket.title} (${ticket.price > 0 ? ticket.price + '€' : 'Kostenlos für Künstler'})` :
                        'Nicht ausgewählt'
                    }
                />
            </Box>
        </FormCard>

        {/* Beverage and Food */}
        <FormCard
            title={artistAreaTexts.summaryForm.catering}
            icon={<RestaurantIcon/>}
        >
            <Box sx={{px: 2}}>
                <InfoPair
                    label={artistAreaTexts.summaryForm.beverageTitle}
                    value={beverage ?
                        `${beverage.title} (${beverage.price > 0 ? beverage.price + '€' : 'Kostenlos für Künstler'})` :
                        'Keine Getränkeoption'
                    }
                    icon={<LocalDrinkIcon/>}
                />

                <Divider sx={{my: 1.5, borderColor: alpha(spacePalette.primary.main, 0.2)}}/>

                <InfoPair
                    label={artistAreaTexts.summaryForm.foodTitle}
                    value={food ?
                        `${food.title} (${food.price > 0 ? food.price + '€' : 'Kostenlos für Künstler'})` :
                        'Keine Essensoption'
                    }
                    icon={<RestaurantIcon/>}
                />
            </Box>
        </FormCard>

        {/* Technical Requirements */}
        <FormCard
            title={artistAreaTexts.summaryForm.technicalRequirements}
            icon={<SettingsIcon/>}
        >
            <Box sx={{px: 2}}>
                <InfoPair
                    label="Benötigte Ausrüstung"
                    value={equipment || "Keine angegeben"}
                />

                {special_requests && (
                    <>
                        <Divider sx={{my: 1.5, borderColor: alpha(spacePalette.primary.main, 0.2)}}/>
                        <InfoPair
                            label={artistAreaTexts.summaryForm.specialRequests}
                            value={special_requests}
                        />
                    </>
                )}
            </Box>
        </FormCard>

        {/* Materials */}
        {artistMaterials && artistMaterials.length > 0 && (
            <FormCard
                title={artistAreaTexts.summaryForm.equipment}
                icon={<BackpackIcon/>}
            >
                <Box sx={{px: 2}}>
                    <Typography variant="subtitle1" sx={{mb: 1, color: alpha('#fff', 0.8)}}>
                        {artistAreaTexts.summaryForm.bringingItems}
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        p: 1.5,
                        bgcolor: alpha('#000', 0.2),
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: alpha(spacePalette.primary.main, 0.2)
                    }}>
                        {artistMaterials.map((material, index) => (
                            <Box key={index} sx={{
                                bgcolor: alpha(spacePalette.primary.main, 0.1),
                                border: '1px solid',
                                borderColor: alpha(spacePalette.primary.main, 0.3),
                                borderRadius: '4px',
                                px: 1.5,
                                py: 0.5
                            }}>
                                <Typography variant="body2" sx={{color: alpha('#fff', 0.9)}}>
                                    {material.title}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </FormCard>
        )}
    </SpacePanelLayout>
}

export default ArtistSummaryForm;