import React, { useState, useEffect } from 'react';
import { kpdlAPI } from '../services/api';

// Connection string ẩn - không hiển thị cho user
const DEFAULT_CONNECTION = 'DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost;DATABASE=StudentEatingDW;UID=SA;PWD=Password.1;TrustServerCertificate=yes';

function DWConnectorComponent({ onSuccess, onError, loading, setLoading }) {
     const [connected, setConnected] = useState(false);
     const [connecting, setConnecting] = useState(false);
     const [views, setViews] = useState([]);
     const [tables, setTables] = useState([]);
     const [selectedView, setSelectedView] = useState('');
     const [idColumn, setIdColumn] = useState('respondentID');

     // Auto connect on mount
     useEffect(() => {
          handleConnect();
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     const handleConnect = async () => {
          setConnecting(true);
          setLoading(true);
          try {
               const response = await kpdlAPI.getDWViews(DEFAULT_CONNECTION);
               setViews(response.views || []);
               setTables(response.tables || []);
               setConnected(true);
               // Auto-select vw_KMeans_Input if available
               if (response.views) {
                    const kmeansView = response.views.find(v => v.includes('KMeans'));
                    setSelectedView(kmeansView || response.views[0] || '');
               }
          } catch (err) {
               onError('Không thể kết nối đến SQL Server. Vui lòng kiểm tra server đang chạy.');
          } finally {
               setConnecting(false);
               setLoading(false);
          }
     };

     const handleLoadView = async () => {
          if (!selectedView) {
               onError('Vui lòng chọn một view');
               return;
          }

          setLoading(true);
          try {
               const response = await kpdlAPI.loadDWView(selectedView, idColumn);
               onSuccess({
                    ...response,
                    source: 'dw',
                    viewName: selectedView,
               });
          } catch (err) {
               onError(err.message || 'Load dữ liệu thất bại');
          } finally {
               setLoading(false);
          }
     };

     // Loading state while connecting
     if (connecting) {
          return (
               <div className="card">
                    <div className="connecting-state">
                         <div className="spinner-lg"></div>
                         <h3>Đang kết nối đến Data Warehouse...</h3>
                         <p>StudentEatingDW</p>
                    </div>
               </div>
          );
     }

     // Connection failed state
     if (!connected && !connecting) {
          return (
               <div className="card">
                    <div className="error-state">
                         <span className="error-icon">⚠️</span>
                         <h3>Không thể kết nối</h3>
                         <p>Vui lòng kiểm tra SQL Server đang chạy</p>
                         <button className="btn btn-primary" onClick={handleConnect}>
                              🔄 Thử lại
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="card">
               <h2 className="card-title">
                    Chọn Dữ Liệu Phân Tích
               </h2>

               {/* Database Banner */}
               <div className="db-banner">
                    <div className="db-banner-icon">🗄️</div>
                    <div className="db-banner-info">
                         <strong>StudentEatingDW</strong>
                         <span>Kho dữ liệu khảo sát thói quen ăn uống sinh viên</span>
                    </div>
                    <div className="db-banner-status">
                         <span className="status-dot"></span>
                         Đã kết nối
                    </div>
               </div>

               {/* View Selection */}
               <div className="view-selection">
                    <label>Chọn nguồn dữ liệu:</label>
                    <div className="view-options">
                         {views.map((view) => (
                              <div
                                   key={view}
                                   className={`view-option ${selectedView === view ? 'view-selected' : ''}`}
                                   onClick={() => setSelectedView(view)}
                              >
                                   <span className="view-icon">
                                        {view.includes('KMeans') ? '⭐' : '📊'}
                                   </span>
                                   <div className="view-info">
                                        <strong>{view.replace('dbo.', '')}</strong>
                                        {view.includes('KMeans') && (
                                             <span className="view-badge">Khuyến nghị</span>
                                        )}
                                   </div>
                                   {selectedView === view && (
                                        <span className="view-check">✓</span>
                                   )}
                              </div>
                         ))}
                    </div>
               </div>

               {/* Load Button */}
               <button
                    className="btn btn-primary btn-block btn-lg"
                    onClick={handleLoadView}
                    disabled={loading || !selectedView}
               >
                    {loading ? '⏳ Đang tải dữ liệu...' : '📊 Tải Dữ Liệu & Tiếp Tục'}
               </button>
          </div>
     );
}

export default DWConnectorComponent;
