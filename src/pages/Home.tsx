import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Cpu, BrainCircuit as Circuit, Layers, Zap, Code, Wrench } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { PublicDataService } from '../services/publicDataService';
import { Project } from '../types';
import { getPrimaryButtonClasses } from '../theme/colors';
import { TypeAnimation } from 'react-type-animation';

const Home: React.FC = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Initialize the data service
  const dataService = new PublicDataService();

  // Load featured projects from public data
  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        setLoadingProjects(true);
        const projectsData = await dataService.getProjects();

        // Transform and get first 3 projects as featured
        const transformedProjects: Project[] = projectsData.slice(0, 3).map((project: any) => ({
          id: project.id.replace('project-', ''),
          title: project.title,
          description: project.description,
          fullDescription: project.fullDescription || project.description,
          challenges: project.challenges || 'Details available in full description',
          results: project.results || 'Project completed successfully',
          category: project.category,
          technologies: project.technologies || [],
          date: project.date,
          image: project.images?.local?.primary ||
            project.images?.primary ||
            '/images/placeholder.jpg'
        }));

        setFeaturedProjects(transformedProjects);
      } catch (err) {
        console.error('Error loading featured projects:', err);
        // Keep empty array as fallback
        setFeaturedProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadFeaturedProjects();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-blue-600 dark:text-blue-400">Discover My</span>
              <span className="text-purple-600 dark:text-purple-400"> Tech</span> &
              <span className="text-purple-600 dark:text-purple-400"> Design </span>
              Space!
            </h1>
            <div
              className="text-xl md:text-2xl mb-8 mt-8"
              style={{
                fontFamily: 'Roboto Mono', fontSize: '1.5em',
                display: 'inline-block'
              }}
            >
              &lt;<span className="text-yellow-600 dark:text-yellow-300">code</span>&gt;
              <TypeAnimation
                sequence={[
                  'I Build Tech Innovation',
                  1000,
                  'I Build automation tools',
                  1000,
                  'I Design Interactive-media',
                  1000,
                  'I develop Embedded Systems',
                  1000,
                  'I develop software solutions',
                  1000
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
              &lt;<span className="text-yellow-600 dark:text-yellow-300">/code</span>&gt;
            </div>

            <p className="text-x1 text-gray-600 dark:text-gray-300 mb-8">
              Bringing hardware to life with innovative solutions at the intersection of
              electronics, mechanics, and interactive multimedia.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/projects">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${getPrimaryButtonClasses()} px-6 py-3 rounded-md font-medium flex items-center space-x-2 shadow-lg`}
                >
                  <span>EXPLORE NOW</span>
                  <ChevronRight size={18} />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border-2 border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-200 dark:hover:text-gray-800 px-6 py-3 rounded-md font-medium transition-colors duration-300 shadow-lg"
                >
                  Contact Me
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-gray-600 dark:text-gray-400"
          >
            <ChevronRight size={24} className="rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      {/* Expertise Areas */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Areas of Expertise</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Specialized in creating innovative solutions across multiple disciplines
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="glass-effect p-8 rounded-xl border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <div className="text-blue-600 dark:text-blue-400 mb-4">
                <Cpu size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Embedded Systems</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Designing and implementing firmware for microcontrollers and embedded processors,
                creating efficient and reliable systems for various applications.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-effect p-8 rounded-xl border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <div className="text-purple-600 dark:text-purple-400 mb-4">
                <Wrench size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Mechatronics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Integrating mechanical, electronic, and control systems to create smart machines
                and automated systems with precise control and functionality.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-effect p-8 rounded-xl border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <div className="text-green-600 dark:text-green-400 mb-4">
                <Layers size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Interactive Multimedia</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Creating engaging interactive experiences by combining hardware interfaces
                with digital content for exhibitions, art installations, and educational tools.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-effect p-8 rounded-xl border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <div className="text-red-600 dark:text-red-400 mb-4">
                <Circuit size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">PCB Design</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Designing custom printed circuit boards from concept to production,
                optimizing for performance, size, and manufacturability.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-effect p-8 rounded-xl border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <div className="text-amber-600 dark:text-amber-400 mb-4">
                <Zap size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Automation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Developing automated systems for industrial and consumer applications,
                improving efficiency and reducing human intervention.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-effect p-8 rounded-xl border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <div className="text-teal-600 dark:text-teal-400 mb-4">
                <Code size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">IoT Solutions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Creating connected devices and systems that communicate over networks,
                enabling smart homes, industrial monitoring, and data-driven applications.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                A selection of my most innovative and impactful work
              </p>
            </div>
            <Link to="/projects" className="mt-4 md:mt-0 text-blue-600 dark:text-blue-400 font-medium flex items-center hover:underline">
              View all projects <ChevronRight size={16} className="ml-1" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingProjects ? (
              // Loading state for featured projects
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-full mb-2"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/3"></div>
                </div>
              ))
            ) : featuredProjects.length > 0 ? (
              featuredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Featured projects will appear here once data is synced.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;