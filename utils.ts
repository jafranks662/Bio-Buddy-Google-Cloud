
import { BIO_STANDARDS } from './constants';
import { Standard } from './types';

export const findStandardByKeyword = (query: string): Standard | undefined => {
  const lowerCaseQuery = query.toLowerCase().trim();
  if (!lowerCaseQuery) return undefined;
  
  return BIO_STANDARDS.find(standard =>
    standard.keywords.some(keyword => lowerCaseQuery.includes(keyword)) ||
    lowerCaseQuery.includes(standard.id.toLowerCase())
  );
};

export const formatText = (text: string): string => {
  // Basic markdown-like formatting for bold and lists
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/\n\s*-\s/g, '<br/>&bull; ');
  return formattedText.replace(/\n/g, '<br/>');
};
