import { useState, useEffect } from "react";
import { getProducts } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatRupiah, getErrorMessage } from "../utils/format";
import OrderModal from "../components/OrderModal";
import type { Product } from "../types";

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Product Catalog</h2>
        <p>{products.length} products available</p>
      </div>

      <div className="filters">
        <input
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select-input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No matching products found.</div>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`product-card ${product.stockQuantity === 0 ? "out-of-stock" : ""}`}
            >
              <div className="product-category">{product.category}</div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-desc">{product.description}</p>
              <div className="product-footer">
                <div>
                  <div className="product-price">
                    {formatRupiah(product.price)}
                  </div>
                  <div
                    className={`product-stock ${product.stockQuantity === 0 ? "stock-empty" : "stock-available"}`}
                  >
                    {product.stockQuantity === 0
                      ? "Out of Stock"
                      : `Stock: ${product.stockQuantity}`}
                  </div>
                </div>
                {user?.role === "buyer" && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedProduct(product)}
                    disabled={product.stockQuantity === 0}
                  >
                    {product.stockQuantity === 0 ? "Sold Out" : "Buy"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
