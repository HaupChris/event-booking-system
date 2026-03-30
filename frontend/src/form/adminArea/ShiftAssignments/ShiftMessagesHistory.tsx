import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { ShiftMessageGroup } from './types';
import MarkdownContent from '../../../components/core/display/MarkdownContent';

interface ShiftMessagesHistoryProps {
  groups: ShiftMessageGroup[];
  loading: boolean;
  onDeleteMessage: (messageId: number) => Promise<void>;
}

interface WorkshiftBucket {
  workshiftTitle: string;
  timeslots: ShiftMessageGroup[];
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatTime = (value: string) => value?.slice(0, 5);

function ShiftMessagesHistory({ groups, loading, onDeleteMessage }: ShiftMessagesHistoryProps) {
  const [workshiftFilter, setWorkshiftFilter] = useState<string>('all');
  const [timeslotFilter, setTimeslotFilter] = useState<string>('all');

  const workshiftOptions = useMemo(
    () => Array.from(new Set(groups.map((group) => group.workshift_title))),
    [groups]
  );

  const timeslotOptions = useMemo(() => {
    const filteredByWorkshift =
      workshiftFilter === 'all'
        ? groups
        : groups.filter((group) => group.workshift_title === workshiftFilter);
    return filteredByWorkshift.map((group) => ({
      key: String(group.timeslot_id),
      label: `${group.timeslot_title} (${formatTime(group.timeslot_start)} - ${formatTime(group.timeslot_end)})`,
    }));
  }, [groups, workshiftFilter]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesWorkshift =
        workshiftFilter === 'all' || group.workshift_title === workshiftFilter;
      const matchesTimeslot =
        timeslotFilter === 'all' || String(group.timeslot_id) === timeslotFilter;
      return matchesWorkshift && matchesTimeslot;
    });
  }, [groups, timeslotFilter, workshiftFilter]);

  const groupedByWorkshift = useMemo<WorkshiftBucket[]>(() => {
    const buckets: Record<string, ShiftMessageGroup[]> = {};
    filteredGroups.forEach((group) => {
      if (!buckets[group.workshift_title]) {
        buckets[group.workshift_title] = [];
      }
      buckets[group.workshift_title].push(group);
    });

    return Object.entries(buckets).map(([workshiftTitle, timeslots]) => ({
      workshiftTitle,
      timeslots,
    }));
  }, [filteredGroups]);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Versandte Nachrichten
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            label="Workshift"
            value={workshiftFilter}
            onChange={(event) => {
              setWorkshiftFilter(event.target.value);
              setTimeslotFilter('all');
            }}
            fullWidth
          >
            <MenuItem value="all">Alle Workshifts</MenuItem>
            {workshiftOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Timeslot"
            value={timeslotFilter}
            onChange={(event) => setTimeslotFilter(event.target.value)}
            fullWidth
          >
            <MenuItem value="all">Alle Timeslots</MenuItem>
            {timeslotOptions.map((option) => (
              <MenuItem key={option.key} value={option.key}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading && groups.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {groupedByWorkshift.length === 0 && (
              <Alert severity="info">
                Für den gewählten Filter wurden keine Nachrichten gefunden.
              </Alert>
            )}

            {groupedByWorkshift.map((bucket) => (
              <Card key={bucket.workshiftTitle} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent
                  sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}
                >
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    {bucket.workshiftTitle}
                  </Typography>

                  <Stack spacing={1.5}>
                    {bucket.timeslots.map((timeslotGroup) => (
                      <Card
                        key={timeslotGroup.timeslot_id}
                        variant="outlined"
                        sx={{ borderRadius: 1.5 }}
                      >
                        <CardContent
                          sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {timeslotGroup.timeslot_title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(timeslotGroup.timeslot_start)} -{' '}
                            {formatTime(timeslotGroup.timeslot_end)}
                          </Typography>
                          <Divider sx={{ my: 1.5 }} />

                          <Stack spacing={1}>
                            {timeslotGroup.messages.map((message) => (
                              <Accordion key={message.id} disableGutters>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Box sx={{ width: '100%', pr: 1 }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                      }}
                                    >
                                      <Typography variant="body2" fontWeight={600}>
                                        {message.title}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          onDeleteMessage(message.id).then();
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                      }}
                                    >
                                      {message.category && (
                                        <Chip
                                          label={message.category}
                                          size="small"
                                          variant="outlined"
                                        />
                                      )}
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDateTime(message.created_date)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pb: 2 }}>
                                  <MarkdownContent content={message.content} />
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default ShiftMessagesHistory;
