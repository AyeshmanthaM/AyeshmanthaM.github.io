import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Project } from '../types';
import { getCategoryColorClasses, getCardClasses } from '../theme/colors';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`${getCardClasses()} hover:shadow-xl transition-all`}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
        />
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColorClasses(project.category)}`}>
            {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{project.date}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.slice(0, 3).map((tech, i) => (
            <span 
              key={i}
              className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
              +{project.technologies.length - 3} more
            </span>
          )}
        </div>
        
        <Link 
          to={`/projects/${project.id}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          View Details <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectCard;