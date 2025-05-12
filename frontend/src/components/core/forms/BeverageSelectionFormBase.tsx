import React from "react";
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Typography,
    alpha
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SpacePanelLayout from "../layouts/SpacePanelLayout";
import FormCard from "../display/FormCard";
import SelectionOptionWithImage from "../display/SelectionOptionWithImage";

interface BeverageOption {
    id: number;
    title: string;
    price: number;
    description: string;
}

interface BeverageSelectionTextProps {
    missionBriefing: string;
    footerId: string;
    title: string;
    noBeverage: string;
}

interface BeverageSelectionFormBaseProps {
    currentBooking: {
        beverage_id: number;
    };
    updateBooking: (key: any, value: any) => void;
    formContent: {
        beverage_options: BeverageOption[];
    };
    texts: BeverageSelectionTextProps;
    getImageSource: (beverage_id: number) => string;
}

function BeverageSelectionFormBase(props: BeverageSelectionFormBaseProps) {
    const { texts, getImageSource } = props;

    // Function to handle beverage selection
    const handleBeverageSelect = (id: number) => () => {
        props.updateBooking('beverage_id', id);
    };

    return <SpacePanelLayout
        missionBriefing={texts.missionBriefing}
        footerId={texts.footerId}
    >
        <List sx={{p: {xs: 1, sm: 2}}}>
            <FormCard selected={props.currentBooking.beverage_id === -1}>
                <ListItemButton
                    onClick={handleBeverageSelect(-1)}
                    sx={{
                        py: 1.5,
                        px: {xs: 2, sm: 3},
                        '&:hover': {
                            backgroundColor: alpha('#1e88e5', 0.1),
                        }
                    }}
                >
                    <ListItemAvatar sx={{minWidth: {xs: 36, sm: 40}}}>
                        <LocalBarIcon
                            sx={{
                                color: alpha('#fff', 0.7),
                                fontSize: '1.5rem',
                            }}
                        />
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Typography
                                variant="body1"
                                sx={{
                                    color: alpha('#fff', 0.9),
                                    fontWeight: 'medium'
                                }}
                            >
                                 {texts.noBeverage}
                            </Typography>
                        }
                    />
                </ListItemButton>
            </FormCard>

            {props.formContent.beverage_options.map((option) => {
                const isSelected = props.currentBooking.beverage_id === option.id;

                return (
                    <SelectionOptionWithImage
                        key={option.id}
                        selected={isSelected}
                        onClick={handleBeverageSelect(option.id)}
                        title={option.title}
                        description={option.description}
                        imageSource={getImageSource(option.id)}
                        price={option.price}
                    />
                );
            })}
        </List>
    </SpacePanelLayout>
}

export default BeverageSelectionFormBase;