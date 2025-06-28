import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import { Button, Input } from '../components/ui/OnceUI';
import { fetchProjectsFromNotion, checkNotionConnection } from '../services/notionService';
import { projects as fallbackProjects } from '../data/projects';
import { Project } from '../types';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';

const Projects: React.FC = () => {
  //----------- Switch to control data source: true for Notion, false for fallback data ------------------------
  const [useNotionService, setUseNotionService] = useState<boolean>(false);

  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotionConnected, setIsNotionConnected] = useState(false);

  // Direct function to check Notion connection
  const checkConnection = async () => {
    try {
      const connected = await checkNotionConnection();
      setIsNotionConnected(connected);
      return connected;
    } catch (err) {
      console.error('Connection check failed:', err);
      setIsNotionConnected(false);
      return false;
    }
  };

  // Direct function to fetch projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (useNotionService) {
        // Check connection first
        const connected = await checkConnection();

        if (connected) {
          const notionProjects = await fetchProjectsFromNotion();
          setProjects(notionProjects);
        } else {
          console.info('Notion connection failed, using fallback projects data');
          setProjects(fallbackProjects);
        }
      } else {
        console.info('Using fallback projects data (Notion service disabled)');
        setProjects(fallbackProjects);
        setIsNotionConnected(false);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Using fallback data.');
      setProjects(fallbackProjects);
    } finally {
      setLoading(false);
    }
  }, [useNotionService]);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Reload projects when useNotionService changes
  useEffect(() => {
    loadProjects();
  }, [useNotionService, loadProjects]);

  // Manual refresh function
  const refreshProjects = async () => {
    await loadProjects();
  };

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'embedded', name: 'Embedded Systems' },
    { id: 'mechatronics', name: 'Mechatronics' },
    { id: 'interactive', name: 'Interactive' },
    { id: 'automation', name: 'Automation' },
    { id: 'iot', name: 'IoT' },
    { id: 'other', name: 'Other' },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = filter === 'all' || project.category === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            My Projects
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Explore my portfolio of embedded systems, mechatronics, and interactive multimedia projects
            that showcase innovation in engineering and technology.
          </motion.p>

          {/* Notion Connection Status and Controls */}
          <motion.div
            className="mt-6 flex items-center justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isNotionConnected && useNotionService
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
              <Database size={14} />
              {useNotionService
                ? (isNotionConnected ? 'Connected to Notion' : 'Notion unavailable - using fallback')
                : 'Using local data'
              }
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseNotionService(!useNotionService)}
              className="text-xs"
            >
              {useNotionService ? 'Switch to Local Data' : 'Switch to Notion'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={refreshProjects}
              disabled={loading}
              className="p-1"
            >
              <RefreshCw
                size={14}
                className={loading ? 'animate-spin' : ''}
              />
            </Button>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  <Button
                    variant={filter === category.id ? 'primary' : 'ghost'}
                    size="md"
                    onClick={() => setFilter(category.id)}
                    className="font-medium"
                  >
                    {category.name}
                  </Button>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="w-full lg:w-80"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="once-ui-input"
              />
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="once-ui-card h-80 animate-pulse bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </motion.div>
          ) : filteredProjects.length > 0 ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: 'easeOut'
                  }}
                >
                  <ProjectCard project={project} index={index} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="text-center py-20"
            >
              <div className="once-ui-card max-w-md mx-auto p-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  No projects found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No projects match your current search criteria.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Projects;