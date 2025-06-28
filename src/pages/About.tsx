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
              Mechatronics Engineer, Embedded Systems Specialist, and Interactive Designer
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-1"
            >
              {/* Profile Photo & CV download button */}
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src="/images/ayesh1.png"
                    alt="Ayeshmantha - Profile Photo"
                    className="w-full h-full object-cover transition-opacity duration-300"
                    loading="eager"
                    onError={(e) => {
                      console.error('Profile image failed to load');
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show fallback
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-6xl font-bold"
                    style={{ display: 'none' }}
                  >
                    A
                  </div>
                </div>
                <div className="p-5 text-center">
                  <h2 className="text-3xl font-bold mb-1">Ayeshmantha</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Mechatronics Engineer
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


            {/* My Story */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-2"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">My Story</h2>
                <div className="space-y-5 mb-7 text-gray-700 dark:text-gray-300">
                  <p>
                    I'm a passionate Embedded Systems and Mechatronics Engineer with over 8 years of experience designing and implementing innovative solutions at the intersection of hardware and software.
                  </p>
                  <p>
                    My journey began with a fascination for how things work, taking apart electronics and building small robots as a child. This curiosity led me to pursue a degree in Bachelor of Engineering Technology Honours Degree under Mechatronics Technology.
                  </p>
                  <p>
                    Throughout my career, I've worked on diverse projects ranging from industrial automation systems and IoT devices to interactive installations and consumer electronics. I thrive on challenges that require creative problem-solving and interdisciplinary approaches.
                  </p>
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
                <h3 className="text-xl font-bold mb-1">Bachelor of Engineering Technology Honours Degree (Mechatronics Technology)</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Stanford University | 2017 - 2021</p>
                <p className="text-gray-700 dark:text-gray-300">
                  Focus on embedded systems and digital electronics. Senior project: "power-Line Communication for Smart Household Appliances."
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
                <h3 className="text-xl font-bold mb-1">Senior Mechatronics Engineer</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <a className='text-blue-600 dark:text-blue-400' target='_blank' href='https://www.behance.net/vaeg'>VAEG - Visual Art and Experiences Group.</a> | 2022 - Present</p>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Leading the development of interactive systems | research and Design multimedia industrial applications
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Design & development of interactive systems and research for multimedia industrial applications.</li>
                  <li>Designed and implemented firmware for the multimedia industry.</li>
                  <li>Created technical drawings for entertainment events.</li>
                  <li>Developed and maintained embedded systems for interactive installations.</li>
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