import React from 'react';
import {
  ResponsiveContainer,
  ResponsiveRow,
  ResponsiveCol,
  ResponsiveCard
} from '../components/responsive';
import { Link } from 'react-router-dom';
import { FaHome, FaCoffee, FaEnvelope, FaSearch } from 'react-icons/fa';
import SEO from '../components/SEO';

/**
 * NotFound - Custom 404 Page
 * Displays a user-friendly error page with navigation options
 */
const NotFound = () => {
  return (
    <main role="main">
      <div className="not-found-page">
        <SEO 
          title="Page Not Found - 404"
          description="Sorry, the page you're looking for doesn't exist. Browse our coffee products or return to the homepage."
          url={window.location.pathname}
          type="website"
        />
        
        <ResponsiveContainer className="py-5">
          <ResponsiveRow className="justify-content-center text-center">
            <ResponsiveCol md={8} lg={6}>
              {/* 404 Illustration */}
              <header className="mb-5">
                <h1 className="display-1 fw-bold notfound-heading">
                  404
                </h1>
                <FaCoffee size={80} className="text-muted mb-3" aria-hidden="true" />

                <h2 className="mb-3">Oops! Page Not Found</h2>
                <p className="lead text-muted">
                  The page you're looking for seems to have been moved, deleted, or doesn't exist. 
                  Don't worry, let's get you back on track!
                </p>
              </header>

            {/* Quick Actions */}
            <ResponsiveRow className="g-3 mb-5">
              <ResponsiveCol sm={6}>
                <Link to="/" className="text-decoration-none" aria-label="Go to homepage">
                  <ResponsiveCard className="h-100 shadow-sm hover-shadow">
                    <ResponsiveCard.Body className="d-flex flex-column align-items-center py-4">
                      <FaHome size={40} className="mb-3 text-coffee" aria-hidden="true" />
                      <h5>Go Home</h5>
                      <p className="text-muted small mb-0">
                        Return to homepage
                      </p>
                    </ResponsiveCard.Body>
                  </ResponsiveCard>
                </Link>
              </ResponsiveCol>

              <ResponsiveCol sm={6}>
                <Link to="/products" className="text-decoration-none" aria-label="Browse coffee products">
                  <ResponsiveCard className="h-100 shadow-sm hover-shadow">
                    <ResponsiveCard.Body className="d-flex flex-column align-items-center py-4">
                      <FaCoffee size={40} className="mb-3 text-coffee" aria-hidden="true" />
                      <h5>Browse Coffee</h5>
                      <p className="text-muted small mb-0">
                        Explore our products
                      </p>
                    </ResponsiveCard.Body>
                  </ResponsiveCard>
                </Link>
              </ResponsiveCol>

              <ResponsiveCol sm={6}>
                <Link to="/contact" className="text-decoration-none" aria-label="Contact us">
                  <ResponsiveCard className="h-100 shadow-sm hover-shadow">
                    <ResponsiveCard.Body className="d-flex flex-column align-items-center py-4">
                      <FaEnvelope size={40} className="mb-3 text-coffee" aria-hidden="true" />
                      <h5>Contact Us</h5>
                      <p className="text-muted small mb-0">
                        Get in touch
                      </p>
                    </ResponsiveCard.Body>
                  </ResponsiveCard>
                </Link>
              </ResponsiveCol>

              <ResponsiveCol sm={6}>
                <Link to="/about" className="text-decoration-none" aria-label="Learn about us">
                  <ResponsiveCard className="h-100 shadow-sm hover-shadow">
                    <ResponsiveCard.Body className="d-flex flex-column align-items-center py-4">
                      <FaSearch size={40} className="mb-3 text-coffee" aria-hidden="true" />
                      <h5>About Us</h5>
                      <p className="text-muted small mb-0">
                        Learn our story
                      </p>
                    </ResponsiveCard.Body>
                  </ResponsiveCard>
                </Link>
              </ResponsiveCol>
            </ResponsiveRow>

            {/* Additional Help */}
            <div className="text-muted">
              <p className="mb-2">
                <strong>Looking for something specific?</strong>
              </p>
              <p className="small">
                Try using the navigation menu above or{' '}
                <Link to="/contact" className="text-primary">
                  contact us
                </Link>{' '}
                if you need help finding what you're looking for.
              </p>
            </div>
          </ResponsiveCol>
        </ResponsiveRow>
      </ResponsiveContainer>

      <style>{`
        .not-found-page {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
        }

        .hover-shadow {
          transition: all 0.3s ease;
        }

        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .hover-shadow:hover .card-body {
          color: var(--color-coffee-brown);
        }
      `}</style>
      </div>
    </main>
  );
};

export default NotFound;
