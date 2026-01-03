import React, { useState } from 'react';
import { kpdlAPI } from '../services/api';

function KMeansComponent({ onSuccess, onError, loading, setLoading }) {
    const [useAutoK, setUseAutoK] = useState(true);
    const [k, setK] = useState(3);

    const handleRunKMeans = async (e) => {
        e.preventDefault();

        if (!useAutoK && (k < 2 || k > 10)) {
            onError('K phải nằm trong khoảng từ 2 đến 10');
            return;
        }

        setLoading(true);
        try {
            const response = await kpdlAPI.runKMeans(
                useAutoK ? null : k,
                useAutoK
            );
            onSuccess(response);
        } catch (err) {
            onError(err.message || 'Phân cụm thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2 className="card-title">Bước 3: Phân cụm K-Means</h2>

            {/* Hướng dẫn */}
            <div className="help-box">
                <h4>K-Means là gì?</h4>
                <p>
                    K-Means là thuật toán <strong>chia dữ liệu thành K nhóm</strong> (cụm) dựa trên sự tương đồng.
                    Các điểm dữ liệu giống nhau sẽ được xếp vào cùng một cụm.
                </p>
                <div className="info-cards">
                    <div className="info-card">
                        <span className="info-icon">🔢</span>
                        <div>
                            <strong>K là gì?</strong>
                            <p>Số lượng nhóm (cụm) bạn muốn chia dữ liệu</p>
                        </div>
                    </div>
                    <div className="info-card">
                        <span className="info-icon">🤖</span>
                        <div>
                            <strong>Auto K là gì?</strong>
                            <p>Để hệ thống tự tìm số cụm tối ưu (khuyên dùng)</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleRunKMeans}>
                {/* Mode Selection */}
                <div className="mode-selection">
                    <label
                        className={`mode-option ${useAutoK ? 'mode-active' : ''}`}
                        onClick={() => setUseAutoK(true)}
                    >
                        <input
                            type="radio"
                            name="kmode"
                            checked={useAutoK}
                            onChange={() => setUseAutoK(true)}
                        />
                        <div className="mode-content">
                            <span className="mode-icon">🤖</span>
                            <div>
                                <strong>Tự động chọn K</strong>
                                <p>Hệ thống tìm số cụm tốt nhất (K = 2-5)</p>
                            </div>
                        </div>
                        <span className="mode-badge">Khuyên dùng</span>
                    </label>

                    <label
                        className={`mode-option ${!useAutoK ? 'mode-active' : ''}`}
                        onClick={() => setUseAutoK(false)}
                    >
                        <input
                            type="radio"
                            name="kmode"
                            checked={!useAutoK}
                            onChange={() => setUseAutoK(false)}
                        />
                        <div className="mode-content">
                            <span className="mode-icon">✋</span>
                            <div>
                                <strong>Tự chọn K</strong>
                                <p>Bạn quyết định số lượng cụm</p>
                            </div>
                        </div>
                    </label>
                </div>

                {/* Manual K Input */}
                {!useAutoK && (
                    <div className="k-input-section">
                        <label htmlFor="k">Số lượng cụm (K):</label>
                        <div className="k-input-wrapper">
                            <button
                                type="button"
                                className="k-btn"
                                onClick={() => setK(Math.max(2, k - 1))}
                                disabled={k <= 2}
                            >−</button>
                            <input
                                type="number"
                                id="k"
                                min="2"
                                max="10"
                                value={k}
                                onChange={(e) => setK(parseInt(e.target.value) || 2)}
                                disabled={loading}
                                className="k-input"
                            />
                            <button
                                type="button"
                                className="k-btn"
                                onClick={() => setK(Math.min(10, k + 1))}
                                disabled={k >= 10}
                            >+</button>
                        </div>
                        <p className="k-hint">
                            Thường K từ 2-5 cho kết quả tốt với dataset nhỏ
                        </p>
                    </div>
                )}

                {/* Summary */}
                <div className="summary-box">
                    <span className="summary-icon">📊</span>
                    <div>
                        {useAutoK
                            ? 'Hệ thống sẽ thử K từ 2 đến 5 và chọn số cụm tốt nhất'
                            : `Dữ liệu sẽ được chia thành ${k} nhóm`}
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                >
                    {loading ? 'Đang phân cụm...' : 'Bắt đầu Phân cụm'}
                </button>
            </form>
        </div>
    );
}

export default KMeansComponent;
