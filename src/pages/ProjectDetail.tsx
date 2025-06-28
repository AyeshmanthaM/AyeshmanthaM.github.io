import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Database, AlertCircle } from 'lucide-react';
import { getCategoryColorClasses, getCardClasses } from '../theme/colors';
import { fetchProjectById, fetchNotionPageContent, convertNotionBlocksToText } from '../services/notionService';
import { projects as fallbackProjects } from '../data/projects';
import { Project } from '../types';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [notionContent, setNotionContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotionConnected, setIsNotionConnected] = useState(false);

  // Direct function to load project details
  const loadProjectDetail = async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from Notion first
      const notionProject = await fetchProjectById(projectId);

      if (notionProject) {
        setProject(notionProject);
        setIsNotionConnected(true);

        // Try to fetch Notion page content
        try {
          const blocks = await fetchNotionPageContent(projectId);
          const content = convertNotionBlocksToText(blocks);
          setNotionContent(content);
        } catch (contentError) {
          console.warn('Failed to fetch Notion content:', contentError);
          setNotionContent('');
        }
      } else {
        // Fallback to static data
        const fallbackProject = fallbackProjects.find(p => p.id === projectId);
        setProject(fallbackProject || null);
        setIsNotionConnected(false);
        setNotionContent('');
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project details');

      // Try fallback data
      const fallbackProject = fallbackProjects.find(p => p.id === projectId);
      setProject(fallbackProject || null);
      setIsNotionConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProjectDetail(id);
    }
  }, [id]);

  useEffect(() => {
    if (!loading && !project) {
      navigate('/projects', { replace: true });
    }

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [project, navigate, loading]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-8"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className={`${getCardClasses()} shadow-xl overflow-hidden`}>
            <div className="h-80 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="p-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColorClasses(project.category)}`}>
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

              {/* Notion Content Status */}
              <div className="mb-6 flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isNotionConnected
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                  <Database size={14} />
                  {isNotionConnected ? 'Content from Notion' : 'Using fallback content'}
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <AlertCircle size={14} />
                    Error loading content
                  </div>
                )}
              </div>

              <div className="prose dark:prose-invert max-w-none mb-8">
                <p className="text-lg mb-6">{project.description}</p>

                {/* Display Notion content if available, otherwise fallback content */}
                {notionContent ? (
                  <div className="notion-content">
                    <h2 className="text-2xl font-bold mt-8 mb-4">Project Details</h2>
                    <div className="whitespace-pre-line">{notionContent}</div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mt-8 mb-4">Project Overview</h2>
                    <p>{project.fullDescription}</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Challenges & Solutions</h2>
                    <p>{project.challenges}</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Results</h2>
                    <p>{project.results}</p>
                  </>
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