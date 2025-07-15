import {Box, Grid} from "@mui/material";
import React from "react";
import FormCard from "../../../components/core/display/FormCard";


function ShiftAssignmentsPage() {
    return <Box>
        <Grid container spacing={3} sx={{mb: 3}}>
            <Grid item xs={12} sm={6} md={4}>
                <FormCard title={"test"}>
                </FormCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <FormCard title={"test"}>
                </FormCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <FormCard title={"test"}>
                </FormCard>
            </Grid>
        </Grid>
        <Grid container spacing={3} sx={{mb: 3}}>
            <Grid item xs={12} sm={6} md={5}>
                <FormCard title={"Participants"}>
                </FormCard>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <FormCard title={"Actions"}>
                </FormCard>
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
                <FormCard title={"Workshifts"}>
                </FormCard>
            </Grid>
        </Grid>

    </Box>

}

export default ShiftAssignmentsPage;