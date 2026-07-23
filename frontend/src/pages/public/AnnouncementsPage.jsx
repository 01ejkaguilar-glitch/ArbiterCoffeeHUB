import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveButton,
  ResponsiveContainer,
  ResponsiveCol,
  ResponsiveRow,
  ResponsiveForm,
  ResponsiveBadge,
  ResponsivePagination,
} from '@/components/responsive';
import { FaFacebookF, FaInstagram, FaSearch, FaCalendar } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import LoadingFallback from '../../components/common/LoadingFallback';
import SEO from '../../components/SEO';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef(null);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'promo', label: 'Promotions' },
    { value: 'event', label: 'Events' },
    { value: 'news', label: 'News' },
    { value: 'update', label: 'Updates' }
  ];

  const fetchAnnouncements = useCallback(async () => {
    try {
      setInitialLoading(true);
      const params = {
        page: currentPage,
        per_page: 9
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (searchTerm) {
        params.search = debouncedSearch;
      }

      const response = await apiService.get(API_ENDPOINTS.ANNOUNCEMENTS.LIST, params);
      if (response.success) {
        const data = response.data.data || response.data;
        setAnnouncements(Array.isArray(data) ? data : []);
        setTotalPages(response.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setInitialLoading(false);
    }
  }, [currentPage, selectedCategory, debouncedSearch, searchTerm]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // useEffect on [searchTerm, currentPage] will trigger the fetch automatically
  };

  const getCategoryBadge = (category) => {
    const badgeColors = {
      promo: 'success',
      event: 'primary',
      news: 'info',
      update: 'warning'
    };
    return badgeColors[category] || 'secondary';
  };

  const shareOnSocial = (platform, announcement) => {
    const url = encodeURIComponent(window.location.origin + '/announcements/' + announcement.id);
    const text = encodeURIComponent(announcement.title + ' - Arbiter Coffee Shop');
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      tiktok: `https://www.tiktok.com/@arbitercoffee.ph`,
      instagram: `https://www.instagram.com/arbitercoffee.ph`
    };

    // For platforms that don't support direct sharing, copy to clipboard instead
    if (platform === 'instagram') {
      navigator.clipboard?.writeText(decodeURIComponent(url))
        .then(() => alert('Link copied! Share it on Instagram.'))
        .catch(() => window.open(shareUrls[platform], '_blank', 'width=600,height=400'));
      return;
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (initialLoading) {
    return <LoadingFallback message="Loading announcements..." />;
  }

  return (
    <main role="main">
      <SEO 
        title="Announcements - Latest News & Promotions"
        description="Stay updated with the latest news, promotions, events, and updates from Arbiter Coffee Shop. Don't miss out on special offers and exciting news!"
        keywords="coffee shop announcements, coffee promotions, coffee events, coffee news, Arbiter Coffee updates, special offers"
        url="/announcements"
        canonical={`${window.location.origin}/announcements`}
        type="website"
      />
      
      {/* Hero Section */}
      <section aria-labelledby="announcements-hero-heading" className="hero-section">
        <ResponsiveContainer>
            <ResponsiveRow className="align-items-center">
              <ResponsiveCol lg={8} className="mx-auto text-center">
                <span className="hero-eyebrow">Stay Updated</span>
                <h1 id="announcements-hero-heading" className="hero-title">Announcements</h1>
                <p className="hero-subtitle">
                  Stay updated with our latest news, promotions, and events
                </p>
              </ResponsiveCol>
            </ResponsiveRow>
          </ResponsiveContainer>
      </section>

      <ResponsiveContainer className="py-5">
        {/* Filters and Search */}
        <ResponsiveRow className="mb-5">
          <ResponsiveCol md={6} className="mb-3">
            <ResponsiveForm onSubmit={handleSearch} role="search" aria-label="Search announcements">
              <ResponsiveForm.Group className="d-flex w-100">
                <ResponsiveForm.Control
                  type="text"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search announcements by keyword"
                  className="border-end-0"
                />
                <ResponsiveButton type="submit" variant="primary" aria-label="Submit search">
                  <FaSearch aria-hidden="true" />
                </ResponsiveButton>
              </ResponsiveForm.Group>
            </ResponsiveForm>
          </ResponsiveCol>
          <ResponsiveCol md={6} className="mb-3">
            <ResponsiveForm.Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by category"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </ResponsiveForm.Select>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Announcements Grid */}
        <section aria-labelledby="announcements-list-heading">
          <h2 id="announcements-list-heading" className="visually-hidden">Announcements List</h2>
          <ResponsiveRow className="g-4 mb-5" role="list">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <ResponsiveCol key={announcement.id} md={6} lg={4} role="listitem">
                  <article className="announcement-card">
                    {announcement.featured_image && (
                      <img
                        className="announcement-img"
                        src={announcement.featured_image}
                        alt={`${announcement.title}${announcement.category ? ` - ${announcement.category} announcement` : ''}`}
                        loading="lazy"
                      />
                    )}
                    <div className="announcement-body">
                      <div className="announcement-meta">
                        <ResponsiveBadge bg={getCategoryBadge(announcement.category)}>
                          {announcement.category}
                        </ResponsiveBadge>
                        <span>
                          <FaCalendar className="me-1" aria-hidden="true" />
                          <time dateTime={announcement.published_at || announcement.created_at}>
                            {new Date(announcement.published_at || announcement.created_at).toLocaleDateString()}
                          </time>
                        </span>
                      </div>
                      <h3>{announcement.title}</h3>
                      <p className="announcement-excerpt">
                        {(announcement.content || '').substring(0, 150)}...
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <ResponsiveButton as={Link} to={`/announcements/${announcement.id}`} variant="outline-primary" size="sm">
                          Read More
                        </ResponsiveButton>
                        <div className="d-flex gap-1">
                          <button
                            className="social-share-btn"
                            onClick={() => shareOnSocial('facebook', announcement)}
                            title="Share on Facebook"
                            aria-label="Share this announcement on Facebook"
                          >
                            <FaFacebookF />
                          </button>
                          <button
                            className="social-share-btn"
                            onClick={() => shareOnSocial('tiktok', announcement)}
                            title="Share on TikTok"
                            aria-label="Visit our TikTok page"
                          >
                            <FaTiktok />
                          </button>
                          <button
                            className="social-share-btn"
                            onClick={() => shareOnSocial('instagram', announcement)}
                            title="Share on Instagram"
                            aria-label="Share this announcement on Instagram"
                          >
                            <FaInstagram />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </ResponsiveCol>
              ))
            ) : (
              <ResponsiveCol>
                <div className="text-center py-5">
                  <h4 className="text-muted mb-2">No announcements found</h4>
                  <p className="text-muted">Check back later for updates!</p>
                </div>
              </ResponsiveCol>
            )}
          </ResponsiveRow>

          {/* Pagination */}
          {totalPages > 1 && (
            <ResponsiveRow>
              <ResponsiveCol className="d-flex justify-content-center">
                <ResponsivePagination aria-label="Announcement pages navigation">
                  <ResponsivePagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} aria-label="Go to first page" />
                  <ResponsivePagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Go to previous page" />
                  
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let end = Math.min(totalPages, start + maxVisible - 1);
                    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
                    if (start > 1) pages.push(<ResponsivePagination.Ellipsis key="start-ellipsis" disabled />);
                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <ResponsivePagination.Item key={i} active={currentPage === i} onClick={() => setCurrentPage(i)}>
                          {i}
                        </ResponsivePagination.Item>
                      );
                    }
                    if (end < totalPages) pages.push(<ResponsivePagination.Ellipsis key="end-ellipsis" disabled />);
                    return pages;
                  })()}

                  <ResponsivePagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Go to next page" />
                  <ResponsivePagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} aria-label="Go to last page" />
                </ResponsivePagination>
              </ResponsiveCol>
            </ResponsiveRow>
          )}
        </section>
      </ResponsiveContainer>
    </main>
  );
};

export default AnnouncementsPage;
