import React, { useState } from 'react';
import { Search, Image as ImageIcon, Sparkles, Send, Loader2, X } from 'lucide-react';
import { explainWordWithAI, generateVisualInspiration } from '../services/geminiService';

interface AIChatBoxProps {
  type: 'microscope' | 'inspiration';
  onClose: () => void;
}

const AIChatBox: React.FC<AIChatBoxProps> = ({ type, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text?: any; image?: string } | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      if (type === 'microscope') {
        const aiResponse = await explainWordWithAI(input);
        // Also try to get an image for visual learning
        const image = await generateVisualInspiration(`The visual concept of ${input}`);
        setResult({ text: aiResponse, image });
      } else {
        const image = await generateVisualInspiration(input);
        setResult({ image, text: `AI为您生成的“${input}”绘画参考：` });
      }
    } catch (error) {
      console.error(error);
      setResult({ text: '抱歉，AI助手暂时遇到了点麻烦，请稍后再试。' });
    } finally {
      setLoading(false);
    }
  };

  const renderTextContent = (content: any) => {
    if (!content) return null;
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
      return (
        <div className="space-y-2">
          {content.pinyin && <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">拼音: {content.pinyin}</p>}
          <p className="text-gray-700 leading-relaxed font-medium">{content.explanation || JSON.stringify(content)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between bg-indigo-50">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            {type === 'microscope' ? <Search size={20} /> : <ImageIcon size={20} />}
            <span>{type === 'microscope' ? 'AI 智能显微镜' : 'AI 灵感画板'}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!result && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} />
              </div>
              <h4 className="font-bold text-gray-800">
                {type === 'microscope' ? '哪段文字不懂？' : '想要画什么？'}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                {type === 'microscope' ? '输入词语，我会用大白话解释给你听' : '输入关键词，我为你生成参考线稿'}
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-indigo-600">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-sm font-medium">AI正在全力思考中...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.text && (
                <div className="bg-gray-50 p-4 rounded-2xl text-gray-700 leading-relaxed border border-gray-100">
                  {renderTextContent(result.text)}
                </div>
              )}
              {result.image && (
                <div className="rounded-2xl overflow-hidden border border-gray-200">
                  <img src={result.image} alt="AI Inspiration" className="w-full h-auto" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={type === 'microscope' ? "例如：彩锦" : "例如：老牛吃草"}
              className="w-full bg-white border border-gray-200 rounded-full py-3 px-6 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1.5 p-2 bg-indigo-600 text-white rounded-full disabled:bg-gray-300 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatBox;