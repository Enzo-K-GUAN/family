
import React from 'react';

export const EVALUATION_LABELS = {
  understanding: '理解与复述',
  creation: '创作表现',
  collaboration: '亲子协作',
  expression: '表达与交流',
  aiUsage: 'AIGC应用'
};

export const EVALUATION_CRITERIA = {
  understanding: {
    title: '理解与复述',
    levels: ['未能理清故事脉络，复述存在断层。', '能完整讲述故事主要情节，基本准确。', '能生动、有感染力地复述，并有独特见解。']
  },
  creation: {
    title: '创作表现',
    levels: ['作品较为单一，未能体现故事特色。', '作品具备故事元素，表现形式较完整。', '作品富有创意，色彩与构图具有艺术美感。']
  },
  collaboration: {
    title: '亲子协作',
    levels: ['协作较少，多由单方完成。', '双方分工明确，共同完成了核心任务。', '深度协同，互动频繁，体现了共同成长的乐趣。']
  },
  expression: {
    title: '表达与交流',
    levels: ['表达不够流畅，逻辑尚不清晰。', '能清晰陈述创作意图，逻辑通顺。', '表达自信，能准确传递情感并与他人有效共鸣。']
  },
  aiUsage: {
    title: 'AIGC应用',
    levels: ['未使用AI辅助或应用较为生硬。', '能使用AI生成素材，辅助完成作品。', '灵活运用AI激发灵感，人机协作效率高且有深度。']
  }
};

export const STORY_CONTENT = {
  title: '牛郎织女',
  school: '五河县第三小学',
  introduction: '融合AIGC与多元评价：开启家校协同育人新范式',
  chapters: [
    {
      id: 1,
      title: '第一课时：教学引领，形成共识',
      subtitle: '多感官沉浸，构建共同的故事世界',
      steps: ['多媒体感知', '共同阅读体验', '文字与词语理解'],
      tasks: [
        { id: 't1', name: '词语显微镜', desc: '利用AI理解“彩锦”、“机房”等关键词', icon: 'Search' },
        { id: 't2', name: '句子复述墙', desc: '家长与学生用自己的话讲述情节', icon: 'Mic' }
      ]
    },
    {
      id: 2,
      title: '第二课时：实践驱动，多元表达',
      subtitle: '多学科融合，在协同创造中深化理解',
      steps: ['任务实践', '延伸活动', '综合表达', '多元评价'],
      tasks: [
        { id: 't3', name: '亲子共创空间', desc: '发挥想象力，上传绘画、手工或表演作品', icon: 'Palette' },
        { id: 't4', name: '多元评估体系', desc: '查看五维学情分析报告与达成标准', icon: 'BarChart2' }
      ]
    }
  ],
  vocab: [
    { word: '彩锦', explanation: '彩锦就是神仙在天上织出来的、有各种颜色的漂亮布匹。', prompt: '请用图片和简单的语言解释什么是“彩锦”？' },
    { word: '机房', explanation: '古代专门用来织布的工作间，织女在这里织出绚丽的锦缎。', prompt: '展示古代织布机房的样子。' }
  ]
};

export const MOCK_WORKS = [
  {
    id: '1',
    studentName: '王小明',
    title: '牛郎照顾老牛',
    imageUrl: 'https://picsum.photos/seed/ming1/400/300',
    description: '我和爸爸一起画的，牛郎正在给老牛刷毛。',
    likes: 32,
    tags: ['情感表达', '创意力'],
    stats: { understanding: 80, creation: 90, collaboration: 95, expression: 70, aiUsage: 85 }
  },
  {
    id: '2',
    studentName: '李华',
    title: '喜鹊搭桥',
    imageUrl: 'https://picsum.photos/seed/hua1/400/300',
    description: '用了AI生成的喜鹊素材作为参考，画出了银河。',
    likes: 45,
    tags: ['审美素养', 'AIGC应用'],
    stats: { understanding: 70, creation: 85, collaboration: 80, expression: 90, aiUsage: 95 }
  }
];
