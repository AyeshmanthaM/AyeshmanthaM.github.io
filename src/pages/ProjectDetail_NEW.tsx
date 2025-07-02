import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, AlertCircle } from 'lucide-react';
import { getCategoryColorClasses, getCardClasses } from '../theme/colors';
import { PublicDataService } from '../services/publicDataService';
import { Project } from '../types';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize the data service
    const dataService = new PublicDataService();

    // Load project details from public data
    const loadProjectDetail = async (projectId: string) => {
        setLoading(true);
        setError(null);

        try {
            // Try to get the specific project file
            const projectData = await dataService.getProject(`project-${projectId}`);

            if (projectData) {
                // Transform the data to match our Project interface
                const transformedProject: Project = {
                    id: projectData.id.replace('project-', ''),
                    title: projectData.title,
                    description: projectData.description,
                    fullDescription: projectData.fullDescription || projectData.description,
                    challenges: projectData.challenges || 'Details available in full description',
                    results: projectData.results || 'Project completed successfully',
                    category: projectData.category,
                    technologies: projectData.technologies || [],
                    date: projectData.date,
                    image: projectData.images?.local?.primary ||
                        projectData.images?.primary ||
                        '/images/placeholder.jpg'
                };

                setProject(transformedProject);
            } else {
                setError('Project not found');
            }
        } catch (err) {
            console.error('Error loading project:', err);
            setError('Failed to load project details. Please try again later.');
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
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded"></div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 h-8 w-3/4 rounded mb-4"></div>
                        <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-8"></div>
                        <div className="space-y-4">
                            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>
                            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-5/6"></div>
                            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-24 pb-16 min-h-screen">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center py-20">
                        <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                            Project Not Found
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            {error}
                        </p>
                        <Link
                            to="/projects"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Projects
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="pt-24 pb-16 min-h-screen">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center py-20">
                        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                            Project Not Found
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            The requested project could not be found.
                        </p>
                        <Link
                            to="/projects"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Projects
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const categoryColors = getCategoryColorClasses(project.category);
    const cardClasses = getCardClasses();

    return (
        <div className="pt-24 pb-16 min-h-screen">
            <div className="container mx-auto px-4 md:px-6">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        to="/projects"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-8"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Projects
                    </Link>
                </motion.div>

                {/* Project Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors}`}>
                            <Tag size={14} className="inline mr-1" />
                            {project.category}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {project.date}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                        {project.title}
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {project.technologies.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Project Image */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-12"
                >
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                    />
                </motion.div>

                {/* Project Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-12"
                >
                    <div className="lg:col-span-2">
                        <div className={`${cardClasses} p-8`}>
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                                Project Overview
                            </h2>
                            <div className="prose dark:prose-invert max-w-none">
                                {/* Render full description with basic markdown-like formatting */}
                                {project.fullDescription.split('\n').map((paragraph, index) => {
                                    if (paragraph.trim() === '') return null;

                                    // Simple heading detection
                                    if (paragraph.startsWith('# ')) {
                                        return (
                                            <h3 key={index} className="text-xl font-semibold mt-6 mb-4 text-gray-900 dark:text-gray-100">
                                                {paragraph.replace('# ', '')}
                                            </h3>
                                        );
                                    }

                                    if (paragraph.startsWith('## ')) {
                                        return (
                                            <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-900 dark:text-gray-100">
                                                {paragraph.replace('## ', '')}
                                            </h4>
                                        );
                                    }

                                    return (
                                        <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Challenges */}
                        <div className={cardClasses}>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                    Challenges
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {project.challenges}
                                </p>
                            </div>
                        </div>

                        {/* Results */}
                        <div className={cardClasses}>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                    Results
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {project.results}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProjectDetail;
