import React, { useState } from 'react';
import { kpdlAPI } from '../services/api';

function PreprocessComponent({
    columns,
    sheets,
    selectedColumns,
    setSelectedColumns,
    onSuccess,
    onSheetChange,
    onError,
    loading,
    setLoading,
}) {
    const [selectedSheet, setSelectedSheet] = useState('');
    const [sheetLoading, setSheetLoading] = useState(false);

    const handleSheetChange = async (sheetName) => {
        setSelectedSheet(sheetName);
        setSheetLoading(true);
        try {
            const response = await kpdlAPI.selectSheet(sheetName);
            // Call parent to update columns
            if (onSheetChange) {
                onSheetChange(response.data);
            }
        } catch (err) {
            onError(err.message || 'Không thể chọn sheet');
        } finally {
            setSheetLoading(false);
        }
    };

    const handleColumnToggle = (col) => {
        setSelectedColumns((prev) =>
            prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
        );
    };

    const handleSelectAll = () => {
        setSelectedColumns([...columns]);
    };

    const handleDeselectAll = () => {
        setSelectedColumns([]);
    };

    const handlePreprocess = async (e) => {
        e.preventDefault();

        if (selectedColumns.length < 2) {
            onError('Vui lòng chọn ít nhất 2 cột để phân cụm');
            return;
        }

        setLoading(true);
        try {
            await kpdlAPI.preprocessData(selectedColumns);
            onSuccess();
        } catch (err) {
            onError(err.message || 'Tiền xử lý thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2 className="card-title">Bước 2: Chọn Thuộc tính</h2>

            {/* Sheet Selector - chỉ hiện nếu có nhiều sheets */}
            {sheets && sheets.length > 1 && (
                <div className="sheet-selector">
                    <h4>Chọn bảng dữ liệu (Sheet):</h4>
                    <p className="help-text">File Excel của bạn có {sheets.length} bảng. Chọn bảng cần phân tích:</p>
                    <div className="sheet-grid">
                        {sheets.map((sheet) => (
                            <button
                                key={sheet}
                                type="button"
                                className={`sheet-btn ${selectedSheet === sheet ? 'sheet-active' : ''}`}
                                onClick={() => handleSheetChange(sheet)}
                                disabled={sheetLoading}
                            >
                                {sheet}
                            </button>
                        ))}
                    </div>
                    {sheetLoading && (
                        <div className="loading-inline">Đang tải dữ liệu sheet...</div>
                    )}
                </div>
            )}

            {/* Hướng dẫn */}
            <div className="help-box">
                <h4>Hướng dẫn</h4>
                <p>Chọn các cột (thuộc tính) bạn muốn sử dụng để phân cụm. Hệ thống sẽ tự động:</p>
                <ul>
                    <li><strong>Điền giá trị thiếu:</strong> Dùng giá trị trung bình cho số, phổ biến nhất cho chữ</li>
                    <li><strong>Mã hóa:</strong> Chuyển dữ liệu chữ thành số</li>
                    <li><strong>Chuẩn hóa:</strong> Đưa tất cả về cùng thang đo</li>
                </ul>
            </div>

            <form onSubmit={handlePreprocess}>
                {/* Quick Actions */}
                <div className="btn-group" style={{ marginBottom: '15px' }}>
                    <button type="button" className="btn btn-secondary" onClick={handleSelectAll}>
                        Chọn tất cả
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleDeselectAll}>
                        Bỏ chọn tất cả
                    </button>
                </div>

                {/* Column Selection */}
                <div className="column-grid">
                    {columns.map((col) => (
                        <label
                            key={col}
                            className={`column-item ${selectedColumns.includes(col) ? 'column-selected' : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedColumns.includes(col)}
                                onChange={() => handleColumnToggle(col)}
                            />
                            <span className="column-name">{col}</span>
                        </label>
                    ))}
                </div>

                {/* Status */}
                <div className="selection-status">
                    <div className="status-badge">
                        Đã chọn: <strong>{selectedColumns.length}</strong> / {columns.length} cột
                    </div>
                    {selectedColumns.length < 2 && (
                        <div className="status-warning">
                            Cần chọn ít nhất 2 cột
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={selectedColumns.length < 2 || loading}
                >
                    {loading ? 'Đang xử lý dữ liệu...' : 'Tiền xử lý và Tiếp tục'}
                </button>
            </form>
        </div>
    );
}

export default PreprocessComponent;
