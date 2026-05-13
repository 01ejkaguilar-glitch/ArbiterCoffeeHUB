import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { FaLightbulb, FaShoppingCart, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api.service';
import { API_ENDPOINTS, BACKEND_BASE_URL } from '../../config/api';

const ProductRecommendations = ({ currentProductId, limit = 3 }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPersonalizedRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.RECOMMENDATIONS.PRODUCTS);
      if (response.success) {
        const filteredRecommendations = (response.data || [])
          .filter(rec => rec.product.id !== currentProductId)
          .slice(0, limit);
        setRecommendations(filteredRecommendations);
      } else {
        await fetchRelatedProducts();
      }
    } catch (err) {
      console.error('Personalized recommendations fetch error:', err);
      await fetchRelatedProducts();
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(API_ENDPOINTS.PRODUCTS.LIST, { limit: 10 });
      if (response.success && response.data) {
        const productsData = response.data.data || response.data;
        const productsArray = Array.isArray(productsData) ? productsData : [];

        const relatedProducts = productsArray
          .filter(product => product.id !== currentProductId)
          .slice(0, limit)
          .map(product => ({
            product: product,
            score: 40,
            reason: 'You might also like this'
          }));

        setRecommendations(relatedProducts);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Related products fetch error:', err);
      setError('Unable to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPersonalizedRecommendations();
    } else {
      fetchRelatedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" role="status">
          <span className="visually-hidden">Loading recommendations...</span>
        </Spinner>
        <small className="text-muted ms-2">Finding similar products...</small>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="py-2">
        <small>Unable to load product recommendations.</small>
      </Alert>
    );
  }

  return (
    <Row className="g-3">
      {recommendations.map((rec, index) => (
        <Col key={rec.product.id || index} xs={12} md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Link to={`/products/${rec.product.id}`}>
              <div style={{ height: '140px', overflow: 'hidden' }}>
                {rec.product.image_url ? (
                  <img
                    src={`${BACKEND_BASE_URL}${rec.product.image_url}`}
                    alt={rec.product.name}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                    <FaLightbulb size={24} className="text-muted" />
                  </div>
                )}
              </div>
            </Link>
            <Card.Body className="p-3">
              <small className="text-muted">{rec.reason}</small>
              <h6 className="mb-2">{rec.product.name}</h6>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-bold text-primary">₱{rec.product.price}</span>
                  {rec.product.rating && (
                    <div className="d-flex align-items-center mt-1">
                      <FaStar className="text-warning me-1" size={12} />
                      <small className="text-muted">{rec.product.rating}</small>
                    </div>
                  )}
                </div>
                <Button
                  as={Link}
                  to={`/products/${rec.product.id}`}
                  variant="outline-primary"
                  size="sm"
                >
                  <FaShoppingCart size={14} />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductRecommendations;
