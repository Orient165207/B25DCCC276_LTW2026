import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const CATEGORIES = ['Văn phòng phẩm', 'Điện tử', 'Gia dụng'];

const formatCurrency = (amount) => `${amount.toLocaleString('vi-VN')} đ`;

const getRoute = (pathname) => {
  if (pathname === '/') return { page: 'home' };
  if (pathname === '/products') return { page: 'products' };
  if (pathname === '/products/new') return { page: 'new' };

  const detailMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (detailMatch) return { page: 'detail', id: detailMatch[1] };

  return { page: 'not-found' };
};

function App() {
  const [route, setRoute] = useState(() => getRoute(window.location.pathname));
  const [products, setProducts] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0],
    price: '',
    quantity: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute(window.location.pathname));
    window.history.replaceState(
      { ...window.history.state, inventoryApp: true },
      '',
      window.location.href,
    );
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let active = true;

    axios
      .get('/data/products.json')
      .then(({ data }) => {
        if (!Array.isArray(data)) {
          throw new Error('Dữ liệu sản phẩm không hợp lệ.');
        }
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const navigate = (pathname, replace = false) => {
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ inventoryApp: true }, '', pathname);
    setRoute(getRoute(pathname));
  };

  const visibleProducts = useMemo(() => {
    if (!products) return [];
    const normalizedSearch = search.trim().toLocaleLowerCase('vi');

    return products.filter((product) => {
      const matchesName = product.name.toLocaleLowerCase('vi').includes(normalizedSearch);
      const matchesCategory =
        categoryFilter === 'Tất cả' || product.category === categoryFilter;
      return matchesName && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const selectedProduct =
    route.page === 'detail'
      ? products?.find((product) => String(product.id) === route.id)
      : null;

  const updateQuantity = (productId, amount) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: Math.max(0, product.quantity + amount) }
          : product,
      ),
    );
  };

  const deleteProduct = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    );
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFormError('');
  };

  const addProduct = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!name || form.price === '' || form.quantity === '') {
      setFormError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      setFormError('Giá phải từ 0 trở lên và số lượng phải là số nguyên không âm.');
      return;
    }

    const newProduct = {
      id: products.reduce((highestId, product) => Math.max(highestId, product.id), 0) + 1,
      name,
      category: form.category,
      price,
      quantity,
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);
    setForm({ name: '', category: CATEGORIES[0], price: '', quantity: '' });
    setFormError('');
    navigate('/products', true);
    navigate(`/products/${newProduct.id}`);
  };

  const goBack = () => {
    if (window.history.state?.inventoryApp && window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/products');
    }
  };

  const renderLoadingOrError = () => {
    if (loadError) {
      return <p className="notice notice-error">Không tải được dữ liệu.</p>;
    }
    if (!products) {
      return <p className="notice">Đang tải...</p>;
    }
    return null;
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/" onClick={(event) => {
            event.preventDefault();
            navigate('/');
          }}>
            <span className="brand-mark" aria-hidden="true">K</span>
            <span>Kho hàng</span>
          </a>
          <nav className="main-nav" aria-label="Điều hướng chính">
            {[
              { path: '/', label: 'Trang chủ', page: 'home' },
              { path: '/products', label: 'Danh sách', page: 'products' },
              { path: '/products/new', label: 'Thêm mới', page: 'new' },
            ].map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={route.page === item.page ? 'nav-link active' : 'nav-link'}
                aria-current={route.page === item.page ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(item.path);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="page-content">
        {route.page === 'home' && (
          <section>
            <div className="page-heading">
              <div>
                <p className="eyebrow">TỔNG QUAN</p>
                <h1>Kho hàng</h1>
                <p className="page-description">Theo dõi nhanh tình hình hàng hóa của cửa hàng.</p>
              </div>
              <button className="button button-primary" onClick={() => navigate('/products/new')}>
                + Thêm sản phẩm
              </button>
            </div>
            {renderLoadingOrError()}
            {products && (
              <div className="stats-grid">
                <article className="stat-card">
                  <span className="stat-label">Tổng số sản phẩm</span>
                  <strong>{products.length}</strong>
                  <span className="stat-caption">mặt hàng trong kho</span>
                </article>
                <article className="stat-card stat-warning">
                  <span className="stat-label">Sắp hết hàng</span>
                  <strong>{products.filter((product) => product.quantity < 5).length}</strong>
                  <span className="stat-caption">sản phẩm có tồn kho dưới 5</span>
                </article>
                <article className="stat-card stat-value">
                  <span className="stat-label">Tổng giá trị kho</span>
                  <strong>
                    {formatCurrency(
                      products.reduce(
                        (total, product) => total + product.price * product.quantity,
                        0,
                      ),
                    )}
                  </strong>
                  <span className="stat-caption">giá bán × số lượng tồn</span>
                </article>
              </div>
            )}
            <section className="welcome-card">
              <div>
                <h2>Quản lý hàng hóa thật đơn giản</h2>
                <p>Tìm sản phẩm, cập nhật số lượng hoặc xem thông tin chi tiết trong danh sách.</p>
              </div>
              <button className="button button-secondary" onClick={() => navigate('/products')}>
                Xem danh sách
              </button>
            </section>
          </section>
        )}

        {route.page === 'products' && (
          <section>
            <div className="page-heading">
              <div>
                <p className="eyebrow">QUẢN LÝ HÀNG HÓA</p>
                <h1>Danh sách sản phẩm</h1>
                <p className="page-description">Tìm kiếm, lọc và cập nhật tồn kho.</p>
              </div>
              <button className="button button-primary" onClick={() => navigate('/products/new')}>
                + Thêm sản phẩm
              </button>
            </div>
            {renderLoadingOrError()}
            {products && (
              <>
                <div className="filter-bar">
                  <label className="field search-field">
                    <span>Tìm kiếm</span>
                    <input
                      type="search"
                      placeholder="Nhập tên sản phẩm..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                  <label className="field category-field">
                    <span>Danh mục</span>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                    >
                      <option>Tất cả</option>
                      {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                </div>
                <p className="result-count">
                  Tìm thấy <strong>{visibleProducts.length}</strong> sản phẩm
                </p>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <a
                              className="product-link"
                              href={`/products/${product.id}`}
                              onClick={(event) => {
                                event.preventDefault();
                                navigate(`/products/${product.id}`);
                              }}
                            >
                              {product.name}
                            </a>
                          </td>
                          <td><span className="category-badge">{product.category}</span></td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>
                            <span className={product.quantity < 5 ? 'stock low-stock' : 'stock'}>
                              {product.quantity}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="icon-button"
                                aria-label={`Giảm tồn kho ${product.name}`}
                                disabled={product.quantity === 0}
                                onClick={() => updateQuantity(product.id, -1)}
                              >
                                −
                              </button>
                              <button
                                className="icon-button"
                                aria-label={`Tăng tồn kho ${product.name}`}
                                onClick={() => updateQuantity(product.id, 1)}
                              >
                                +
                              </button>
                              <button
                                className="delete-button"
                                onClick={() => deleteProduct(product.id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {visibleProducts.length === 0 && (
                        <tr>
                          <td className="empty-cell" colSpan="5">Không có dữ liệu.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}

        {route.page === 'new' && (
          <section className="form-page">
            <div className="page-heading">
              <div>
                <p className="eyebrow">QUẢN LÝ HÀNG HÓA</p>
                <h1>Thêm sản phẩm mới</h1>
                <p className="page-description">Điền thông tin bên dưới để thêm vào kho.</p>
              </div>
            </div>
            {renderLoadingOrError()}
            {products && (
              <form className="product-form" onSubmit={addProduct} noValidate>
                <label className="field">
                  <span>Tên sản phẩm</span>
                  <input name="name" value={form.name} onChange={handleFormChange} />
                </label>
                <label className="field">
                  <span>Danh mục</span>
                  <select name="category" value={form.category} onChange={handleFormChange}>
                    {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Giá (đ)</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleFormChange}
                  />
                </label>
                <label className="field">
                  <span>Số lượng tồn</span>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={handleFormChange}
                  />
                </label>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="form-actions">
                  <button className="button button-secondary" type="button" onClick={goBack}>
                    Quay lại
                  </button>
                  <button className="button button-primary" type="submit">Thêm</button>
                </div>
              </form>
            )}
          </section>
        )}

        {route.page === 'detail' && (
          <section>
            <button className="back-link" onClick={goBack}>← Quay lại</button>
            {renderLoadingOrError()}
            {products && selectedProduct && (
              <article className="detail-card">
                <p className="eyebrow">CHI TIẾT SẢN PHẨM</p>
                <h1>{selectedProduct.name}</h1>
                <dl className="detail-list">
                  <div><dt>Tên sản phẩm</dt><dd>{selectedProduct.name}</dd></div>
                  <div><dt>Danh mục</dt><dd>{selectedProduct.category}</dd></div>
                  <div><dt>Giá</dt><dd>{formatCurrency(selectedProduct.price)}</dd></div>
                  <div>
                    <dt>Tồn kho</dt>
                    <dd className={selectedProduct.quantity < 5 ? 'low-stock' : ''}>
                      {selectedProduct.quantity}
                    </dd>
                  </div>
                </dl>
              </article>
            )}
            {products && !selectedProduct && (
              <p className="notice notice-error">Không tìm thấy sản phẩm.</p>
            )}
          </section>
        )}

        {route.page === 'not-found' && (
          <section className="not-found">
            <h1>Không tìm thấy trang</h1>
            <button className="button button-secondary" onClick={() => navigate('/')}>
              Về trang chủ
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
