import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, ChevronRight, Filter, Calendar, Tag, User, ArrowRight } from 'lucide-react';
import api from '../api/axios'; // Make sure this path is correct for your axios instance
import toast, { Toaster } from 'react-hot-toast';

export default function NewsPortal() {
    const [theme, setTheme] = useState('light');
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Fetch News Data from our new Django API
    useEffect(() => {
        const fetchNewsData = async () => {
            try {
                // Try fetching from the real backend
                const [articleRes, categoryRes, bannerRes] = await Promise.all([
                    api.get('news/articles/'),
                    api.get('news/categories/'),
                    api.get('news/banners/')
                ]);
                setArticles(articleRes.data);
                setCategories(categoryRes.data);
                setBanners(bannerRes.data);
            } catch (error) {
                console.warn("Backend empty or offline, loading dummy data for UI testing...");
                // Dummy Data based on PDF Requirements
                setCategories([{ id: 1, name: 'Competitions News' }, { id: 2, name: 'Board Exam Updates' }, { id: 3, name: 'Career Guidance' }]);
                setArticles([
                    {
                        id: 1, title: 'UPSC CSE 2026 Notification Released', content: 'The Union Public Service Commission has released the much-awaited notification...',
                        category_name: 'Competitions News', author_name: 'Admin', tags_names: ['UPSC', 'Exam'],
                        state: 'Delhi', created_at: '2026-03-15T10:00:00Z', is_featured: true, views_count: 1250,
                        featured_image: 'https://images.unsplash.com/photo-1585432959315-d9342fd58eb6?w=800&q=80'
                    },
                    {
                        id: 2, title: 'Gujarat Board Class 12 Results Date Announced', content: 'GSEB is set to announce the Class 12 board results by next week...',
                        category_name: 'Board Exam Updates', author_name: 'Editor', tags_names: ['GSEB', 'Results'],
                        state: 'Gujarat', created_at: '2026-03-16T14:30:00Z', is_featured: false, views_count: 840,
                        featured_image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'
                    },
                    {
                        id: 3, title: 'Top 10 Career Options After BCA', content: 'Explore the best career paths in Data Science, AI, and Software Engineering...',
                        category_name: 'Career Guidance', author_name: 'Guidance Expert', tags_names: ['BCA', 'Careers', 'IT'],
                        state: 'All India', created_at: '2026-03-17T09:15:00Z', is_featured: false, views_count: 3200,
                        featured_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'
                    }
                ]);
                setBanners([{ id: 1, title: 'Prepare for JEE 2026 with Top Educators', image: 'https://images.unsplash.com/photo-1513258496099-4816c0245304?w=1200&q=80' }]);
            } finally {
                setLoading(false);
            }
        };
        fetchNewsData();
    }, []);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const filteredArticles = articles.filter(article => {
        const matchesCategory = activeCategory === 'All' || article.category_name === activeCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredArticle = articles.find(a => a.is_featured) || articles[0];

    return (
        <div className={`news-portal ${theme}`}>
            <Toaster position="top-right" />

            {/* 1. NAVBAR component [cite: 14, 15] */}
            <nav className="news-navbar">
                <div className="nav-brand">
                    <h2>ShivAdda <span className="text-primary">News</span></h2>
                </div>
                <div className="nav-links">
                    <a href="#" className="active">Home</a>
                    <a href="#">Categories</a>
                    <a href="#">About Us</a>
                    <a href="#">Contact</a>
                </div>
                <div className="nav-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search news..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </nav>

            <main className="news-container">
                {/* 2. HERO SECTION [cite: 20] */}
                {!searchQuery && activeCategory === 'All' && featuredArticle && (
                    <section className="hero-section">
                        <div className="hero-banner" style={{ backgroundImage: `url(${banners[0]?.image || featuredArticle.featured_image})` }}>
                            <div className="hero-overlay">
                                <span className="hero-tag">Featured Update</span>
                                <h1>{featuredArticle.title}</h1>
                                <p>{featuredArticle.content.substring(0, 120)}...</p>
                                <button className="btn-read-more">Read Full Article <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    </section>
                )}

                <div className="content-layout">
                    {/* MAIN NEWS FEED */}
                    <div className="news-feed">
                        <div className="feed-header">
                            <h3>Latest Updates</h3>
                            <div className="category-pills">
                                <button className={`pill ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')}>All News</button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`pill ${activeCategory === cat.name ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.name)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* NEWS CARDS [cite: 24] */}
                        <div className="news-grid">
                            {filteredArticles.map(article => (
                                <article key={article.id} className="news-card">
                                    <div className="card-img-wrapper">
                                        <img src={article.featured_image || 'https://via.placeholder.com/400x200'} alt={article.title} />
                                        <span className="card-category">{article.category_name}</span>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-meta">
                                            <span><Calendar size={14} /> {new Date(article.created_at).toLocaleDateString()}</span>
                                            <span><User size={14} /> {article.author_name}</span>
                                        </div>
                                        <h4 className="card-title">{article.title}</h4>
                                        <div className="card-tags">
                                            {article.tags_names?.slice(0, 2).map(tag => (
                                                <span key={tag} className="tag"><Tag size={12} /> {tag}</span>
                                            ))}
                                        </div>
                                        <button className="btn-link">Read More <ChevronRight size={16} /></button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* 3. SIDEBAR FILTERS [cite: 32, 33] */}
                    <aside className="news-sidebar">
                        <div className="sidebar-widget filters-widget">
                            <h3><Filter size={18} /> Advanced Filters</h3>

                            <div className="filter-group">
                                <h4>Sort By</h4>
                                <select className="filter-select">
                                    <option>Newest First</option>
                                    <option>Oldest First</option>
                                    <option>Most Popular</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <h4>Location / State</h4>
                                <select className="filter-select">
                                    <option>All India</option>
                                    <option>Delhi</option>
                                    <option>Gujarat</option>
                                    <option>Uttar Pradesh</option>
                                </select>
                            </div>

                            <button className="btn-apply-filters">Apply Filters</button>
                        </div>
                    </aside>
                </div>
            </main>

            {/* CSS STYLING */}
            <style>{`
                .news-portal {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    min-height: 100vh;
                    transition: all 0.3s ease;
                }
                .news-portal.light { --bg: #f8fafc; --card-bg: #ffffff; --text: #1e293b; --text-muted: #64748b; --border: #e2e8f0; --primary: #3b82f6; }
                .news-portal.dark { --bg: #0f172a; --card-bg: #1e293b; --text: #f8fafc; --text-muted: #94a3b8; --border: #334155; --primary: #60a5fa; }
                
                .news-portal { background-color: var(--bg); color: var(--text); }
                .text-primary { color: var(--primary); }
                
                /* Navbar */
                .news-navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 5%; background: var(--card-bg); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100;}
                .nav-brand h2 { margin: 0; font-weight: 800; font-size: 1.5rem; }
                .nav-links { display: flex; gap: 20px; }
                .nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 600; transition: 0.2s; }
                .nav-links a:hover, .nav-links a.active { color: var(--primary); }
                
                .nav-actions { display: flex; align-items: center; gap: 15px; }
                .search-bar { display: flex; align-items: center; background: var(--bg); padding: 8px 15px; border-radius: 20px; border: 1px solid var(--border); }
                .search-bar input { border: none; background: transparent; outline: none; margin-left: 8px; color: var(--text); }
                .theme-toggle { background: transparent; border: none; color: var(--text); cursor: pointer; display: flex; align-items: center;}

                .news-container { max-width: 1200px; margin: 0 auto; padding: 30px 15px; }

                /* Hero Section */
                .hero-section { margin-bottom: 40px; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                .hero-banner { height: 400px; background-size: cover; background-position: center; position: relative; display: flex; align-items: flex-end; }
                .hero-overlay { background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); width: 100%; padding: 40px; color: white; }
                .hero-tag { background: var(--primary); color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
                .hero-overlay h1 { font-size: 2.5rem; margin: 10px 0; font-weight: 800; }
                .btn-read-more { background: white; color: black; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; transition: 0.2s;}
                .btn-read-more:hover { transform: translateY(-2px); }

                /* Content Layout */
                .content-layout { display: grid; grid-template-columns: 3fr 1fr; gap: 30px; }

                /* News Feed & Categories */
                .feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;}
                .feed-header h3 { margin: 0; font-size: 1.5rem; font-weight: 800; }
                .category-pills { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; }
                .pill { background: var(--card-bg); border: 1px solid var(--border); padding: 6px 15px; border-radius: 20px; color: var(--text-muted); cursor: pointer; font-weight: 600; white-space: nowrap;}
                .pill.active, .pill:hover { background: var(--primary); color: white; border-color: var(--primary); }

                /* News Cards */
                .news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
                .news-card { background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; transition: transform 0.3s; display: flex; flex-direction: column;}
                .news-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                .card-img-wrapper { height: 180px; position: relative; }
                .card-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
                .card-category { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.7); color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; backdrop-filter: blur(4px); }
                .card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
                .card-meta { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px; }
                .card-meta span { display: flex; align-items: center; gap: 5px; }
                .card-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 15px; line-height: 1.4; color: var(--text); }
                .card-tags { display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
                .tag { background: var(--bg); color: var(--text-muted); font-size: 0.7rem; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; border: 1px solid var(--border); }
                .btn-link { margin-top: auto; background: transparent; border: none; color: var(--primary); font-weight: 700; display: inline-flex; align-items: center; gap: 5px; padding: 0; cursor: pointer; }
                .btn-link:hover { text-decoration: underline; }

                /* Sidebar */
                .sidebar-widget { background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border); padding: 20px; margin-bottom: 20px; }
                .sidebar-widget h3 { margin: 0 0 20px; display: flex; align-items: center; gap: 10px; font-size: 1.1rem; }
                .filter-group { margin-bottom: 15px; }
                .filter-group h4 { margin: 0 0 8px; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .filter-select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); outline: none; }
                .btn-apply-filters { width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }

                @media (max-width: 900px) {
                    .content-layout { grid-template-columns: 1fr; }
                    .nav-links { display: none; }
                }
            `}</style>
        </div>
    );
}