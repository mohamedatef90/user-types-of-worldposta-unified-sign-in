
import React from 'react';
import { Card } from './Card';
import { Icon } from './Icon';
import type { BlogPost } from '@/pages/dashboard/BlogsData';

interface BlogCardProps {
  blog: BlogPost;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, isExpanded, onToggleExpand }) => {
    let sourceHostname = '';
    if (blog.sourceUrl) {
        try {
            sourceHostname = new URL(blog.sourceUrl).hostname.replace('www.', '');
        } catch (e) {
            // keep it empty if URL is invalid
        }
    }

    return (
        <Card 
            className="flex flex-col h-full overflow-hidden !p-0 group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 cursor-pointer" 
            onClick={onToggleExpand}
        >
            <div className="relative h-40 overflow-hidden">
                <img 
                    src={blog.thumbnail} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-[#293c51] dark:text-gray-100 mb-1 group-hover:text-[#679a41] dark:group-hover:text-emerald-400 transition-colors">
                    {blog.title}
                </h3>
                <p className={`text-sm text-gray-600 dark:text-gray-400 flex-grow transition-all duration-300 ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
                    {blog.subtitle}
                </p>

                {blog.sourceUrl && (
                    <a 
                        href={blog.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 hover:underline flex items-center gap-1.5"
                    >
                        <Icon name="fas fa-link" />
                        {blog.sourceName || sourceHostname}
                    </a>
                )}
            </div>
        </Card>
    );
};
