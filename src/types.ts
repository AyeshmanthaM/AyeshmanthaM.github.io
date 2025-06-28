export type ProjectCategory = 'embedded' | 'mechatronics' | 'interactive' | 'automation' | 'iot' | 'Web' |'other';

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