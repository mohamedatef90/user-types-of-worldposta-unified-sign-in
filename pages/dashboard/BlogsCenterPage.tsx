import React, { useState } from 'react';
import { Card, Button, Icon, BlogCard } from '@/components/ui';
import { DEMO_BLOGS, BlogPost } from './BlogsData';

const BlogRow: React.FC<{ blog: BlogPost; isExpanded: boolean; onToggleExpand: () => void; }> = ({ blog, isExpanded, onToggleExpand }) => {
    return (
        <Card 
            className="group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 cursor-pointer mb-4 !p-4" 
            onClick={onToggleExpand}
        >
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <img 
                    src={blog.thumbnail} 
                    alt={blog.title} 
                    className="w-full sm:w-32 h-32 object-cover rounded-md flex-shrink-0"
                />

                <div className="flex flex-col flex-grow w-full">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-shrink-0 ml-2">
                            <Icon name="far fa-calendar" /> {blog.date}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mb-2 group-hover:text-[#679a41] dark:group-hover:text-emerald-400 transition-colors cursor-pointer">
                      {blog.title}
                    </h3>

                    <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 transition-all duration-300 ${isExpanded ? 'line-clamp-4' : 'line-clamp-2'}`}>
                      {blog.subtitle}
                    </p>

                    {isExpanded && blog.sourceUrl && (
                        <div className="my-2 animate-fade-in">
                            <a 
                                href={blog.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                            >
                                <Icon name="fas fa-link" />
                                Source: {blog.sourceName || 'Read more'}
                            </a>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-500 dark:text-gray-400">By {blog.author}</span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#679a41] dark:text-emerald-400 hover:underline p-0 h-auto" 
                            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                        >
                            {isExpanded ? 'Show Less' : 'Read More'}
                            <Icon name={isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} className="ml-1 text-xs" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export const BlogsCenterPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [expandedBlogId, setExpandedBlogId] = useState<string | null>(null);

  const handleToggleExpand = (blogId: string) => {
    setExpandedBlogId(prevId => (prevId === blogId ? null : blogId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Blogs Center</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Latest security news, technical updates, and expert insights from WorldPosta.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
            leftIconName="fas fa-list"
          >
            List
          </Button>
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('grid')}
            leftIconName="fas fa-th-large"
          >
            Grid
          </Button>
        </div>
      </div>
      
      {view === 'list' ? (
        <div className="space-y-4">
          {DEMO_BLOGS.map(blog => (
            <BlogRow 
              key={blog.id} 
              blog={blog} 
              isExpanded={expandedBlogId === blog.id}
              onToggleExpand={() => handleToggleExpand(blog.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_BLOGS.map(blog => (
            <BlogCard
              key={blog.id}
              blog={blog}
              isExpanded={expandedBlogId === blog.id}
              onToggleExpand={() => handleToggleExpand(blog.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};