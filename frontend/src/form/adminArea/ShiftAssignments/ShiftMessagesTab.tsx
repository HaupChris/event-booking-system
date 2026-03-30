import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { TokenContext } from '../../../contexts/AuthContext';
import MarkdownContent from '../../../components/core/display/MarkdownContent';
import type { FormContent } from '../../userArea/interface';
import type { CreateShiftMessageRequest, ShiftMessageGroup } from './types';
import { ShiftAssignmentAPI } from './api';
import ShiftMessagesHistory from './ShiftMessagesHistory';

interface ShiftMessagesTabProps {
  formContent: FormContent;
}

interface ShiftTimeslot {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
}

const formatTime = (value: string) => value?.slice(0, 5);

function ShiftMessagesTab({ formContent }: ShiftMessagesTabProps) {
  const { token } = useContext(TokenContext);
  const [groups, setGroups] = useState<ShiftMessageGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedWorkshiftId, setSelectedWorkshiftId] = useState<number>(-1);
  const [selectedTimeslotIds, setSelectedTimeslotIds] = useState<number[]>([]);
  const [form, setForm] = useState<Omit<CreateShiftMessageRequest, 'timeslot_ids'>>({
    title: '',
    category: '',
    content: '',
  });
  const markdownHelpPlaceholder = [
    '# Markdown-Hilfe',
    '## Überschrift',
    'Mit `#` oder `##` am Zeilenanfang.',
    '',
    '**Fett** mit `**Text**`, *kursiv* mit `*Text*`.',
    '',
    '- Liste mit `-` oder `*`',
    '- Zweiter Listenpunkt',
    '',
    'Link-Syntax: [Wiesenwahn](https://wiesenwahn.de)',
    'Inline-Code-Syntax: `Beispiel`',
  ].join('\n');

  const selectedWorkshift = useMemo(
    () => formContent.work_shifts.find((item) => item.id === selectedWorkshiftId) || null,
    [formContent.work_shifts, selectedWorkshiftId]
  );

  const availableTimeslots: ShiftTimeslot[] = useMemo(
    () =>
      selectedWorkshift
        ? selectedWorkshift.time_slots.map((slot) => ({
            id: slot.id,
            title: slot.title,
            start_time: slot.start_time,
            end_time: slot.end_time,
          }))
        : [],
    [selectedWorkshift]
  );

  const selectAllTimeslots = useCallback((timeslots: ShiftTimeslot[]) => {
    setSelectedTimeslotIds(timeslots.map((slot) => slot.id));
  }, []);

  useEffect(() => {
    if (availableTimeslots.length > 0) {
      selectAllTimeslots(availableTimeslots);
    } else {
      setSelectedTimeslotIds([]);
    }
  }, [availableTimeslots, selectAllTimeslots]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setGroups(await ShiftAssignmentAPI.getShiftMessages(token));
    } catch (err) {
      console.error('Failed to load shift messages', err);
      setError('Nachrichten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMessages().then();
  }, [loadMessages]);

  const handleTimeslotToggle = (timeslotId: number) => {
    setSelectedTimeslotIds((prev) =>
      prev.includes(timeslotId) ? prev.filter((id) => id !== timeslotId) : [...prev, timeslotId]
    );
  };

  const handleCreateMessage = async () => {
    if (
      selectedWorkshiftId < 0 ||
      selectedTimeslotIds.length === 0 ||
      !form.title.trim() ||
      !form.content.trim()
    ) {
      setError('Bitte Schicht, mindestens einen Timeslot, Titel und Inhalt ausfüllen.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await ShiftAssignmentAPI.createShiftMessage(token, {
        timeslot_ids: selectedTimeslotIds,
        title: form.title.trim(),
        category: form.category?.trim() || undefined,
        content: form.content,
      });

      const failInfo =
        result.failedTimeslotIds.length > 0
          ? ` (${result.failedTimeslotIds.length} Timeslot(s) fehlgeschlagen)`
          : '';
      setSuccess(`${result.createdCount} Nachricht(en) versendet${failInfo}.`);
      setForm({ title: '', category: '', content: '' });
      if (availableTimeslots.length > 0) {
        selectAllTimeslots(availableTimeslots);
      }
      await loadMessages();
    } catch (err) {
      console.error('Failed to create shift message', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Nachricht konnte nicht versendet werden.');
      } else {
        setError('Nachricht konnte nicht versendet werden.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await ShiftAssignmentAPI.deleteShiftMessage(token, messageId);
      setSuccess('Nachricht gelöscht.');
      await loadMessages();
    } catch (err) {
      console.error('Failed to delete shift message', err);
      setError('Nachricht konnte nicht gelöscht werden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Neue Nachricht erstellen
              </Typography>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Schicht"
                  value={selectedWorkshiftId}
                  onChange={(event) => setSelectedWorkshiftId(Number(event.target.value))}
                  fullWidth
                  required
                >
                  <MenuItem value={-1} disabled>
                    Bitte Schicht auswählen
                  </MenuItem>
                  {formContent.work_shifts.map((workshift) => (
                    <MenuItem key={workshift.id} value={workshift.id}>
                      {workshift.title}
                    </MenuItem>
                  ))}
                </TextField>

                <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Timeslots
                    </Typography>
                    {availableTimeslots.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Bitte zuerst eine Schicht auswählen.
                      </Typography>
                    ) : (
                      <FormGroup>
                        {availableTimeslots.map((timeslot) => (
                          <FormControlLabel
                            key={timeslot.id}
                            control={
                              <Checkbox
                                checked={selectedTimeslotIds.includes(timeslot.id)}
                                onChange={() => handleTimeslotToggle(timeslot.id)}
                              />
                            }
                            label={`${timeslot.title} (${formatTime(timeslot.start_time)} - ${formatTime(timeslot.end_time)})`}
                          />
                        ))}
                      </FormGroup>
                    )}
                  </CardContent>
                </Card>

                <TextField
                  label="Titel"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  fullWidth
                  required
                />

                <TextField
                  label="Kategorie (optional)"
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                  fullWidth
                />

                <TextField
                  label="Inhalt (Markdown)"
                  value={form.content}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, content: event.target.value }))
                  }
                  multiline
                  rows={8}
                  InputProps={{ inputComponent: 'textarea' }}
                  fullWidth
                  required
                />

                <Button variant="contained" onClick={handleCreateMessage} disabled={loading}>
                  Nachricht versenden
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Live-Preview
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {form.title || 'Titel der Nachricht'}
                </Typography>
                {form.category && (
                  <Chip label={form.category} size="small" variant="outlined" sx={{ mt: 1 }} />
                )}
                <Divider sx={{ my: 1.5 }} />
                <MarkdownContent content={form.content || markdownHelpPlaceholder} />
              </CardContent>
            </Card>
            <ShiftMessagesHistory
              groups={groups}
              loading={loading}
              onDeleteMessage={handleDeleteMessage}
            />
          </Stack>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
    </Box>
  );
}

export default ShiftMessagesTab;
