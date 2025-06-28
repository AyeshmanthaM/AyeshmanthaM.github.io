import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Project } from '../types';
import { Badge, Card } from './ui/OnceUI';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const categoryVariants = {
    embedded: 'primary',
    mechatronics: 'success',
    interactive: 'warning',
    automation: 'danger',
    iot: 'default'
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      className="group h-full"
    >
      <Card className="once-ui-card h-full overflow-hidden group-hover:shadow-2xl group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all duration-500" padding="none" elevated>
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
          <motion.img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover object-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <div className="absolute top-4 left-4 z-20">
            <Badge
              variant={categoryVariants[project.category as keyof typeof categoryVariants] || 'default'}
              size="md"
            >
              {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 z-20">
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
              {project.date}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <motion.h3
            className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {project.title}
          </motion.h3>

          <motion.p
            className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed flex-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {project.description}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-2 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {project.technologies.slice(0, 3).map((tech, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {tech}
              </motion.span>
            ))}
            {project.technologies.length > 3 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                +{project.technologies.length - 3} more
              </motion.span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-between"
          >
            <Link
              to={`/projects/${project.id}`}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300 group/link"
            >
              View Details
              <motion.div
                className="ml-1"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight size={16} />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;