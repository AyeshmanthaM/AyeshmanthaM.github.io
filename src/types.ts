export type ProjectCategory = 'embedded' | 'mechatronics' | 'interactive' | 'automation' | 'iot' | 'web' | 'software' | 'other';

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  challenges: string;
  results: string;
  image: string;
  category: ProjectCategory;
  technologies: string[];
  date: string;
}