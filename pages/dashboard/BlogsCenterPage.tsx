
import React from 'react';
import { Card, Button, Icon } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { DEMO_BLOGS, BlogPost } from './BlogsData';

const BlogRow: React.FC<{ blog: BlogPost; onClick: () => void }> = ({ blog, onClick }) => (
    <Card className="flex flex-col sm:flex-row overflow-hidden !p-0 group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 cursor-pointer mb-4" onClick={onClick}>
      <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
        <img 
          src={blog.thumbnail} 
          alt={blog.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>
      <div className="p-6 flex-grow flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
            <div className="flex flex-wrap gap-2">
            {blog.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                {tag}
                </span>
            ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Icon name="far fa-calendar" /> {blog.date}
            </span>
        </div>
        <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mb-2 group-hover:text-[#679a41] dark:group-hover:text-emerald-400 transition-colors cursor-pointer">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {blog.subtitle}
        </p>
        <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-gray-500 dark:text-gray-400">By {blog.author}</span>
            <Button variant="ghost" size="sm" className="text-[#679a41] dark:text-emerald-400 hover:underline p-0 h-auto" onClick={(e) => { e.stopPropagation(); onClick(); }}>
                Read More <Icon name="fas fa-arrow-right" className="ml-1 text-xs" />
            </Button>
        </div>
      </div>
    </Card>
);

export const BlogsCenterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBlogClick = (id: string) => {
      navigate(`/app/blogs-center/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Blogs Center</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Latest security news, technical updates, and expert insights from WorldPosta.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {DEMO_BLOGS.map(blog => (
        <BlogRow key={blog.id} blog={blog} onClick={() => handleBlogClick(blog.id)} />
        ))}
      </div>
    </div>
  );
};
