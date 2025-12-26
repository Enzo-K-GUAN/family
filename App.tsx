
import React, { useState } from 'react';
import { UserRole } from './types';
import RoleSelector from './components/RoleSelector';
import DashboardTeacher from './components/DashboardTeacher';
import DashboardFamily from './components/DashboardFamily';
import { LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [studentName, setStudentName] = useState<string>('');
  const [parentName, setParentName] = useState<string>('');

  const handleLogout = () => {
    setRole(UserRole.NONE);
  };

  const registerFamily = (sName: string, pName: string) => {
    try {
      const existingData = JSON.parse(localStorage.getItem('ai_bridge_registered_families') || '[]');
      // 检查是否已存在（简单去重）
      const alreadyExists = existingData.some((f: any) => f.studentName === sName && f.parentName === pName);
      
      if (!alreadyExists) {
        const newData = [
          ...existingData,
          { 
            studentName: sName, 
            parentName: pName, 
            timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
            id: Date.now().toString()
          }
        ];
        localStorage.setItem('ai_bridge_registered_families', JSON.stringify(newData));
      }
    } catch (e) {
      console.error("Failed to register family:", e);
    }
  };

  if (role === UserRole.NONE) {
    return (
      <RoleSelector 
        onSelect={(selectedRole, sName, pName) => {
          setRole(selectedRole);
          if (selectedRole === UserRole.FAMILY && sName && pName) {
            setStudentName(sName);
            setParentName(pName);
            registerFamily(sName, pName);
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <button 
        onClick={handleLogout}
        className="fixed top-4 right-4 z-[60] bg-white/20 backdrop-blur-md p-2 rounded-full text-white/70 hover:text-white transition-colors border border-white/20 sm:top-6 sm:right-6"
        title="返回角色选择"
      >
        <LogOut size={20} />
      </button>

      {role === UserRole.TEACHER ? (
        <DashboardTeacher />
      ) : (
        <DashboardFamily studentName={studentName || '同学'} parentName={parentName || '家长'} />
      )}
    </div>
  );
};

export default App;
