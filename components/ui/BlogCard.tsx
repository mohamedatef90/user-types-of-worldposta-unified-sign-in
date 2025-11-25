
import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Icon } from './Icon';
import type { BlogPost } from '@/pages/dashboard/BlogsData';

interface BlogCardProps {
  blog: BlogPost;
  onClick: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick }) => (
  <Card className="flex flex-col h-full overflow-hidden !p-0 group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 cursor-pointer" onClick={onClick}>
    <div className="relative h-48 overflow-hidden">
      <img 
        src={blog.thumbnail} 
        alt={blog.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
      />
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
        {blog.date}
      </div>
    </div>
    <div className="p-6 flex-grow flex flex-col">
      <div className="flex flex-wrap gap-2 mb-3">
        {blog.tags.map(tag => (
          <span key={tag} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mb-2 group-hover:text-[#679a41] dark:group-hover:text-emerald-400 transition-colors cursor-pointer">
        {blog.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
        {blog.subtitle}
      </p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-500 dark:text-gray-400">By {blog.author}</span>
        <Button variant="ghost" size="sm" className="text-[#679a41] dark:text-emerald-400 hover:underline p-0 h-auto" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            Read More
        </Button>
      </div>
    </div>
  </Card>
);
