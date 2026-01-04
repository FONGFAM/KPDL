import React, { useEffect, useState, useCallback } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { kpdlAPI } from '../services/api';
import ClusterReportComponent from './ClusterReportComponent';

const COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea'
];

function ResultsComponent({
    kmeansResult,
    conclusion,
    onConclusion,
    onGoToAnalysis,
    onReset,
    loading,
    setLoading,
}) {
    const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'detail'
    const [exporting, setExporting] = useState(false);
    const [conclusionLoading, setConclusionLoading] = useState(false);

    const handleLoadConclusion = useCallback(async () => {
        setConclusionLoading(true);
        try {
            const data = await kpdlAPI.getConclusion();
            onConclusion(data.conclusions);
        } catch (err) {
            console.error('Failed to load conclusion:', err);
        } finally {
            setConclusionLoading(false);
        }
    }, [onConclusion]);

    useEffect(() => {
        if (!conclusion && !loading && !conclusionLoading) {
            handleLoadConclusion();
        }
    }, [conclusion, loading, conclusionLoading, handleLoadConclusion]);

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const exportData = await kpdlAPI.exportResults();

            const csvRows = [];
            csvRows.push('KPDL Clustering Report');
            csvRows.push('');

            if (exportData.summary) {
                csvRows.push('Summary');
                csvRows.push(`Silhouette Score,${exportData.summary.silhouette_score?.toFixed(4) || 'N/A'}`);
                csvRows.push(`Davies-Bouldin Index,${exportData.summary.davies_bouldin_index?.toFixed(4) || 'N/A'}`);
                csvRows.push(`Number of Clusters,${exportData.summary.n_clusters || 'N/A'}`);
                csvRows.push('');
            }

            csvRows.push('Cluster Details');
            if (exportData.clusters && exportData.clusters.length > 0) {
                const features = exportData.clusters[0].features || [];
                csvRows.push(['Cluster ID', 'Size', 'Percentage', ...features.map(f => `Mean_${f}`), ...features.map(f => `Std_${f}`)].join(','));

                exportData.clusters.forEach(cluster => {
                    const row = [
                        cluster.cluster_id,
                        cluster.size,
                        cluster.percentage?.toFixed(2) + '%',
                        ...cluster.mean.map(v => v?.toFixed(4) || 0),
                        ...cluster.std.map(v => v?.toFixed(4) || 0)
                    ];
                    csvRows.push(row.join(','));
                });
            }

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `kpdl_report_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Xuất báo cáo thất bại: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    const metrics = kmeansResult?.fit_info || {};
    const pca = kmeansResult?.clustering?.pca_points || [];
    const stats = kmeansResult?.statistics || {};

    return (
        <div>
            {/* Tab Navigation */}
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'report' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('report')}
                >
                    📊 Báo cáo
                </button>
                <button
                    className={`tab-btn ${activeTab === 'visualization' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('visualization')}
                >
                    📈 Biểu đồ
                </button>
                <button
                    className={`tab-btn ${activeTab === 'analysis' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    📝 Chi tiết
                </button>
            </div>

            {/* Tab 0: Report */}
            {activeTab === 'report' && (
                <ClusterReportComponent stats={stats} metrics={metrics} />
            )}

            {/* Tab 1: Visualization */}
            {activeTab === 'visualization' && (
                <>
                    {/* Metrics */}
                    <div className="card">
                        <h2 className="card-title">Chỉ số Phân cụm</h2>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <div className="stat-value">{metrics.k}</div>
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

                        {/* Giải thích metrics chi tiết */}
                        <div className="metrics-interpretation">
                            <h4>Giải thích kết quả:</h4>
                            <div className="interpretation-item">
                                <strong>Silhouette Score ({(metrics.silhouette_score * 100).toFixed(1)}%):</strong>
                                {metrics.silhouette_score >= 0.5 ? (
                                    <span className="quality-good"> Tốt - Các cụm phân tách rõ ràng</span>
                                ) : metrics.silhouette_score >= 0.25 ? (
                                    <span className="quality-medium"> Trung bình - Có sự chồng lấp nhất định</span>
                                ) : (
                                    <span className="quality-weak"> Yếu - Phổ biến với dữ liệu khảo sát</span>
                                )}
                            </div>
                            <div className="interpretation-item">
                                <strong>Davies-Bouldin ({metrics.davies_bouldin_index?.toFixed(2)}):</strong>
                                {metrics.davies_bouldin_index < 1 ? (
                                    <span className="quality-good"> Tốt - Các cụm tách biệt rõ</span>
                                ) : metrics.davies_bouldin_index < 2 ? (
                                    <span className="quality-medium"> Trung bình - Chấp nhận được</span>
                                ) : (
                                    <span className="quality-weak"> Yếu - Cần xem xét lại</span>
                                )}
                            </div>
                        </div>

                        {/* Ghi chú học thuật */}
                        {metrics.silhouette_score < 0.25 && (
                            <div className="academic-note">
                                <h4>Ghi chú học thuật</h4>
                                <p>Silhouette Score thấp (&lt;25%) là <strong>bình thường</strong> với dữ liệu khảo sát (survey data). Nguyên nhân:</p>
                                <ul>
                                    <li>Nhiều biến categorical được encode thành số</li>
                                    <li>Dữ liệu không phân tách tự nhiên thành các nhóm rõ ràng</li>
                                    <li>Kích thước mẫu nhỏ</li>
                                </ul>
                                <p>Kết quả <strong>vẫn có giá trị phân tích</strong>, không phải lỗi thuật toán.</p>
                            </div>
                        )}
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
                                    {Array.from({ length: metrics.k || 1 }, (_, i) => (
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

                    {/* Quick Stats Table */}
                    <div className="card">
                        <h2 className="card-title">Tổng quan các Cụm</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Cụm</th>
                                    <th>Số mẫu</th>
                                    <th>Tỉ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(stats).map(([clusterId, clusterStats]) => (
                                    <tr key={clusterId}>
                                        <td>
                                            <span
                                                className="cluster-dot"
                                                style={{ backgroundColor: COLORS[parseInt(clusterId) % COLORS.length] }}
                                            ></span>
                                            Cụm {clusterId}
                                        </td>
                                        <td>{clusterStats.size}</td>
                                        <td>{clusterStats.percentage.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Tab 2: Analysis */}
            {activeTab === 'analysis' && (
                <>
                    {/* Detailed Statistics */}
                    <div className="card">
                        <h2 className="card-title">Chi tiết từng Cụm</h2>
                        {Object.entries(stats).map(([clusterId, clusterStats]) => (
                            <div key={clusterId} className="cluster-detail">
                                <h3 style={{ color: COLORS[parseInt(clusterId) % COLORS.length] }}>
                                    Cụm {clusterId} - {clusterStats.size} mẫu ({clusterStats.percentage.toFixed(1)}%)
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
                                        {clusterStats.features?.map((feature, idx) => (
                                            <tr key={feature}>
                                                <td>{feature}</td>
                                                <td>{(clusterStats.mean[idx] ?? 0).toFixed(2)}</td>
                                                <td>{(clusterStats.std[idx] ?? 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    {/* Conclusions */}
                    {conclusionLoading && (
                        <div className="card">
                            <div className="loading">
                                <div className="spinner"></div>
                                <span>Đang phân tích...</span>
                            </div>
                        </div>
                    )}

                    {conclusion && conclusion.clusters && (
                        <div className="conclusion-card">
                            <div className="conclusion-header-main">
                                <span className="conclusion-icon">🎯</span>
                                <h2>Kết Luận Phân Tích</h2>
                            </div>

                            {/* Cluster Cards */}
                            <div className="conclusion-clusters">
                                {conclusion.clusters.map((cluster, idx) => {
                                    const color = COLORS[cluster.cluster_id % COLORS.length];
                                    const typeEmoji = cluster.type === 'tích cực' ? '🟢' :
                                        cluster.type === 'trung bình' ? '🟡' : '🔴';

                                    return (
                                        <div
                                            key={idx}
                                            className="conclusion-cluster-card"
                                            style={{ borderColor: color }}
                                        >
                                            <div className="cluster-card-top" style={{ backgroundColor: color }}>
                                                <span className="cluster-type-emoji">{typeEmoji}</span>
                                                <div className="cluster-card-title">
                                                    <h4>Cụm {cluster.cluster_id}</h4>
                                                    <span>{cluster.size} sinh viên • {cluster.percentage.toFixed(1)}%</span>
                                                </div>
                                                <span className="cluster-type-badge">{cluster.type.toUpperCase()}</span>
                                            </div>

                                            <div className="cluster-card-body">
                                                <p className="cluster-description">{cluster.description}</p>

                                                {cluster.insights && cluster.insights.length > 0 && (
                                                    <div className="cluster-insights">
                                                        <span className="insights-label">Đặc điểm:</span>
                                                        <div className="insights-tags">
                                                            {cluster.insights.slice(0, 6).map((insight, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`insight-tag ${insight.includes('cao') ? 'positive' : 'negative'}`}
                                                                >
                                                                    {insight}
                                                                </span>
                                                            ))}
                                                            {cluster.insights.length > 6 && (
                                                                <span className="insight-more">+{cluster.insights.length - 6} khác</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Metrics Summary */}
                            {conclusion.metrics_interpretation && (
                                <div className="metrics-summary">
                                    <h4>📊 Đánh Giá Chất Lượng</h4>
                                    <div className="metrics-grid">
                                        {conclusion.metrics_interpretation.map((metric, idx) => (
                                            <div key={idx} className="metric-item">
                                                <span className="metric-name">{metric.metric}</span>
                                                <span className="metric-value">{metric.value}</span>
                                                <span className={`metric-quality ${metric.quality === 'Tốt' ? 'good' : metric.quality === 'Trung bình' ? 'medium' : 'weak'}`}>
                                                    {metric.quality}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Actions - Always visible */}
            <div className="card">
                <h3 style={{ marginBottom: '15px' }}>Tiếp theo</h3>

                <button
                    className="btn btn-primary btn-block btn-lg"
                    onClick={onGoToAnalysis}
                >
                    📊 Xem Báo Cáo Phân Tích →
                </button>

                <div className="btn-group" style={{ marginTop: '15px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleExportCSV}
                        disabled={exporting}
                    >
                        {exporting ? 'Đang xuất...' : '📄 Tải CSV'}
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={onReset}
                    >
                        🔄 Làm lại
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResultsComponent;
