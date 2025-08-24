import React from 'react';
import { Check, FileText } from 'lucide-react';

// Images imported at top of your files
import KuveraImg from '../assets/Kuvera.png';
import IbkrImg from '../assets/ibkr-logo.png';

const UploadTab = ({
  uploadedFiles,
  handleFileUpload,
}) => {

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Upload Transaction Files</h2>
        <p className="text-gray-400">Upload CSV files from your brokers to track your investments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kuvera Upload */}
        <div className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 border-2 border-transparent hover:border-green-500/30">
          <div className="h-32 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <img
              src={KuveraImg}
              alt="Kuvera Logo"
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          </div>
          <div className="p-8">
            <h3 className="text-xl font-semibold mb-2">Kuvera Transactions</h3>
            <p className="text-gray-400 mb-6">Upload your Kuvera transaction CSV file</p>
            {uploadedFiles.kuvera ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-green-500 mr-2" />
                  <span className="text-green-500 font-medium">File Uploaded</span>
                </div>
                <p className="text-sm text-gray-300">{uploadedFiles.kuvera.name}</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-4 hover:border-blue-500 transition-colors">
                <div className="w-8 h-8 text-gray-400 mx-auto mb-3 flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-gray-400 mb-2">Drag & drop your CSV file here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
            )}

            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload('kuvera', e)}
              className="hidden"
              id="kuvera-upload"
            />
            <label
              htmlFor="kuvera-upload"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              {uploadedFiles.kuvera ? 'Replace File' : 'Choose CSV File'}
            </label>
          </div>
        </div>

        {/* Interactive Brokers Upload */}
        <div className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 border-2 border-transparent hover:border-green-500/30">
          <div className="h-32 bg-gradient-to-r from-red-400 via-red-500 to-red-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <img
              src={IbkrImg}
              alt="Interactive Brokers Logo"
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          </div>
          <div className="p-8">
            <h3 className="text-xl font-semibold mb-2">Interactive Brokers</h3>
            <p className="text-gray-400 mb-6">Upload your Interactive Brokers CSV file</p>
            {uploadedFiles.interactive ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-green-500 mr-2" />
                  <span className="text-green-500 font-medium">File Uploaded</span>
                </div>
                <p className="text-sm text-gray-300">{uploadedFiles.interactive.name}</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-4 hover:border-red-500 transition-colors">
                <div className="w-8 h-8 text-gray-400 mx-auto mb-3 flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-gray-400 mb-2">Drag & drop your CSV file here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
            )}

            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload('ibkr', e)}
              className="hidden"
              id="interactive-upload"
            />
            <label
              htmlFor="interactive-upload"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-colors font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              {uploadedFiles.interactive ? 'Replace File' : 'Choose CSV File'}
            </label>
          </div>
        </div>
      </div>

      {/* Upload Instructions */}
      <div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            Upload Instructions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-blue-400 mb-2">Kuvera CSV Format</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Export from Kuvera dashboard</li>
                <li>• Include transaction history</li>
                <li>• Ensure all columns are present</li>
                <li>• File size limit: 10MB</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-red-400 mb-2">Interactive Brokers CSV Format</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Export from TWS or Client Portal</li>
                <li>• Include trade confirmations</li>
                <li>• Standard IB CSV format</li>
                <li>• File size limit: 10MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTab;
