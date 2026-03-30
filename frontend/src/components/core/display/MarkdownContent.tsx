import React from 'react';
import { Box, Link, Typography } from '@mui/material';

interface MarkdownContentProps {
  content: string;
}

const INLINE_REGEX = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g;

const renderInline = (text: string): React.ReactNode[] => {
  const parts = text.split(INLINE_REGEX).filter(Boolean);
  let offset = 0;

  return parts.map((part) => {
    const key = `inline-${offset}-${part}`;
    offset += part.length;

    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)]\(([^)]+)\)$/);
      if (match) {
        return (
          <Link key={key} href={match[2]} target="_blank" rel="noopener noreferrer">
            {match[1]}
          </Link>
        );
      }
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Box
          key={key}
          component="code"
          sx={{
            bgcolor: 'action.hover',
            px: 0.5,
            py: 0.1,
            borderRadius: 0.5,
            fontFamily: 'monospace',
          }}
        >
          {part.slice(1, -1)}
        </Box>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    if (
      (part.startsWith('*') && part.endsWith('*')) ||
      (part.startsWith('_') && part.endsWith('_'))
    ) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
};

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    blocks.push(
      <Typography key={`p-${blocks.length}`} variant="body2" sx={{ mb: 1.2 }}>
        {renderInline(paragraphBuffer.join(' '))}
      </Typography>
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    blocks.push(
      <Box key={`ul-${blocks.length}`} component="ul" sx={{ mt: 0.5, mb: 1.5, pl: 3 }}>
        {listBuffer.map((item) => (
          <li key={`li-${item}`}>
            <Typography variant="body2">{renderInline(item)}</Typography>
          </li>
        ))}
      </Box>
    );
    listBuffer = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2).trim());
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push(
        <Typography
          key={`h3-${blocks.length}`}
          variant="subtitle1"
          fontWeight={700}
          sx={{ mt: 1, mb: 0.8 }}
        >
          {renderInline(trimmed.slice(4))}
        </Typography>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push(
        <Typography
          key={`h2-${blocks.length}`}
          variant="subtitle1"
          fontWeight={800}
          sx={{ mt: 1, mb: 0.8 }}
        >
          {renderInline(trimmed.slice(3))}
        </Typography>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push(
        <Typography key={`h1-${blocks.length}`} variant="h6" fontWeight={800} sx={{ mt: 1, mb: 1 }}>
          {renderInline(trimmed.slice(2))}
        </Typography>
      );
      return;
    }

    paragraphBuffer.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <Box>{blocks}</Box>;
};

export default MarkdownContent;
