import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, davies_bouldin_score

class KMeansEngine:
    def __init__(self):
        self.model = None
        self.labels = None
        self.centroids = None
        self.silhouette = None
        self.db_index = None
        self.pca_model = None
        self.pca_points = None

    def auto_select_k(self, X, k_range=(2, 5)):
        """Auto-select K using Silhouette Score"""
        best_k = 2
        best_score = -1
        scores = {}

        for k in range(k_range[0], k_range[1] + 1):
            kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
            labels = kmeans.fit_predict(X)
            score = silhouette_score(X, labels)
            scores[k] = score

            if score > best_score:
                best_score = score
                best_k = k

        return best_k, scores

    def fit(self, X, k):
        """Fit K-means model"""
        self.model = KMeans(n_clusters=k, n_init=10, random_state=42)
        self.labels = self.model.fit_predict(X)
        self.centroids = self.model.cluster_centers_
        
        # Calculate metrics
        self.silhouette = float(silhouette_score(X, self.labels))
        self.db_index = float(davies_bouldin_score(X, self.labels))
        
        # PCA for visualization
        pca = PCA(n_components=2)
        self.pca_points = pca.fit_transform(X)
        self.pca_model = pca

        return {
            "k": k,
            "silhouette_score": self.silhouette,
            "davies_bouldin_index": self.db_index,
            "status": "success"
        }

    def get_results(self):
        """Get clustering results"""
        if self.labels is None:
            return None

        pca_data = [
            {
                "x": float(self.pca_points[i, 0]),
                "y": float(self.pca_points[i, 1]),
                "label": int(self.labels[i])
            }
            for i in range(len(self.labels))
        ]

        centroids_data = [
            {
                "id": int(i),
                "x": float(self.pca_model.transform([self.centroids[i]])[0, 0]),
                "y": float(self.pca_model.transform([self.centroids[i]])[0, 1])
            }
            for i in range(len(self.centroids))
        ]

        return {
            "labels": self.labels.tolist(),
            "centroids": self.centroids.tolist(),
            "pca_points": pca_data,
            "centroid_positions": centroids_data,
            "metrics": {
                "silhouette": self.silhouette,
                "davies_bouldin": self.db_index
            }
        }

    def get_cluster_statistics(self, X, feature_names):
        """Get statistics per cluster"""
        if self.labels is None:
            return None

        stats = {}
        for cluster_id in range(len(self.centroids)):
            mask = self.labels == cluster_id
            cluster_data = X[mask]

            stats[cluster_id] = {
                "size": int(np.sum(mask)),
                "percentage": float(np.sum(mask) / len(self.labels) * 100),
                "centroid": self.centroids[cluster_id].tolist(),
                "mean": cluster_data.mean(axis=0).tolist(),
                "std": cluster_data.std(axis=0).tolist(),
                "features": feature_names
            }

        return stats
