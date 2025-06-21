import type { Note } from './types';

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Meeting Notes 2024-07-29',
    content: 'Discussed Q3 goals. Key takeaways: increase marketing budget by 15%, focus on user retention, and launch new feature by September. Action items assigned to John (marketing) and Jane (product).',
    createdAt: new Date('2024-07-29T10:00:00Z'),
    updatedAt: new Date('2024-07-29T10:30:00Z'),
    summary: 'The meeting covered Q3 objectives, including a 15% marketing budget increase, enhancing user retention, and a new feature launch by September. John will handle marketing tasks, and Jane will manage product-related action items.',
    audioUrl: 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder.mp3'
  },
  {
    id: '2',
    title: 'Brainstorming Session',
    content: 'Ideas for new app: a social network for pets, a recipe app that suggests meals based on ingredients you have, and a language learning game. The pet network idea seems most promising. We should explore monetization options.',
    createdAt: new Date('2024-07-28T14:00:00Z'),
    updatedAt: new Date('2024-07-28T15:00:00Z'),
  },
  {
    id: '3',
    title: 'My Novel Idea',
    content: 'A sci-fi epic set in a distant galaxy where sentient plants have replaced all other life forms. The protagonist is a young botanist who discovers a human seedling, the last of its kind. It is a story of hope and survival against all odds.',
    createdAt: new Date('2024-07-27T18:00:00Z'),
    updatedAt: new Date('2024-07-27T18:00:00Z'),
  },
  {
    id: '4',
    title: 'Grocery List',
    content: '- Milk\n- Bread\n- Eggs\n- Cheese\n- Coffee\n- Apples',
    createdAt: new Date('2024-07-26T09:00:00Z'),
    updatedAt: new Date('2024-07-26T09:05:00Z'),
  }
];
