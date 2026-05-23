import { useState, useEffect, useCallback } from 'react';
import { MESSAGES } from '../utils/constants';
import {
  fetchAllTasks,
  createTaskRequest,
  updateTaskRequest,
  toggleTaskRequest,
  deleteTaskRequest,
} from '../api/taskApi';
import type { Task, TaskFormData, UseTasksReturn } from '../types';

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateTitle = useCallback((title: string): boolean => {
    if (title.trim()) return true;
    setError(MESSAGES.ERROR_EMPTY_TITLE);
    return false;
  }, []);

  const withSubmit = useCallback(async (fn: () => Promise<void>): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : MESSAGES.ERROR_CONNECTION);
      console.error('Erro:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Função para carregar tarefas
  const fetchTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await fetchAllTasks());
    } catch (err) {
      setError(MESSAGES.ERROR_LOAD);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para criar nova tarefa
  const createTask = useCallback(async (taskData: TaskFormData): Promise<boolean> => {
    if (!validateTitle(taskData.title)) return false;
    return withSubmit(async () => {
      const newTask = await createTaskRequest(taskData);
      setTasks(prev => [...prev, newTask]);
    });
  }, [validateTitle, withSubmit]);

  // Função para atualizar tarefa existente
  const updateTask = useCallback(async (id: number, taskData: TaskFormData): Promise<boolean> => {
    if (!validateTitle(taskData.title)) return false;
    return withSubmit(async () => {
      const updated = await updateTaskRequest(id, taskData);
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    });
  }, [validateTitle, withSubmit]);

  // Função para alternar status da tarefa
  const toggleTask = useCallback(async (id: number): Promise<void> => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
    try {
      const updated = await toggleTaskRequest(id);
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
      setError(MESSAGES.ERROR_UPDATE);
      console.error('Erro:', err);
    }
  }, []);

  // Função para deletar tarefa
  const deleteTask = useCallback(async (id: number): Promise<void> => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await deleteTaskRequest(id);
    } catch (err) {
      await fetchTasks();
      setError(MESSAGES.ERROR_DELETE);
      console.error('Erro:', err);
    }
  }, [fetchTasks]);

  // Carregar tarefas ao inicializar
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, submitting, fetchTasks, createTask, updateTask, toggleTask, deleteTask };
}
