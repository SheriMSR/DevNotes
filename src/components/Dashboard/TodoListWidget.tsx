import React, { useState, useEffect } from 'react';
import type { DashboardTodo, AppLanguage } from '../../types';
import { loadDashboardTodos, saveDashboardTodos } from '../../services/storage';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Check, 
  ListTodo
} from 'lucide-react';

interface TodoListWidgetProps {
  lang: AppLanguage;
}

export const TodoListWidget: React.FC<TodoListWidgetProps> = ({ lang }) => {
  const isEn = lang === 'en';
  const [todos, setTodos] = useState<DashboardTodo[]>(() => loadDashboardTodos());
  const [newText, setNewText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    saveDashboardTodos(todos);
  }, [todos]);

  const handleAddTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;

    const newTodo: DashboardTodo = {
      id: 'dt-' + Math.random().toString(36).substring(2, 9),
      text: trimmed,
      completed: false,
      priority,
      createdAt: Date.now(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setNewText('');
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="dashboard-todo-widget">
      {/* Widget Header */}
      <div className="todo-widget-header">
        <div className="todo-widget-title-group">
          <div className="todo-widget-icon-box">
            <ListTodo size={18} color="#6366f1" />
          </div>
          <div>
            <h3 className="todo-widget-title">
              {isEn ? 'Daily Goals & Todo List' : 'Mục Tiêu & Việc Cần Làm'}
            </h3>
            <span className="todo-widget-subtitle">
              {isEn 
                ? `${completedCount}/${totalCount} completed (${progressPercent}%)` 
                : `${completedCount}/${totalCount} việc hoàn thành (${progressPercent}%)`}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="todo-filter-pills">
          <button
            type="button"
            className={`todo-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {isEn ? 'All' : 'Tất cả'} ({totalCount})
          </button>
          <button
            type="button"
            className={`todo-filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            {isEn ? 'Active' : 'Đang làm'} ({totalCount - completedCount})
          </button>
          <button
            type="button"
            className={`todo-filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            {isEn ? 'Done' : 'Đã xong'} ({completedCount})
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="todo-progress-track">
        <div 
          className="todo-progress-fill" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Add Todo Input Form */}
      <form onSubmit={handleAddTodo} className="todo-add-form">
        <div className="todo-input-wrapper">
          <input
            type="text"
            className="todo-text-input"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={isEn ? "Add a new task or study goal..." : "Nhập mục tiêu học tập hoặc việc cần làm..."}
          />
        </div>

        {/* Priority Selector */}
        <div className="todo-priority-select-wrapper">
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as any)}
            className={`todo-priority-select ${priority}`}
            title={isEn ? "Priority" : "Mức độ ưu tiên"}
          >
            <option value="high">{isEn ? '🔴 High' : '🔴 Cao'}</option>
            <option value="medium">{isEn ? '🟡 Medium' : '🟡 Vừa'}</option>
            <option value="low">{isEn ? '🟢 Low' : '🟢 Thấp'}</option>
          </select>

          <button
            type="submit"
            className="todo-add-btn"
            disabled={!newText.trim()}
          >
            <Plus size={16} />
            <span>{isEn ? 'Add' : 'Thêm'}</span>
          </button>
        </div>
      </form>

      {/* Todo Items List */}
      <div className="todo-items-list custom-scrollbar">
        {filteredTodos.length === 0 ? (
          <div className="todo-empty-state">
            <CheckSquare size={28} className="todo-empty-icon" />
            <p>
              {filter === 'completed' 
                ? (isEn ? 'No completed tasks yet.' : 'Chưa có công việc nào hoàn thành.')
                : filter === 'active'
                ? (isEn ? 'All tasks completed! Great job! 🎉' : 'Đã hoàn thành hết các mục! Xuất sắc! 🎉')
                : (isEn ? 'No tasks for today. Add one above!' : 'Chưa có việc nào. Hãy thêm một mục ở trên!')}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const priorityBadge = 
              todo.priority === 'high' 
                ? { label: isEn ? 'High' : 'Ưu tiên', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' }
                : todo.priority === 'low'
                ? { label: isEn ? 'Low' : 'Nhẹ', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' }
                : { label: isEn ? 'Med' : 'Vừa', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };

            return (
              <div 
                key={todo.id} 
                className={`todo-item-card ${todo.completed ? 'completed' : ''}`}
              >
                <button
                  type="button"
                  className={`todo-checkbox-btn ${todo.completed ? 'checked' : ''}`}
                  onClick={() => handleToggleTodo(todo.id)}
                  title={todo.completed ? (isEn ? "Mark incomplete" : "Đánh dấu chưa xong") : (isEn ? "Mark completed" : "Đánh dấu hoàn thành")}
                >
                  {todo.completed && <Check size={13} strokeWidth={3} />}
                </button>

                <div 
                  className="todo-item-text"
                  onClick={() => handleToggleTodo(todo.id)}
                >
                  {todo.text}
                </div>

                <div className="todo-item-meta">
                  <span 
                    className="todo-priority-badge"
                    style={{ color: priorityBadge.color, background: priorityBadge.bg }}
                  >
                    {priorityBadge.label}
                  </span>

                  <button
                    type="button"
                    className="todo-delete-btn"
                    onClick={() => handleDeleteTodo(todo.id)}
                    title={isEn ? "Delete task" : "Xóa việc này"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
