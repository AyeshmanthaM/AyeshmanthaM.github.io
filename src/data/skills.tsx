import React from 'react';
import { Cpu, Microwave as Microchip, BrainCircuit as Circuit, Wrench, Code, Database, Layers, PenTool, Zap, Wifi, Server, GitBranch } from 'lucide-react';

export const skills = [
  {
    name: 'Hardware & Electronics',
    items: [
      {
        name: 'Microcontrollers',
        icon: <Microchip size={32} className="text-blue-600 dark:text-blue-400" />,
        level: 95
      },
      {
        name: 'PCB Design',
        icon: <Circuit size={32} className="text-blue-600 dark:text-blue-400" />,
        level: 90
      },
      {
        name: 'Analog Electronics',
        icon: <Zap size={32} className="text-blue-600 dark:text-blue-400" />,
        level: 85
      },
      {
        name: 'Digital Electronics',
        icon: <Cpu size={32} className="text-blue-600 dark:text-blue-400" />,
        level: 95
      },
      {
        name: 'Sensor Integration',
        icon: <Wifi size={32} className="text-blue-600 dark:text-blue-400" />,
        level: 90
      }
    ]
  },
  {
    name: 'Programming Languages',
    items: [
      {
        name: 'C/C++',
        icon: <Code size={32} className="text-purple-600 dark:text-purple-400" />,
        level: 95
      },
      {
        name: 'Python',
        icon: <Code size={32} className="text-purple-600 dark:text-purple-400" />,
        level: 90
      },
      {
        name: 'JavaScript/TypeScript',
        icon: <Code size={32} className="text-purple-600 dark:text-purple-400" />,
        level: 85
      },
      {
        name: 'Assembly',
        icon: <Code size={32} className="text-purple-600 dark:text-purple-400" />,
        level: 80
      },
      {
        name: 'VHDL/Verilog',
        icon: <Code size={32} className="text-purple-600 dark:text-purple-400" />,
        level: 75
      }
    ]
  },
  {
    name: 'Mechatronics & Robotics',
    items: [
      {
        name: 'Motor Control',
        icon: <Wrench size={32} className="text-green-600 dark:text-green-400" />,
        level: 90
      },
      {
        name: 'Kinematics',
        icon: <Wrench size={32} className="text-green-600 dark:text-green-400" />,
        level: 85
      },
      {
        name: 'Control Systems',
        icon: <Wrench size={32} className="text-green-600 dark:text-green-400" />,
        level: 90
      },
      {
        name: 'Mechanical Design',
        icon: <Wrench size={32} className="text-green-600 dark:text-green-400" />,
        level: 80
      },
      {
        name: 'Sensor Fusion',
        icon: <Wrench size={32} className="text-green-600 dark:text-green-400" />,
        level: 85
      }
    ]
  },
  {
    name: 'Software & Tools',
    items: [
      {
        name: 'Git',
        icon: <GitBranch size={32} className="text-amber-600 dark:text-amber-400" />,
        level: 90
      },
      {
        name: 'RTOS',
        icon: <Server size={32} className="text-amber-600 dark:text-amber-400" />,
        level: 85
      },
      {
        name: 'Altium Designer',
        icon: <PenTool size={32} className="text-amber-600 dark:text-amber-400" />,
        level: 90
      },
      {
        name: 'MATLAB/Simulink',
        icon: <Database size={32} className="text-amber-600 dark:text-amber-400" />,
        level: 85
      },
      {
        name: 'ROS',
        icon: <Layers size={32} className="text-amber-600 dark:text-amber-400" />,
        level: 80
      }
    ]
  },
  {
    name: 'Protocols & Communication',
    items: [
      {
        name: 'I2C/SPI/UART',
        icon: <Circuit size={32} className="text-teal-600 dark:text-teal-400" />,
        level: 95
      },
      {
        name: 'CAN Bus',
        icon: <Circuit size={32} className="text-teal-600 dark:text-teal-400" />,
        level: 90
      },
      {
        name: 'Bluetooth/BLE',
        icon: <Wifi size={32} className="text-teal-600 dark:text-teal-400" />,
        level: 85
      },
      {
        name: 'WiFi',
        icon: <Wifi size={32} className="text-teal-600 dark:text-teal-400" />,
        level: 90
      },
      {
        name: 'LoRa/LoRaWAN',
        icon: <Wifi size={32} className="text-teal-600 dark:text-teal-400" />,
        level: 80
      }
    ]
  }
];