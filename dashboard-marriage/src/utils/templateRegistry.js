export const TEMPLATE_REGISTRY = [
  { globalId: 1, category: 'invitation', key: 'classic', name: 'Classic' },
  { globalId: 2, category: 'invitation', key: 'signature', name: 'Signature' },
  { globalId: 3, category: 'invitation', key: 'royal', name: 'Royal Entrance' },
  { globalId: 4, category: 'invitation', key: 'love-letter', name: 'Love Letter' },
  { globalId: 5, category: 'invitation', key: 'floral-butterfly', name: 'Floral Butterfly' },
  { globalId: 6, category: 'invitation', key: 'modern-minimal', name: 'Modern Minimalist' },
  { globalId: 7, category: 'eid', key: 'default', name: 'Default Eid' },
  { globalId: 8, category: 'birthday', key: 'default', name: 'Classic Romantic' },
  { globalId: 9, category: 'birthday', key: 'romantic', name: 'Love & Velvet' },
  { globalId: 10, category: 'birthday', key: 'neon', name: 'Neon Galaxy' },
  { globalId: 11, category: 'love-message', key: 'happy-message', name: 'Happy Message' },
  { globalId: 12, category: 'invitation', key: 'burgundy', name: 'Burgundy Romance' },
];

export const getTemplateGlobalId = (category, key) => (
  TEMPLATE_REGISTRY.find((template) => template.category === category && template.key === key)?.globalId
);
