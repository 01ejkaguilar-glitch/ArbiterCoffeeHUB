import React from 'react';
import ResponsiveTable from '@/components/responsive/Table';
import ResponsiveButton from '@/components/responsive/Button';
import ResponsiveForm from '@/components/responsive/Form';

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
    <ResponsiveTable
      columns={[
        {
          Header: '',
          accessor: 'select',
          Cell: ({ cell }) => (
            <div className="text-center">
              <input
                className="form-check-input"
                type="checkbox"
                checked={selectedProducts.includes(cell.row.original.id)}
                onChange={() => toggleProductSelection(cell.row.original.id)}
              />
            </div>
          )
        },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Category', accessor: 'category' },
        { Header: 'Price', accessor: 'price' },
        { Header: 'Stock', accessor: 'stock' },
        { Header: 'Status', accessor: 'status' },
        {
          Header: 'Actions',
          accessor: 'actions',
          Cell: ({ cell }) => (
            <div className="d-flex gap-2">
              <ResponsiveButton size="sm" variant="outline-secondary" onClick={() => handleShowModal(cell.row.original)}>Edit</ResponsiveButton>
              <ResponsiveButton size="sm" variant="outline-danger" onClick={() => handleDelete(cell.row.original.id)}>Delete</ResponsiveButton>
            </div>
          )
        }
      ]}
      data={!loading && products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category?.name || product.category_name || 'Uncategorized',
        price: Number(product.price || 0).toFixed(2),
        stock: product.stock_quantity ?? 0,
        status: product.is_available ? 'Available' : 'Hidden',
      }))}
      loading={loading}
      emptyMessage={
        <div className="text-center py-4">
          <p>No products found</p>
        </div>
      }
    />
  );
};

export default ProductTable;