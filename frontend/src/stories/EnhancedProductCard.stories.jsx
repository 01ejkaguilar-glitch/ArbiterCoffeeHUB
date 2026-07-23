import React from 'react';
import { EnhancedProductCard } from './EnhancedProductCard';

export default {
  title: 'Components/EnhancedProductCard',
  component: EnhancedProductCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onAddToCart: { action: 'added to cart' },
    onQuickView: { action: 'quick view' },
    onToggleFavorite: { action: 'toggled favorite' },
  },
};

const mockProduct = {
  id: 1,
  name: 'Ethiopian Yirgacheffe Coffee',
  description: 'A bright and floral coffee with notes of citrus and bergamot.',
  price: 18.99,
  sale_price: 15.99,
  stock_quantity: 12,
  is_popular: true,
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  category: {
    name: 'Single Origin'
  },
  image_url: '/images/products/ethiopian-yirgacheffe.jpg'
};

export const Default = {
  args: {
    product: mockProduct,
    onAddToCart: () => alert('Added to cart!'),
    onQuickView: () => alert('Quick view opened!'),
    onToggleFavorite: () => alert('Toggled favorite!'),
    isFavorite: false,
    isAddingToCart: false
  },
};

export const WithSale = {
  args: {
    product: {
      ...mockProduct,
      name: 'Colombian Supremo Coffee',
      price: 22.99,
      sale_price: 18.99,
      stock_quantity: 5,
      is_low_stock: true
    },
    onAddToCart: () => alert('Added to cart!'),
    onQuickView: () => alert('Quick view opened!'),
    onToggleFavorite: () => alert('Toggled favorite!'),
    isFavorite: true,
    isAddingToCart: false
  },
};

export const OutOfStock = {
  args: {
    product: {
      ...mockProduct,
      name: 'Kenyan AA Coffee',
      price: 19.99,
      stock_quantity: 0,
      is_popular: false
    },
    onAddToCart: () => alert('Added to cart!'),
    onQuickView: () => alert('Quick view opened!'),
    onToggleFavorite: () => alert('Toggled favorite!'),
    isFavorite: false,
    isAddingToCart: false
  },
};

export const NewProduct = {
  args: {
    product: {
      ...mockProduct,
      name: 'New Jamaican Blue Mountain',
      price: 45.99,
      stock_quantity: 8,
      created_at: new Date().toISOString() // Just released
    },
    onAddToCart: () => alert('Added to cart!'),
    onQuickView: () => alert('Quick view opened!'),
    onToggleFavorite: () => alert('Toggled favorite!'),
    isFavorite: false,
    isAddingToCart: false
  },
};