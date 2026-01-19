export const BUSINESS_CATEGORIES = [
  { value: 'salao-beleza', label: 'Salão de Beleza' },
  { value: 'barbearia', label: 'Barbearia' },
  { value: 'clinica-medica', label: 'Clínica Médica' },
  { value: 'clinica-odontologica', label: 'Clínica Odontológica' },
  { value: 'estetica', label: 'Estética' },
  { value: 'personal-trainer', label: 'Personal Trainer' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
  { value: 'psicologia', label: 'Psicologia' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'massoterapia', label: 'Massoterapia' },
  { value: 'tatuagem-piercing', label: 'Tatuagem/Piercing' },
  { value: 'pet-shop', label: 'Pet Shop' },
  { value: 'academia', label: 'Academia' },
  { value: 'spa', label: 'Spa' },
  { value: 'pilates-yoga', label: 'Pilates/Yoga' },
  { value: 'outros', label: 'Outros' },
] as const;

export type CategoryValue = typeof BUSINESS_CATEGORIES[number]['value'];

export function getCategoryLabel(value: string | null | undefined): string {
  if (!value) return '';
  const category = BUSINESS_CATEGORIES.find(c => c.value === value);
  return category?.label || value;
}
