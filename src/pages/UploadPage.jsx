import React, { useState } from 'react';
import { Check, FileText, Upload, CloudUpload, AlertCircle, Info, X } from 'lucide-react';
import KuveraImg from '../assets/Kuvera.png';
import IbkrImg from '../assets/ibkr.jpg';

const UploadPage = ({
  uploadedFiles = {},
  handleFileUpload,
}) => {
  const [flippedCards, setFlippedCards] = useState({
    kuvera: false,
    ibkr: false
  });

  const toggleCardFlip = (cardType) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardType]: !prev[cardType]
    }));
  };

  // Fixed file upload handler with proper error handling
  const handleFileSelect = async (type, event) => {
    if (!event?.target?.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    try {
      const recordCount = await estimateRecordCount(file);
      
      // Create a synthetic event object with processed data
      const syntheticEvent = {
        target: {
          files: event.target.files,
          value: event.target.value
        },
        fileData: {
          name: file.name,
          size: file.size,
          recordCount: recordCount,
          lastModified: file.lastModified,
          type: file.type
        }
      };
      
      if (handleFileUpload) {
        handleFileUpload(type, syntheticEvent);
      }
      
      event.target.value = '';
      
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };


  // Function to estimate CSV record count
  const estimateRecordCount = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(0);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          if (!text) {
            resolve(0);
            return;
          }
          
          const lines = text.split('\n').filter(line => line.trim() !== '');
          // Subtract 1 for header row, ensure non-negative
          const recordCount = Math.max(0, lines.length - 1);
          resolve(recordCount);
        } catch (error) {
          console.error('Error reading file:', error);
          resolve(0);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        resolve(0);
      };
      
      // Read only first 100KB to estimate quickly
      const blob = file.slice(0, 100000);
      reader.readAsText(blob);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <style dangerouslySetInnerHTML={{
          __html: `
            .perspective-1000 {
              perspective: 1000px;
            }
            .transform-style-preserve-3d {
              transform-style: preserve-3d;
            }
            .backface-hidden {
              backface-visibility: hidden;
            }
            .rotate-y-180 {
              transform: rotateY(180deg);
            }
            .flip-card {
              transition: transform 0.8s;
              transform-style: preserve-3d;
            }
            .flip-card.flipped {
              transform: rotateY(180deg);
            }
            .flip-card-container {
              background: transparent !important;
            }
          `
        }} />
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Upload Transaction Files
          </h1>
          <p className="text-gray-400 text-lg">Upload CSV files from your brokers to automatically track your investments</p>
        </div>

        {/* Upload Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Kuvera Upload Card */}
          <div className="perspective-1000 flip-card-container" style={{ height: '420px', background: 'transparent' }}>
            <div className={`flip-card transform-style-preserve-3d w-full h-full relative ${flippedCards.kuvera ? 'flipped' : ''}`}>
              {/* Front of Card */}
              <div className="backface-hidden absolute inset-0 w-full h-full bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-blue-500/30">
                <div className="h-40 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center overflow-hidden">
                        <img 
                          src={KuveraImg} 
                          alt="Kuvera Logo" 
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="text-white font-bold text-lg hidden w-full h-full items-center justify-center"
                          style={{ display: 'none' }}
                        >
                          KU
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-2xl">Kuvera</h3>
                        <p className="text-red-100 text-sm">Indian Stocks & Mutual Funds</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <button
                    onClick={() => toggleCardFlip('kuvera')}
                    className="absolute bottom-4 right-4 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <Info className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <div className="p-6 h-[calc(100%-160px)] flex flex-col bg-gray-800">
                  {uploadedFiles.kuvera ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-3 flex-1 overflow-y-auto">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-green-400 font-medium text-sm">File Uploaded</span>
                            <p className="text-gray-300 text-xs truncate">{uploadedFiles.kuvera.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-xs font-medium">Ready</span>
                          </div>
                        </div>
                        
                        {/* Processing Status - More compact */}
                        <div className="border-t border-green-500/20 pt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Status:</span>
                            <span className="text-green-400">Processed</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Records:</span>
                            <span className="text-white">
                              {uploadedFiles.kuvera.recordCount || 0} transactions
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">File Size:</span>
                            <span className="text-gray-300">
                              {uploadedFiles.kuvera.size ? `${(uploadedFiles.kuvera.size / 1024).toFixed(1)} KB` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label 
                      htmlFor="kuvera-upload"
                      className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 mb-4 hover:border-blue-500/50 transition-all duration-300 bg-gray-700/20 cursor-pointer flex-1 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <CloudUpload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-white text-sm mb-1">Drop CSV file here</p>
                        <p className="text-gray-400 text-xs">or click to browse</p>
                      </div>
                    </label>
                  )}
                  
                  {/* Fixed button positioning */}
                  <div className="flex-shrink-0 mt-3">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) => handleFileSelect('kuvera', e)}
                      style={{ display: 'none' }}
                      id="kuvera-upload"
                    />
                    <label
                      htmlFor="kuvera-upload"
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl cursor-pointer transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadedFiles.kuvera ? 'Replace File' : 'Choose CSV File'}
                    </label>
                  </div>
                </div>

              </div>

              {/* Back of Card - Instructions */}
              <div className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full bg-gray-900 rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 relative overflow-hidden flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-bold text-white text-lg">Kuvera Instructions</h5>
                  </div>
                  <button
                    onClick={() => toggleCardFlip('kuvera')}
                    className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <div className="p-6 h-[calc(100%-64px)] overflow-y-auto bg-gray-900">
                  <div className="space-y-4">
                    <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/40 bg-gray-800">
                      <h6 className="text-blue-200 font-medium mb-3">Required Steps:</h6>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-blue-500/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                          </div>
                          <span className="text-white text-sm">Export from Kuvera dashboard</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-blue-500/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                          </div>
                          <span className="text-white text-sm">Include complete transaction history</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-blue-500/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                          </div>
                          <span className="text-white text-sm">Ensure all columns are present</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-blue-500/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                          </div>
                          <span className="text-white text-sm">File size limit: 10MB maximum</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/40 bg-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-blue-300" />
                        <span className="text-blue-300 font-medium text-sm">Note</span>
                      </div>
                      <p className="text-white text-sm">Supported formats: CSV files with UTF-8 encoding</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Brokers Upload Card - Same structure with red theme */}
          <div className="perspective-1000 flip-card-container" style={{ height: '420px', background: 'transparent' }}>
            <div className={`flip-card transform-style-preserve-3d w-full h-full relative ${flippedCards.ibkr ? 'flipped' : ''}`}>
              {/* Front of Card */}
              <div className="backface-hidden absolute inset-0 w-full h-full bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-red-500/30">
                <div className="h-40 bg-gradient-to-r from-red-600 to-orange-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center overflow-hidden">
                        <img 
                          src={IbkrImg} 
                          alt="Interactive Brokers Logo" 
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="text-white font-bold text-lg hidden w-full h-full items-center justify-center"
                          style={{ display: 'none' }}
                        >
                          KU
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-2xl">Interactive Brokers</h3>
                        <p className="text-red-100 text-sm">US Stocks & ETF's</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                  <button
                    onClick={() => toggleCardFlip('ibkr')}
                    className="absolute bottom-4 right-4 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <Info className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <div className="p-6 h-[calc(100%-160px)] flex flex-col bg-gray-800">
                  {uploadedFiles.ibkr ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-3 flex-1 overflow-y-auto">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-green-400 font-medium text-sm">File Uploaded</span>
                            <p className="text-gray-300 text-xs truncate">{uploadedFiles.ibkr.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-xs font-medium">Ready</span>
                          </div>
                        </div>
                        
                        {/* Processing Status - More compact */}
                        <div className="border-t border-green-500/20 pt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Status:</span>
                            <span className="text-green-400">Processed</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Records:</span>
                            <span className="text-white">
                              {uploadedFiles.ibkr.recordCount || 0} trades
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">File Size:</span>
                            <span className="text-gray-300">
                              {uploadedFiles.ibkr.size ? `${(uploadedFiles.ibkr.size / 1024).toFixed(1)} KB` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label 
                      htmlFor="interactive-upload"
                      className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 mb-4 hover:border-red-500/50 transition-all duration-300 bg-gray-700/20 cursor-pointer flex-1 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <CloudUpload className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-white text-sm mb-1">Drop CSV file here</p>
                        <p className="text-gray-400 text-xs">or click to browse</p>
                      </div>
                    </label>
                  )}
                  
                  {/* Fixed button positioning */}
                  <div className="flex-shrink-0 mt-3">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) => handleFileSelect('ibkr', e)}
                      style={{ display: 'none' }}
                      id="interactive-upload"
                    />
                    <label
                      htmlFor="interactive-upload"
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl cursor-pointer transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadedFiles.ibkr ? 'Replace File' : 'Choose CSV File'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Back of Card - Instructions (same as Kuvera but with red theme) */}
              <div className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full bg-gray-900 rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
                {/* Same structure as Kuvera instructions but with red colors */}
                <div className="h-16 bg-gradient-to-r from-red-600 to-orange-600 relative overflow-hidden flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-bold text-white text-lg">IBKR Instructions</h5>
                  </div>
                  <button
                    onClick={() => toggleCardFlip('ibkr')}
                    className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <div className="p-6 h-[calc(100%-64px)] overflow-y-auto bg-gray-900">
                  <div className="space-y-4">
                    <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/40 bg-gray-800">
                      <h6 className="text-red-200 font-medium mb-3">Required Steps:</h6>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-red-500/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                          </div>
                          <span className="text-white text-sm">Export from TWS or Client Portal</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-red-500/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                          </div>
                          <span className="text-white text-sm">Include trade confirmations</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-red-500/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                          </div>
                          <span className="text-white text-sm">Standard IB CSV format required</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-red-500/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                          </div>
                          <span className="text-white text-sm">File size limit: 10MB maximum</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/40 bg-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-300" />
                        <span className="text-red-300 font-medium text-sm">Note</span>
                      </div>
                      <p className="text-white text-sm">Ensure trades include symbol, quantity, and price data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Upload Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h5 className="font-semibold text-white mb-2">Zerodha Console</h5>
            <p className="text-gray-400 text-sm mb-4">Upload Zerodha trading history</p>
            <button className="w-full px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-colors text-sm">
              Coming Soon
            </button>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-yellow-400" />
            </div>
            <h5 className="font-semibold text-white mb-2">Bank Statements</h5>
            <p className="text-gray-400 text-sm mb-4">Upload bank CSV files</p>
            <button className="w-full px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-600/30 transition-colors text-sm">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
