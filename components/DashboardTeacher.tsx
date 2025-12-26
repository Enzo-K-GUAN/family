
import React, { useState, useEffect } from 'react';
import { 
  Users, BarChart2, MessageSquare, ClipboardList, 
  TrendingUp, ThumbsUp, ArrowLeft, Star, Send, 
  RefreshCw, PieChart, Sparkles, Filter, Layout, Heart,
  UserPlus, Calendar, Trash2, ChevronRight, Search,
  ExternalLink, UserCheck, ShieldCheck, Image as ImageIcon,
  Type, Link as LinkIcon, CheckCircle2, X, Share2, Clock, 
  ArrowUpRight
} from 'lucide-react';
import EvaluationRadar from './EvaluationRadar';
import { MOCK_WORKS, STORY_CONTENT } from '../constants';
import { StudentWork, CoCreationRecord } from '../types';

interface RegisteredFamily {
  id: string;
  studentName: string;
  parentName: string;
  timestamp: string;
}

type TeacherView = 'overview' | 'roster' | 'records';

const DashboardTeacher: React.FC = () => {
  const [view, setView] = useState<TeacherView>('overview');
  const [selectedRecord, setSelectedRecord] = useState<CoCreationRecord | null>(null);
  const [registeredFamilies, setRegisteredFamilies] = useState<RegisteredFamily[]>([]);
  const [cocreationRecords, setCocreationRecords] = useState<CoCreationRecord[]>([]);
  const [localWorks, setLocalWorks] = useState<any[]>(MOCK_WORKS);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = () => {
      const families = JSON.parse(localStorage.getItem('ai_bridge_registered_families') || '[]');
      const records = JSON.parse(localStorage.getItem('ai_bridge_cocreation_records') || '[]');
      setRegisteredFamilies(families);
      setCocreationRecords(records);
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const classAverageStats = {
    understanding: 78,
    creation: 65,
    collaboration: 82,
    expression: 55,
    aiUsage: 90
  };

  const getStudentScore = (sName: string) => {
    const pr = JSON.parse(localStorage.getItem(`peer_ratings_${sName}`) || '{"understanding":3,"creation":3,"collaboration":3,"expression":3,"aiUsage":3}');
    const sr = JSON.parse(localStorage.getItem(`self_ratings_${sName}`) || '{"understanding":0,"creation":0,"collaboration":0,"expression":0,"aiUsage":0}');
    const tr = JSON.parse(localStorage.getItem(`teacher_ratings_${sName}`) || '{"understanding":3,"creation":3,"collaboration":3,"expression":3,"aiUsage":3}');
    
    const calcAvg = (key: string) => Math.round((sr[key] + pr[key] + tr[key]) / 3 * 20);
    return Math.round((calcAvg('understanding') + calcAvg('creation') + calcAvg('collaboration') + calcAvg('expression') + calcAvg('aiUsage')) / 5);
  };

  const getTeacherAvgRating = (sName: string) => {
    const tr = JSON.parse(localStorage.getItem(`teacher_ratings_${sName}`) || '{"understanding":3,"creation":3,"collaboration":3,"expression":3,"aiUsage":3}');
    const values = Object.values(tr) as number[];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 10) / 10;
  };

  const deleteRecord = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('确定要彻底删除该学生成果吗？此操作不可撤销。')) return;
    
    const allRecords = JSON.parse(localStorage.getItem('ai_bridge_cocreation_records') || '[]');
    const updatedRecords = allRecords.filter((r: CoCreationRecord) => r.id !== id);
    localStorage.setItem('ai_bridge_cocreation_records', JSON.stringify(updatedRecords));
    setCocreationRecords([...updatedRecords]);
    
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const deleteMockWork = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要从墙上移除这项展示作品吗？')) return;
    setLocalWorks(prev => prev.filter(w => w.id !== id));
  };

  // --- 成果点评反馈子页面 ---
  if (selectedRecord) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] pb-24">
        <div className="fixed top-0 inset-x-0 h-20 bg-white/90 backdrop-blur-xl border-b flex items-center px-8 z-50">
          <button onClick={() => setSelectedRecord(null)} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 mr-4 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-black">点评分享成果：{selectedRecord.title}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">学生：{selectedRecord.studentName}</p>
          </div>
        </div>

        <div className="pt-28 px-6 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6">
          <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100">
            <div className="mb-8">
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 inline-block bg-indigo-100 text-indigo-600">外部链接作品</span>
              <h3 className="text-3xl font-black text-gray-900 mb-8">{selectedRecord.title}</h3>
              <div className="bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100 flex flex-col items-center gap-6">
                 <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm"><LinkIcon size={40} /></div>
                 <button onClick={() => window.open(selectedRecord.content, '_blank')} className="px-10 py-5 bg-indigo-900 text-white rounded-2xl font-black shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                   前往欣赏作品 <ExternalLink size={20} />
                 </button>
                 <p className="text-[10px] text-gray-400 font-mono break-all px-6 py-3 bg-white/50 rounded-xl">{selectedRecord.content}</p>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100">
               <h4 className="font-black text-gray-900 mb-6 flex items-center gap-2"><Sparkles className="text-orange-500" size={20} /> 老师点评与寄语</h4>
               <textarea placeholder="在这里输入您的评价与指导..." className="w-full bg-gray-50 border-none rounded-3xl p-6 h-32 outline-none font-bold text-gray-700"></textarea>
               <button onClick={() => setSelectedRecord(null)} className="w-full mt-6 py-6 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl active:scale-95 transition-all">确认点评并发送给家庭</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 子页面：参与学生花名册 ---
  if (view === 'roster') {
    const filteredFamilies = registeredFamilies.filter(f => 
      f.studentName.includes(searchTerm) || f.parentName.includes(searchTerm)
    );

    return (
      <div className="min-h-screen bg-[#fcfaf7]">
        <div className="fixed top-0 inset-x-0 h-24 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center px-8 z-50">
          <button onClick={() => setView('overview')} className="mr-6 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"><ArrowLeft size={24} /></button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">参与学生花名册</h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Registered Students & Families</p>
          </div>
        </div>

        <div className="pt-32 pb-32 px-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
           <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center gap-4">
             <div className="p-4 bg-gray-50 rounded-full ml-2"><Search className="text-gray-400" size={24} /></div>
             <input type="text" placeholder="按姓名搜索学生或家长..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent py-4 outline-none font-bold text-gray-800 text-lg placeholder:text-gray-200" />
           </div>

           <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-900 text-white">
                   <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest">学生姓名</th>
                   <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest">协同家长</th>
                   <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest text-center">综合评分</th>
                   <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest">入驻时间</th>
                   <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest text-right">操作</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {filteredFamilies.map((family) => (
                   <tr key={family.id} className="hover:bg-indigo-50/30 transition-all">
                     <td className="px-10 py-8 font-black text-slate-800 text-lg">{family.studentName}</td>
                     <td className="px-10 py-8 font-bold text-slate-500">{family.parentName}</td>
                     <td className="px-10 py-8 text-center"><span className="text-2xl font-black text-indigo-600">{getStudentScore(family.studentName)}</span></td>
                     <td className="px-10 py-8 text-xs font-bold text-gray-400">{family.timestamp}</td>
                     <td className="px-10 py-8 text-right"><button onClick={() => { setView('records'); setSearchTerm(family.studentName); }} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all">查看档案汇总</button></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  }

  // --- 子页面：档案库汇总 (表格视图) ---
  if (view === 'records') {
    const filteredRecords = cocreationRecords.filter(r => 
      r.studentName.includes(searchTerm) || r.title.includes(searchTerm)
    );

    return (
      <div className="min-h-screen bg-[#fcfaf7]">
        <div className="fixed top-0 inset-x-0 h-24 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center px-8 z-50">
          <button onClick={() => setView('overview')} className="mr-6 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"><ArrowLeft size={24} /></button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">档案库汇总</h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase italic">Archives & Multi-evaluation Summary</p>
          </div>
        </div>

        <div className="pt-32 pb-32 px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
           <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center gap-4">
             <div className="p-4 bg-gray-50 rounded-full ml-2"><Search className="text-gray-400" size={24} /></div>
             <input type="text" placeholder="搜索学生姓名或作品标题..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent py-4 outline-none font-bold text-gray-800 text-lg placeholder:text-gray-200" />
           </div>

           <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-[#1a365d] text-white">
                   <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest">学生姓名</th>
                   <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest">家长</th>
                   <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest">亲子共创空间 (链接)</th>
                   <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-center">教师评分</th>
                   <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-right">管理操作</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {filteredRecords.length > 0 ? (
                   [...filteredRecords].reverse().map((record) => {
                     const teacherAvg = getTeacherAvgRating(record.studentName);
                     return (
                       <tr key={record.id} className="hover:bg-indigo-50/20 group transition-all">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                 {record.studentName[0]}
                               </div>
                               <span className="font-black text-slate-800">{record.studentName}</span>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <span className="font-bold text-slate-500">{record.parentName}</span>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-2">
                               <div className="max-w-[200px] truncate text-[10px] text-indigo-400 font-mono italic">{record.content}</div>
                               <button onClick={() => window.open(record.content, '_blank')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                  <ArrowUpRight size={14} />
                               </button>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <div className="flex flex-col items-center">
                               <div className="flex gap-0.5 mb-1">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={10} fill={i <= Math.round(teacherAvg) ? "#10b981" : "none"} className={i <= Math.round(teacherAvg) ? "text-emerald-500" : "text-gray-100"} />
                                  ))}
                               </div>
                               <span className="text-xs font-black text-emerald-600">{teacherAvg} <span className="text-[10px] text-gray-300">/ 5.0</span></span>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => setSelectedRecord(record)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">点评成果</button>
                               <button onClick={(e) => deleteRecord(record.id, e)} className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                         </td>
                       </tr>
                     );
                   })
                 ) : (
                   <tr>
                     <td colSpan={5} className="py-40 text-center opacity-10">
                        <ClipboardList size={100} className="mx-auto mb-4" />
                        <p className="text-2xl font-black">暂无匹配的成果汇总记录</p>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] pb-32">
      <div className="bg-[#1a365d] text-white p-12 rounded-b-[5rem] shadow-2xl relative overflow-hidden mb-16">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none -translate-y-20 translate-x-20">
           <Layout size={600} strokeWidth={0.5} />
        </div>

        <div className="flex items-center justify-between relative z-10 mb-16">
           <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <p className="text-orange-400 text-xs font-black tracking-widest uppercase">Center for Teaching Excellence</p>
              </div>
              <h1 className="text-5xl font-black tracking-tighter">教学指挥中台</h1>
           </div>
           <div className="flex gap-4">
             <button onClick={() => window.location.reload()} className="p-5 bg-white/10 rounded-3xl border border-white/10 hover:bg-white/20 transition-all"><RefreshCw size={28} /></button>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          <button onClick={() => { setView('roster'); setSearchTerm(''); }} className="bg-white/10 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem] text-left hover:bg-white/20 transition-all group">
            <Users size={24} className="text-white mb-4" />
            <p className="text-white/50 text-[10px] font-black tracking-widest mb-1 uppercase">参与学生</p>
            <h3 className="text-4xl font-black tracking-tight">{registeredFamilies.length}</h3>
          </button>
          
          <button onClick={() => { setView('records'); setSearchTerm(''); }} className="bg-white/10 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem] text-left hover:bg-white/20 transition-all group">
            <ClipboardList size={24} className="text-white mb-4" />
            <p className="text-white/50 text-[10px] font-black tracking-widest mb-1 uppercase">档案库汇总</p>
            <h3 className="text-4xl font-black tracking-tight">{cocreationRecords.length}</h3>
          </button>

          <div className="bg-white/10 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem]">
            <TrendingUp size={24} className="text-white mb-4" />
            <p className="text-white/50 text-[10px] font-black tracking-widest mb-1 uppercase">任务进度</p>
            <h3 className="text-4xl font-black tracking-tight">82%</h3>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem]">
            <Heart size={24} className="text-white mb-4" />
            <p className="text-white/50 text-[10px] font-black tracking-widest mb-1 uppercase">满意度</p>
            <h3 className="text-4xl font-black tracking-tight">98%</h3>
          </div>
        </div>
      </div>

      <div className="px-10 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-10">
          <EvaluationRadar data={classAverageStats} title="班级五维成长平均值" />
          <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3"><Sparkles size={24} className="text-orange-500" /> AI 实时学情简报</h3>
            <div className="space-y-6">
              <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                <p className="text-indigo-900 text-sm font-bold leading-relaxed italic">“今日已有 {registeredFamilies.length} 位学生完成初步登录，成果档案库汇总了 {cocreationRecords.length} 项新记录。”</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">亲子共创成果墙</h3>
            <button onClick={() => setView('records')} className="bg-indigo-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-transform">管理全班档案</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {localWorks.map(work => (
              <div key={work.id} className="bg-white rounded-[4rem] overflow-hidden shadow-xl border border-gray-100 group relative">
                <button 
                  onClick={(e) => deleteMockWork(work.id, e)}
                  className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur text-red-400 hover:text-red-500 rounded-2xl transition-all z-10"
                >
                  <Trash2 size={20} />
                </button>
                <img src={work.imageUrl} className="aspect-[16/10] w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="p-10">
                  <h4 className="font-black text-2xl text-gray-900 mb-3">{work.title}</h4>
                  <p className="text-sm text-gray-400 mb-8 line-clamp-2">{work.description}</p>
                  <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                    <span className="text-[10px] font-black text-indigo-500 uppercase">学生：{work.studentName}</span>
                    <div className="flex items-center gap-2 text-pink-500"><Heart size={20} fill="currentColor" /><span className="text-xl font-black">{work.likes}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTeacher;
