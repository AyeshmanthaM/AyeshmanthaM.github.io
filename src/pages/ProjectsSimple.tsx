import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import { Button, Input } from '../components/ui/OnceUI';
import { Project } from '../types';

const ProjectsSimple: React.FC = () => {
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load projects directly without service wrapper
    useEffect(() => {
        const loadProjectsDirectly = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔄 Loading projects directly...');

                // Step 1: Load metadata
                console.log('📋 Fetching metadata...');
                const metadataResponse = await fetch('/data/metadata.json');
                if (!metadataResponse.ok) {
                    throw new Error(`Metadata fetch failed: ${metadataResponse.status} ${metadataResponse.statusText}`);
                }
                const metadata = await metadataResponse.json();
                console.log('✅ Metadata loaded:', metadata);

                // Step 2: Load individual projects
                console.log('📦 Loading individual projects...');
                const projectPromises = metadata.projects.map(async (projectInfo: any) => {
                    console.log(`🔄 Fetching ${projectInfo.filename}...`);
                    const response = await fetch(`/data/projects/${projectInfo.filename}`);
                    if (!response.ok) {
                        console.error(`❌ Failed to fetch ${projectInfo.filename}: ${response.status}`);
                        return null;
                    }
                    const projectData = await response.json();
                    console.log(`✅ Loaded project: ${projectData.title}`);
                    return projectData;
                });

                const projectsData = await Promise.all(projectPromises);
                const validProjects = projectsData.filter(p => p !== null);
                console.log(`✅ Loaded ${validProjects.length} valid projects`);

                // Step 3: Transform data
                console.log('🔄 Transforming project data...');
                const transformedProjects: Project[] = validProjects.map((project: any) => {
                    const transformed = {
                        id: project.id.replace('project-', ''),
                        title: project.title,
                        description: project.description || 'No description available',
                        fullDescription: project.fullDescription || project.description || 'No description available',
                        challenges: project.challenges || 'Details available in full description',
                        results: project.results || 'Project completed successfully',
                        category: project.category,
                        technologies: project.technologies || [],
                        date: project.date,
                        image: project.images?.local?.primary ||
                            project.images?.primary ||
                            'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
                    };
                    console.log(`✅ Transformed project: ${transformed.title}`, transformed);
                    return transformed;
                });

                console.log(`🎉 Successfully loaded and transformed ${transformedProjects.length} projects`);
                setProjects(transformedProjects);

            } catch (err) {
                console.error('❌ Error loading projects:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(`Failed to load projects: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        loadProjectsDirectly();
    }, []);

    const categories = [
        { id: 'all', name: 'All Projects' },
        { id: 'automation', name: 'Automation' },
        { id: 'web', name: 'Web Development' },
        { id: 'software', name: 'Software' },
        { id: 'embedded', name: 'Embedded Systems' },
        { id: 'mechatronics', name: 'Mechatronics' },
        { id: 'interactive', name: 'Interactive' },
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
                        My Projects (Direct Load)
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
                </motion.div>

                {/* Debug Info */}
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                    <strong>Debug Info:</strong> Projects: {projects.length}, Loading: {loading ? 'Yes' : 'No'}, Error: {error ? 'Yes' : 'No'}
                </div>

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

                {/* Loading State */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                            Loading Projects
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Fetching the latest project data...
                        </p>
                    </motion.div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="once-ui-card max-w-md mx-auto p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-100">
                                Failed to Load Projects
                            </h3>
                            <p className="text-red-700 dark:text-red-300 mb-6">
                                {error}
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {!loading && !error && (
                        <>
                            {filteredProjects.length > 0 ? (
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
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProjectsSimple;
