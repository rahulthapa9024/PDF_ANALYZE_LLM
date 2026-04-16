import { useState, useRef } from "react";
import axiosClient from "../utils/axiosClient";
import { X, Plus, Loader2, FileText, UploadCloud, Bot } from "lucide-react";

export default function PDFInput({ onReady }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (selectedFile) => {
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
        } else {
            setError("Please select a valid PDF file.");
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
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axiosClient.post("/upload-pdf/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            // ✅ Only allow chat when actually ready
            if (res.data.status === "done") {
                onReady?.();
            } else if (res.data.status === "processing") {
                setError("Large PDF is processing... please wait.");
            }

        } catch (err) {
            console.log(err.response?.data);

            let errorMsg = "Upload failed";

            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMsg = err.response.data.detail[0].msg;
                } else {
                    errorMsg = err.response.data.detail;
                }
            }

            setError(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-[#1e293b]/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-indigo-500/10 hover:border-slate-600/50">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
                <FileText className="text-indigo-400" size={20} />
                Document Upload
            </h3>

            {!file ? (
                <div
                    onClick={() => fileInputRef.current.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed p-8 text-center cursor-pointer rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                        dragActive 
                        ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" 
                        : "border-slate-600/60 hover:border-indigo-400 hover:bg-slate-800/80"
                    }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        accept="application/pdf"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                    <div className={`p-4 bg-slate-800 rounded-full shadow-lg border border-slate-700 mb-1 transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <UploadCloud className="text-indigo-400" size={28} />
                    </div>
                    <div>
                        <p className="text-slate-200 font-medium mb-1">Click or drag PDF to upload</p>
                        <p className="text-xs text-slate-500">Maximum file size: 50MB</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-5 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 relative overflow-hidden group/file">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover/file:opacity-100 transition-opacity" />
                        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                        </div>
                        <button 
                            onClick={() => setFile(null)}
                            title="Remove file"
                            className="p-2 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full relative group/btn overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-3.5 rounded-2xl flex justify-center items-center gap-2 font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing Document...
                            </>
                        ) : (
                            <>
                                <Bot size={20} className="group-hover/btn:animate-bounce" />
                                Start Conversation
                            </>
                        )}
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                    <X size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}