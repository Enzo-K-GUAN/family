
import React, { useState } from 'react';
import { UserRole } from '../types';
import { School, Home, Sparkles, BookOpen, User, Heart, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { STORY_CONTENT } from '../constants';

interface RoleSelectorProps {
  onSelect: (role: UserRole, sName?: string, pName?: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  const [step, setStep] = useState<'role' | 'family-login'>('role');
  const [sName, setSName] = useState('');
  const [pName, setPName] = useState('');
  const [showError, setShowError] = useState(false);

  const handleFamilySubmit = () => {
    if (!sName.trim() || !pName.trim()) {
      setShowError(true);
      return;
    }
    onSelect(UserRole.FAMILY, sName, pName);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fcfaf7] overflow-hidden">
      {/* 装饰性背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200 rounded-full blur-[100px]"></div>
      </div>

      <div className="text-center mb-16 relative z-10">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 border-2 border-indigo-900/20 rounded-full animate-spin-slow"></div>
          <div className="bg-white p-5 rounded-full shadow-2xl text-indigo-900">
            <BookOpen size={40} />
          </div>
        </div>
        <h1 className="text-5xl font-black text-[#1a365d] mb-4 tracking-tighter">
          智绘鹊桥
        </h1>
        <p className="text-orange-500 font-bold tracking-[0.3em] text-xs uppercase">AI-Bridge Education Platform</p>
      </div>

      <div className="w-full max-w-4xl relative z-10 transition-all duration-500">
        {step === 'role' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <button
              onClick={() => onSelect(UserRole.TEACHER)}
              className="group bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] shadow-2xl hover:shadow-indigo-100 hover:border-indigo-600 border-2 border-transparent transition-all text-left"
            >
              <div className="p-6 bg-indigo-50 rounded-[2rem] text-indigo-900 mb-10 inline-block group-hover:scale-110 transition-transform">
                <School size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">我是老师</h2>
              <p className="text-gray-400 font-medium leading-relaxed">
                进入教学指挥中台，发布任务并查看全班多元评价数据。
              </p>
            </button>

            <button
              onClick={() => setStep('family-login')}
              className="group bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] shadow-2xl hover:shadow-orange-100 hover:border-orange-500 border-2 border-transparent transition-all text-left"
            >
              <div className="p-6 bg-orange-50 rounded-[2rem] text-orange-600 mb-10 inline-block group-hover:scale-110 transition-transform">
                <Home size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">家长与学生</h2>
              <p className="text-gray-400 font-medium leading-relaxed">
                开启亲子共创空间，让AI成为连接家庭与学校的“鹊桥”。
              </p>
            </button>
          </div>
        ) : (
          <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[4rem] p-12 shadow-2xl border border-white">
              <button 
                onClick={() => setStep('role')}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-10 font-bold transition-colors"
              >
                <ArrowLeft size={18} /> 返回选择
              </button>
              
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-4 text-orange-500 mb-4">
                  <User size={24} />
                  <div className="w-12 h-[2px] bg-orange-100"></div>
                  <Heart size={24} fill="currentColor" />
                  <div className="w-12 h-[2px] bg-orange-100"></div>
                  <User size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">登记家庭信息</h3>
                <p className="text-sm text-gray-400 mt-2">家长与学生深度绑定，共同开启探索</p>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-6 mb-2 block">学生姓名</label>
                  <div className="bg-gray-50 rounded-[2rem] p-5 border-2 border-transparent focus-within:border-orange-200 transition-all shadow-inner">
                    <input 
                      type="text"
                      value={sName}
                      onChange={(e) => setSName(e.target.value)}
                      placeholder="输入孩子姓名..."
                      className="w-full bg-transparent outline-none font-bold text-gray-800 placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center justify-between ml-6 mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">家长姓名</label>
                  </div>
                  <div className="bg-gray-50 rounded-[2rem] p-5 border-2 border-transparent focus-within:border-orange-200 transition-all shadow-inner">
                    <input 
                      type="text"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="输入家长姓名..."
                      className="w-full bg-transparent outline-none font-bold text-gray-800 placeholder:text-gray-300"
                    />
                  </div>
                  <div className="mt-2 ml-6 flex items-start gap-1.5 text-orange-400/70">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    <p className="text-[10px] font-bold leading-tight">
                      多位家长，可用；隔开，如张爸爸；张妈妈
                    </p>
                  </div>
                </div>

                {showError && (
                  <p className="text-red-400 text-xs font-bold text-center animate-pulse">※ 请完整填写两个姓名，共筑成长之桥</p>
                )}

                <button 
                  onClick={handleFamilySubmit}
                  className="w-full py-6 bg-orange-500 text-white rounded-[2rem] font-black shadow-xl shadow-orange-100 hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  进入共创空间 <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-20 text-[10px] text-gray-300 font-bold tracking-[0.5em] uppercase">Multi-Evaluation & AIGC Platform</p>
    </div>
  );
};

export default RoleSelector;
