import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ResumeUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setErrorMessage('Please select a PDF file');
        setUploadStatus('error');
        return;
      }
      setFile(selectedFile);
      setUploadStatus(null);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file first');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload resume');
      }

      const data = await response.json();
      setUploadStatus('success');
      
      // Notify parent component of successful upload
      if (onUploadSuccess) {
        onUploadSuccess(data.resume_data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border-2 border-dashed border-gray-300">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Upload Resume</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="resume-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </div>
            <input
              id="resume-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-700">{file.name}</span>
            </div>
            <span className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            !file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading & Parsing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Resume
            </>
          )}
        </button>

        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">Resume uploaded and parsed successfully!</p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
