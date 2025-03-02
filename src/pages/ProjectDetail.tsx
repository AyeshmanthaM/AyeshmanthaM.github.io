import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Calendar, Tag } from 'lucide-react';
import { projects } from '../data/projects';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState(projects.find(p => p.id === id));

  useEffect(() => {
    if (!project) {
      navigate('/projects', { replace: true });
    }
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [project, navigate]);

  if (!project) return null;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <Link 
          to="/projects" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            <div className="h-80 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover object-center"
              />
            </div>
            
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.category === 'embedded' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  project.category === 'mechatronics' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                  project.category === 'interactive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  project.category === 'automation' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                }`}>
                  {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                </span>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                  <Calendar size={14} className="mr-1" />
                  <span>{project.date}</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    <Tag size={12} className="mr-1" />
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="prose dark:prose-invert max-w-none mb-8">
                <p className="text-lg mb-6">{project.description}</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Project Overview</h2>
                <p>{project.fullDescription}</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Challenges & Solutions</h2>
                <p>{project.challenges}</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Results</h2>
                <p>{project.results}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-8">
                {project.githubUrl && (
                  <a 
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Github size={18} className="mr-2" />
                    View Source Code
                  </a>
                )}
                
                {project.liveUrl && (
                  <a 
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={18} className="mr-2" />
                    View Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail;