import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { FaCoffee, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import { API_ENDPOINTS, BACKEND_BASE_URL } from '../../config/api';

const isTransportError = (error) => {
  if (!error) return false;
  return error.code === 'ERR_NETWORK' || !error.response;
};

const HomepageRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPersonalizedRecommendations();
    } else {
      fetchPopularProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPersonalizedRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.RECOMMENDATIONS.HOMEPAGE);
      if (response.success && response.data) {
        const { recommended_products, recommended_coffee_beans, is_authenticated } = response.data;
        const allRecommendations = [];

        if (recommended_products && Array.isArray(recommended_products)) {
          recommended_products.forEach(product => {
            allRecommendations.push({
              product: product,
              score: is_authenticated ? 80 : 60,
              reason: product.reason || (is_authenticated ? 'Recommended for you' : 'Popular choice')
            });
          });
        }

        if (recommended_coffee_beans && Array.isArray(recommended_coffee_beans)) {
          recommended_coffee_beans.forEach(bean => {
            allRecommendations.push({
              product: bean,
              score: is_authenticated ? 75 : 55,
              reason: bean.reason || 'Premium coffee beans'
            });
          });
        }

        setRecommendations(allRecommendations.slice(0, 4));
      } else {
        await fetchPopularProducts();
      }
    } catch (err) {
      if (!isTransportError(err)) {
        setError('Unable to load recommendations');
      }
      await fetchPopularProducts();
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST, { per_page: 8 });
      if (response.success && response.data) {
        const productsData = response.data.data || response.data;
        const productsArray = Array.isArray(productsData) ? productsData : [];

        const popular = productsArray
          .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
          .slice(0, 4)
          .map(product => ({
            product,
            score: 50,
            reason: 'Best seller'
          }));

        setRecommendations(popular);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      setError('Unable to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" role="status">
          <span className="visually-hidden">Loading recommendations...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Row className="g-3">
      {recommendations.map((rec, index) => (
        <Col key={rec.product.id || index} xs={6} md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Link to={`/products/${rec.product.id}`}>
              <div className="card-image-container" style={{ height: '120px', overflow: 'hidden' }}>
                {rec.product.image_url ? (
                  <img
                    src={`${BACKEND_BASE_URL}${rec.product.image_url}`}
                    alt={rec.product.name}
                    className="card-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                    <FaCoffee size={32} className="text-muted" />
                  </div>
                )}
              </div>
            </Link>
            <Card.Body className="p-2">
              <small className="text-muted">{rec.reason}</small>
              <h6 className="mb-1" style={{ fontSize: '0.9rem' }}>{rec.product.name}</h6>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-primary">₱{rec.product.price}</span>
                <Button
                  as={Link}
                  to={`/products/${rec.product.id}`}
                  variant="outline-primary"
                  size="sm"
                  className="py-0 px-2"
                >
                  <FaShoppingCart size={12} />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
      <Col xs={12} className="text-center mt-2">
        <Link to="/products" className="btn btn-outline-primary btn-sm">
          View All Products <FaArrowRight className="ms-1" />
        </Link>
      </Col>
    </Row>
  );
};

export default HomepageRecommendations;
