import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';
import { DEMO_BLOGS } from './BlogsData';

const SocialIcon = ({ name, onClick }: { name: string; onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 hover:text-[#679a41] hover:border-[#679a41] transition-all duration-200 dark:text-gray-400 dark:hover:text-emerald-400 dark:hover:border-emerald-400 hover:scale-110"
    >
        <Icon name={name} />
    </button>
);

export const BlogDetailsPage: React.FC = () => {
    const { blogId } = useParams<{ blogId: string }>();
    const navigate = useNavigate();

    const blog = useMemo(() => {
        return DEMO_BLOGS.find(b => b.id === blogId);
    }, [blogId]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [blogId]);

    const handleNext = () => {
        if (!blog) return;
        const currentIndex = DEMO_BLOGS.findIndex(b => b.id === blog.id);
        const nextIndex = (currentIndex + 1) % DEMO_BLOGS.length;
        navigate(`/app/blogs-center/${DEMO_BLOGS[nextIndex].id}`);
    };

    if (!blog) {
        return (
            <div className="text-center py-12">
                <Icon name="fas fa-exclamation-circle" className="text-4xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Blog Post Not Found</h2>
                <Button onClick={() => navigate('/app/blogs-center')} className="mt-6">
                    Back to Blogs Center
                </Button>
            </div>
        );
    }

    // Determine category from tags or default
    const category = blog.tags.length > 0 ? blog.tags[0] : 'Article';

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 animate-fade-in">
            {/* Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Left: Back Button */}
                    <div className="flex items-center w-1/3">
                        <button 
                            onClick={() => navigate('/app/blogs-center')} 
                            className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-gray-600 dark:text-gray-400"
                            aria-label="Back to all articles"
                        >
                            <Icon name="fas fa-angle-double-left" />
                        </button>
                    </div>

                    {/* Center: Category Badge */}
                    <div className="flex justify-center w-1/3">
                        <span className="text-xs font-bold tracking-widest uppercase text-white bg-[#679a41] dark:bg-emerald-600 px-3 py-1 rounded-sm">
                            {category}
                        </span>
                    </div>

                    {/* Right: Read Next */}
                    <div className="flex items-center justify-end w-1/3">
                        <button 
                            onClick={handleNext}
                            className="group flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-200 transition-colors"
                        >
                            <span className="mr-2">Read Next</span>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 group-hover:border-gray-400 dark:group-hover:border-slate-500 transition-all">
                                <Icon name="fas fa-arrow-right" className="text-xs" />
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-16">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header Content (Centered) */}
                    <div className="text-center max-w-4xl mx-auto mb-10">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#293c51] dark:text-gray-100 mb-6 leading-tight tracking-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                            <span className="text-[#293c51] dark:text-gray-300">by {blog.author}</span>
                            <span className="mx-3 text-gray-300 dark:text-gray-600">|</span>
                            <span>{blog.date}</span>
                        </div>
                    </div>

                    {/* Hero Image (Wide) */}
                    <div className="w-full max-w-6xl mx-auto mb-16 rounded-xl overflow-hidden shadow-sm">
                        <img 
                            src={blog.thumbnail} 
                            alt={blog.title} 
                            className="w-full h-auto object-cover" 
                        />
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 max-w-5xl mx-auto relative">
                        {/* Social Sidebar (Sticky on Desktop) */}
                        <div className="hidden lg:flex flex-col gap-4 sticky top-24 h-fit w-12 flex-shrink-0 items-center">
                            <SocialIcon name="fab fa-twitter" onClick={() => {}} />
                            <SocialIcon name="fab fa-instagram" onClick={() => {}} />
                            <SocialIcon name="fab fa-facebook-f" onClick={() => {}} />
                            <SocialIcon name="fab fa-linkedin-in" onClick={() => {}} />
                        </div>

                        {/* Mobile Social Row */}
                        <div className="flex lg:hidden gap-4 justify-center mb-6">
                            <SocialIcon name="fab fa-twitter" onClick={() => {}} />
                            <SocialIcon name="fab fa-instagram" onClick={() => {}} />
                            <SocialIcon name="fab fa-facebook-f" onClick={() => {}} />
                            <SocialIcon name="fab fa-linkedin-in" onClick={() => {}} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                                {/* Lead Paragraph */}
                                <p className="text-xl font-medium mb-8 text-[#293c51] dark:text-gray-100 leading-relaxed">
                                    {blog.subtitle}
                                </p>
                                {/* Article Body */}
                                {blog.content}
                            </div>

                            {/* Footer: Tags & Back to Top */}
                            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    {blog.tags.map(tag => (
                                        <span key={tag} className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    leftIconName="fas fa-arrow-up"
                                    className="border-[#679a41] text-[#679a41] hover:bg-[#679a41] hover:text-white dark:border-emerald-500 dark:text-emerald-500 dark:hover:bg-emerald-600 dark:hover:text-white"
                                >
                                    Back to Top
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};