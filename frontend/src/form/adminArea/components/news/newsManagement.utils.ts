import type { NewsItem } from '../../../../services/adminNewsService';

export const NEWS_CATEGORIES = [
  { value: 'announcement', label: 'Ankuendigung' },
  { value: 'timetable', label: 'Zeitplan' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'anreise', label: 'Anreise' },
  { value: 'general', label: 'Allgemein' },
] as const;

export const markdownHelpPlaceholder = [
  '# Beispiel',
  '## Optionales Markdown',
  '- Du kannst einfache Listen verwenden',
  '- Oder Hinweise mit klaren Absätzen',
  '',
  'Der Inhalt wird 1:1 im News-Feed ausgespielt.',
].join('\n');

export const getCategoryLabel = (category: string | null) => {
  if (!category) {
    return 'Allgemein';
  }
  return NEWS_CATEGORIES.find((item) => item.value === category)?.label || category;
};

export const formatDate = (value: string) =>
  new Date(value).toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const getSnippet = (content: string) => {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 180) {
    return normalized;
  }
  return `${normalized.slice(0, 180)}...`;
};

export const getActiveCount = (newsItems: NewsItem[]) =>
  newsItems.filter((item) => item.is_active).length;
