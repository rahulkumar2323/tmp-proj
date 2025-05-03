"use client"; // Required for hooks like useState, useEffect and framer-motion

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Image from 'next/image';

// --- Type Definitions ---

type Goal = {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  milestones: Milestone[];
  comments: Comment[];
  category: string; // e.g., 'Personal', 'Team', 'Fitness'
  dueDate?: string; // Optional due date
};

type Milestone = {
  id: string;
  text: string;
  completed: boolean;
};

type Comment = {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: Date;
};

type User = {
  name: string;
  avatar: string;
};

// --- Mock Data ---

const initialGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Launch New Website',
    description: 'Complete the design, development, and deployment of the new company website.',
    progress: 65,
    category: 'Team',
    dueDate: '2024-07-31',
    milestones: [
      { id: 'm1-1', text: 'Finalize Design Mockups', completed: true },
      { id: 'm1-2', text: 'Develop Frontend Components', completed: true },
      { id: 'm1-3', text: 'Integrate Backend API', completed: true },
      { id: 'm1-4', text: 'Conduct User Testing', completed: false },
      { id: 'm1-5', text: 'Deploy to Production', completed: false },
    ],
    comments: [
      { id: 'c1-1', author: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', text: 'Looking great so far! Testing should start next week.', timestamp: new Date(Date.now() - 86400000) },
      { id: 'c1-2', author: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', text: 'Agreed. Let’s ensure mobile responsiveness is perfect.', timestamp: new Date(Date.now() - 3600000) },
    ],
  },
  {
    id: 'g2',
    title: 'Complete Fitness Challenge',
    description: 'Run 100km and complete 20 workout sessions in 30 days.',
    progress: 80,
    category: 'Personal',
    dueDate: '2024-06-30',
    milestones: [
      { id: 'm2-1', text: 'Run 25km', completed: true },
      { id: 'm2-2', text: 'Complete 5 Workouts', completed: true },
      { id: 'm2-3', text: 'Run 50km', completed: true },
      { id: 'm2-4', text: 'Complete 10 Workouts', completed: true },
      { id: 'm2-5', text: 'Run 75km', completed: true },
      { id: 'm2-6', text: 'Complete 15 Workouts', completed: true },
      { id: 'm2-7', text: 'Run 100km', completed: true },
      { id: 'm2-8', text: 'Complete 20 Workouts', completed: false },
    ],
    comments: [
      { id: 'c2-1', author: 'Charlie', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', text: 'Almost there! Keep pushing!', timestamp: new Date(Date.now() - 172800000) },
    ],
  },
    {
    id: 'g3',
    title: 'Learn React Native',
    description: 'Build a small mobile application using React Native.',
    progress: 30,
    category: 'Personal',
    dueDate: '2024-08-31',
    milestones: [
      { id: 'm3-1', text: 'Setup Development Environment', completed: true },
      { id: 'm3-2', text: 'Complete Tutorial Project', completed: true },
      { id: 'm3-3', text: 'Build Basic UI Components', completed: false },
      { id: 'm3-4', text: 'Implement Navigation', completed: false },
      { id: 'm3-5', text: 'Integrate State Management', completed: false },
    ],
    comments: [
       { id: 'c3-1', author: 'David', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', text: 'Check out the official docs, they are quite helpful.', timestamp: new Date(Date.now() - 259200000) },
       { id: 'c3-2', author: 'Eve', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', text: 'Expo Go is great for quick testing!', timestamp: new Date(Date.now() - 600000) },
    ],
  },
];

// --- Helper Functions ---

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const calculateMilestoneCompletion = (milestones: Milestone[]): number => {
  if (milestones.length === 0) return 0;
  const completedCount = milestones.filter(m => m.completed).length;
  return Math.round((completedCount / milestones.length) * 100);
};

// --- Icons --- (Using simple SVGs for icons as requested)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUpIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrophyIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.871m0 0h6.75m-6.75 0H6.375c-.621 0-1.125.504-1.125 1.125v3.375m0 0A3.375 3.375 0 0112 15m0 0V6.75A5.25 5.25 0 0012 1.5a5.25 5.25 0 000 5.25v8.25m0 0A3.375 3.375 0 0016.5 18.75m-4.5 0A3.375 3.375 0 017.5 18.75" />
</svg>
);

const ChatBubbleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const CalendarIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-gray-500">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
</svg>
);


// --- Component Definitions ---

// Navbar Component
const Navbar: React.FC<{ onAddGoal: () => void }> = ({ onAddGoal }) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <svg className="h-8 w-auto text-primary" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM16.5 9.5L11 15L7.5 11.5L8.91 10.09L11 12.17L15.09 8.09L16.5 9.5Z" />
            </svg>
            <span className="ml-3 text-xl font-bold text-gray-800">GoalGetter</span>
          </div>
          <div className="flex items-center">
             <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddGoal}
                className="btn btn-primary flex items-center gap-1"
            >
              <PlusIcon/>
              Add Goal
            </motion.button>
            {/* Add other nav items like profile/settings if needed */}
            <div className="ml-4 flex items-center">
                 <Image
                    src="https://randomuser.me/api/portraits/men/10.jpg"
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-primary"
                    data-ai-hint="user avatar"
                />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} GoalGetter. All rights reserved. Keep reaching for your goals!
      </div>
    </footer>
  );
};


// ProgressBar Component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const bgColor = progress === 100 ? 'bg-green-500' : 'bg-primary'; // Green when complete
  return (
    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
      <motion.div
        className={`h-2.5 rounded-full ${bgColor}`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </div>
  );
};

// MilestoneItem Component
const MilestoneItem: React.FC<{ milestone: Milestone; onToggle: (id: string) => void; goalId: string }> = ({ milestone, onToggle, goalId }) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        layout
        className="flex items-center space-x-2 py-1.5 cursor-pointer group"
        onClick={() => onToggle(milestone.id)}
    >
      <div className={`w-5 h-5 flex items-center justify-center rounded-full border-2 ${milestone.completed ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-primary'}`}>
        {milestone.completed && <CheckIcon />}
      </div>
      <span className={`flex-1 text-sm ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700 group-hover:text-primary'}`}>
        {milestone.text}
      </span>
       {milestone.completed && <TrophyIcon />}
    </motion.div>
  );
};

// CommentItem Component
const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  return (
     <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0"
    >
      <Image
        src={comment.avatar}
        alt={comment.author}
        width={32}
        height={32}
        className="rounded-full mt-1"
        data-ai-hint="user avatar"
      />
      <div className="flex-1">
        <div className="flex justify-between items-baseline">
          <p className="font-medium text-sm text-gray-800">{comment.author}</p>
          <p className="text-xs text-gray-400">{formatDate(comment.timestamp)}</p>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{comment.text}</p>
      </div>
    </motion.div>
  );
};

// GoalCard Component
const GoalCard: React.FC<{
  goal: Goal;
  onUpdateGoal: (updatedGoal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  currentUser: User;
}> = ({ goal, onUpdateGoal, onDeleteGoal, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMilestones, setShowMilestones] = useState(true);
  const [showComments, setShowComments] = useState(true);

  const toggleMilestone = (milestoneId: string) => {
    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const newProgress = calculateMilestoneCompletion(updatedMilestones);
    onUpdateGoal({ ...goal, milestones: updatedMilestones, progress: newProgress });
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    const commentToAdd: Comment = {
      id: `c${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text: newComment,
      timestamp: new Date(),
    };
    onUpdateGoal({ ...goal, comments: [...goal.comments, commentToAdd] });
    setNewComment('');
  };

   const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newProgress = parseInt(e.target.value, 10);
      onUpdateGoal({ ...goal, progress: newProgress });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="card p-4 md:p-6 mb-6"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">{goal.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
        </div>
         <span className="text-xs font-medium bg-secondary text-secondary-foreground py-1 px-2 rounded-full whitespace-nowrap ml-4">
            {goal.category}
        </span>
      </div>

       {goal.dueDate && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
                <CalendarIcon />
                Due: {new Date(goal.dueDate).toLocaleDateString()}
            </div>
        )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-bold text-primary">{goal.progress}%</span>
        </div>
        <ProgressBar progress={goal.progress} />
         {/* Optional: Manual Progress Slider */}
         {/* <input
            type="range"
            min="0"
            max="100"
            value={goal.progress}
            onChange={handleProgressChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
         /> */}
      </div>


      <motion.button
        className="text-sm text-accent hover:underline flex items-center gap-1 mb-4"
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
        {showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Milestones Section */}
            <div className="mb-6">
              <button
                className="flex justify-between items-center w-full text-left font-medium text-gray-700 mb-2"
                onClick={() => setShowMilestones(!showMilestones)}
              >
                <span>Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})</span>
                 {showMilestones ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
              <AnimatePresence>
                  {showMilestones && (
                      <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                           transition={{ duration: 0.2 }}
                           className="border-l-2 border-primary pl-4 ml-2"
                       >
                          {goal.milestones.map(milestone => (
                              <MilestoneItem key={milestone.id} milestone={milestone} onToggle={toggleMilestone} goalId={goal.id} />
                          ))}
                      </motion.div>
                  )}
              </AnimatePresence>
            </div>

            {/* Comments Section */}
            <div>
               <button
                    className="flex justify-between items-center w-full text-left font-medium text-gray-700 mb-3"
                    onClick={() => setShowComments(!showComments)}
                >
                   <div className="flex items-center gap-1">
                        <ChatBubbleIcon />
                        <span>Comments ({goal.comments.length})</span>
                   </div>
                   {showComments ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>
                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="max-h-60 overflow-y-auto pr-2 mb-4 custom-scrollbar">
                                {goal.comments.length > 0 ? (
                                    goal.comments.slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(comment => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No comments yet.</p>
                                )}
                            </div>

                            <form onSubmit={handleAddComment} className="flex items-start space-x-3">
                                <Image
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full mt-1 flex-shrink-0"
                                    data-ai-hint="user avatar"
                                />
                                <div className="flex-1">
                                     <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="textarea w-full text-sm border-gray-200 focus:border-primary focus:ring-primary resize-none"
                                        rows={2}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="submit"
                                        className="btn btn-accent text-sm mt-2"
                                        disabled={!newComment.trim()}
                                    >
                                        Post Comment
                                    </motion.button>
                                </div>
                            </form>
                         </motion.div>
                    )}
                </AnimatePresence>
            </div>

             {/* Delete Button */}
            <div className="mt-6 border-t pt-4 flex justify-end">
                 <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--destructive) / 0.9)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDeleteGoal(goal.id)}
                    className="btn bg-destructive text-destructive-foreground text-sm"
                 >
                    Delete Goal
                </motion.button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// AddGoalModal Component
const AddGoalModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddGoal: (newGoal: Omit<Goal, 'id' | 'comments' | 'progress'> & { milestonesText: string[] }) => void;
}> = ({ isOpen, onClose, onAddGoal }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Personal');
    const [dueDate, setDueDate] = useState('');
    const [milestonesText, setMilestonesText] = useState<string[]>(['']); // Start with one empty milestone input
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Reset form on open
            setTitle('');
            setDescription('');
            setCategory('Personal');
            setDueDate('');
            setMilestonesText(['']);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!title) return; // Basic validation

        const filteredMilestones = milestonesText.map(m => m.trim()).filter(m => m !== '');
        onAddGoal({ title, description, category, dueDate: dueDate || undefined, milestonesText: filteredMilestones });
        onClose();
    };

    const handleMilestoneChange = (index: number, value: string) => {
        const newMilestones = [...milestonesText];
        newMilestones[index] = value;
        setMilestonesText(newMilestones);
    };

    const addMilestoneInput = () => {
        setMilestonesText([...milestonesText, '']);
    };

     const removeMilestoneInput = (index: number) => {
        if (milestonesText.length > 1) {
            const newMilestones = milestonesText.filter((_, i) => i !== index);
            setMilestonesText(newMilestones);
        } else {
             setMilestonesText(['']); // Keep at least one input, just clear it
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={onClose} // Close on backdrop click
        >
            <motion.div
                ref={modalRef}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Goal</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input w-full"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="textarea w-full"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input w-full appearance-none bg-white" // Added bg-white for better visibility
                            >
                                <option>Personal</option>
                                <option>Team</option>
                                <option>Fitness</option>
                                <option>Learning</option>
                                <option>Financial</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                            <input
                                type="date"
                                id="dueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Milestones</label>
                        <div className="space-y-2">
                            {milestonesText.map((milestone, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={milestone}
                                        onChange={(e) => handleMilestoneChange(index, e.target.value)}
                                        placeholder={`Milestone ${index + 1}`}
                                        className="input flex-grow"
                                    />
                                     <motion.button
                                        type="button"
                                        onClick={() => removeMilestoneInput(index)}
                                        className="p-1 text-gray-400 hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Remove milestone"
                                    >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                        </svg>
                                    </motion.button>
                                </div>
                            ))}
                        </div>
                        <motion.button
                            type="button"
                            onClick={addMilestoneInput}
                            className="mt-2 text-sm text-accent hover:underline flex items-center gap-1"
                             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                           <PlusIcon /> Add Milestone
                        </motion.button>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <motion.button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit"
                            className="btn btn-primary"
                             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                             disabled={!title.trim()}
                        >
                            Add Goal
                        </motion.button>
                    </div>
                </form>
                {/* Close button */}
                 <motion.button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    aria-label="Close modal"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </motion.button>
            </motion.div>
        </motion.div>
    );
};


// Dashboard Chart Component
const GoalProgressChart: React.FC<{ goals: Goal[] }> = ({ goals }) => {
  const data = goals.map(goal => ({
    name: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title, // Shorten long titles
    progress: goal.progress,
  }));

  return (
     <div className="card p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Goal Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(211, 211, 211, 0.3)' }} // Light gray on hover
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                    />
                    <Bar dataKey="progress" barSize={30}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="hsl(var(--primary))" /> // Use primary color (Teal)
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
  );
};

// Main App Component
export default function GoalGetterApp() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [currentUser, setCurrentUser] = useState<User>({ name: 'Guest User', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All'); // Filter state: 'All', 'Personal', 'Team', etc.

   // Effect to fetch user data (simulated)
    useEffect(() => {
        // Simulate fetching user data after mount
        const timer = setTimeout(() => {
            setCurrentUser({ name: 'Jordan Lee', avatar: 'https://randomuser.me/api/portraits/men/10.jpg' });
        }, 1500); // Simulate network delay
        return () => clearTimeout(timer);
    }, []);

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const handleAddGoal = (newGoalData: Omit<Goal, 'id' | 'comments' | 'progress'> & { milestonesText: string[] }) => {
     const newGoal: Goal = {
          id: `g${Date.now()}`,
          title: newGoalData.title,
          description: newGoalData.description,
          progress: 0, // Starts at 0
          category: newGoalData.category,
          dueDate: newGoalData.dueDate,
          milestones: newGoalData.milestonesText.map((text, index) => ({
              id: `m${Date.now()}-${index}`,
              text: text,
              completed: false,
          })),
          comments: [], // Starts with no comments
      };
      // Calculate initial progress based on milestones if any exist
      newGoal.progress = calculateMilestoneCompletion(newGoal.milestones);
      setGoals([newGoal, ...goals]);
  };

  const handleDeleteGoal = (goalId: string) => {
     // Add a confirmation step here if desired
    setGoals(goals.filter(g => g.id !== goalId));
  };

   const filteredGoals = goals.filter(goal => filter === 'All' || goal.category === filter);
   const categories = ['All', ...new Set(goals.map(g => g.category))];


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onAddGoal={() => setIsModalOpen(true)} />

      <main className="flex-grow max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Dashboard/Overview Section */}
         <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-6"
         >
            Welcome, {currentUser.name}!
        </motion.h2>

        {goals.length > 0 && <GoalProgressChart goals={goals} />}

        {/* Goal List Section */}
         <div className="mb-6 flex flex-wrap items-center gap-2">
             <span className="text-sm font-medium text-gray-600 mr-2">Filter by category:</span>
             {categories.map(category => (
                 <motion.button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filter === category ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                 >
                    {category}
                 </motion.button>
             ))}
        </div>

        <AnimatePresence>
            {filteredGoals.length > 0 ? (
                filteredGoals.map(goal => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdateGoal={handleUpdateGoal}
                        onDeleteGoal={handleDeleteGoal}
                        currentUser={currentUser}
                    />
                ))
            ) : (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-500 py-10"
                >
                   <p>No goals found for the "{filter}" category.</p>
                   {filter !== 'All' && <button onClick={() => setFilter('All')} className="text-accent hover:underline mt-2">Show all goals</button>}
                </motion.div>
            )}
        </AnimatePresence>
         {goals.length === 0 && (
             <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-center py-16"
            >
                 <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                     <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 <h3 className="mt-2 text-sm font-medium text-gray-900">No goals yet</h3>
                 <p className="mt-1 text-sm text-gray-500">Get started by creating a new goal.</p>
                 <div className="mt-6">
                     <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center gap-1 mx-auto"
                     >
                         <PlusIcon/>
                         Add Goal
                     </motion.button>
                 </div>
             </motion.div>
         )}
      </main>

      <AddGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGoal={handleAddGoal}
      />

      <Footer />

      {/* Basic styling for custom scrollbar */}
       <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #D3D3D3; /* Light Gray */
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                 background: #b0b0b0;
            }
        `}</style>
    </div>
  );
}
