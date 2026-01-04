import React, { useEffect, useState, useCallback } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { kpdlAPI } from '../services/api';

const COLORS = ['#48bb78', '#ecc94b', '#f56565', '#4299e1', '#9f7aea', '#ed64a6'];
const EMOJIS = ['🟢', '🟡', '🔴', '🔵', '🟣', '🟠'];

// Tên nhóm mặc định cho K=3 (sinh viên thường có 3 nhóm)
const GROUP_NAMES_K3 = [
     { name: 'Lối sống lành mạnh', desc: 'Ăn uống cân đối, quan tâm dinh dưỡng' },
     { name: 'Vận động cao, ăn chưa điều độ', desc: 'Tập thể dục nhiều nhưng ít rau quả' },
     { name: 'Lối sống thụ động', desc: 'Ít vận động, phụ thuộc người khác nấu' }
];

function AnalysisComponent({ kmeansResult, onReset, loading, setLoading }) {
     const [activeTab, setActiveTab] = useState('report'); // 'report' or 'chart'
     const [conclusion, setConclusion] = useState(null);
     const [conclusionLoading, setConclusionLoading] = useState(false);
     const [savingToDW, setSavingToDW] = useState(false);
     const [savedToDW, setSavedToDW] = useState(false);

     const loadConclusion = useCallback(async () => {
          setConclusionLoading(true);
          try {
               const data = await kpdlAPI.getConclusion();
               setConclusion(data.conclusions);
          } catch (err) {
               console.error('Failed to load conclusion:', err);
          } finally {
               setConclusionLoading(false);
          }
     }, []);

     useEffect(() => {
          if (!conclusion && !conclusionLoading) {
               loadConclusion();
          }
     }, [conclusion, conclusionLoading, loadConclusion]);

     const handleSaveToDW = async () => {
          setSavingToDW(true);
          try {
               await kpdlAPI.saveClusters('Fact_Clustering_Result');
               setSavedToDW(true);
          } catch (err) {
               console.error('Save to DW failed:', err);
               alert('Lưu về DW thất bại: ' + err.message);
          } finally {
               setSavingToDW(false);
          }
     };

     const stats = kmeansResult?.statistics || {};
     const metrics = kmeansResult?.fit_info || {};
     const pca = kmeansResult?.clustering?.pca_points || [];
     const k = metrics?.k || Object.keys(stats).length;
     const totalSamples = Object.values(stats).reduce((sum, c) => sum + c.size, 0);

     // Sort clusters by size (descending)
     const sortedClusters = Object.entries(stats)
          .map(([id, data]) => ({ id: parseInt(id), ...data }))
          .sort((a, b) => b.size - a.size);

     // Get group name based on index
     const getGroupName = (index) => {
          if (k === 3 && GROUP_NAMES_K3[index]) {
               return GROUP_NAMES_K3[index];
          }
          return { name: `Nhóm ${index + 1}`, desc: '' };
     };

     if (conclusionLoading) {
          return (
               <div className="card">
                    <div className="loading-center">
                         <div className="spinner-lg"></div>
                         <h3>Đang phân tích kết quả...</h3>
                    </div>
               </div>
          );
     }

     return (
          <div className="analysis-page">
               {/* Tab Navigation */}
               <div className="analysis-tabs">
                    <button
                         className={`analysis-tab ${activeTab === 'report' ? 'active' : ''}`}
                         onClick={() => setActiveTab('report')}
                    >
                         📋 Báo Cáo
                    </button>
                    <button
                         className={`analysis-tab ${activeTab === 'chart' ? 'active' : ''}`}
                         onClick={() => setActiveTab('chart')}
                    >
                         📈 Biểu Đồ
                    </button>
               </div>

               {/* TAB 1: REPORT */}
               {activeTab === 'report' && (
                    <>
                         {/* Report Header */}
                         <div className="report-hero">
                              <h1>📊 Báo Cáo Phân Tích {k} Nhóm Sinh Viên</h1>
                              <p>Dựa trên Khai Phá Dữ Liệu K-Means Clustering</p>
                         </div>

                         {/* Overview Section */}
                         <div className="report-section">
                              <h2>1. Tổng Quan</h2>
                              <div className="overview-grid">
                                   <div className="overview-item">
                                        <span className="overview-label">Tổng số sinh viên</span>
                                        <span className="overview-value">{totalSamples} người</span>
                                   </div>
                                   <div className="overview-item">
                                        <span className="overview-label">Phương pháp</span>
                                        <span className="overview-value">K-Means (K={k})</span>
                                   </div>
                                   <div className="overview-item">
                                        <span className="overview-label">Nguồn dữ liệu</span>
                                        <span className="overview-value">SQL Server DW</span>
                                   </div>
                              </div>
                         </div>

                         {/* Results Table */}
                         <div className="report-section">
                              <h2>2. Kết Quả Phân Cụm</h2>
                              <div className="results-table-wrapper">
                                   <table className="results-table">
                                        <thead>
                                             <tr>
                                                  <th>Nhóm</th>
                                                  <th>Số lượng</th>
                                                  <th>Tỷ lệ</th>
                                                  <th>Mô tả</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {sortedClusters.map((cluster, index) => {
                                                  const groupInfo = getGroupName(index);
                                                  return (
                                                       <tr key={cluster.id}>
                                                            <td>
                                                                 <span className="group-emoji">{EMOJIS[index]}</span>
                                                                 <strong>{groupInfo.name}</strong>
                                                            </td>
                                                            <td>{cluster.size} SV</td>
                                                            <td>{cluster.percentage.toFixed(1)}%</td>
                                                            <td>{groupInfo.desc}</td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                   </table>
                              </div>
                         </div>

                         {/* Detailed Analysis */}
                         <div className="report-section">
                              <h2>3. Phân Tích Chi Tiết Từng Nhóm</h2>

                              {sortedClusters.map((cluster, index) => {
                                   const groupInfo = getGroupName(index);
                                   const color = COLORS[index];
                                   const conclusionCluster = conclusion?.clusters?.find(c => c.cluster_id === cluster.id);

                                   // Get features
                                   const features = cluster.features || [];
                                   const means = cluster.mean || [];
                                   const highFeatures = features
                                        .map((f, i) => ({ name: f, value: means[i] || 0 }))
                                        .filter(f => f.value > 0.3)
                                        .slice(0, 5);
                                   const lowFeatures = features
                                        .map((f, i) => ({ name: f, value: means[i] || 0 }))
                                        .filter(f => f.value < -0.3)
                                        .slice(0, 5);

                                   return (
                                        <div key={cluster.id} className="group-detail-card" style={{ borderColor: color }}>
                                             <div className="group-detail-header" style={{ backgroundColor: color }}>
                                                  <span className="group-emoji-large">{EMOJIS[index]}</span>
                                                  <div>
                                                       <h3>{groupInfo.name}</h3>
                                                       <span>{cluster.percentage.toFixed(1)}% - {cluster.size} sinh viên</span>
                                                  </div>
                                             </div>

                                             <div className="group-detail-body">
                                                  {conclusionCluster && (
                                                       <p className="group-description">{conclusionCluster.description}</p>
                                                  )}

                                                  {highFeatures.length > 0 && (
                                                       <div className="feature-block">
                                                            <h4>✅ Đặc điểm nổi bật:</h4>
                                                            <ul>
                                                                 {highFeatures.map(f => (
                                                                      <li key={f.name}>{f.name}</li>
                                                                 ))}
                                                            </ul>
                                                       </div>
                                                  )}

                                                  {lowFeatures.length > 0 && (
                                                       <div className="feature-block negative">
                                                            <h4>❌ Điểm cần cải thiện:</h4>
                                                            <ul>
                                                                 {lowFeatures.map(f => (
                                                                      <li key={f.name}>{f.name}</li>
                                                                 ))}
                                                            </ul>
                                                       </div>
                                                  )}

                                                  {conclusionCluster?.insights && conclusionCluster.insights.length > 0 && (
                                                       <div className="recommendation-box">
                                                            <strong>💡 Khuyến nghị:</strong> {conclusionCluster.insights.slice(0, 2).join('. ')}
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>

                         {/* Quality Assessment */}
                         <div className="report-section">
                              <h2>4. Đánh Giá Chất Lượng Phân Cụm</h2>
                              <div className="quality-table-wrapper">
                                   <table className="quality-table">
                                        <thead>
                                             <tr>
                                                  <th>Chỉ số</th>
                                                  <th>Giá trị</th>
                                                  <th>Đánh giá</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             <tr>
                                                  <td>Silhouette Score</td>
                                                  <td>{(metrics.silhouette_score || 0).toFixed(3)}</td>
                                                  <td>
                                                       <span className={`quality-tag ${metrics.silhouette_score >= 0.25 ? 'good' : 'weak'}`}>
                                                            {metrics.silhouette_score >= 0.5 ? 'Tốt' : metrics.silhouette_score >= 0.25 ? 'Trung bình' : 'Yếu - Phổ biến với dữ liệu khảo sát'}
                                                       </span>
                                                  </td>
                                             </tr>
                                             <tr>
                                                  <td>Davies-Bouldin Index</td>
                                                  <td>{(metrics.davies_bouldin_index || 0).toFixed(2)}</td>
                                                  <td>
                                                       <span className={`quality-tag ${metrics.davies_bouldin_index < 2 ? 'good' : 'weak'}`}>
                                                            {metrics.davies_bouldin_index < 1 ? 'Tốt' : metrics.davies_bouldin_index < 2 ? 'Trung bình' : 'Có sự chồng lấp giữa các nhóm'}
                                                       </span>
                                                  </td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                              {metrics.silhouette_score < 0.25 && (
                                   <div className="note-box">
                                        <strong>Ghi chú học thuật:</strong> Silhouette thấp với dữ liệu khảo sát là bình thường do nhiều biến categorical và dữ liệu không phân tách tự nhiên. Kết quả vẫn có giá trị phân tích.
                                   </div>
                              )}
                         </div>

                         {/* Conclusion Section */}
                         <div className="report-section conclusion-section">
                              <h2>5. Kết Luận & Kiến Nghị</h2>

                              <div className="conclusion-box">
                                   <h3>🎯 Kết luận chính:</h3>
                                   <div className="conclusion-items">
                                        {sortedClusters.map((cluster, index) => {
                                             const groupInfo = getGroupName(index);
                                             return (
                                                  <div key={cluster.id} className="conclusion-item">
                                                       <span className="conclusion-percent" style={{ color: COLORS[index] }}>
                                                            {cluster.percentage.toFixed(1)}%
                                                       </span>
                                                       <p>sinh viên thuộc nhóm <strong>{groupInfo.name}</strong></p>
                                                  </div>
                                             );
                                        })}
                                   </div>
                              </div>

                              <div className="recommendation-section">
                                   <h3>📝 Kiến nghị:</h3>
                                   <ol className="recommendation-list">
                                        {k === 3 && (
                                             <>
                                                  <li><strong>Với Nhóm Lành Mạnh:</strong> Duy trì và khuyến khích làm gương cho các nhóm khác</li>
                                                  <li><strong>Với Nhóm Vận Động Cao:</strong> Tổ chức workshop về dinh dưỡng thể thao</li>
                                                  <li><strong>Với Nhóm Thụ Động:</strong> Chương trình can thiệp đặc biệt kết hợp vận động + nấu ăn + dinh dưỡng</li>
                                             </>
                                        )}
                                        {k !== 3 && (
                                             <li>Cần phân tích thêm để đưa ra kiến nghị cụ thể cho từng nhóm</li>
                                        )}
                                   </ol>
                              </div>
                         </div>

                         <div className="report-footer">
                              <em>Báo cáo được tạo tự động từ hệ thống KPDL - K-means Processing & Data Learning</em>
                         </div>
                    </>
               )}

               {/* TAB 2: CHART */}
               {activeTab === 'chart' && (
                    <>
                         {/* Metrics Card */}
                         <div className="card">
                              <h2 className="card-title">Chỉ số Phân cụm</h2>
                              <div className="stats-grid">
                                   <div className="stat-box">
                                        <div className="stat-value">{k}</div>
                                        <div className="stat-label">Số cụm (K)</div>
                                   </div>
                                   <div className="stat-box">
                                        <div className="stat-value">{(metrics.silhouette_score * 100).toFixed(1)}%</div>
                                        <div className="stat-label">Silhouette Score</div>
                                   </div>
                                   <div className="stat-box">
                                        <div className="stat-value">{metrics.davies_bouldin_index?.toFixed(2)}</div>
                                        <div className="stat-label">Davies-Bouldin</div>
                                   </div>
                              </div>
                         </div>

                         {/* PCA Chart */}
                         <div className="card">
                              <h2 className="card-title">Biểu đồ PCA 2D</h2>
                              <p className="card-desc">Mỗi điểm là một mẫu dữ liệu, màu sắc thể hiện cụm</p>
                              <div className="chart-container" style={{ height: '400px' }}>
                                   <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis type="number" dataKey="x" name="PC1" />
                                             <YAxis type="number" dataKey="y" name="PC2" />
                                             <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                             <Legend />
                                             {Array.from({ length: k }, (_, i) => (
                                                  <Scatter
                                                       key={i}
                                                       name={`Cụm ${i}`}
                                                       data={pca.filter(p => p.label === i)}
                                                       fill={COLORS[i % COLORS.length]}
                                                  />
                                             ))}
                                        </ScatterChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>

                         {/* Cluster Stats Table */}
                         <div className="card">
                              <h2 className="card-title">Thống kê Chi Tiết</h2>
                              {sortedClusters.map((cluster, index) => (
                                   <div key={cluster.id} className="cluster-detail" style={{ marginBottom: '20px' }}>
                                        <h3 style={{ color: COLORS[index] }}>
                                             Cụm {cluster.id} - {cluster.size} mẫu ({cluster.percentage.toFixed(1)}%)
                                        </h3>
                                        <table className="table table-compact">
                                             <thead>
                                                  <tr>
                                                       <th>Thuộc tính</th>
                                                       <th>Trung bình</th>
                                                       <th>Độ lệch chuẩn</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {cluster.features?.slice(0, 10).map((feature, idx) => (
                                                       <tr key={feature}>
                                                            <td>{feature}</td>
                                                            <td>{(cluster.mean[idx] ?? 0).toFixed(2)}</td>
                                                            <td>{(cluster.std[idx] ?? 0).toFixed(2)}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              ))}
                         </div>
                    </>
               )}

               {/* Actions - Always visible */}
               <div className="action-section">
                    <h3>🎯 Thao Tác</h3>

                    {savedToDW ? (
                         <div className="save-success-banner">
                              <span>✓</span>
                              <div>
                                   <strong>Đã lưu về Data Warehouse!</strong>
                                   <p>Kết quả đã được lưu vào bảng Fact_Clustering_Result</p>
                              </div>
                         </div>
                    ) : (
                         <button
                              className="btn btn-dw btn-block"
                              onClick={handleSaveToDW}
                              disabled={savingToDW}
                         >
                              {savingToDW ? '⏳ Đang lưu...' : '🗄️ Lưu Kết Quả Về Data Warehouse'}
                         </button>
                    )}

                    <button className="btn btn-success btn-block" onClick={onReset} style={{ marginTop: '15px' }}>
                         🔄 Phân Tích Mới
                    </button>
               </div>
          </div>
     );
}

export default AnalysisComponent;
