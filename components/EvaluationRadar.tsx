
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { EvaluationData } from '../types';
import { EVALUATION_LABELS } from '../constants';

interface EvaluationRadarProps {
  data: EvaluationData;
  title?: string;
}

const EvaluationRadar: React.FC<EvaluationRadarProps> = ({ data, title }) => {
  const chartData = [
    { subject: EVALUATION_LABELS.understanding, A: data.understanding, fullMark: 100 },
    { subject: EVALUATION_LABELS.creation, A: data.creation, fullMark: 100 },
    { subject: EVALUATION_LABELS.collaboration, A: data.collaboration, fullMark: 100 },
    { subject: EVALUATION_LABELS.expression, A: data.expression, fullMark: 100 },
    { subject: EVALUATION_LABELS.aiUsage, A: data.aiUsage, fullMark: 100 },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full h-full min-h-[300px]">
      {title && <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>}
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
            <Radar
              name="学生表现"
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvaluationRadar;
