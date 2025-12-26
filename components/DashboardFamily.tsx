
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Book, Palette, Video, ChevronRight, Star, Heart, 
  MessageCircle, MessageSquare, Sparkles, ArrowLeft, Gamepad2, Play, 
  Camera, CheckCircle2, Layout, BookOpen, Quote, Info, X,
  ChevronLeft, Music, Trophy, Users, FileText, Layers, Film, Volume2,
  HelpCircle, Eye, Monitor, Loader2, Mic, Zap, Lightbulb, ExternalLink, AlignLeft,
  Scissors, Wind, CloudSun, Gem, Bird, BookMarked, RefreshCw, Image as ImageIcon,
  Target, AlertCircle, Sparkle, Brush, Languages, Coffee, Sun, Compass, Plus, Trash2,
  ChevronDown, ChevronUp, Upload, Type, Link as LinkIcon, Wand2, Share2, Search, Lock,
  Send, BarChart2, ShieldCheck, Award, UserCheck, UserPlus, GraduationCap, ZapOff, Activity,
  Download, FileDown, LayoutGrid, Flame
} from 'lucide-react';
import { STORY_CONTENT, EVALUATION_LABELS, EVALUATION_CRITERIA, MOCK_WORKS } from '../constants';
import AIChatBox from './AIChatBox';
import EvaluationRadar from './EvaluationRadar';
import { CoCreationRecord } from '../types';

// Define GAME_PAIRS for the matching game
const GAME_PAIRS = [
  { id: '1', character: '牛郎', event: '悉心照料老牛，勤劳又善良。' },
  { id: '2', character: '织女', event: '在银河边织彩锦，向往人间生活。' },
  { id: '3', character: '老牛', event: '开口说话传天机，指引牛郎去相会。' },
  { id: '4', character: '王母娘娘', event: '狠心划出银河，把恩爱夫妻拆散。' },
  { id: '5', character: '喜鹊', event: '搭起一年一度相会的桥梁。' }
];

type SubView = 'none' | 'intro_perception' | 'reading_study' | 'vocab_study' | 'card_interaction' | 'summary_extension' | 'workshop' | 'evaluation_system' | 'time_messenger' | 'future_art' | 'student_square';
type WorkshopMode = 'reading' | 'drama' | 'craft';
type ChatType = 'none' | 'microscope' | 'inspiration';

interface VocabItem {
  word: string;
  pinyin: string;
  desc: string;
  icon: any;
  color: string;
  isCustom?: boolean;
}

interface DashboardFamilyProps {
  studentName: string;
  parentName: string;
}

const DashboardFamily: React.FC<DashboardFamilyProps> = ({ studentName, parentName }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [subView, setSubView] = useState<SubView>('none');
  const [workshopMode, setWorkshopMode] = useState<WorkshopMode>('reading');
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [activeChat, setActiveChat] = useState<ChatType>('none');
  
  // Evaluation system UI state
  const [isPortraitExpanded, setIsPortraitExpanded] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [isScoringExpanded, setIsScoringExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // --- 三方评价数据状态 ---
  const [selfRatings, setSelfRatings] = useState({
    understanding: 0,
    creation: 0,
    collaboration: 0,
    expression: 0,
    aiUsage: 0
  });
  const [peerRatings, setPeerRatings] = useState({
    understanding: 3,
    creation: 3,
    collaboration: 3,
    expression: 3,
    aiUsage: 3
  });
  const [teacherRatings, setTeacherRatings] = useState({
    understanding: 3,
    creation: 3,
    collaboration: 3,
    expression: 3,
    aiUsage: 3
  });

  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState(''); 
  const [isUploading, setIsUploading] = useState(false);

  const [customVocab, setCustomVocab] = useState<VocabItem[]>([]);
  const [isAddingVocab, setIsAddingVocab] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newPinyin, setNewPinyin] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [myRecords, setMyRecords] = useState<CoCreationRecord[]>([]);
  const [squareLikes, setSquareLikes] = useState<Record<string, number>>({});

  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [correctMatches, setCorrectMatches] = useState<string[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);
  
  const shuffledEvents = useMemo(() => {
    return [...GAME_PAIRS].sort(() => Math.random() - 0.5);
  }, []);

  // --- 动态计算评分与画像数据 (三方加权均值) ---
  const dynamicStats = useMemo(() => {
    const calc = (key: keyof typeof selfRatings) => {
      const s = selfRatings[key] || 0;
      const p = peerRatings[key] || 0;
      const t = teacherRatings[key] || 0;
      const avg = (s + p + t) / 3;
      return Math.round(avg * 20); 
    };

    return {
      understanding: calc('understanding'),
      creation: calc('creation'),
      collaboration: calc('collaboration'),
      expression: calc('expression'),
      aiUsage: calc('aiUsage')
    };
  }, [selfRatings, peerRatings, teacherRatings]);

  const totalScore = useMemo(() => {
    const vals = Object.values(dynamicStats);
    return Math.round(vals.reduce((a: number, b: number) => a + b, 0) / (vals.length || 1));
  }, [dynamicStats]);

  useEffect(() => {
    const savedVocab = localStorage.getItem(`custom_vocab_${studentName}`);
    if (savedVocab) setCustomVocab(JSON.parse(savedVocab));

    const loadRecords = () => {
      const savedRecords = JSON.parse(localStorage.getItem('ai_bridge_cocreation_records') || '[]');
      setMyRecords(savedRecords.filter((r: CoCreationRecord) => r.studentName === studentName));
    };
    loadRecords();

    const savedSelf = localStorage.getItem(`self_ratings_${studentName}`);
    const savedPeer = localStorage.getItem(`peer_ratings_${studentName}`);
    const savedTeacher = localStorage.getItem(`teacher_ratings_${studentName}`);
    if (savedSelf) setSelfRatings(JSON.parse(savedSelf));
    if (savedPeer) setPeerRatings(JSON.parse(savedPeer));
    if (savedTeacher) setTeacherRatings(JSON.parse(savedTeacher));
  }, [studentName]);

  const saveRatings = () => {
    localStorage.setItem(`self_ratings_${studentName}`, JSON.stringify(selfRatings));
    localStorage.setItem(`peer_ratings_${studentName}`, JSON.stringify(peerRatings));
    localStorage.setItem(`teacher_ratings_${studentName}`, JSON.stringify(teacherRatings));
    setHasSynced(true);
    alert('评估数据已成功同步！系统已根据最新的自评、互评与师评结果，重新绘制了您的全景成长画像。下载按钮已激活。');
  };

  const handleDownloadReport = () => {
    if (!hasSynced) return;
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      window.print();
    }, 1200);
  };

  const handleCardClick = (id: string) => {
    if (id === 't1') setSubView('vocab_study');
    if (id === 't2') setSubView('card_interaction');
    if (id === 't3') setSubView('workshop');
    if (id === 't4') setSubView('evaluation_system');
    if (id === 't5') setSubView('time_messenger');
    if (id === 't6') setSubView('future_art');
  };

  const submitRecord = () => {
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      alert('请填写成果标题并提供分享链接哦！');
      return;
    }
    setIsUploading(true);
    const newRecord: CoCreationRecord = {
      id: Date.now().toString(),
      studentName,
      parentName,
      type: 'video', 
      title: uploadTitle,
      content: uploadContent, 
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    };
    const allRecords = JSON.parse(localStorage.getItem('ai_bridge_cocreation_records') || '[]');
    localStorage.setItem('ai_bridge_cocreation_records', JSON.stringify([...allRecords, newRecord]));
    setTimeout(() => {
      setMyRecords(prev => [...prev, newRecord]);
      setIsUploading(false);
      setIsAddingRecord(false);
      setUploadTitle('');
      setUploadContent('');
      alert('成果提交成功！老师将会在档案库中查看您的亲子共创成果。');
    }, 1000);
  };

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这项成果吗？删除后老师将无法在档案中看到它。')) return;
    const allRecords = JSON.parse(localStorage.getItem('ai_bridge_cocreation_records') || '[]');
    const updatedAllRecords = allRecords.filter((r: CoCreationRecord) => r.id !== id);
    localStorage.setItem('ai_bridge_cocreation_records', JSON.stringify(updatedAllRecords));
    setMyRecords(prev => prev.filter(r => r.id !== id));
  };

  const removeVocab = (word: string) => {
    const newList = customVocab.filter(v => v.word !== word);
    localStorage.setItem(`custom_vocab_${studentName}`, JSON.stringify(newList));
    setCustomVocab(newList);
  };

  const handleManualAdd = () => {
    if (!newWord.trim() || !newPinyin.trim() || !newDesc.trim()) {
      alert("请完整填写词语、拼音和解释哦！");
      return;
    }
    const newItem: VocabItem = {
      word: newWord,
      pinyin: newPinyin,
      desc: newDesc,
      icon: BookMarked,
      color: ['text-pink-500', 'text-teal-500', 'text-orange-500', 'text-purple-500'][Math.floor(Math.random() * 4)],
      isCustom: true
    };
    const newList = [...customVocab, newItem];
    localStorage.setItem(`custom_vocab_${studentName}`, JSON.stringify(newList));
    setCustomVocab(newList);
    setNewWord('');
    setNewPinyin('');
    setNewDesc('');
    setIsAddingVocab(false);
  };

  const SubHeader = ({ title, colorClass = "text-indigo-900", onBack }: { title: string, colorClass?: string, onBack?: () => void }) => (
    <div className="fixed top-0 inset-x-0 h-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center px-6 z-50 print:hidden">
      <button 
        onClick={onBack || (() => setSubView('none'))} 
        className="mr-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
      >
        <ChevronLeft size={24} className="text-gray-600 group-active:-translate-x-1 transition-transform" />
      </button>
      <div>
        <h2 className={`text-xl font-black ${colorClass}`}>{title}</h2>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">家校协同共创空间</p>
      </div>
    </div>
  );

  interface StarRatingProps {
    value: number;
    onChange: (val: number) => void;
    label: string;
    activeColor?: string;
    readOnly?: boolean;
    compact?: boolean;
  }

  const StarRating: React.FC<StarRatingProps> = ({ 
    value, 
    onChange, 
    label, 
    activeColor = "text-yellow-400", 
    readOnly = false, 
    compact = false 
  }) => (
    <div className={`flex items-center justify-between ${compact ? 'py-2' : 'py-3'} border-b border-gray-50 last:border-0 group`}>
      <div className="flex items-center gap-2">
         <div className={`w-1 h-3 rounded-full ${value > 0 ? (readOnly ? 'bg-gray-300' : 'bg-indigo-500') : 'bg-gray-100'}`}></div>
         <span className={`font-black ${compact ? 'text-xs' : 'text-sm'} ${readOnly ? 'text-gray-400' : 'text-gray-600 group-hover:text-indigo-600'} transition-colors`}>{label}</span>
      </div>
      <div className="flex gap-1 items-center">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <button 
              key={i} 
              disabled={readOnly}
              onClick={() => onChange(i)}
              className={`transition-all duration-300 transform ${!readOnly && 'active:scale-125 hover:scale-110'} ${i <= value ? activeColor + ' drop-shadow-sm' : 'text-gray-100'} ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <Star size={compact ? 16 : 22} fill={i <= value ? "currentColor" : "none"} strokeWidth={i <= value ? 1 : 2.5} />
            </button>
          ))}
        </div>
        {value > 0 && <span className={`ml-2 w-4 font-black ${compact ? 'text-[10px]' : 'text-xs'} ${readOnly ? 'text-gray-300' : 'text-indigo-400'}`}>{value}</span>}
      </div>
    </div>
  );

  const StudentSquareView = () => {
    return (
      <div className="min-h-screen bg-[#fcfaf7] pt-28 pb-32 px-6">
        <SubHeader title="班级学生广场" colorClass="text-pink-600" />
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
          <div className="bg-gradient-to-r from-pink-500 to-orange-400 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform"><LayoutGrid size={200} /></div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black mb-4">发现同伴的精彩</h3>
              <p className="text-pink-50 font-medium max-w-xl text-lg">在这里欣赏同学们的奇思妙想，给喜欢的作品点个赞，或者让 AI 帮你写一段赞美的话吧！</p>
              <div className="mt-8 flex gap-4">
                <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-2xl flex items-center gap-2">
                   <Flame size={20} className="text-orange-200" />
                   <span className="font-black text-sm">当前共有 {MOCK_WORKS.length} 个精彩作品展示</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {MOCK_WORKS.map(work => (
              <div key={work.id} className="bg-white rounded-[3.5rem] overflow-hidden shadow-xl border border-gray-100 group hover:-translate-y-2 transition-all duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-6 left-6 flex gap-2">
                    {work.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xs">{work.studentName[0]}</div>
                    <span className="text-sm font-black text-slate-800">{work.studentName}同学</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-3 group-hover:text-pink-600 transition-colors">{work.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2 mb-8">{work.description}</p>
                  
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <button 
                      onClick={() => setSquareLikes(prev => ({...prev, [work.id]: (prev[work.id] || work.likes) + 1}))}
                      className="flex items-center gap-2 text-pink-500 group/like hover:scale-110 transition-transform active:scale-90"
                    >
                      <Heart size={20} fill={squareLikes[work.id] ? "currentColor" : "none"} className={squareLikes[work.id] ? "animate-pulse" : ""} />
                      <span className="text-lg font-black">{squareLikes[work.id] || work.likes}</span>
                    </button>
                    <button 
                      onClick={() => alert(`AI 赞美建议：这段作品的${work.tags[0]}表现力极强，构思非常独特！`)}
                      className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all"
                      title="AI 生成评语灵感"
                    >
                      <Sparkles size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-10">
            <button onClick={() => setSubView('none')} className="px-16 py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-lg">
              <ArrowLeft size={24} /> 返回学习路径
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EvaluationSystemView = () => {
    const getLevelIndex = (val: number) => {
      if (val < 40) return 0;
      if (val < 80) return 1;
      return 2;
    };

    return (
      <div className="min-h-screen bg-[#fcfaf7] pt-28 pb-32 px-6 print:pt-4 print:pb-4 print:bg-white">
        <SubHeader title="多元评估体系" colorClass="text-indigo-900" />
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
          
          {/* Top Hero Section */}
          <div className="bg-white p-10 rounded-[4.5rem] shadow-2xl border border-gray-100 overflow-hidden relative print:shadow-none print:border-none print:rounded-none">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none -rotate-12 print:hidden"><BarChart2 size={400} /></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
              <div className="flex items-center gap-8">
                 <div className="relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] rotate-12 flex items-center justify-center shadow-2xl shadow-indigo-200 print:shadow-none print:bg-indigo-700 print:rotate-0">
                       <span className="text-5xl font-black text-white -rotate-12 print:rotate-0">{totalScore}</span>
                    </div>
                    <div className="absolute -top-4 -right-4 p-3 bg-orange-500 text-white rounded-2xl shadow-xl animate-bounce print:hidden"><Activity size={20} /></div>
                 </div>
                 <div>
                    <h5 className="text-3xl font-black text-slate-800 tracking-tight">综合成长评估报告</h5>
                    <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-widest print:text-gray-600">Growth Analytics & Multi-Evaluation</p>
                    <p className="hidden print:block text-xs text-gray-500 font-bold mt-1">学生：{studentName} | 家长：{parentName} | 生成时间：{new Date().toLocaleString()}</p>
                 </div>
              </div>
              
              <button 
                onClick={() => setIsPortraitExpanded(!isPortraitExpanded)}
                className={`flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black transition-all shadow-xl hover:scale-105 active:scale-95 print:hidden ${isPortraitExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-900 text-white shadow-indigo-200'}`}
              >
                {isPortraitExpanded ? <><ChevronUp size={24} /> 收起全景档案</> : <><ChevronDown size={24} /> 点击展开全景档案</>}
              </button>
            </div>

            <div className={`${isPortraitExpanded ? 'block' : 'hidden'} print:block mt-16 space-y-20 animate-in slide-in-from-top-6 fade-in duration-700 print:mt-10 print:space-y-10`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center print:grid-cols-2 print:gap-10">
                  <div className="space-y-10 print:space-y-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest print:bg-white print:border print:border-indigo-100">Visualized Intelligence</div>
                      <h4 className="text-5xl font-black text-slate-900 leading-tight print:text-3xl">全景成长画像</h4>
                      <p className="text-gray-400 font-medium leading-relaxed print:text-gray-600 print:text-sm">
                        基于三方评价数据通过加权算法动态生成。雷达图清晰地展现了学生在《牛郎织女》学习周期内的核心素养达成情况。
                      </p>
                    </div>
                    
                    <div className="p-10 bg-gradient-to-br from-slate-50 to-white rounded-[3.5rem] border border-indigo-100 shadow-inner relative overflow-hidden group print:rounded-3xl print:p-6 print:shadow-none print:bg-white">
                      <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600 group-hover:rotate-12 transition-transform print:hidden"><Wand2 size={80} /></div>
                      <h6 className="text-xs font-black text-indigo-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <Sparkles size={18} /> AI 深度学情诊断建议
                      </h6>
                      <div className="space-y-4 relative z-10">
                        <p className="text-lg text-slate-700 font-black leading-relaxed print:text-base">
                          {totalScore > 85 ? '🌟 您在 AIGC 的应用与创作表现上展现了惊人的天赋！建议您在接下来的“未来艺术展”中担任创意组长，分享您的亲子共创经验。' : 
                           totalScore > 70 ? '🚀 学习表现非常稳健，特别是在理解故事内涵方面做得很好。如果能进一步发挥 AI 辅助创作的潜力，您的画像将会更加完美。' :
                           '📚 这是一个很棒的开始！建议在后续学习中多与家长交流复述情节，并在“词语显微镜”模块投入更多时间，夯实基础知识。'}
                        </p>
                        <div className="h-px bg-indigo-100/50 w-full"></div>
                        
                        {/* 豆包 AI 提醒 */}
                        <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 print:bg-white print:border-gray-200">
                           <p className="text-xs font-black text-orange-700 mb-2 flex items-center gap-2 italic">
                              <Zap size={14} /> 进阶建议：将本报告上传至豆包 AI
                           </p>
                           <p className="text-[11px] text-orange-600/80 leading-relaxed font-bold">
                              您可以将本报告（PDF或截图）发送给豆包 AI，输入：“请根据这份成长评估报告，为我制定一份个性化的课外读写提升计划”。
                           </p>
                           <a 
                             href="https://www.doubao.com/chat/" 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="mt-3 inline-flex items-center gap-2 text-[10px] font-black bg-white text-orange-600 px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-all print:hidden"
                           >
                             前往豆包开启 AI 分析 <ExternalLink size={12} />
                           </a>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-bold italic print:text-[9px]">
                          <Info size={14} /> 本画像由“智绘鹊桥”智慧评估引擎实时驱动生成
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[450px] relative print:h-[350px]">
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-[120px] animate-pulse print:hidden"></div>
                    <EvaluationRadar data={dynamicStats} />
                  </div>
                </div>

                <div className="pt-16 border-t border-gray-100 print:pt-8 print:border-gray-200">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 print:mb-6">
                      <div>
                        <h5 className="text-3xl font-black text-slate-800 flex items-center gap-4 print:text-2xl">
                          <FileText className="text-indigo-500" /> 三方均值评分清单
                        </h5>
                        <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">Detailed Multi-Party Metrics</p>
                      </div>
                   </div>
                   
                   <div className="overflow-hidden rounded-[3.5rem] border border-gray-100 shadow-xl bg-white print:rounded-2xl print:shadow-none print:border">
                     <table className="w-full text-left">
                       <thead>
                         <tr className="bg-slate-900 text-white print:bg-gray-100 print:text-black">
                           <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest print:px-6 print:py-4">素养维度 (Metric)</th>
                           <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest text-center print:px-6 print:py-4">三方分值分布</th>
                           <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest text-center print:px-6 print:py-4">综合均分</th>
                           <th className="px-10 py-7 text-[11px] font-black uppercase tracking-widest text-center print:px-6 print:py-4">达成状态</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {Object.entries(EVALUATION_CRITERIA).map(([key, criterion]) => {
                            const sVal = (selfRatings as any)[key];
                            const pVal = (peerRatings as any)[key];
                            const tVal = (teacherRatings as any)[key];
                            const avg = (sVal + pVal + tVal) / 3;
                            const percent = Math.round(avg * 20);
                            const activeIdx = getLevelIndex(percent);
                            return (
                              <tr key={key} className="hover:bg-indigo-50/30 transition-all group">
                                <td className="px-10 py-8 font-black text-slate-800 text-lg print:px-6 print:py-4 print:text-sm">{criterion.title}</td>
                                <td className="px-10 py-8 print:px-6 print:py-4">
                                   <div className="flex items-center justify-center gap-4 print:gap-2">
                                      <div className="flex flex-col items-center gap-1"><div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-black print:bg-white print:border">{sVal}</div></div>
                                      <div className="w-px h-6 bg-gray-100 print:hidden"></div>
                                      <div className="flex flex-col items-center gap-1"><div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black print:bg-white print:border">{pVal}</div></div>
                                      <div className="w-px h-6 bg-gray-100 print:hidden"></div>
                                      <div className="flex flex-col items-center gap-1"><div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black print:bg-white print:border">{tVal}</div></div>
                                   </div>
                                </td>
                                <td className="px-10 py-8 text-center print:px-6 print:py-4"><div className="inline-flex items-baseline gap-1"><span className="text-3xl font-black text-slate-900 print:text-xl">{percent}</span><span className="text-xs font-bold text-gray-400">%</span></div></td>
                                <td className="px-10 py-8 text-center print:px-6 print:py-4">
                                   <div className={`inline-flex px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm print:bg-white print:border print:px-3 print:py-1 ${activeIdx === 2 ? 'bg-green-500 text-white' : activeIdx === 1 ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                      {activeIdx === 0 ? '未达成' : activeIdx === 1 ? '良好' : '卓越'}
                                   </div>
                                </td>
                              </tr>
                            );
                          })}
                       </tbody>
                     </table>
                   </div>
                </div>

                {/* Scoring Guidelines - Always visible during printing */}
                <div className="pt-16 border-t border-gray-100 print:pt-10 print:border-gray-200">
                   <h5 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 print:text-xl">
                      <Award className="text-orange-500" /> 评估达成标准细则 (Scoring Guidelines)
                   </h5>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-1 print:gap-4">
                      {Object.entries(EVALUATION_CRITERIA).map(([key, item]) => (
                        <div key={key} className="p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 print:rounded-xl print:bg-white print:p-4 print:border-gray-200">
                           <h6 className="font-black text-slate-900 mb-4 flex items-center gap-2 print:text-sm print:mb-2">
                              <div className="w-1.5 h-3 bg-indigo-500 rounded-full"></div> {item.title}
                           </h6>
                           <div className="space-y-2">
                              {item.levels.map((lvl, idx) => (
                                <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                                   <span className={`font-black shrink-0 ${idx === 2 ? 'text-indigo-600' : 'text-gray-300'}`}>L{idx+1}</span>
                                   <span className={`${idx === 2 ? 'font-bold text-indigo-900/70' : 'text-gray-500'} print:text-[10px]`}>{lvl}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
            </div>
          </div>

          {/* Scoring Center UI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
            <div className="lg:col-span-8">
              <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-gray-100 h-full flex flex-col">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-orange-50 text-orange-600 rounded-[1.5rem] shadow-sm"><UserCheck size={32} /></div>
                      <div>
                         <h4 className="text-2xl font-black text-slate-900 leading-none">1. 学生/家长互动自评区</h4>
                         <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">Interactive Self-Assessment</p>
                      </div>
                   </div>
                   <button 
                      onClick={() => setShowCriteriaModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all shadow-sm"
                    >
                      <Info size={16} /> 查看标准
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-12">
                   {Object.entries(EVALUATION_LABELS).map(([key, label]) => (
                     <div key={key} className="bg-orange-50/20 px-6 py-2 rounded-[2rem] border border-orange-50/50">
                       <StarRating 
                        label={label} 
                        value={(selfRatings as any)[key]} 
                        activeColor="text-orange-400"
                        onChange={(val) => {
                          setSelfRatings(prev => ({ ...prev, [key]: val }));
                          setHasSynced(false);
                        }}
                       />
                     </div>
                   ))}
                </div>

                <div className="mt-auto pt-10 border-t border-gray-50 flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={saveRatings}
                    className="flex-[2] py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                     <CheckCircle2 size={32} /> 同步并计算最新报告
                  </button>
                  
                  <button 
                    onClick={handleDownloadReport}
                    disabled={!hasSynced || isDownloading}
                    className={`flex-1 py-8 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${hasSynced ? 'bg-slate-900 text-white hover:bg-black active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                     {isDownloading ? <Loader2 className="animate-spin" size={32} /> : <FileDown size={32} />}
                     下载评估报告
                  </button>
                </div>
                
                <div className="mt-6 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm"><Zap size={18} /></div>
                     <p className="text-sm font-black text-blue-900">AIGC 提效建议：</p>
                   </div>
                   <p className="text-xs text-blue-700 font-bold leading-relaxed mb-4">
                      同步并下载报告后，您可以将 PDF 报告上传至豆包 AI 聊天框，获取深度分析报告与个性化提升方案。
                   </p>
                   <a 
                     href="https://www.doubao.com/chat/" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-xs font-black bg-white text-blue-600 px-6 py-3 rounded-2xl shadow-sm hover:scale-105 transition-all"
                   >
                     点击前往豆包进行 AI 分析 <ExternalLink size={14} />
                   </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-100 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 pointer-events-none"><ShieldCheck size={180} /></div>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ShieldCheck size={24} /></div>
                  <h4 className="text-xl font-black text-slate-800">外部评估详情</h4>
                </div>

                <div className="flex-1 space-y-4">
                  <button 
                    onClick={() => setIsScoringExpanded(!isScoringExpanded)}
                    className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${isScoringExpanded ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-gray-100 shadow-sm hover:border-indigo-100'}`}
                  >
                     <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 border border-indigo-50"><UserPlus size={24} /></div>
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 border border-emerald-50"><GraduationCap size={24} /></div>
                     </div>
                     <span className="font-black text-gray-900 tracking-tight">{isScoringExpanded ? '点击收起互评/师评' : '点击查看详细分值'}</span>
                     <div className={`p-2 rounded-full transition-all ${isScoringExpanded ? 'bg-indigo-600 text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                        <ChevronDown size={20} />
                     </div>
                  </button>

                  {isScoringExpanded && (
                    <div className="space-y-8 mt-4 animate-in slide-in-from-top-4 fade-in duration-500">
                       <section>
                          <h5 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 px-4"><UserPlus size={14} /> 2. 同学互评 (已同步)</h5>
                          <div className="bg-indigo-50/20 p-5 rounded-[2.5rem] border border-indigo-50">
                             {Object.entries(EVALUATION_LABELS).map(([key, label]) => (
                               <StarRating 
                                key={key} 
                                label={label} 
                                value={(peerRatings as any)[key]} 
                                activeColor="text-indigo-400"
                                onChange={() => {}}
                                readOnly={true}
                                compact={true}
                               />
                             ))}
                          </div>
                       </section>

                       <section>
                          <h5 className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 px-4"><GraduationCap size={14} /> 3. 教师专业分 (已核准)</h5>
                          <div className="bg-emerald-50/20 p-5 rounded-[2.5rem] border border-emerald-50">
                             {Object.entries(EVALUATION_LABELS).map(([key, label]) => (
                               <StarRating 
                                key={key} 
                                label={label} 
                                value={(teacherRatings as any)[key]} 
                                activeColor="text-emerald-500"
                                onChange={() => {}}
                                readOnly={true}
                                compact={true}
                               />
                             ))}
                          </div>
                       </section>
                    </div>
                  )}

                  {!isScoringExpanded && (
                    <div className="p-8 text-center text-gray-300">
                       <ZapOff size={40} className="mx-auto mb-4 opacity-20" />
                       <p className="text-xs font-bold leading-relaxed">系统已根据班级互评<br/>与教师考评自动填充分值</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-16 print:hidden">
             <button 
               onClick={() => setSubView('none')}
               className="px-20 py-8 bg-indigo-900 text-white rounded-[3rem] font-black shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all group flex items-center gap-5 text-xl"
             >
               <ArrowLeft size={32} className="group-hover:-translate-x-2 transition-transform" /> 完成评估，返回学习路径
             </button>
          </div>
        </div>

        {showCriteriaModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 print:hidden">
             <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><Info size={24} /></div>
                      <div>
                         <h4 className="text-xl font-black text-slate-800">评估达成标准详情</h4>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Scoring Standards Details</p>
                      </div>
                   </div>
                   <button onClick={() => setShowCriteriaModal(false)} className="p-3 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm"><X size={24} /></button>
                </div>
                <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
                   {Object.entries(EVALUATION_CRITERIA).map(([key, item]) => (
                      <div key={key} className="space-y-3 p-6 rounded-3xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                         <div className="flex items-center gap-3">
                            <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                            <h5 className="font-black text-slate-900">{item.title}</h5>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {item.levels.map((level, i) => (
                               <div key={i} className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed ${i === 2 ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-white border-gray-100 text-gray-500'}`}>
                                  <span className="block font-black mb-1 opacity-50">L{i+1}</span>
                                  {level}
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-center">
                   <button onClick={() => setShowCriteriaModal(false)} className="px-12 py-4 bg-indigo-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
                      我明白了
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const IntroPerceptionView = () => {
    const steps = [
      {
        title: "提问引入",
        icon: HelpCircle,
        content: "你们听说过牛郎织女的故事吗？猜猜故事可能发生在哪里，会有什么人物？",
        action: "查看导入视频",
        videoUrl: "https://www.bilibili.com/video/BV1mWt5z3EgE",
        bg: "bg-blue-50",
        mediaType: 'video'
      },
      {
        title: "音乐感知",
        icon: Music,
        content: "播放一段优美的民间音乐，闭上眼，感受故事发生的那个古老时代。",
        question: "音乐让你觉得牛郎和老牛生活是快乐还是辛苦？",
        action: "播放音乐素材",
        videoUrl: "https://www.bilibili.com/video/BV1Ba411G7Rc",
        bg: "bg-orange-50",
        mediaType: 'music'
      },
      {
        title: "美术观察",
        icon: Eye,
        content: "观察艺术作品：织女在木质织机旁，正亲手织就璀璨的星河。",
        question: "画面中的色彩让你想到了什么样的星空？",
        action: "观察浪漫意境",
        videoUrl: "https://www.bilibili.com/video/BV1Gg411y7us",
        bg: "bg-indigo-50",
        mediaType: 'video'
      },
      {
        title: "导入讲解",
        icon: Monitor,
        content: "在正式开始学习前，让我们通过一段导入讲解视频，提前熟悉传统《牛郎织女》的课堂教学内容。",
        question: "通过这段教学导引，你是否对这篇经典课文的学习目标有了更清晰认识？",
        action: "查看导入讲解视频",
        videoUrl: "https://www.bilibili.com/video/BV1okpqeEERf/?share_source=copy_web&vd_source=236e512cec5570d75d7d1428b995aa4f",
        bg: "bg-indigo-50",
        mediaType: 'video'
      }
    ];
    const cur = steps[introStep];
    const handleAction = () => {
      if (introStep < steps.length - 1) {
        setIntroStep(prev => prev + 1);
      } else {
        setSubView('none');
      }
    };
    return (
      <div className="min-h-screen bg-[#fdfaf5] pt-28 pb-32 px-6">
        <SubHeader title="多维感官导入" colorClass="text-indigo-900" />
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
             {steps.map((_, i) => (
               <div key={i} className={`h-2 flex-1 mx-1 rounded-full transition-all ${i <= introStep ? 'bg-indigo-600' : 'bg-gray-100'}`}></div>
             ))}
          </div>
          <div className={`p-10 rounded-[3rem] shadow-xl border-2 border-white transition-all ${cur.bg}`}>
            <div className="flex items-center gap-4 mb-8">
               <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600"><cur.icon size={32} /></div>
               <div>
                 <h3 className="text-2xl font-black text-gray-900">{cur.title}</h3>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">第 {introStep + 1} 步（共 4 步）</p>
               </div>
            </div>
            <div className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] border border-white mb-8 min-h-[160px] flex flex-col justify-center relative group">
               <p className="text-lg font-bold text-gray-800导致 mb-4">{cur.content}</p>
               {cur.videoUrl && (
                 <div className="mb-6">
                   <button 
                     onClick={() => window.open(cur.videoUrl, '_blank')}
                     className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 ${cur.mediaType === 'music' ? 'bg-orange-500 shadow-orange-100' : 'bg-blue-600 shadow-blue-100'}`}
                   >
                     {cur.mediaType === 'music' ? <Music size={20} /> : <Play size={20} />}
                     {cur.action || '点击查看素材'}
                   </button>
                 </div>
               )}
               {cur.question && <p className="text-indigo-600 font-bold italic">“{cur.question}”</p>}
            </div>
            <div className="flex gap-4">
              {introStep > 0 && (
                <button onClick={() => setIntroStep(s => s - 1)} className="flex-1 py-5 bg-white text-gray-400 rounded-2xl font-bold border border-gray-100 active:scale-95 transition-all">上一步</button>
              )}
              <div className="flex-[2] flex flex-col gap-2">
                <button 
                  onClick={handleAction}
                  className="py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {introStep < steps.length - 1 ? (
                    <>已观看，进入下一步 <ChevronRight size={18} /></>
                  ) : (
                    <><CheckCircle2 size={24} /> 完成导入，返回学习路径</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReadingStudyView = () => (
    <div className="min-h-screen bg-[#fcfaf7] pt-28 pb-32 px-6">
      <SubHeader title="课文朗读与精读" colorClass="text-orange-600" />
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><AlignLeft size={32} /></div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">牛郎织女(一)</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">教材精读课文</p>
              </div>
            </div>
            <button 
              onClick={() => window.open('https://hanchacha.com/yuwen/16864969371467.html', '_blank')}
              className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all shadow-sm"
            >
              <ExternalLink size={18} /> 原文参考资料
            </button>
          </div>
          <div className={`prose prose-lg max-w-none text-gray-700 leading-[2.2] space-y-8 font-medium transition-all duration-700 overflow-hidden relative ${isTextExpanded ? 'max-h-[5000px]' : 'max-h-[600px]'}`}>
         <p>　　古时候有个孩子，爹妈都死了，跟着哥哥嫂子过日子。哥哥嫂子待他很不好，叫他吃剩饭，穿破衣裳，夜里在牛棚里睡。牛棚里没床铺，他就睡在干草上。他每天放牛。那头牛跟他很亲密，用温和的眼睛看着他，有时候还伸出舌头舔舔他的手，怪有意思的。哥哥嫂子见着他总是爱理不理的，仿佛他一在眼前，就满身不舒服。两下一比较，他也乐得跟牛一块儿出去，一块儿睡。</p>
<p>　　他没名字，人家见他每天放牛，就叫他牛郎。</p>
<p>　　牛郎照看那头牛挺周到。一来是牛跟他亲密;二来呢，他想，牛那么勤勤恳恳地干活，不好好照看它，怎么对得起它呢?他总是挑很好的草地，让牛吃嫩嫩的青草;家里吃的干草，筛得一点儿土也没有。牛渴了，他就牵着它到小溪的上游，让它喝干净的水。夏天天气热，就在树林里休息;冬天天气冷，就在山坡上晒太阳。他把牛身上刷得干干净净，不沾一点儿草叶、土粒。夏天，一把蒲扇不离手，把成群乱转的牛虻都赶跑了。牛棚也打扫得干干净净。在干干净净的地方住，牛舒服，自已也舒服。</p>
<p>　　牛郎随口哼几支小曲儿，没人听他的，可是牛摇摇耳朵闭闭眼，好像听得挺有味儿。牛郎心里想什么，嘴里就说出来，没人听他的，可是牛咧开嘴，笑嘻嘻的，好像明白他的意思。他常常把看见的、听见的事告诉牛，有时候跟它商量些事。牛好像全了解，虽然没说话，可是眉开眼笑的，他也就满意了。自然，有时候他还觉得美中不足，要是牛能说话，把了解的和想说的都一五一十地说出来，那该多好呢。</p>
<p>　　一年一年过去，牛郎渐渐长大了。哥哥嫂子想独占父亲留下来的家产，把他看成眼中钉。一天，哥哥把牛郎叫到跟前，装得很亲热的样子说：“你如今长大了，也该成家立业了。老人家留下一点儿家产，咱们分了吧。一头牛，一辆车，都归你;别的归我。”</p>
<p>　　嫂子在旁边，三分像笑七分像发狠，说：“我们挑顶有用的东西给你，你知道吗?你要知道好歹，赶紧离开这儿。天还早，能走就走吧。”</p>
<p>　　牛郎听哥哥嫂子这么说，想了想，说：“好，我这就走!”他想哥哥嫂子既然这样对待他，他又何必恋恋不舍呢?那辆车不稀罕，幸亏那头老牛归了他，亲密的伙伴还在一块儿，离不离开家有什么关系?</p>
<p>　　他就牵着老牛，拉着破车，头也不回，一直往前走，走出村子，走过树林，走到山里。从那以后，他白天上山打柴，柴装满一车，就让老牛拉着，到集市上去换粮食;夜晚就让老牛在车旁边休息，自己睡在车上。过了些日子，他在山前边盖了一间草房，又在草房旁边开辟了一块地，种些庄稼，这就算安了家。</p>
<p>　　一天晚上，他走进草房，忽然听见一声“牛郎”，他从没听见过这个声音。是谁叫他呢?回头一看，微弱的星光下，老牛嘴一张一合的，正在说话。</p>
<p>　　老牛真会说话了!</p>
<p>　　牛郎并不觉得奇怪，像是听惯了它说话似的，就转过身子去听。老牛说：“明天黄昏时候，你翻过右边那座山，山那边是一片树林，树林前边是个湖，那时候会有些仙女在湖里洗澡。她们的衣裳放在草地上，你要捡起那件粉红色的纱衣，跑到树林里等着，跟你要衣裳的那个仙女就是你的妻子。这个好机会你可别错过了。”</p>
<p>　　“知道了。”牛郎高兴地回答。</p>
<p>　　第二天黄昏时候，牛郎翻过右边的那座山，穿过树林，走到湖边。湖面映着晚霞的余光，蓝紫色的波纹晃晃荡荡。他听见有女子的笑声，顺着声音看，果然有好些个女子在湖里洗澡。他沿着湖边走，没几步，就看见草地上放着好些衣裳，花花绿绿的，件件都那么漂亮。里头果然有一件粉红色的纱衣，他就拿起来，转身走进树林。</p>
<p>　　他静静地听着，过了一会儿，就听见女子们上岸的声音。只听见一个说：“不早了，咱们赶紧回去吧!咱们偷偷地到人间来，要是老人家知道了，不知道要怎么罚咱们呢!”过了一会儿，又听见一个说：“怎么，你们都走啦?难得来一趟，自由自在地洗个澡，也不多玩一会儿。——哎呀! 我的衣裳哪儿去了?谁瞧见我的衣裳啦?”</p>
<p>　　牛郎听到这儿，从树林里走出来，双手托着纱衣，说：“姑娘，别着急，你的衣裳在这儿。”</p>
<p>　　姑娘穿上衣裳，一边梳她长长的黑头发，一边跟牛郎谈话。牛郎把自己的情形一五一十地说了。姑娘听得出了神，又同情他，又爱惜他，就把自己的情形也告诉了他。</p>
<p>　　原来姑娘是天上王母娘娘的外孙女，织得一手好彩锦，名字叫织女。天天早晨和傍晚，王母娘娘拿她织的彩锦装饰天空，那就是灿烂的云霞，什么东西也没它美丽。王母娘娘需要的彩锦多，就叫织女成天成夜地织，一会儿也不许休息。织女身子老在机房里，手老在梭子上，劳累不用说，自由也没有了，等于关在监狱里，实在难受。她常常想，人人说天上好，天上好，天上有什么好呢?没有自由，又看不见什么。她总想离开天上，到人间去，哪怕是一天半天呢，也可以见识见识人间的景物。她把这个想法跟别的仙女说了。别的仙女也都说早有这种想法。那天下午，王母娘娘喝千年酿的葡萄酒，多喝了点儿，靠在宝座上直打瞌睡，看样子不见得马上就醒。仙女们见机会难得，就你拉我、我拉你地溜出来，一齐飞到人间。她们飞到湖边，看见湖水清得可爱，就跳下去洗澡。织女关在机房里太久了，现在能够在湖水里无拘无束地游泳，心里真痛快，想多玩一会儿，没想到就落在了后边。</p>
<p>　　牛郎听完织女的话，就说：“姑娘，既然天上没什么好，你就不用回去了。你能干活，我也能干活，咱们两个结了婚，一块儿在人间过一辈子吧。”</p>
<p>　　织女想了想，说：“你说得很对，咱们结婚，一块儿过日子吧。”</p>
<p>　　他们俩手拉着手，穿过树林，翻过山头，回到草房。牛郎把老牛指给织女看，说它就是从小到大相依为命的伴儿。织女拍拍老牛的脖子，用腮帮挨挨它的耳朵，算是跟它行见面礼。老牛眉开眼笑地朝她看，仿佛说：“正是这个新娘子。”</p>
            {!isTextExpanded && <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none"></div>}
          </div>
          <div className="flex flex-col items-center gap-6 mt-8">
            <button onClick={() => setIsTextExpanded(!isTextExpanded)} className="flex items-center gap-2 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black hover:bg-indigo-100 transition-all shadow-sm">
              {isTextExpanded ? <><ChevronUp size={20} /> 收起全文</> : <><ChevronDown size={20} /> 展开阅读全文</>}
            </button>
            <button onClick={() => setSubView('none')} className="flex items-center gap-3 px-10 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all">
              <CheckCircle2 size={24} /> 完成朗读，返回学习路径
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const VocabStudyView = () => {
    const defaultVocab: VocabItem[] = [
      { word: '相依为命', pinyin: 'xiāng yī wéi mìng', desc: '互相依靠着生活，谁也离不开谁。', icon: Heart, color: 'text-red-500' },
      { word: '心意相通', pinyin: 'xīn yì xiāng tōng', desc: '彼此心里想的，不用说出来对方就能明白。', icon: Wind, color: 'text-teal-500' },
      { word: '纱衣', pinyin: 'shā yī', desc: '用轻软、透明的丝织品制成的衣服。', icon: Palette, color: 'text-pink-400' },
      { word: '金簪', pinyin: 'jīn zān', desc: '古代用来别住头发的一种金制首饰。', icon: Gem, color: 'text-yellow-500' },
      { word: '鹊桥', pinyin: 'què qiáo', desc: '传说喜鹊在银河上搭起的桥，让牛郎织女相会。', icon: Bird, color: 'text-blue-600' },
      { word: '彩锦', pinyin: 'cǎi jǐn', desc: '带有彩色花纹的丝织品，像彩虹一样美丽。', icon: Layers, color: 'text-purple-500' }
    ];
    return (
      <div className="min-h-screen bg-[#f5f7fa] pt-28 pb-32 px-6">
        <SubHeader title="词语精讲与互动" colorClass="text-indigo-600" />
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {defaultVocab.map(item => (
                 <button key={item.word} onClick={() => setActiveChat('microscope')} className="bg-gray-50/50 p-8 rounded-[3rem] border-2 border-transparent hover:border-indigo-400 hover:bg-white transition-all text-left shadow-sm group flex flex-col min-h-[220px]">
                   <div className="flex items-center gap-4 mb-4">
                     <div className={`p-4 rounded-2xl bg-white shadow-sm ${item.color}`}><item.icon size={24} /></div>
                     <div className="flex flex-col">
                       <span className="text-2xl font-black text-gray-900 leading-tight">{item.word}</span>
                       <span className="text-xs font-bold text-gray-300 italic tracking-widest">{item.pinyin}</span>
                     </div>
                   </div>
                   <p className="text-sm text-gray-600 font-medium mb-6 leading-relaxed flex-1">{item.desc}</p>
                   <div className="flex items-center text-[10px] font-black text-indigo-600 gap-1 opacity-0 group-hover:opacity-100 transition-all uppercase mt-auto">
                     点击开启 AI 智能显微镜 <ExternalLink size={12} />
                   </div>
                 </button>
               ))}
               {customVocab.map((item, index) => (
                 <div key={item.word + index} className="bg-white p-8 rounded-[3rem] border-2 border-indigo-100 shadow-sm flex flex-col min-h-[220px] relative group">
                   <button onClick={() => removeVocab(item.word)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors z-10"><Trash2 size={16} /></button>
                   <div className="flex items-center gap-4 mb-4">
                     <div className={`p-4 rounded-2xl bg-indigo-50 ${item.color}`}><BookMarked size={24} /></div>
                     <div className="flex flex-col">
                       <span className="text-2xl font-black text-gray-900 leading-tight">{item.word}</span>
                       <span className="text-xs font-bold text-gray-300 italic tracking-widest uppercase">{item.pinyin}</span>
                     </div>
                   </div>
                   <p className="text-sm text-gray-600 font-medium mb-6 leading-relaxed flex-1">{item.desc}</p>
                 </div>
               ))}
               <div className={`rounded-[3rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 ${isAddingVocab ? 'bg-white border-indigo-400 shadow-xl' : 'border-gray-200 text-gray-300 hover:border-indigo-200 hover:text-indigo-400'}`}>
                 {isAddingVocab ? (
                   <div className="w-full space-y-3">
                      <input placeholder="词语" value={newWord} onChange={e => setNewWord(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none" />
                      <input placeholder="拼音" value={newPinyin} onChange={e => setNewPinyin(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none" />
                      <textarea placeholder="用孩子能听懂的话解释..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-bold outline-none h-20 resize-none" />
                      <button onClick={handleManualAdd} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all">保存词语</button>
                   </div>
                 ) : (
                   <button onClick={() => setIsAddingVocab(true)} className="flex flex-col items-center gap-2 group">
                     <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 transition-colors"><Plus size={32} /></div>
                     <span className="text-sm font-black">手动添加生词档案</span>
                   </button>
                 )}
               </div>
             </div>
          </div>
          <div className="flex justify-center">
              <button onClick={() => setSubView('card_interaction')} className="flex items-center gap-3 px-10 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all">词语掌握了，进入情节挑战 <ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    );
  };

  const CardInteractionView = () => {
    const handleMatch = (charId: string, eventId: string) => {
      if (charId === eventId) {
        setCorrectMatches(prev => [...prev, charId]);
        setSelectedChar(null);
      } else {
        setWrongMatch(eventId);
        setTimeout(() => setWrongMatch(null), 500);
      }
    };
    const progress = (correctMatches.length / GAME_PAIRS.length) * 100;
    return (
      <div className="min-h-screen bg-[#fcfaf7] pt-28 pb-32 px-6">
        <SubHeader title="情节挑战与 AI 生图" colorClass="text-blue-600" onBack={() => setSubView('vocab_study')} />
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4"><span className="text-sm font-black text-gray-400 uppercase tracking-widest">任务进度</span><span className="text-sm font-black text-blue-600">{correctMatches.length} / {GAME_PAIRS.length}</span></div>
             <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
          <section className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-4">
                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4 mb-2">角色人物</h4>
                 {GAME_PAIRS.map(p => (
                   <button key={p.id} disabled={correctMatches.includes(p.id)} onClick={() => setSelectedChar(p.id)} className={`w-full p-6 rounded-[2rem] text-left border-2 transition-all flex items-center justify-between ${correctMatches.includes(p.id) ? 'bg-green-50 border-green-200 opacity-60' : selectedChar === p.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-gray-100 hover:border-blue-400'}`}>
                     <span className="text-xl font-black">{p.character}</span>
                     {correctMatches.includes(p.id) && <CheckCircle2 size={24} className="text-green-500" />}
                   </button>
                 ))}
               </div>
               <div className="space-y-4">
                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4 mb-2">故事情节</h4>
                 {shuffledEvents.map(p => (
                   <button key={p.id} disabled={correctMatches.includes(p.id)} onClick={() => selectedChar && handleMatch(selectedChar, p.id)} className={`w-full p-6 rounded-[2rem] text-left border-2 transition-all ${correctMatches.includes(p.id) ? 'bg-green-50 border-green-200 opacity-60' : wrongMatch === p.id ? 'bg-red-50 border-red-500 animate-shake' : !selectedChar ? 'bg-gray-50 border-transparent opacity-30 cursor-not-allowed' : 'bg-white border-gray-100 hover:border-indigo-400 shadow-sm'}`}>
                     <span className="text-lg font-black">{p.event}</span>
                   </button>
                 ))}
               </div>
             </div>
          </section>
          <div className="bg-[#1e293b] p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Wand2 size={200} /></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">AIGC Lab</div>
                  <h4 className="text-3xl font-black mb-2">AI 场景实验室</h4>
                  <p className="text-gray-400 font-medium max-w-md">完成所有连线了吗？尝试让 AI 为你刚刚匹配的情节画一张插图，作为故事绘本的参考吧！</p>
               </div>
               <button disabled={correctMatches.length < GAME_PAIRS.length} onClick={() => setActiveChat('inspiration')} className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed">
                 <Sparkles size={24} className="text-blue-500" /> 开启灵感生图
               </button>
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={() => setSubView('none')} className="px-10 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <CheckCircle2 size={24} /> 情节掌握了，返回学习路径
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SummaryExtensionView = () => (
    <div className="min-h-screen bg-[#fcfaf7] pt-28 pb-32 px-6">
      <SubHeader title="课堂延伸与总结" colorClass="text-indigo-900" />
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Quote size={120} /></div>
          <div className="text-center mb-10 relative z-10">
            <h3 className="text-3xl font-black text-gray-900 mb-2">环节一：核心主题总结</h3>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">DEEP THEME REFLECTION</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
             <div className="bg-orange-50/50 p-8 rounded-[3rem] border border-orange-100 hover:bg-white hover:shadow-xl transition-all group">
                <Heart size={24} fill="currentColor" className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-black mb-3 text-gray-800">情感的纽带</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">牛郎与老牛的“相依为命”，告诉我们勤劳与真诚是世间情感的底色。</p>
             </div>
             <div className="bg-indigo-50/50 p-8 rounded-[3rem] border border-indigo-100 hover:bg-white hover:shadow-xl transition-all group">
                <Compass size={24} className="text-indigo-600 mb-6 group-hover:rotate-45 transition-transform" />
                <h4 className="text-xl font-black mb-3 text-gray-800">勇敢的追寻</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">织女下凡是对幸福的选择，体现了突破重重束缚的巨大勇气。</p>
             </div>
             <div className="bg-blue-50/50 p-8 rounded-[3rem] border border-blue-100 hover:bg-white hover:shadow-xl transition-all group">
                <Bird size={24} className="text-blue-600 mb-6 group-hover:-translate-y-1 transition-transform" />
                <h4 className="text-xl font-black mb-3 text-gray-800">想象的力量</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">“鹊桥”是浪漫化身，象征着希望终能跨越困难，达成圆满。</p>
             </div>
          </div>
        </div>
        <div className="bg-[#1a365d] p-12 rounded-[4rem] text-white flex flex-col items-center gap-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute bottom-0 left-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Sparkles size={200} /></div>
           <div className="text-center relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                 <div className="p-4 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20"><Sparkles size={32} /></div>
                 <h4 className="text-4xl font-black">环节二：家庭延伸任务</h4>
              </div>
              <p className="text-2xl font-black text-blue-50 leading-relaxed max-w-2xl mx-auto mb-4">“尝试用绘画、手工 或者 角色扮演呈现故事，可使用‘豆包’辅助。”</p>
           </div>
           <button onClick={() => setSubView('workshop')} className="w-full py-8 bg-white text-[#1a365d] rounded-[2.5rem] font-black shadow-2xl hover:scale-[1.01] active:scale-95 transition-all text-2xl flex items-center justify-center gap-4 group">
             进入亲子共创空间 <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>
        <div className="flex flex-col items-center gap-6 pt-8">
          <button onClick={() => setSubView('none')} className="flex items-center gap-3 px-16 py-6 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all group">
            <CheckCircle2 size={24} /> 完成总结，返回学习路径
          </button>
        </div>
      </div>
    </div>
  );

  const WorkshopView = () => (
    <div className="min-h-screen bg-[#f5f3ff] pt-28 pb-32 px-6">
      <SubHeader title="亲子共创空间" colorClass="text-purple-600" onBack={() => setSubView('summary_extension')} />
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="grid grid-cols-3 gap-4">
           {[
             { id: 'reading', n: '声临其境', i: Mic, c: 'text-orange-500', b: 'bg-orange-50' },
             { id: 'drama', n: '剧本演绎', i: Film, c: 'text-purple-500', b: 'bg-purple-50' },
             { id: 'craft', n: '巧手匠心', i: Palette, c: 'text-blue-500', b: 'bg-blue-50' }
           ].map(m => (
             <button key={m.id} onClick={() => setWorkshopMode(m.id as WorkshopMode)} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${workshopMode === m.id ? 'bg-white border-purple-600 shadow-xl scale-105' : 'bg-white/50 border-transparent opacity-60'}`}>
               <div className={`p-4 rounded-2xl ${m.b} ${m.c}`}><m.i size={28} /></div>
               <span className="block font-black text-gray-900">{m.n}</span>
             </button>
           ))}
        </div>
        <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-purple-100">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
             <div className="flex items-center gap-4">
               <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Sparkles size={32} /></div>
               <div><h3 className="text-2xl font-black text-gray-900">灵感助手 · 豆包 AI</h3><p className="text-sm text-gray-400 font-bold">获取 AI 创意灵感并开始你的创作</p></div>
             </div>
             <button onClick={() => {
                 const prompts = { reading: '提供牛郎织女故事朗读指导建议。', drama: '创作一段牛郎织女亲子表演剧本。', craft: '提供牛郎织女主题手工创意灵感。' };
                 window.open(`https://www.doubao.com/chat/?q=${encodeURIComponent(prompts[workshopMode])}`, '_blank');
               }} className="px-10 py-5 bg-purple-600 text-white rounded-[2rem] font-black shadow-xl flex items-center gap-2 active:scale-95 transition-all">
               <Sparkles size={24} /> 开始生成灵感
             </button>
           </div>
           <div className="mt-12 pt-8 border-t border-gray-100">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Upload size={24} className="text-purple-600" /> 我的共创成果库</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {myRecords.map(record => (
                  <div key={record.id} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 relative group overflow-hidden">
                    <button onClick={(e) => deleteRecord(record.id, e)} className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-500 rounded-xl transition-all z-20"><Trash2 size={16} /></button>
                    <h5 className="font-black text-gray-800 mb-2 truncate pr-6">{record.title}</h5>
                    <div className="bg-white p-4 rounded-2xl border border-indigo-50 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden"><Share2 size={18} className="text-indigo-400 shrink-0" /><span className="text-[10px] font-black text-indigo-600 truncate">{record.content}</span></div>
                      <button onClick={() => window.open(record.content, '_blank')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><ExternalLink size={12} /></button>
                    </div>
                  </div>
                ))}
                {!isAddingRecord ? (
                  <button onClick={() => setIsAddingRecord(true)} className="border-2 border-dashed border-purple-200 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-3 text-purple-300 hover:bg-purple-50 group min-h-[200px] w-full">
                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform"><Plus size={32} /></div>
                    <span className="font-black text-sm">提交新的成果链接</span>
                  </button>
                ) : (
                  <div className="col-span-1 md:col-span-2 bg-purple-50 p-8 rounded-[3rem] border-2 border-purple-200 space-y-6">
                    <div className="flex items-center justify-between mb-2"><h5 className="font-black text-purple-900 text-lg flex items-center gap-2"><LinkIcon size={20} /> 填写分享链接</h5><button onClick={() => setIsAddingRecord(false)} className="p-2 hover:bg-purple-100 rounded-full text-purple-400"><X size={20} /></button></div>
                    <div className="space-y-4">
                      <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="作品名称" className="w-full bg-white border rounded-2xl p-4 text-sm font-bold outline-none shadow-sm" />
                      <input value={uploadContent} onChange={e => setUploadContent(e.target.value)} placeholder="粘贴作品分享链接" className="w-full bg-white border rounded-2xl p-4 text-sm font-bold outline-none shadow-sm" />
                      <button disabled={isUploading} onClick={submitRecord} className="w-full py-5 bg-purple-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                        {isUploading ? <><Loader2 className="animate-spin" size={20} /> 正在提交...</> : <><CheckCircle2 size={20} /> 确认提交</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <button onClick={() => setSubView('none')} className="flex items-center gap-3 px-16 py-6 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all group">
            <CheckCircle2 size={24} /> 完成所有任务，返回学习路径
          </button>
        </div>
      </div>
    </div>
  );

  if (subView === 'intro_perception') return <IntroPerceptionView />;
  if (subView === 'reading_study') return <ReadingStudyView />;
  if (subView === 'vocab_study') return (
    <>
      <VocabStudyView />
      {activeChat !== 'none' && <AIChatBox type={activeChat === 'microscope' ? 'microscope' : 'inspiration'} onClose={() => setActiveChat('none')} />}
    </>
  );
  if (subView === 'card_interaction') return (
    <>
      <CardInteractionView />
      {activeChat !== 'none' && <AIChatBox type={activeChat === 'microscope' ? 'microscope' : 'inspiration'} onClose={() => setActiveChat('none')} />}
    </>
  );
  if (subView === 'summary_extension') return <SummaryExtensionView />;
  if (subView === 'workshop') return <WorkshopView />;
  if (subView === 'evaluation_system') return <EvaluationSystemView />;
  if (subView === 'student_square') return <StudentSquareView />;
  if (subView === 'time_messenger') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
       <SubHeader title="时光信使" onBack={() => setSubView('none')} />
       <div className="text-center">
          <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600"><Send size={64} /></div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">时光信使</h2>
          <p className="text-gray-500 font-medium max-w-md mx-auto">记录共学时光，该模块正在建设中...</p>
       </div>
    </div>
  );
  if (subView === 'future_art') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
       <SubHeader title="未来艺术展" onBack={() => setSubView('none')} />
       <div className="text-center">
          <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600"><Layout size={64} /></div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">未来艺术展</h2>
          <p className="text-gray-500 font-medium max-w-md mx-auto">班级画展模块正在建设中...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfaf7] pb-32">
      <div className="bg-[#1a365d] text-white pt-16 pb-24 px-8 rounded-b-[4rem] shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 pr-8 rounded-[2.5rem] border border-white/10 shadow-inner">
             <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"><Users size={24} className="text-white" /></div>
             <div className="flex items-center gap-2">
               <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-indigo-300 mb-1">学生</span><span className="text-xl font-black">{studentName}</span></div>
               <div className="w-px h-8 bg-white/20 mx-3"></div>
               <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-indigo-300 mb-1">家长</span><span className="text-xl font-black">{parentName}</span></div>
             </div>
          </div>
          <button onClick={() => setSubView('evaluation_system')} className="p-5 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl flex items-center gap-2 group">
            <BarChart2 size={20} className="group-hover:rotate-12 transition-transform" /><span className="font-bold">多元评价报告</span>
          </button>
        </div>
        <div className="mt-12 flex gap-3 relative z-10 max-w-md">
          {[1, 2].map(id => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 py-4 rounded-3xl transition-all font-bold text-xs tracking-widest border-2 ${activeTab === id ? 'bg-white text-indigo-900 border-white shadow-xl' : 'bg-white/10 text-white/60 border-white/10'}`}>
              第 {id} 课时：{id === 1 ? '情节感知' : '协同创造'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4"><Sparkles className="text-orange-500" size={24} /><h2 className="text-2xl font-black text-gray-900">今日探索路径</h2></div>
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <button onClick={() => { setSubView('intro_perception'); setIntroStep(0); }} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Monitor size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">1. 故事导入</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">开启多维感官感知。</p>
              <div className="flex items-center text-indigo-600 font-bold text-sm">开启之旅 <ChevronRight size={16} /></div>
            </button>
            <button onClick={() => setSubView('reading_study')} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><BookOpen size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">2. 朗读与讲解</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">阅读正文，开启精读模式。</p>
              <div className="flex items-center text-orange-600 font-bold text-sm">进入空间 <ChevronRight size={16} /></div>
            </button>
            <button onClick={() => setSubView('vocab_study')} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><BookMarked size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">3. 词语与情节</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">解释和角色挑战。</p>
              <div className="flex items-center text-indigo-600 font-bold text-sm">开始学习 <ChevronRight size={16} /></div>
            </button>
            <button onClick={() => setSubView('summary_extension')} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Sparkles size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">4. 总结与延伸</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">总结情感，开启共创。</p>
              <div className="flex items-center text-blue-600 font-bold text-sm">开启创意 <ChevronRight size={16} /></div>
            </button>
          </div>
        )}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
             {STORY_CONTENT.chapters[1].tasks.map(task => (
               <button 
                 key={task.id} 
                 onClick={() => handleCardClick(task.id)} 
                 className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group"
               >
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${task.id === 't3' ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
                   {task.id === 't3' ? <Palette size={32} /> : <BarChart2 size={32} />}
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 mb-2">{task.id === 't3' ? '亲子共创空间' : task.name}</h3>
                 <p className="text-gray-400 text-sm mb-6 leading-relaxed">{task.desc}</p>
                 <div className={`flex items-center font-bold text-sm ${task.id === 't3' ? 'text-purple-600' : 'text-indigo-600'}`}>进入空间 <ChevronRight size={16} /></div>
               </button>
             ))}
             <button 
               onClick={() => setSubView('student_square')} 
               className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group col-span-1 md:col-span-2"
             >
               <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                 <LayoutGrid size={32} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">学生广场 (Student Square)</h3>
               <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                 看看其他同学的创意成果，相互学习，共同进步。这里是属于大家的灵感森林！
               </p>
               <div className="flex items-center font-bold text-sm text-pink-600">
                 进入广场互动 <ChevronRight size={16} />
               </div>
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFamily;
