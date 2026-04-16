import { useState, useEffect, useRef } from "react";
import axiosClient from "../utils/axiosClient";
import PDFInput from "../components/Input";
import { Send, Bot, RotateCcw } from "lucide-react";

export default function Chat() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);
    const scrollRef = useRef(null);

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleNewConversation = () => {
        window.location.reload();
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axiosClient.post("/chat/", {
                query: input
            });

            setMessages(prev => [
                ...prev,
                { role: "bot", text: res.data.answer }
            ]);

        } catch (err) {
            console.log(err.response?.data);

            let errorMsg = "Server error";

            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    errorMsg = err.response.data.detail[0].msg;
                } else {
                    errorMsg = err.response.data.detail;
                }
            }

            setMessages(prev => [
                ...prev,
                { role: "bot", text: `⚠️ ${errorMsg}` }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-[#050b14] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Sidebar / Upload Panel */}
            <div className={`transition-all duration-700 ease-in-out z-10 flex flex-col justify-center min-h-screen ${isUploaded ? "w-0 p-0 opacity-0 hidden" : "w-full lg:w-1/2 p-6 lg:p-12"}`}>
                <div className="max-w-md w-full mx-auto animate-in slide-in-from-left-8 fade-in duration-700">
                    <div className="mb-10 text-center lg:text-left">
                        <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/20">
                            <Bot size={36} className="text-white" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">ContextBot AI</h1>

                        <p className="text-slate-400 text-lg">Upload a document to unlock intelligent insights and start a conversation.</p>
                    </div>
                    <PDFInput
                        onReady={() => {
                            setIsUploaded(true);
                            setMessages([
                                { role: "bot", text: "I've analyzed your document. What would you like to know?" }
                            ]);
                        }}
                    />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col transition-all duration-700 z-10 h-screen ${!isUploaded ? "lg:w-1/2 opacity-30 pointer-events-none scale-95 blur-md lg:blur-none lg:scale-100 lg:opacity-100 lg:pointer-events-auto filter p-6 lg:p-12 relative" : "w-full p-4 md:p-6 lg:p-8"}`}>
                <div className={`flex-1 flex flex-col bg-[#0f172a]/70 backdrop-blur-2xl rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden relative transition-all duration-700 delay-300 ${isUploaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 lg:translate-y-0 lg:opacity-100 border-none bg-transparent lg:bg-[#0f172a]/70 lg:border-solid lg:border-slate-700/50'}`}>

                    {/* Header */}
                    {isUploaded && (
                        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/40 backdrop-blur-xl z-20">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg ring-1 ring-white/10">
                                        <Bot size={22} className="text-white" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-[#1e293b] rounded-full"></span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-semibold text-slate-100 text-base">ContextBot Assistant</h2>
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Beta</span>
                                    </div>
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                        Document Analyzed & Ready
                                    </p>
                                </div>
                            </div>

                            {/* New Conversation Button */}
                            <button
                                onClick={handleNewConversation}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700/40 hover:bg-indigo-500/20 border border-slate-600/50 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 transition-all rounded-xl text-sm font-medium group active:scale-95"
                            >
                                <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform duration-300" />
                                <span className="hidden sm:inline">New Conversation</span>
                            </button>
                        </div>
                    )}

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 scroll-smooth custom-scrollbar relative z-10">
                        {messages.length === 0 && !isUploaded && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                                <div className="p-6 bg-slate-800/50 rounded-full">
                                    <Bot size={64} className="text-slate-500" />
                                </div>
                                <div className="max-w-xs">
                                    <h3 className="text-xl font-medium text-slate-300 mb-2">Waiting for Document</h3>
                                    <p className="text-sm text-slate-500">I need some context before we can chat. Upload a PDF to get started.</p>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-3 fade-in duration-500`}>
                                {msg.role === "bot" && (
                                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                                        <Bot size={18} className="text-indigo-400" />
                                    </div>
                                )}
                                <div className={`max-w-[85%] md:max-w-[75%] text-[15px] leading-relaxed p-4 shadow-md ${msg.role === "user"
                                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tr-sm"
                                        : "bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-sm selection:bg-indigo-500/40"
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in duration-300">
                                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                                    <Bot size={18} className="text-indigo-400" />
                                </div>
                                <div className="bg-slate-800/90 border border-slate-700/50 text-slate-400 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm min-h-[56px]">
                                    <div className="flex gap-1.5 items-center">
                                        <span className="w-2 h-2 bg-indigo-500/80 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-indigo-500/80 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-indigo-500/80 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className={`p-4 md:p-6 bg-slate-800/40 border-t border-slate-700/50 backdrop-blur-xl z-20 transition-all duration-500 ${!isUploaded ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                        <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[1.25rem] opacity-0 group-focus-within:opacity-20 transition duration-500 blur-sm"></div>
                                <textarea
                                    value={input}
                                    disabled={!isUploaded || loading}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                                    }}
                                    placeholder={isUploaded ? "Message ContextBot..." : "Upload a document first..."}
                                    className="w-full relative bg-[#1e293b]/90 backdrop-blur-md border border-slate-600/50 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 px-5 py-3.5 rounded-2xl outline-none resize-none min-h-[56px] max-h-[120px] shadow-inner text-[15px] transition-all custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-500 leading-relaxed"
                                    rows="1"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                />
                            </div>
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading || !isUploaded}
                                className="h-[56px] w-[56px] flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.95] group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Send size={22} className={`relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${(!input.trim() || loading || !isUploaded) && 'opacity-50'}`} />
                            </button>
                        </div>
                        <div className="text-center mt-3 text-[11px] text-slate-500 font-medium tracking-wide">
                            AI CAN MAKE MISTAKES. VERIFY IMPORTANT INFORMATION.
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}} />
        </div>
    );
}