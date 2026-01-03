import React, { useState } from 'react';
import { kpdlAPI } from '../services/api';

function UploadComponent({ onSuccess, onError, loading, setLoading }) {
    const [fileSelected, setFileSelected] = useState(false);
    const [fileName, setFileName] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileSelected(true);
            setFileName(e.target.files[0].name);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
                setFileSelected(true);
                setFileName(file.name);
                // Update the file input
                const input = document.getElementById('file');
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
            } else {
                onError('Chỉ hỗ trợ file CSV hoặc Excel (.xlsx)');
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const fileInput = e.target.querySelector('input[type="file"]');
        const file = fileInput.files[0];

        if (!file) {
            onError('Vui lòng chọn một file');
            return;
        }

        setLoading(true);
        try {
            const response = await kpdlAPI.uploadFile(file);
            onSuccess(response);
        } catch (err) {
            onError(err.message || 'Upload thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2 className="card-title">Bước 1: Tải Dữ liệu</h2>

            {/* Hướng dẫn */}
            <div className="help-box">
                <h4>Hướng dẫn</h4>
                <p>Tải lên file dữ liệu của bạn để bắt đầu phân tích. Hệ thống sẽ tự động nhận diện các cột dữ liệu.</p>
                <ul>
                    <li><strong>File hỗ trợ:</strong> CSV (.csv) hoặc Excel (.xlsx)</li>
                    <li><strong>Giới hạn:</strong> Tối đa 10MB</li>
                    <li><strong>Yêu cầu:</strong> File phải có tiêu đề cột ở hàng đầu tiên</li>
                </ul>
            </div>

            <form onSubmit={handleUpload}>
                {/* Drag & Drop Zone */}
                <div
                    className={`drop-zone ${dragActive ? 'drop-zone-active' : ''} ${fileSelected ? 'drop-zone-selected' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileChange}
                        disabled={loading}
                        style={{ display: 'none' }}
                    />

                    {fileSelected ? (
                        <div className="drop-zone-content">
                            <span className="drop-zone-icon">OK</span>
                            <p className="drop-zone-text"><strong>{fileName}</strong></p>
                            <p className="drop-zone-hint">File đã sẵn sàng. Nhấp "Tải lên" để tiếp tục.</p>
                            <label htmlFor="file" className="btn btn-secondary" style={{ marginTop: '10px' }}>
                                Chọn file khác
                            </label>
                        </div>
                    ) : (
                        <div className="drop-zone-content">
                            <span className="drop-zone-icon">+</span>
                            <p className="drop-zone-text">Kéo thả file vào đây</p>
                            <p className="drop-zone-hint">hoặc</p>
                            <label htmlFor="file" className="btn btn-secondary">
                                Chọn file từ máy tính
                            </label>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={!fileSelected || loading}
                    style={{ marginTop: '20px' }}
                >
                    {loading ? 'Đang tải lên...' : 'Tải lên và Phân tích'}
                </button>
            </form>
        </div>
    );
}

export default UploadComponent;
