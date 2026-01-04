import React from 'react';

// Tạo tên nhóm động dựa trên số thứ tự và đặc điểm
const CLUSTER_COLORS = ['#48bb78', '#ecc94b', '#f56565', '#4299e1', '#9f7aea', '#ed64a6'];
const CLUSTER_EMOJIS = ['🟢', '🟡', '🔴', '🔵', '🟣', '🟠'];

// Generate cluster names based on order (sorted by size)
function getClusterLabel(index, total) {
     if (total === 2) {
          return index === 0 ? 'Nhóm chính' : 'Nhóm phụ';
     }
     if (total === 3) {
          const labels = ['Nhóm lớn nhất', 'Nhóm trung bình', 'Nhóm nhỏ nhất'];
          return labels[index] || `Nhóm ${index + 1}`;
     }
     return `Nhóm ${index + 1}`;
}

function ClusterReportComponent({ stats, metrics }) {
     const k = metrics?.k || Object.keys(stats).length;
     const totalSamples = Object.values(stats).reduce((sum, c) => sum + c.size, 0);

     // Sort clusters by size (descending)
     const sortedClusters = Object.entries(stats)
          .map(([id, data]) => ({ id: parseInt(id), ...data }))
          .sort((a, b) => b.size - a.size);

     return (
          <div className="cluster-report">
               {/* Header */}
               <div className="report-header">
                    <h2>📊 Báo Cáo Phân Tích {k} Nhóm Sinh Viên</h2>
                    <p>Dựa trên Khai Phá Dữ Liệu K-Means Clustering</p>
               </div>

               {/* Summary */}
               <div className="report-summary">
                    <div className="summary-item">
                         <span className="summary-value">{totalSamples}</span>
                         <span className="summary-label">Sinh viên</span>
                    </div>
                    <div className="summary-item">
                         <span className="summary-value">{k}</span>
                         <span className="summary-label">Nhóm</span>
                    </div>
                    <div className="summary-item">
                         <span className="summary-value">{(metrics?.silhouette_score * 100 || 0).toFixed(0)}%</span>
                         <span className="summary-label">Silhouette</span>
                    </div>
               </div>

               {/* Overview Table */}
               <div className="report-table">
                    <table>
                         <thead>
                              <tr>
                                   <th>Nhóm</th>
                                   <th>Số lượng</th>
                                   <th>Tỷ lệ</th>
                                   <th>Phân bố</th>
                              </tr>
                         </thead>
                         <tbody>
                              {sortedClusters.map((cluster, index) => (
                                   <tr key={cluster.id}>
                                        <td>
                                             <span style={{ marginRight: '8px' }}>{CLUSTER_EMOJIS[index % CLUSTER_EMOJIS.length]}</span>
                                             <strong>{getClusterLabel(index, k)}</strong>
                                        </td>
                                        <td>{cluster.size} SV</td>
                                        <td>{cluster.percentage.toFixed(1)}%</td>
                                        <td>
                                             <div className="mini-bar">
                                                  <div
                                                       className="mini-bar-fill"
                                                       style={{
                                                            width: `${cluster.percentage}%`,
                                                            backgroundColor: CLUSTER_COLORS[index % CLUSTER_COLORS.length]
                                                       }}
                                                  ></div>
                                             </div>
                                        </td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>

               {/* Cluster Cards */}
               <h3 className="section-title">📋 Chi Tiết Từng Nhóm</h3>

               <div className="cluster-cards">
                    {sortedClusters.map((cluster, index) => {
                         const color = CLUSTER_COLORS[index % CLUSTER_COLORS.length];
                         const emoji = CLUSTER_EMOJIS[index % CLUSTER_EMOJIS.length];

                         // Find top 5 highest and lowest features
                         const features = cluster.features || [];
                         const means = cluster.mean || [];
                         const featureData = features.map((f, i) => ({ name: f, value: means[i] || 0 }));
                         const sortedFeatures = [...featureData].sort((a, b) => b.value - a.value);
                         const highFeatures = sortedFeatures.slice(0, 3).filter(f => f.value > 0.3);
                         const lowFeatures = sortedFeatures.slice(-3).filter(f => f.value < -0.3);

                         return (
                              <div
                                   key={cluster.id}
                                   className="cluster-card-v2"
                                   style={{ borderLeftColor: color }}
                              >
                                   <div className="card-header-v2">
                                        <span className="card-emoji">{emoji}</span>
                                        <div className="card-info">
                                             <h4>{getClusterLabel(index, k)}</h4>
                                             <span className="card-meta">{cluster.size} sinh viên • {cluster.percentage.toFixed(1)}%</span>
                                        </div>
                                   </div>

                                   <div className="card-body-v2">
                                        {highFeatures.length > 0 && (
                                             <div className="feature-group">
                                                  <span className="feature-label positive">Đặc điểm cao:</span>
                                                  <div className="feature-tags">
                                                       {highFeatures.map(f => (
                                                            <span key={f.name} className="tag tag-positive">{f.name}</span>
                                                       ))}
                                                  </div>
                                             </div>
                                        )}

                                        {lowFeatures.length > 0 && (
                                             <div className="feature-group">
                                                  <span className="feature-label negative">Đặc điểm thấp:</span>
                                                  <div className="feature-tags">
                                                       {lowFeatures.map(f => (
                                                            <span key={f.name} className="tag tag-negative">{f.name}</span>
                                                       ))}
                                                  </div>
                                             </div>
                                        )}

                                        {highFeatures.length === 0 && lowFeatures.length === 0 && (
                                             <p className="no-features">Các đặc điểm gần mức trung bình</p>
                                        )}
                                   </div>
                              </div>
                         );
                    })}
               </div>

               {/* Quality Metrics */}
               <div className="quality-box">
                    <h4>📈 Chất Lượng Phân Cụm</h4>
                    <div className="quality-metrics">
                         <div className="quality-item">
                              <span className="quality-name">Silhouette Score</span>
                              <span className="quality-value">{(metrics?.silhouette_score || 0).toFixed(3)}</span>
                              <span className={`quality-badge ${metrics?.silhouette_score >= 0.25 ? 'good' : 'weak'}`}>
                                   {metrics?.silhouette_score >= 0.5 ? 'Tốt' : metrics?.silhouette_score >= 0.25 ? 'TB' : 'Yếu'}
                              </span>
                         </div>
                         <div className="quality-item">
                              <span className="quality-name">Davies-Bouldin</span>
                              <span className="quality-value">{(metrics?.davies_bouldin_index || 0).toFixed(2)}</span>
                              <span className={`quality-badge ${metrics?.davies_bouldin_index < 2 ? 'good' : 'weak'}`}>
                                   {metrics?.davies_bouldin_index < 1 ? 'Tốt' : metrics?.davies_bouldin_index < 2 ? 'TB' : 'Yếu'}
                              </span>
                         </div>
                    </div>
                    {metrics?.silhouette_score < 0.25 && (
                         <p className="quality-note">
                              💡 Silhouette thấp là bình thường với dữ liệu khảo sát (survey data)
                         </p>
                    )}
               </div>
          </div>
     );
}

export default ClusterReportComponent;
