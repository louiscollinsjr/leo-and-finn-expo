import { Book } from '@/types/reader';

export interface ContinueBook extends Book {
  status: 'In Progress' | 'Finished';
  progress?: number;
}

export const continueReading: ContinueBook[] = [
  {
    id: '1',
    title: 'The Secret Life of Walter Mitty',
    author: 'James Thurber',
    cover: '',
    status: 'Finished',
    progress: 1,
    accentColors: ['rgba(227, 170, 45, 0.85)', 'rgba(227, 170, 45, 0.55)'],
  },
  {
    id: '2',
    title: 'Moon Over Manifest',
    author: 'Clare Vanderpool',
    cover: '',
    status: 'In Progress',
    progress: 0.35,
    accentColors: ['rgba(72,74,89,0.65)', 'rgba(72,74,89,0.35)'],
  },
  {
    id: '6',
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    cover: '',
    status: 'In Progress',
    progress: 0.12,
    accentColors: ['rgba(59, 130, 246, 0.85)', 'rgba(59, 130, 246, 0.55)'],
  },
  {
    id: '7',
    title: 'Anne of Green Gables',
    author: 'L. M. Montgomery',
    cover: '',
    status: 'In Progress',
    progress: 0.28,
    accentColors: ['rgba(16, 185, 129, 0.85)', 'rgba(16, 185, 129, 0.55)'],
  },
  {
    id: '8',
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    cover: '',
    status: 'In Progress',
    progress: 0.41,
    accentColors: ['rgba(245, 158, 11, 0.85)', 'rgba(245, 158, 11, 0.55)'],
  },
  {
    id: '9',
    title: 'A Christmas Carol',
    author: 'Charles Dickens',
    cover: '',
    status: 'Finished',
    progress: 1,
    accentColors: ['rgba(139, 92, 246, 0.85)', 'rgba(139, 92, 246, 0.55)'],
  },
];

export const topPicks: Book[] = [
  {
    id: '3',
    title: 'The Clockmaker\'s Apprentice',
    author: 'Paulo Coelho',
    cover: '',
    accentColors: ['rgba(0, 123, 255, 0.85)', 'rgba(50, 205, 50, 0.85)'],
  },
  {
    id: '4',
    title: 'The Backwards Bell Tower',
    author: 'John Steinbeck',
    cover: '',
    accentColors: ['rgba(255, 204, 0, 0.9)', 'rgba(255, 140, 0, 0.7)'],
  },
  {
    id: '5',
    title: 'The Midnight Music Box',
    author: 'Thich Nhat Hanh',
    cover: '',
    accentColors: ['rgba(252, 71, 107, 0.9)', 'rgba(255, 69, 58, 0.7)'],
  },
];

export const featuredStories = [
  {
    id: 'featured1',
    title: "The Last Clockmaker.",
    description: "Read the story of a clockmaker who lost his clock.",
    cover: '',
    accentColors: ['#ef4444', '#d10000']
  },
  {
    id: 'featured2',
    title: "The Clock That Forgot Summer",
    description: "Read the story of a clock that forgot summer.",
    cover: '',
    accentColors: ['#3b82f6', '#1d4ed8']
  }
];

export const leoMysteries = [
  { id: 'leo1', title: "The Swiss Synchronicity", cover: '', accentColors: ['rgba(255, 159, 10, 0.85)', 'rgba(255, 159, 10, 0.55)'] },
  { id: 'leo2', title: 'The Baker\'s Missing Recipe', cover: '', accentColors: ['rgba(255, 99, 71, 0.85)', 'rgba(255, 99, 71, 0.55)'] },
  { id: 'leo3', title: 'The Singing Pipes Mystery', cover: '', accentColors: ['rgba(107, 114, 128, 0.85)', 'rgba(107, 114, 128, 0.55)'] },
  { id: 'leo4', title: 'The Library Cat\'s Secret', cover: '', accentColors: ['rgba(59, 130, 246, 0.85)', 'rgba(59, 130, 246, 0.55)'] }
];

export const americanClassics: Book[] = [
  { id: 'free1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: '', accentColors: ['rgba(45, 55, 255, 0.9)', 'rgba(148, 0, 211, 0.7)'] },
  { id: 'free2', title: 'Moby Dick', author: 'Herman Melville', cover: '', accentColors: ['rgba(138, 43, 226, 0.9)', 'rgba(255, 65, 108, 0.7)'] },
  { id: 'free3', title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain', cover: '', accentColors: ['rgba(64, 224, 208, 0.9)', 'rgba(0, 123, 255, 0.7)'] },
  { id: 'free4', title: 'Little Women', author: 'Louisa May Alcott', cover: '', accentColors: ['rgba(59, 130, 246, 0.85)', 'rgba(59, 130, 246, 0.55)'] },
  { id: 'free5', title: 'The Call of the Wild', author: 'Jack London', cover: '', accentColors: ['rgba(24, 220, 255, 0.9)', 'rgba(15, 185, 177, 0.7)'] }
];

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'cat1', name: 'Fiction', icon: 'book' },
  { id: 'cat2', name: 'Non-Fiction', icon: 'book-open' },
  { id: 'cat3', name: 'Children', icon: 'smile' },
  { id: 'cat4', name: 'Fantasy', icon: 'star' },
  { id: 'cat5', name: 'Mystery', icon: 'search' },
  { id: 'cat6', name: 'Science', icon: 'flask' }
];
