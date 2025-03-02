import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Award, BookOpen, Briefcase } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Me</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Embedded Systems Engineer, Mechatronics Specialist, and Interactive Designer
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-1"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
                  alt="Profile"
                  className="w-full h-auto"
                />
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">John Doe</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Embedded Systems & Mechatronics Engineer
                  </p>
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Download size={16} className="mr-2" />
                      Download CV
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-2"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">My Story</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    I'm a passionate Embedded Systems and Mechatronics Engineer with over 8 years of experience designing and implementing innovative solutions at the intersection of hardware and software.
                  </p>
                  <p>
                    My journey began with a fascination for how things work, taking apart electronics and building small robots as a child. This curiosity led me to pursue a degree in Electrical Engineering with a specialization in Embedded Systems, followed by a Master's in Mechatronics.
                  </p>
                  <p>
                    Throughout my career, I've worked on diverse projects ranging from industrial automation systems and IoT devices to interactive installations and consumer electronics. I thrive on challenges that require creative problem-solving and interdisciplinary approaches.
                  </p>
                  <p>
                    When I'm not designing circuits or writing firmware, you can find me mentoring engineering students, contributing to open-source projects, or exploring the latest advancements in technology.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">My Approach</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    I believe in creating technology that is not only functional but also intuitive and accessible. My design philosophy centers around:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>User-Centered Design:</strong> Understanding the end-user's needs and creating solutions that are intuitive and enjoyable to use.</li>
                    <li><strong>Sustainability:</strong> Designing with energy efficiency and longevity in mind to minimize environmental impact.</li>
                    <li><strong>Modularity:</strong> Creating systems with well-defined interfaces that can be easily maintained and upgraded.</li>
                    <li><strong>Reliability:</strong> Implementing robust error handling and fail-safe mechanisms to ensure dependable operation.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 pb-2 border-b-2 border-gray-200 dark:border-gray-700 flex items-center">
              <BookOpen size={24} className="mr-2 text-blue-600 dark:text-blue-400" />
              Education
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-1">MSc in Mechatronics Engineering</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Stanford University | 2015 - 2017</p>
                <p className="text-gray-700 dark:text-gray-300">
                  Specialized in robotics and control systems. Thesis on "Adaptive Control Algorithms for Autonomous Robotic Systems."
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-1">BSc in Electrical Engineering</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">MIT | 2011 - 2015</p>
                <p className="text-gray-700 dark:text-gray-300">
                  Focus on embedded systems and digital electronics. Senior project: "Low-Power Wireless Sensor Networks for Environmental Monitoring."
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 pb-2 border-b-2 border-gray-200 dark:border-gray-700 flex items-center">
              <Briefcase size={24} className="mr-2 text-blue-600 dark:text-blue-400" />
              Work Experience
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-1">Senior Embedded Systems Engineer</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">TechInnovate Inc. | 2020 - Present</p>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Leading the development of next-generation IoT devices for smart home and industrial applications.
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Designed and implemented firmware for a family of energy-efficient wireless sensors</li>
                  <li>Optimized battery life by 40% through innovative power management techniques</li>
                  <li>Led a team of 5 engineers in developing a new industrial automation platform</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-1">Mechatronics Engineer</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">RoboSystems Ltd. | 2017 - 2020</p>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Developed control systems for robotic applications in manufacturing and logistics.
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Created precision motion control algorithms for robotic arms</li>
                  <li>Implemented machine vision systems for quality control processes</li>
                  <li>Reduced system integration time by 30% through modular design approaches</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 pb-2 border-b-2 border-gray-200 dark:border-gray-700 flex items-center">
              <Award size={24} className="mr-2 text-blue-600 dark:text-blue-400" />
              Certifications & Awards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-1">Certified IoT Solutions Architect</h3>
                <p className="text-gray-600 dark:text-gray-400">AWS | 2022</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-1">Innovation Award</h3>
                <p className="text-gray-600 dark:text-gray-400">Embedded Systems Conference | 2021</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-1">RTOS Specialist Certification</h3>
                <p className="text-gray-600 dark:text-gray-400">FreeRTOS | 2019</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-1">Best Paper Award</h3>
                <p className="text-gray-600 dark:text-gray-400">International Conference on Mechatronics | 2018</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl font-bold mb-6">Interested in working together?</h2>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium shadow-lg"
              >
                Get in Touch
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;