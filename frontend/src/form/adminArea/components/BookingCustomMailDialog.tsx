import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  previewAdminBookingMail,
  sendAdminBookingMail,
  type AdminBookingMailPreviewResponse,
  type AdminBookingMailRecipient,
  type AdminBookingMailSendResponse,
} from '../../../services/adminBookingMailService';

const TEMPLATE_TOKENS = [
  '{{first_name}}',
  '{{last_name}}',
  '{{full_name}}',
  '{{email}}',
  '{{profile_url}}',
  '{{booking_type}}',
  '{{ticket_title}}',
  '{{payment_link}}',
];

interface BookingCustomMailDialogProps {
  open: boolean;
  token: string;
  selectedRecipients: AdminBookingMailRecipient[];
  onClose: () => void;
  onSent: (result: AdminBookingMailSendResponse) => void;
}

interface ErrorResponseData {
  error?: string;
  msg?: string;
}

const BookingCustomMailDialog: React.FC<BookingCustomMailDialogProps> = ({
  open,
  token,
  selectedRecipients,
  onClose,
  onSent,
}) => {
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [preview, setPreview] = useState<AdminBookingMailPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewDirty, setIsPreviewDirty] = useState(true);

  const selectionHash = useMemo(
    () =>
      selectedRecipients
        .map((recipient) => `${recipient.booking_type}:${recipient.booking_id}`)
        .join(','),
    [selectedRecipients]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setPreview(null);
    setErrorMessage('');
    setIsPreviewDirty(true);
  }, [open, selectionHash]);

  const handleTemplateChange = (
    updater: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    updater(value);
    setPreview(null);
    setErrorMessage('');
    setIsPreviewDirty(true);
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (!axios.isAxiosError(error)) {
      return fallback;
    }

    const responseData = error.response?.data as ErrorResponseData | undefined;
    return responseData?.error || responseData?.msg || fallback;
  };

  const requestPayload = {
    subject_template: subjectTemplate,
    body_template: bodyTemplate,
    selected_bookings: selectedRecipients,
  };

  const handlePreview = async () => {
    try {
      setLoadingPreview(true);
      setErrorMessage('');
      const response = await previewAdminBookingMail(token, requestPayload);
      setPreview(response);
      setIsPreviewDirty(false);
    } catch (error) {
      setPreview(null);
      setErrorMessage(getErrorMessage(error, 'Preview could not be generated.'));
      setIsPreviewDirty(true);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSend = async () => {
    try {
      setSending(true);
      setErrorMessage('');
      const result = await sendAdminBookingMail(token, requestPayload);
      setSubjectTemplate('');
      setBodyTemplate('');
      setPreview(null);
      setIsPreviewDirty(true);
      onSent(result);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Emails could not be sent.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={sending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Send Custom Mail</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Preview is required before sending. If you change the template or the selection, refresh
            the preview again.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Selected recipients: {selectedRecipients.length}
          </Typography>

          <TextField
            label="Subject"
            fullWidth
            value={subjectTemplate}
            onChange={(event) => handleTemplateChange(setSubjectTemplate, event.target.value)}
          />

          <TextField
            label="Message"
            fullWidth
            multiline
            minRows={10}
            value={bodyTemplate}
            onChange={(event) => handleTemplateChange(setBodyTemplate, event.target.value)}
            helperText="Use the tokens below to personalize each email."
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Available Tokens
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {TEMPLATE_TOKENS.map((tokenValue) => (
                <Chip key={tokenValue} size="small" label={tokenValue} variant="outlined" />
              ))}
            </Box>
          </Box>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1">Preview</Typography>
            {preview && (
              <Typography variant="body2" color="text.secondary">
                Showing {preview.preview_count} of {preview.total_recipient_count} recipient(s)
              </Typography>
            )}
          </Box>

          {preview?.truncated && (
            <Alert severity="info">
              Preview is limited to the first {preview.preview_count} selected recipients.
            </Alert>
          )}

          {preview ? (
            <Stack spacing={2}>
              {preview.previews.map((previewItem) => (
                <Box
                  key={`${previewItem.booking_type}-${previewItem.booking_id}`}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
                >
                  <Typography variant="subtitle2">
                    {previewItem.recipient_name || 'Unnamed recipient'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {previewItem.recipient_email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {previewItem.subject}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Message
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      mt: 0.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'inherit',
                    }}
                  >
                    {previewItem.body}
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No preview generated yet.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button onClick={handlePreview} disabled={loadingPreview || sending} variant="outlined">
          {loadingPreview
            ? 'Generating Preview...'
            : preview
              ? 'Refresh Preview'
              : 'Generate Preview'}
        </Button>
        <Button
          onClick={handleSend}
          disabled={loadingPreview || sending || isPreviewDirty || preview === null}
          variant="contained"
        >
          {sending ? 'Sending...' : 'Send Emails'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingCustomMailDialog;
