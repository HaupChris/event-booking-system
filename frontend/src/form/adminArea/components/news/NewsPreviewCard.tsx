import React from 'react';
import { Card, CardContent, Chip, Divider, Typography } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import type { CreateNewsRequest } from '../../../../services/adminNewsService';
import { getCategoryLabel, markdownHelpPlaceholder } from './newsManagement.utils';
import MarkdownContent from '../../../../components/core/display/MarkdownContent';
import { getNewsCategoryIconFromKey } from '../../../../utils/newsCategoryIcons';

interface NewsPreviewCardProps {
  formData: CreateNewsRequest;
}

function NewsPreviewCard({ formData }: NewsPreviewCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PreviewIcon fontSize="small" color="action" />
          Live-Vorschau
        </Typography>
        <Typography variant="subtitle1" fontWeight={700}>
          {formData.title?.trim() || 'Titel der News'}
        </Typography>
        <Chip
          icon={getNewsCategoryIconFromKey(formData.category || 'general', { fontSize: 'small' })}
          label={getCategoryLabel(formData.category || 'general')}
          size="small"
          variant="outlined"
          sx={{ mt: 1 }}
        />
        <Divider sx={{ my: 1.5 }} />
        <MarkdownContent
          content={formData.content?.trim() ? formData.content : markdownHelpPlaceholder}
        />
      </CardContent>
    </Card>
  );
}

export default NewsPreviewCard;
