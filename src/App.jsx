import React, { useState, useEffect, useMemo } from 'react';

/**
 * ARK Analytics - Advanced Interactive Dashboard
 * * Updates:
 * - Deletion Logic: Admin can now delete campaigns and products.
 * - Admin Toggle: Trash icons appear for data management only when logged in as admin.
 * - Real-time Sync: Charts and tables reflect deletions immediately.
 */

const App = () => {
  // --- State ---
  const [activeSummary, setActiveSummary] = useState('Overview');
  const [isSummaryRefreshing, setIsSummaryRefreshing] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [viewMode, setViewMode] = useState('Monthly');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(4);
  const [message, setMessage] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    type: 'Campaign',
    name: '',
    spend: '',
    sales: '',
    category: 'Electronics'
  });

  // Stateful Data
  const [campaigns, setCampaigns] = useState([
    { id: 'C1', name: 'Premium Electronics - Q1', spend: 2510, sales: 12437, acos: 12437, initial: 'E', color: '#FBCFE8' },
    { id: 'C2', name: 'Summer Home Decor', spend: 3320, sales: 11122, acos: 11163, initial: 'H', color: '#FECACA' },
    { id: 'C3', name: 'Outdoor Gear Research', spend: 3614, sales: 10769, acos: 10375, initial: 'O', color: '#D1FAE5' },
    { id: 'C4', name: 'Kitchen Essentials Flash', spend: 3805, sales: 9379, acos: 9914, initial: 'K', color: '#FEF3C7' },
    { id: 'C5', name: 'Smart Home Automation', spend: 4482, sales: 8262, acos: 7055, initial: 'S', color: '#DBEAFE' },
  ]);

  const [products, setProducts] = useState([
    { id: 'P1', name: 'Wireless Headphones Pro', spend: 226674, category: 'Electronics', color: '#7B93FF' },
    { id: 'P2', name: 'Smart Watch Series 5', spend: 185200, category: 'Electronics', color: '#C687FF' },
    { id: 'P3', name: 'Noise Cancelling Buds', spend: 142300, category: 'Electronics', color: '#FF87C4' },
    { id: 'P4', name: 'Bluetooth Speaker XL', spend: 98400, category: 'Outdoor', color: '#E6C600' },
    { id: 'P5', name: 'Smart Home Hub', spend: 85000, category: 'Home', color: '#4ADE80' },
    { id: 'P6', name: 'Kitchen Air Fryer', spend: 72000, category: 'Home', color: '#F87171' },
    { id: 'P7', name: 'Gaming Mouse RGB', spend: 45000, category: 'Electronics', color: '#60A5FA' },
    { id: 'P8', name: 'Portable Projector', spend: 38000, category: 'Electronics', color: '#A78BFA' },
    { id: 'P9', name: 'Ergonomic Desk Chair', spend: 32000, category: 'Home', color: '#FBBF24' },
    { id: 'P10', name: 'Solar Camping Light', spend: 12000, category: 'Outdoor', color: '#34D399' },
  ]);

  const summaryData = [
    { id: 'Overview', label: 'Overview', count: '1,552', color: '#DEE7FF', iconColor: '#7B93FF' },
    { id: 'Campaigns', label: 'Campaigns', count: '2,847', color: '#F1E1FF', iconColor: '#C687FF' },
    { id: 'AdGroup', label: 'Ad Group', count: '1,806', color: '#FFE1F0', iconColor: '#FF87C4' },
    { id: 'Keywords', label: 'Keywords', count: '3,095', color: '#FFF9D4', iconColor: '#E6C600' },
  ];

  // --- Helpers ---
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const showFeedback = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsSummaryRefreshing(true);
    setOpenMenu(null);
    setTimeout(() => {
      setIsSummaryRefreshing(false);
      showFeedback('Data synchronized with server.');
    }, 1500);
  };

  // Auth Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === 'patil123') {
      setIsAdmin(true);
      setPassInput('');
      showFeedback('Admin Access Granted');
    } else {
      showFeedback('Incorrect Password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    showFeedback('Admin Logged Out');
  };

  // Delete Handlers
  const deleteCampaign = (id) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    showFeedback('Campaign Deleted');
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showFeedback('Product Deleted');
  };

  const handleAddData = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.spend || !formData.sales) {
      showFeedback('Please fill all fields');
      return;
    }

    const spendNum = parseFloat(formData.spend);
    const salesNum = parseFloat(formData.sales);
    const randomColor = `hsl(${Math.random() * 360}, 70%, 85%)`;

    if (formData.type === 'Campaign') {
      const newCampaign = {
        id: `C${Date.now()}`,
        name: formData.name,
        spend: spendNum,
        sales: salesNum,
        acos: salesNum > 0 ? (spendNum / salesNum) * 1000 : 0,
        initial: formData.name.charAt(0).toUpperCase(),
        color: randomColor
      };
      setCampaigns([newCampaign, ...campaigns]);
      showFeedback(`Added Campaign: ${formData.name}`);
    } else {
      const newProduct = {
        id: `P${Date.now()}`,
        name: formData.name,
        spend: spendNum,
        category: formData.category,
        color: randomColor
      };
      setProducts([newProduct, ...products]);
      showFeedback(`Added Product: ${formData.name}`);
    }
    setFormData({ ...formData, name: '', spend: '', sales: '' });
  };

  // --- Memoized Logic ---
  const chartData = useMemo(() => {
    if (viewMode === 'Monthly') {
      return [
        { label: 'Jan', val: 4, line: 3.5 }, { label: 'Feb', val: 5, line: 4.2 }, { label: 'Mar', val: 3, line: 3.1 },
        { label: 'Apr', val: 7, line: 6.5 }, { label: 'May', val: 6, line: 5.8 }, { label: 'Jun', val: 8, line: 7.2 },
        { label: 'Jul', val: 5, line: 4.8 }, { label: 'Aug', val: 2.5, line: 2.2 }, { label: 'Sep', val: 4, line: 3.8 },
        { label: 'Oct', val: 6, line: 5.5 }, { label: 'Nov', val: 7.2, line: 6.8 }, { label: 'Dec', val: 5, line: 4.6 }
      ];
    } else {
      return [
        { label: '2021', val: 3.2, line: 2.8 }, { label: '2022', val: 5.5, line: 5.0 }, 
        { label: '2023', val: 7.8, line: 7.1 }, { label: '2024', val: 4.2, line: 3.9 }, 
        { label: '2025', val: 6.5, line: 6.1 }
      ];
    }
  }, [viewMode]);

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      return sortOrder === 'desc' ? b.acos - a.acos : a.acos - b.acos;
    });
  }, [campaigns, sortOrder]);

  const filteredProducts = useMemo(() => {
    let list = selectedCategory === 'All' 
      ? products 
      : products.filter(p => p.category === selectedCategory);
    return list.slice(0, visibleCount);
  }, [products, selectedCategory, visibleCount]);

  const totalFilteredSpend = useMemo(() => {
    return filteredProducts.reduce((acc, curr) => acc + curr.spend, 0);
  }, [filteredProducts]);

  const generateRadialPaths = () => {
    let currentAngle = 180;
    const top5 = products.slice(0, 5);
    const total = top5.reduce((a, b) => a + b.spend, 0);
    const radius = 80;
    const cx = 100;
    const cy = 100;

    return top5.map((p) => {
      const percentage = p.spend / total;
      const angleSize = percentage * 180;
      const startAngle = currentAngle;
      const endAngle = currentAngle - angleSize;
      currentAngle = endAngle;

      const x1 = cx + radius * Math.cos(startAngle * Math.PI / 180);
      const y1 = cy - radius * Math.sin(startAngle * Math.PI / 180);
      const x2 = cx + radius * Math.cos(endAngle * Math.PI / 180);
      const y2 = cy - radius * Math.sin(endAngle * Math.PI / 180);

      const largeArcFlag = angleSize > 180 ? 1 : 0;

      return (
        <path 
          key={p.id}
          d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`}
          fill="none"
          stroke={p.color}
          strokeWidth="25"
          strokeLinecap="round"
        />
      );
    });
  };

  const styles = `
    .dashboard-container { background-color: #E0F2F7; min-height: 100vh; padding: 40px; font-family: 'Inter', sans-serif, system-ui; display: flex; flex-direction: column; align-items: center; }
    
    .brand-header { width: 100%; max-width: 1200px; margin-bottom: 30px; display: flex; align-items: center; gap: 15px; }
    .brand-logo { width: 40px; height: 40px; background: #333; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; }
    .brand-name { font-size: 24px; font-weight: 800; color: #333; letter-spacing: -0.5px; }

    .toast-msg { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 12px 24px; border-radius: 30px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    
    .dashboard-layout { display: flex; flex-direction: column; gap: 25px; max-width: 1200px; width: 100%; }
    .main-grid { display: grid; grid-template-columns: repeat(2, 1fr); grid-gap: 25px; width: 100%; }
    
    .card { background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); position: relative; overflow: hidden; display: flex; flex-direction: column; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    
    .form-group { margin-bottom: 15px; }
    .form-label { display: block; font-size: 11px; font-weight: 700; color: #94A3B8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid #F1F5F9; font-size: 14px; transition: all 0.2s; box-sizing: border-box; background: #F8FAFC; }
    .form-input:focus { border-color: #7B93FF; outline: none; background: #FFF; }
    .form-select { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid #F1F5F9; background: #F8FAFC; font-size: 14px; cursor: pointer; }
    .submit-btn { width: 100%; background: #333; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 10px; }
    .submit-btn:hover { background: #000; }
    .logout-btn { background: #FEE2E2; color: #EF4444; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .logout-btn:hover { background: #FECACA; }

    .dots-menu-btn { cursor: pointer; padding: 5px; border-radius: 50%; transition: background 0.2s; position: relative; border: none; background: transparent; color: #BBB; font-size: 18px; line-height: 1; }
    .dots-menu-btn:hover { background: #f0f0f0; }
    .dropdown-menu { position: absolute; top: 35px; right: 0; background: white; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); z-index: 100; min-width: 180px; padding: 8px 0; }
    .dropdown-item { padding: 10px 16px; font-size: 13px; cursor: pointer; color: #444; display: flex; justify-content: space-between; align-items: center; }
    .dropdown-item:hover { background: #f8f9fa; color: #000; }

    .summary-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-radius: 16px; cursor: pointer; margin-bottom: 12px; transition: all 0.2s ease; border: 1.5px solid transparent; }
    .summary-item:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0,0.08); filter: brightness(1.02); }
    .summary-item.active { border-color: #333; transform: scale(1.03); }
    
    .product-list { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; width: 100%; max-height: 250px; overflow-y: auto; padding-right: 5px; }
    .product-item { display: flex; align-items: center; justify-content: space-between; padding: 10px; border-radius: 12px; cursor: pointer; font-size: 13px; border: 1px solid transparent; transition: background 0.2s; }
    .product-item:hover { background: #f9f9f9; border-color: #eee; }
    
    .clickable-val { cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: 0.2s; font-size: 13px; }
    .clickable-val:hover { background: #f0f0f0; color: #7B93FF; }

    .delete-btn { background: transparent; border: none; color: #EF4444; opacity: 0.5; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px; transition: all 0.2s; }
    .delete-btn:hover { opacity: 1; background: #FEE2E2; }

    .chart-scroll-wrapper { width: 100%; overflow-x: auto; padding-bottom: 10px; margin-top: auto; position: relative; }
    .chart-viewport { min-width: 500px; height: 180px; display: flex; align-items: flex-end; justify-content: space-between; position: relative; padding: 0 30px 30px 50px; }
    
    .bar-col { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; min-width: 40px; position: relative; z-index: 2; cursor: pointer; }
    .bar-main { width: 16px; background: #9381FF; border-radius: 4px; position: relative; transition: height 0.3s ease; }
    .bar-bg { position: absolute; bottom: 0; width: 100%; height: 140px; background: #9381FF; opacity: 0.08; border-radius: 4px; }
    .chart-label { font-size: 10px; color: #999; white-space: nowrap; font-weight: 500; }

    .y-axis { position: absolute; left: 0; top: 0; bottom: 30px; display: flex; flex-direction: column-reverse; justify-content: space-between; font-size: 10px; color: #CCC; padding: 5px 15px; z-index: 1; border-right: 1px solid #F5F5F5; }

    .refresh-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 200; flex-direction: column; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #7B93FF; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin-bottom: 10px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .admin-form-row { display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 20px; align-items: end; }
    @media (max-width: 800px) { .admin-form-row { grid-template-columns: 1fr; } }

    @media (max-width: 1000px) {
      .main-grid { grid-template-columns: 1fr; }
    }
  `;

  return (
    <div className="dashboard-container" onClick={() => setOpenMenu(null)}>
      <style>{styles}</style>
      
      {message && <div className="toast-msg">{message}</div>}

      <header className="brand-header">
        <div className="brand-logo">A</div>
        <h1 className="brand-name">ARK Analytics</h1>
      </header>

      <div className="dashboard-layout">
        
        <div className="main-grid">
          
          <div className="card">
            {isSummaryRefreshing && (
              <div className="refresh-overlay">
                <div className="spinner"></div>
                <span style={{fontSize: '12px', color: '#666', fontWeight: 500}}>Refreshing...</span>
              </div>
            )}
            <div className="card-header">
              <h2 style={{fontSize: '18px', fontWeight: 600}}>Summary</h2>
              <button 
                className="dots-menu-btn" 
                onClick={(e) => { e.stopPropagation(); setOpenMenu('summary'); }}
              >
                •••
                {openMenu === 'summary' && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={handleRefresh}>Actual Refresh</div>
                    <div className="dropdown-item" onClick={() => showFeedback('Downloading PDF Report...')}>Export PDF</div>
                  </div>
                )}
              </button>
            </div>
            <div className="summary-list">
              {summaryData.map((item) => (
                <div 
                  key={item.id}
                  className={`summary-item ${activeSummary === item.label ? 'active' : ''}`}
                  style={{ backgroundColor: item.color }}
                  onClick={() => setActiveSummary(item.label)}
                >
                  <div style={{display:'flex', alignItems:'center', gap: '12px'}}>
                    <div style={{width: 8, height: 8, borderRadius: '50%', background: item.iconColor}}></div>
                    <span style={{fontWeight: 600, color: '#444'}}>{item.label}</span>
                  </div>
                  <span style={{fontWeight: 700, color: '#222'}}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 style={{fontSize: '18px', fontWeight: 600}}>Top 5 products by spend</h2>
              <button 
                className="dots-menu-btn" 
                onClick={(e) => { e.stopPropagation(); setOpenMenu('products'); }}
              >
                •••
                {openMenu === 'products' && (
                  <div className="dropdown-menu">
                    <div style={{padding: '5px 16px', fontSize: '11px', color: '#999', fontWeight: 600}}>CATEGORY</div>
                    <div className="dropdown-item" onClick={() => setSelectedCategory('All')}>All Categories {selectedCategory === 'All' && '✓'}</div>
                    <div className="dropdown-item" onClick={() => setSelectedCategory('Electronics')}>Electronics {selectedCategory === 'Electronics' && '✓'}</div>
                    <div className="dropdown-item" onClick={() => setSelectedCategory('Home')}>Home {selectedCategory === 'Home' && '✓'}</div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => { setVisibleCount(10); showFeedback('Showing all products'); }}>View All (10)</div>
                    <div className="dropdown-item" onClick={() => { setVisibleCount(4); showFeedback('Reset to Top 4'); }}>Reset Top 4</div>
                  </div>
                )}
              </button>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
              <div style={{marginBottom: 10, fontSize: '28px', fontWeight: 800}}>{formatINR(totalFilteredSpend)}</div>
              <div style={{width: '260px', height: '130px', position:'relative'}}>
                <svg viewBox="0 0 200 100" width="100%">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F1F5F9" strokeWidth="25" />
                  {generateRadialPaths()}
                </svg>
              </div>
              <div className="product-list">
                 {filteredProducts.map(p => (
                   <div key={p.id} className="product-item">
                      <div style={{display:'flex', alignItems:'center', gap: '8px', overflow:'hidden', flex: 1}}>
                        <div style={{minWidth: 8, height: 8, borderRadius: '50%', background: p.color}}></div>
                        <span style={{whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>{p.name}</span>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap: '15px'}}>
                        <span style={{fontWeight: 600}}>{formatINR(p.spend)}</span>
                        {isAdmin && (
                          <button 
                            className="delete-btn" 
                            title="Delete Product"
                            onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="card" style={{gridColumn: 'span 2'}}>
            <div className="card-header">
              <h2 style={{fontSize: '18px', fontWeight: 600}}>Highest ACoS campaigns</h2>
              <button 
                className="dots-menu-btn" 
                onClick={(e) => { e.stopPropagation(); setOpenMenu('campaigns'); }}
              >
                •••
                {openMenu === 'campaigns' && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => { setSortOrder('desc'); showFeedback('Sorted: High to Low'); }}>Sort: High ACoS</div>
                    <div className="dropdown-item" onClick={() => { setSortOrder('asc'); showFeedback('Sorted: Low to High'); }}>Sort: Low ACoS</div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => showFeedback('Downloading CSV...')}>Download CSV</div>
                  </div>
                )}
              </button>
            </div>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{textAlign: 'left', color: '#888', fontSize: '11px', textTransform: 'uppercase'}}>
                  <th style={{paddingBottom: '12px'}}>Campaign</th>
                  <th>Spend</th>
                  <th>Sales</th>
                  <th style={{color: '#7B93FF', cursor:'pointer'}} onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                    ACoS {sortOrder === 'desc' ? '↓' : '↑'}
                  </th>
                  {isAdmin && <th style={{width: '40px'}}></th>}
                </tr>
              </thead>
              <tbody>
                {sortedCampaigns.map((row) => (
                  <tr key={row.id} style={{borderTop: '1px solid #f8f8f8'}}>
                    <td style={{padding: '12px 0'}}>
                      <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
                        <div style={{ backgroundColor: row.color, minWidth: '28px', height: '28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'bold' }}>{row.initial}</div>
                        <span style={{fontSize: '13px', fontWeight: 500}}>{row.name}</span>
                      </div>
                    </td>
                    <td><span className="clickable-val" onClick={() => showFeedback(`Spend: ${formatINR(row.spend)}`)}>{formatINR(row.spend)}</span></td>
                    <td><span className="clickable-val" onClick={() => showFeedback(`Sales: ${formatINR(row.sales)}`)}>{formatINR(row.sales)}</span></td>
                    <td><span className="clickable-val" style={{fontWeight: 700}} onClick={() => showFeedback(`ACoS: ${formatINR(row.acos)}`)}>{formatINR(row.acos)}</span></td>
                    {isAdmin && (
                      <td style={{textAlign: 'right'}}>
                        <button 
                          className="delete-btn" 
                          title="Delete Campaign"
                          onClick={() => deleteCampaign(row.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{gridColumn: 'span 2'}}>
            <div className="card-header">
              <h2 style={{fontSize: '18px', fontWeight: 600}}>ACoS vs TACoS</h2>
              <button 
                className="dots-menu-btn" 
                onClick={(e) => { e.stopPropagation(); setOpenMenu('graph'); }}
              >
                •••
                {openMenu === 'graph' && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => { setViewMode('Monthly'); showFeedback('View: Monthly'); }}>Switch to Monthly</div>
                    <div className="dropdown-item" onClick={() => { setViewMode('Yearly'); showFeedback('View: Yearly'); }}>Switch to Yearly</div>
                  </div>
                )}
              </button>
            </div>
            <div className="chart-scroll-wrapper">
              <div className="chart-viewport" style={{ minWidth: viewMode === 'Monthly' ? '650px' : '450px' }}>
                <div className="y-axis">
                  <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span>
                </div>
                {chartData.map((d, i) => (
                  <div key={i} className="bar-col" onClick={() => showFeedback(`${d.label}: ${d.val}%`)}>
                    <div className="bar-main" style={{ height: `${d.val * 15}px` }}><div className="bar-bg"></div></div>
                    <span className="chart-label">{d.label}</span>
                  </div>
                ))}
                <svg style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents:'none', zIndex: 3}}>
                  {chartData.map((d, i) => {
                    if (i === chartData.length - 1) return null;
                    const x1 = ((i + 0.5) / chartData.length) * 100 + 4.5; 
                    const y1 = 100 - (d.line * 10) - 15;
                    const x2 = ((i + 1.5) / chartData.length) * 100 + 4.5;
                    const y2 = 100 - (chartData[i+1].line * 10) - 15;
                    return (
                      <g key={i}>
                        <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#333" strokeWidth="2" strokeLinecap="round" />
                        <circle cx={`${x1}%`} cy={`${y1}%`} r="3.5" fill="#FFF" stroke="#333" strokeWidth="2" style={{pointerEvents: 'auto', cursor:'pointer'}} />
                        {i === chartData.length - 2 && <circle cx={`${x2}%`} cy={`${y2}%`} r="3.5" fill="#FFF" stroke="#333" strokeWidth="2" />}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Admin Portal */}
        <section className="card">
          {!isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{fontSize: '24px'}}>🔒</div>
                <div style={{textAlign: 'left'}}>
                  <h2 style={{fontSize: '16px', fontWeight: 600, margin: 0}}>Admin Portal</h2>
                  <p style={{fontSize: '12px', color: '#64748B', margin: 0}}>Enter 'patil123' to manage data</p>
                </div>
              </div>
              
              <form onSubmit={handleLogin} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="password"
                  className="form-input" 
                  style={{ width: '200px' }}
                  placeholder="Password" 
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                />
                <button type="submit" className="submit-btn" style={{ marginTop: 0, width: 'auto', padding: '10px 20px' }}>Unlock</button>
              </form>
            </div>
          ) : (
            <>
              <div className="card-header">
                <h2 style={{fontSize: '18px', fontWeight: 600}}>Quick Add Data</h2>
                <button className="logout-btn" onClick={handleLogout}>Exit Admin Mode</button>
              </div>
              <form onSubmit={handleAddData}>
                <div className="admin-form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select 
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Campaign">New Campaign</option>
                      <option value="Product">New Product</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input 
                      className="form-input" 
                      placeholder="Enter name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Spend (INR)</label>
                    <input 
                      type="number"
                      className="form-input" 
                      placeholder="0" 
                      value={formData.spend}
                      onChange={(e) => setFormData({...formData, spend: e.target.value})}
                    />
                  </div>
                </div>

                <div className="admin-form-row" style={{ marginTop: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Sales (INR)</label>
                    <input 
                      type="number"
                      className="form-input" 
                      placeholder="0" 
                      value={formData.sales}
                      onChange={(e) => setFormData({...formData, sales: e.target.value})}
                    />
                  </div>

                  {formData.type === 'Product' && (
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select 
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Home">Home</option>
                        <option value="Outdoor">Outdoor</option>
                      </select>
                    </div>
                  )}

                  <button type="submit" className="submit-btn" style={{ marginBottom: '15px' }}>
                    Push to Analytics
                  </button>
                </div>
              </form>
            </>
          )}
        </section>

      </div>
    </div>
  );
};

export default App;