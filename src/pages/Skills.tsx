import React from 'react';
import { motion } from 'framer-motion';
import { skills } from '../data/skills';

const Skills: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Skills & Technologies</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            My technical expertise spans hardware, firmware, software, and design
          </p>
        </motion.div>

        {skills.map((category) => (
          <div key={category.name} className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold mb-8 pb-2 border-b-2 border-gray-200 dark:border-gray-700"
            >
              {category.name}
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {category.items.map((skill, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col items-center"
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-3">
                    {skill.icon}
                  </div>
                  <h3 className="font-medium text-center">{skill.name}</h3>
                  {skill.level && (
                    <div className="w-full mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 shadow-lg"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Continuous Learning</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            I'm constantly expanding my skill set and staying up-to-date with the latest technologies and methodologies in embedded systems, mechatronics, and interactive design. Currently exploring:
          </p>
          <ul className="mt-4 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>Machine Learning for embedded systems</li>
            <li>Advanced sensor fusion techniques</li>
            <li>Energy-efficient IoT architectures</li>
            <li>Real-time operating systems optimization</li>
            <li>Sustainable electronics design</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Skills;