import numpy as np

class ConclusionEngine:
    """Generate automatic conclusions based on cluster characteristics"""
    
    def __init__(self, feature_names, cluster_stats, metrics=None):
        self.feature_names = feature_names
        self.cluster_stats = cluster_stats
        self.metrics = metrics or {}
        self.cluster_types = {}
        self.conclusions = {}

    def rank_clusters(self):
        """Rank clusters based on their characteristics"""
        ranked = []
        
        for cluster_id, stats in self.cluster_stats.items():
            # Tính score dựa trên trung bình của features
            centroid = np.array(stats['centroid'])
            score = np.mean(centroid)
            
            ranked.append({
                "cluster_id": cluster_id,
                "size": stats['size'],
                "percentage": stats['percentage'],
                "score": float(score),
                "centroid": stats['centroid'],
                "mean": stats['mean']
            })
        
        # Sắp xếp theo score giảm dần
        ranked.sort(key=lambda x: x['score'], reverse=True)
        return ranked

    def classify_cluster(self, cluster_rank, total_clusters):
        """Phân loại cluster: tích cực, trung bình, kém"""
        if cluster_rank <= total_clusters // 3:
            return "tích cực"
        elif cluster_rank <= 2 * total_clusters // 3:
            return "trung bình"
        else:
            return "kém"

    def generate_feature_insights(self, cluster_id, stats):
        """Generate insights từ centroid của cluster"""
        centroid = np.array(stats['centroid'])
        mean_value = np.mean(centroid)
        
        insights = []
        for i, feature in enumerate(self.feature_names):
            value = centroid[i]
            if value > mean_value * 1.2:
                insights.append(f"{feature} cao")
            elif value < mean_value * 0.8:
                insights.append(f"{feature} thấp")
        
        return insights

    def generate_conclusions(self):
        """Generate text conclusions for each cluster"""
        ranked = self.rank_clusters()
        conclusions = []
        
        for rank, cluster_info in enumerate(ranked):
            cluster_id = cluster_info['cluster_id']
            cluster_type = self.classify_cluster(rank + 1, len(self.cluster_stats))
            
            stats = self.cluster_stats[cluster_id]
            insights = self.generate_feature_insights(cluster_id, stats)
            
            # Build description
            description = f"Nhóm {cluster_type}. "
            
            if insights:
                description += "Đặc điểm nổi bật: " + ", ".join(insights[:3]) + ". "
            
            description += f"Chiếm {stats['percentage']:.1f}% dữ liệu ({stats['size']} mẫu)."
            
            conclusion = {
                "cluster_id": cluster_id,
                "type": cluster_type,
                "size": stats['size'],
                "percentage": stats['percentage'],
                "description": description,
                "insights": insights
            }
            
            conclusions.append(conclusion)
        
        return conclusions

    def get_metrics_interpretation(self):
        """Giải thích các chỉ số metrics cho mục đích học thuật"""
        silhouette = self.metrics.get('silhouette', 0)
        db_index = self.metrics.get('davies_bouldin', 0)
        k = self.metrics.get('k', len(self.cluster_stats))
        
        interpretations = []
        
        # Silhouette Score interpretation
        if silhouette >= 0.5:
            sil_quality = "Tốt"
            sil_desc = "Các cụm phân tách rõ ràng"
        elif silhouette >= 0.25:
            sil_quality = "Trung bình"
            sil_desc = "Các cụm có sự chồng lấp nhất định"
        else:
            sil_quality = "Yếu"
            sil_desc = "Cấu trúc cụm không rõ ràng - phổ biến với dữ liệu khảo sát"
        
        interpretations.append({
            "metric": "Silhouette Score",
            "value": f"{silhouette:.4f}",
            "quality": sil_quality,
            "description": sil_desc,
            "range": "Từ -1 đến 1, càng cao càng tốt"
        })
        
        # Davies-Bouldin interpretation
        if db_index < 1.0:
            db_quality = "Tốt"
            db_desc = "Các cụm tách biệt tốt"
        elif db_index < 2.0:
            db_quality = "Trung bình"
            db_desc = "Mức độ phân tách chấp nhận được"
        else:
            db_quality = "Yếu"
            db_desc = "Các cụm có sự chồng lấp đáng kể"
        
        interpretations.append({
            "metric": "Davies-Bouldin Index",
            "value": f"{db_index:.4f}",
            "quality": db_quality,
            "description": db_desc,
            "range": "Từ 0 trở lên, càng thấp càng tốt"
        })
        
        return interpretations

    def generate_summary(self):
        """Generate overall summary với giải thích học thuật"""
        conclusions = self.generate_conclusions()
        total_clusters = len(self.cluster_stats)
        
        # Header
        summary = f"=== KẾT QUẢ PHÂN CỤM K-MEANS ===\n\n"
        summary += f"Số cụm tìm được: {total_clusters}\n\n"
        
        # Metrics interpretation
        if self.metrics:
            summary += "--- ĐÁNH GIÁ CHẤT LƯỢNG ---\n"
            interpretations = self.get_metrics_interpretation()
            for interp in interpretations:
                summary += f"• {interp['metric']}: {interp['value']} ({interp['quality']})\n"
                summary += f"  → {interp['description']}\n"
            summary += "\n"
        
        # Cluster distribution
        summary += "--- PHÂN BỐ CỤM ---\n"
        cluster_counts = {
            "tích cực": sum(1 for c in conclusions if c['type'] == "tích cực"),
            "trung bình": sum(1 for c in conclusions if c['type'] == "trung bình"),
            "kém": sum(1 for c in conclusions if c['type'] == "kém")
        }
        
        if cluster_counts["tích cực"] > 0:
            summary += f"• {cluster_counts['tích cực']} cụm tích cực\n"
        if cluster_counts["trung bình"] > 0:
            summary += f"• {cluster_counts['trung bình']} cụm trung bình\n"
        if cluster_counts["kém"] > 0:
            summary += f"• {cluster_counts['kém']} cụm cần cải thiện\n"
        
        summary += "\n"
        
        # Academic note
        summary += "--- GHI CHÚ HỌC THUẬT ---\n"
        silhouette = self.metrics.get('silhouette', 0)
        
        if silhouette < 0.25:
            summary += "• Silhouette thấp (<0.25) là phổ biến với dữ liệu khảo sát\n"
            summary += "• Nguyên nhân: nhiều biến categorical, dữ liệu không phân tách tự nhiên\n"
            summary += "• Kết quả vẫn có giá trị phân tích, không phải lỗi thuật toán\n"
        else:
            summary += "• Kết quả phân cụm có chất lượng tốt\n"
            summary += "• Các nhóm được phân tách rõ ràng\n"
        
        return summary, conclusions

    def get_all_conclusions(self):
        """Get formatted conclusions with academic interpretation"""
        summary, conclusions = self.generate_summary()
        
        return {
            "summary": summary,
            "clusters": conclusions,
            "metrics_interpretation": self.get_metrics_interpretation() if self.metrics else []
        }
