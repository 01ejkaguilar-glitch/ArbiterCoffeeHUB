import React from 'react';
import { Table, Button, Form } from 'react-bootstrap';

const ProductTable = ({
  products = [],
  loading,
  selectedProducts = [],
  toggleProductSelection,
  toggleSelectAll,
  handleShowModal,
  handleDelete,
}) => {
  return (
    <Table responsive hover className="table-mobile-cards">
      <thead>
        <tr>
          <th>
            <Form.Check type="checkbox" checked={selectedProducts.length > 0 && selectedProducts.length === products.length} onChange={toggleSelectAll} />
          </th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {!loading && products.map((product) => (
          <tr key={product.id}>
            <td data-label="Select">
              <Form.Check type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleProductSelection(product.id)} />
            </td>
            <td data-label="Name">{product.name}</td>
            <td data-label="Category">{product.category?.name || product.category_name || 'Uncategorized'}</td>
            <td data-label="Price">{Number(product.price || 0).toFixed(2)}</td>
            <td data-label="Stock">{product.stock_quantity ?? 0}</td>
            <td data-label="Status">{product.is_available ? 'Available' : 'Hidden'}</td>
            <td data-label="Actions" className="text-end">
              <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => handleShowModal(product)}>Edit</Button>
              <Button size="sm" variant="outline-danger" onClick={() => handleDelete(product.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ProductTable;