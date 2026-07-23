import React from 'react';
import { ResponsivePagination } from './Pagination';

export default {
  title: 'Components/Pagination',
  component: ResponsivePagination,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};

export const WithManyPages = {
  args: {
    currentPage: 5,
    totalPages: 50,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};

export const CurrentPageInMiddle = {
  args: {
    currentPage: 10,
    totalPages: 20,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};

export const FirstPage = {
  args: {
    currentPage: 1,
    totalPages: 5,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};

export const LastPage = {
  args: {
    currentPage: 5,
    totalPages: 5,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};