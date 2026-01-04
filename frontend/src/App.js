import React, { useState } from 'react';
import './styles/main.css';
import DWConnectorComponent from './components/DWConnectorComponent';
import PreprocessComponent from './components/PreprocessComponent';
import KMeansComponent from './components/KMeansComponent';
import AnalysisComponent from './components/AnalysisComponent';

function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [columns, setColumns] = useState([]);
    const [sheets, setSheets] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [kmeansResult, setKmeansResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUploadSuccess = (data) => {
        setUploadedFile(data);
        setColumns(data.data.columns.map(c => c.name));
        setSelectedColumns(data.data.columns.map(c => c.name));
        setSheets(data.data.sheets || []);
        setCurrentStep(2);
        setError(null);
    };

    const handleSheetChange = (sheetData) => {
        setColumns(sheetData.columns.map(c => c.name));
        setSelectedColumns(sheetData.columns.map(c => c.name));
    };

    const handlePreprocessSuccess = () => {
        setCurrentStep(3);
        setError(null);
    };

    const handleKMeansSuccess = (data) => {
        setKmeansResult(data);
        setCurrentStep(4);
        setError(null);
    };

    const handleError = (msg) => {
        setError(msg);
    };

    const handleReset = async () => {
        setCurrentStep(1);
        setUploadedFile(null);
        setColumns([]);
        setSheets([]);
        setSelectedColumns([]);
        setKmeansResult(null);
        setError(null);
        setLoading(false);
    };

    return (
        <div className="container">
            <div className="header">
                <h1>KPDL</h1>
                <p>Phân cụm K-means & Học Dữ liệu</p>
            </div>

            {/* Steps Indicator */}
            <div className="steps">
                <div className={`step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}`}>
                    <span className="step-number">1</span>
                    <span>Kết nối</span>
                </div>
                <div className={`step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}`}>
                    <span className="step-number">2</span>
                    <span>Xử lý</span>
                </div>
                <div className={`step ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'done' : ''}`}>
                    <span className="step-number">3</span>
                    <span>K-Means</span>
                </div>
                <div className={`step ${currentStep === 4 ? 'active' : ''}`}>
                    <span className="step-number">4</span>
                    <span>Phân tích</span>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error">
                    <span>Lỗi:</span>
                    <div>{error}</div>
                </div>
            )}

            {/* Content */}
            {currentStep === 1 && (
                <DWConnectorComponent onSuccess={handleUploadSuccess} onError={handleError} loading={loading} setLoading={setLoading} />
            )}

            {currentStep === 2 && uploadedFile && (
                <PreprocessComponent
                    columns={columns}
                    sheets={sheets}
                    selectedColumns={selectedColumns}
                    setSelectedColumns={setSelectedColumns}
                    onSuccess={handlePreprocessSuccess}
                    onSheetChange={handleSheetChange}
                    onError={handleError}
                    loading={loading}
                    setLoading={setLoading}
                />
            )}

            {currentStep === 3 && (
                <KMeansComponent
                    onSuccess={handleKMeansSuccess}
                    onError={handleError}
                    loading={loading}
                    setLoading={setLoading}
                />
            )}

            {currentStep === 4 && kmeansResult && (
                <AnalysisComponent
                    kmeansResult={kmeansResult}
                    onReset={handleReset}
                    loading={loading}
                    setLoading={setLoading}
                />
            )}
        </div>
    );
}

export default App;
