import React from 'react';
import ResponsiveTable from '../../../components/responsive/Table';
import ResponsiveButton from '../../../components/responsive/Button';
import ResponsiveForm from '../../../components/responsive/Form';

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
        { Header: '', accessor: 'select' },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Category', accessor: 'category' },
        { Header: 'Price', accessor: 'price' },
        { Header: 'Stock', accessor: 'stock' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'Actions', accessor: 'actions' }
      ]}
      data={!loading && products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category?.name || product.category_name || 'Uncategorized',
        price: Number(product.price || 0).toFixed(2),
        stock: product.stock_quantity ?? 0,
        status: product.is_available ? 'Available' : 'Hidden',
        actions: (
          <div className="d-flex gap-2">
            <ResponsiveButton size="sm" variant="outline-secondary" onClick={() => handleShowModal(product)}>Edit</ResponsiveButton>
            <ResponsiveButton size="sm" variant="outline-danger" onClick={() => handleDelete(product.id)}>Delete</ResponsiveButton>
          </div>
        ),
        select: (
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => toggleProductSelection(product.id)}
            />
          </div>
        )
      }))}
      loading={loading}
      emptyMessage=(
        <div className="text-center py-4">
          <p>No products found</p>
        </div>
      )
    >
      {/* Custom rendering for select column */}
      {(columnProps) => {
        if (columnProps.column.accessor === 'select') {
          return <div className="text-center">{columnProps.cell}</div>;
        }
        return <div>{columnProps.cell}</div>;
      }}
      {/* Custom rendering for actions column */}
      {(columnProps) => {
        if (columnProps.column.accessor === 'actions') {
          return <div>{columnProps.cell}</div>;
        }
        return <div>{columnProps.cell}</div>;
      }}
    </ResponsiveTable>
  );
};

export default ProductTable;