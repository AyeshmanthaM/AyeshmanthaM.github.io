export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  challenges: string;
  results: string;
  image: string;
  category: 'embedded' | 'mechatronics' | 'interactive' | 'automation' | 'iot';
  technologies: string[];
  date: string;
  githubUrl: string | null;
  liveUrl: string | null;
}