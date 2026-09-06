// import { Subject, Todo, Video, Note, TimestampNote } from './types';

// export const INITIAL_SUBJECTS: Subject[] = [
//   {
//     id: 'subj-1',
//     userId: 'user_alex',
//     title: 'Quantum Physics',
//     description: 'Master the fundamental principles of quantum mechanics and particle behavior.',
//     category: 'SCIENCES',
//     colorCode: '#a855f7',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     _count: { videos: 4, notes: 3, todos: 1 },
//   },
//   {
//     id: 'subj-2',
//     userId: 'user_alex',
//     title: 'Renaissance Art',
//     description: 'Explore the cultural and artistic rebirth of 15th-century Europe.',
//     category: 'ARTS',
//     colorCode: '#c084fc',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     _count: { videos: 2, notes: 2, todos: 1 },
//   },
//   {
//     id: 'subj-3',
//     userId: 'user_alex',
//     title: 'Data Structures',
//     description: 'Advanced algorithms and optimal data organization for complex software.',
//     category: 'ENGINEERING',
//     colorCode: '#3b82f6',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     _count: { videos: 6, notes: 5, todos: 0 },
//   },
//   {
//     id: 'subj-4',
//     userId: 'user_alex',
//     title: 'Linear Algebra',
//     description: 'Vector spaces, matrices, and linear transformations.',
//     category: 'MATHEMATICS',
//     colorCode: '#eab308',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     _count: { videos: 3, notes: 2, todos: 1 },
//   },
// ];

// export const INITIAL_VIDEOS: Record<string, Video[]> = {
//   'subj-1': [
//     {
//       id: 'vid-1',
//       subjectId: 'subj-1',
//       youtubeUrl: 'https://www.youtube.com/watch?v=Usu9xZfabPM',
//       youtubeId: 'Usu9xZfabPM',
//       title: 'Lecture 4: Wave-Particle Duality',
//       description: 'Quantum Mechanics Module 3: The Nature of Reality',
//       thumbnailUrl: 'https://img.youtube.com/vi/Usu9xZfabPM/hqdefault.jpg',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       _count: { timestamps: 4 },
//     },
//     {
//       id: 'vid-2',
//       subjectId: 'subj-1',
//       youtubeUrl: 'https://www.youtube.com/watch?v=qpnxWskT9gU',
//       youtubeId: 'qpnxWskT9gU',
//       title: 'Lecture 5: Quantum Entanglement & Bell Inequality',
//       description: 'Module 4: Non-locality in Quantum Theory',
//       thumbnailUrl: 'https://img.youtube.com/vi/qpnxWskT9gU/hqdefault.jpg',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       _count: { timestamps: 2 },
//     },
//   ],
// };

// export const INITIAL_TIMESTAMPS: Record<string, TimestampNote[]> = {
//   'vid-1': [
//     {
//       id: 'ts-1',
//       videoId: 'vid-1',
//       timeSeconds: 0,
//       timeLabel: '00:00',
//       noteText: 'Introduction to Quantum Mechanics & historical backdrop',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     },
//     {
//       id: 'ts-2',
//       videoId: 'vid-1',
//       timeSeconds: 320,
//       timeLabel: '05:20',
//       noteText: 'Wave-Particle Duality fundamentals & de Broglie relation (λ = h/p)',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     },
//     {
//       id: 'ts-3',
//       videoId: 'vid-1',
//       timeSeconds: 885,
//       timeLabel: '14:45',
//       noteText: 'The Double-Slit Experiment interference pattern breakdown',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     },
//     {
//       id: 'ts-4',
//       videoId: 'vid-1',
//       timeSeconds: 1690,
//       timeLabel: '28:10',
//       noteText: 'Schrödinger Equation derivation & wave function collapse probability',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     },
//   ],
// };

// export const INITIAL_NOTES: Record<string, Note[]> = {
//   'subj-1': [
//     {
//       id: 'note-1',
//       subjectId: 'subj-1',
//       title: 'Wave-Particle Duality & Interference Notes',
//       content: `# Quantum Mechanics: Lecture 4 Key Takeaways

// ## 1. Wave-Particle Duality
// Light and matter exhibit behaviors of both waves and particles depending on measurement.

// - **de Broglie Wavelength**:
//   $$\\lambda = \\frac{h}{p}$$
// - **Photoelectric Effect**: Photons possess discrete energy $E = h\\nu$.

// ## 2. Double-Slit Experiment Observations
// 1. When unobserved, single electrons build up an **interference pattern** on the detector screen over time.
// 2. Placing a detector at the slits collapses the wave function, producing two simple classical bands.

// \`\`\`python
// # Simulation pseudocode for probability amplitude
// import numpy as np

// def probability_density(psi):
//     return np.abs(psi)**2
// \`\`\`

// > *“Those who are not shocked when they first come across quantum theory cannot possibly have understood it.”* — Niels Bohr
// `,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     },
//   ],
// };

// export const INITIAL_TODOS: Todo[] = [
//   {
//     id: 'todo-1',
//     userId: 'user_alex',
//     subjectId: 'subj-1',
//     title: 'Submit Calculus Assignment',
//     isCompleted: false,
//     dueDate: 'Due Today, 11:59 PM',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: 'todo-2',
//     userId: 'user_alex',
//     subjectId: 'subj-1',
//     title: 'Read Chapter 5: Physics',
//     isCompleted: false,
//     dueDate: 'Tomorrow',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: 'todo-3',
//     userId: 'user_alex',
//     subjectId: 'subj-2',
//     title: 'Review History Notes',
//     isCompleted: false,
//     dueDate: 'Friday',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ];
