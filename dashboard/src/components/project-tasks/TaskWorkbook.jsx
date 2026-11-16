import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  Plus, Download, Upload, FileXls, MagnifyingGlass, Trash, CaretDown, Table, FolderPlus,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  useGetMyProjectsQuery, useGetProjectTasksQuery, useLazyGetProjectTasksQuery,
  useCreateProjectMutation, useCreateTaskMutation, useUpdateTaskStatusMutation,
  useUpdateTaskMutation, useDeleteProjectMutation,
} from '../../services/api/projectTasksApi';
import ProjectCreateModal from './CreateProjectModal';
import TaskCreateModal from './TaskCreateModal';

const COLUMNS = [
  { key: 'title', label: 'A', header: 'Title' },
  { key: 'description', label: 'B', header: 'Description' },
  { key: 'status', label: 'C', header: 'Status' },
  { key: 'priority', label: 'D', header: 'Priority' },
  { key: 'due_date', label: 'E', header: 'Due Date' },
  { key: 'assigned_to', label: 'F', header: 'Assignee' },
  { key: 'created_at', label: 'G', header: 'Created' },
];
const STATUS_OPTIONS = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'archived'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const statusColors = {
  backlog: 'bg-zinc-700 text-zinc-300', todo: 'bg-blue-500/25 text-blue-300',
  in_progress: 'bg-yellow-500/25 text-yellow-300', in_review: 'bg-purple-500/25 text-purple-300',
  blocked: 'bg-red-500/25 text-red-300', done: 'bg-green-500/25 text-green-300', archived: 'bg-zinc-600 text-zinc-400',
};
const priorityColors = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', urgent: 'text-red-400 font-semibold' };

function formatDate(value) {
  if (!value) return '';
  try { return new Date(value).toLocaleDateString(); } catch { return String(value); }
}
function sanitizeSheetName(name) {
  return String(name || 'Sheet').replace(/[:\\/?*[\]]/g, '_').slice(0, 31);
}
function tasksToSheetRows(tasks) {
  return (tasks || []).map((t) => ({
    Title: t.title || '', Description: t.description || '', Status: t.status || '',
    Priority: t.priority || '', 'Due Date': t.due_date ? formatDate(t.due_date) : '',
    Assignee: t.assigned_to || t.assignee_name || '', Created: t.created_at ? formatDate(t.created_at) : '', ID: t.id || '',
  }));
}
function sheetRowsToTaskPayloads(rows, projectId) {
  return rows.filter((r) => r.Title || r.title).map((r) => ({
    title: (r.Title || r.title || '').trim(),
    description: (r.Description || r.description || '').trim() || undefined,
    status: (r.Status || r.status || 'todo').toLowerCase().replace(/\s+/g, '_'),
    priority: (r.Priority || r.priority || 'medium').toLowerCase(),
    due_date: r['Due Date'] || r.due_date || null,
    project_id: projectId,
  }));
}

const TaskWorkbook = () => {
  const fileInputRef = useRef(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [importMode, setImportMode] = useState('new-sheet');
  const [isExporting, setIsExporting] = useState(false);
  const prevProjectCount = useRef(0);

  const { data: projectsRes, isLoading: projectsLoading, refetch: refetchProjects } = useGetMyProjectsQuery();
  const projects = useMemo(() => {
    const raw = projectsRes?.data || projectsRes || [];
    return Array.isArray(raw) ? raw : [];
  }, [projectsRes]);

  useEffect(() => {
    if (projects.length === 0) { setActiveProjectId(null); prevProjectCount.current = 0; return; }
    if (!activeProjectId) setActiveProjectId(projects[0].id);
    else if (projects.length > prevProjectCount.current && projects[0]?.id) setActiveProjectId(projects[0].id);
    prevProjectCount.current = projects.length;
  }, [projects, activeProjectId]);

  const { data: tasksRes, isLoading: tasksLoading, refetch: refetchTasks } = useGetProjectTasksQuery(activeProjectId, { skip: !activeProjectId });
  const tasks = useMemo(() => {
    const raw = tasksRes?.data || tasksRes || [];
    return Array.isArray(raw) ? raw : [];
  }, [tasksRes]);

  const [createProject] = useCreateProjectMutation();
  const [createTask] = useCreateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [fetchProjectTasks] = useLazyGetProjectTasksQuery();
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const filteredTasks = useMemo(() => tasks
    .filter((task) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q || task.title?.toLowerCase().includes(q) || task.description?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [tasks, searchTerm, statusFilter]);

  const exportSheet = useCallback((project, taskList, filename) => {
    const ws = XLSX.utils.json_to_sheet(tasksToSheetRows(taskList));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(project?.name || 'Tasks'));
    XLSX.writeFile(wb, filename || `${sanitizeSheetName(project?.name || 'sheet')}.xlsx`);
    toast.success('Sheet exported');
  }, []);

  const exportWorkbookFull = useCallback(async () => {
    if (projects.length === 0) { toast.error('No projects to export'); return; }
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const usedNames = new Set();
      for (const project of projects) {
        let taskList = [];
        if (project.id === activeProjectId) taskList = tasks;
        else {
          try {
            const result = await fetchProjectTasks(project.id).unwrap();
            taskList = result?.data || result || [];
          } catch { taskList = []; }
        }
        let name = sanitizeSheetName(project.name);
        let n = 1;
        while (usedNames.has(name)) name = sanitizeSheetName(`${project.name} (${n++})`);
        usedNames.add(name);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tasksToSheetRows(taskList)), name);
      }
      XLSX.writeFile(wb, `workspace-workbook-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Workbook downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export workbook');
    } finally { setIsExporting(false); }
  }, [projects, activeProjectId, tasks, fetchProjectTasks]);

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const sheetNames = wb.SheetNames;
      if (!sheetNames.length) { toast.error('Workbook has no sheets'); return; }
      if (importMode === 'current-sheet' && activeProjectId) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetNames[0]]);
        const payloads = sheetRowsToTaskPayloads(rows, activeProjectId);
        if (!payloads.length) { toast.error('No valid task rows (need Title column)'); return; }
        let created = 0;
        for (const payload of payloads) {
          try { await createTask(payload).unwrap(); created += 1; } catch (err) { console.error(err); }
        }
        toast.success(`Imported ${created} task(s) into “${activeProject?.name}”`);
        refetchTasks();
        return;
      }
      let projectsCreated = 0, tasksCreated = 0;
      for (const sheetName of sheetNames) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
        try {
          const newProject = await createProject({ name: sheetName.slice(0, 100), description: `Imported from ${file.name}` }).unwrap();
          const projectId = newProject?.data?.id || newProject?.id;
          projectsCreated += 1;
          if (projectId) {
            for (const payload of sheetRowsToTaskPayloads(rows, projectId)) {
              try { await createTask(payload).unwrap(); tasksCreated += 1; } catch { /* skip */ }
            }
            setActiveProjectId(projectId);
          }
        } catch (err) { console.error(err); }
      }
      toast.success(`Imported ${projectsCreated} sheet(s), ${tasksCreated} task(s)`);
      refetchProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to read workbook');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try { await updateTaskStatus({ id: taskId, status }).unwrap(); toast.success('Status updated'); }
    catch { toast.error('Failed to update status'); }
  };
  const handlePriorityChange = async (taskId, priority) => {
    try { await updateTask({ id: taskId, priority }).unwrap(); toast.success('Priority updated'); }
    catch { toast.error('Failed to update priority'); }
  };
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project (sheet)?')) return;
    try {
      await deleteProject(projectId).unwrap();
      if (activeProjectId === projectId) setActiveProjectId(null);
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };
  const onSelectCell = (task, colKey) => {
    setSelectedCell({ rowId: task.id, colKey });
    const val = task[colKey];
    setFormulaBarValue(colKey === 'due_date' || colKey === 'created_at' ? formatDate(val) : (val != null ? String(val) : ''));
  };
  const cellRefLabel = selectedCell
    ? `${COLUMNS.find((c) => c.key === selectedCell.colKey)?.label || '?'}${filteredTasks.findIndex((t) => t.id === selectedCell.rowId) + 1}`
    : '';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[520px] rounded-xl border border-zinc-700/80 bg-[#1e1e1e] shadow-2xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-700">
        <div className="flex items-center gap-1.5 mr-2">
          <FileXls size={22} className="text-emerald-500" weight="fill" />
          <span className="text-sm font-semibold text-zinc-200">Task Workbook</span>
        </div>
        <div className="h-5 w-px bg-zinc-700" />
        <Button size="sm" variant="ghost" className="h-8 text-zinc-300 hover:bg-zinc-800" onClick={() => setIsProjectModalOpen(true)}>
          <FolderPlus size={16} className="mr-1.5" /> New Sheet
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-zinc-300 hover:bg-zinc-800" disabled={!activeProjectId} onClick={() => setIsTaskModalOpen(true)}>
          <Plus size={16} className="mr-1.5" /> New Task
        </Button>
        <div className="h-5 w-px bg-zinc-700" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 text-zinc-300 hover:bg-zinc-800"><Upload size={16} className="mr-1.5" /> Import <CaretDown size={12} className="ml-1 opacity-70" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-700">
            <DropdownMenuItem onClick={() => { setImportMode('new-sheet'); fileInputRef.current?.click(); }}>Import workbook as new sheet(s)</DropdownMenuItem>
            <DropdownMenuItem disabled={!activeProjectId} onClick={() => { setImportMode('current-sheet'); fileInputRef.current?.click(); }}>Import rows into current sheet</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 text-zinc-300 hover:bg-zinc-800"><Download size={16} className="mr-1.5" /> Export <CaretDown size={12} className="ml-1 opacity-70" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-700">
            <DropdownMenuItem disabled={!activeProject} onClick={() => exportSheet(activeProject, tasks, `${sanitizeSheetName(activeProject?.name)}.xlsx`)}>Export current sheet (.xlsx)</DropdownMenuItem>
            <DropdownMenuItem disabled={isExporting} onClick={exportWorkbookFull}>{isExporting ? 'Exporting…' : 'Download whole workbook'}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
        <div className="flex-1" />
        <div className="relative">
          <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Find in sheet..." className="h-8 w-44 sm:w-56 pl-8 bg-zinc-950 border-zinc-700 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[130px] bg-zinc-950 border-zinc-700 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">All status</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-stretch border-b border-zinc-700 bg-zinc-900/80">
        <div className="w-20 sm:w-24 shrink-0 border-r border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-400 bg-zinc-950/50">{cellRefLabel || '—'}</div>
        <div className="flex-1 flex items-center px-2 py-1.5">
          <span className="text-xs text-zinc-500 mr-2 hidden sm:inline">fx</span>
          <input readOnly value={formulaBarValue} className="w-full bg-transparent text-sm text-zinc-200 outline-none font-mono" placeholder="Select a cell" />
        </div>
      </div>
      <div className="flex-1 overflow-auto relative bg-[#0f0f0f]">
        {projectsLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-500">Loading workbook...</div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <Table size={48} className="text-zinc-600" />
            <p className="text-zinc-300 font-medium">No sheets yet</p>
            <div className="flex gap-2">
              <Button onClick={() => setIsProjectModalOpen(true)}><FolderPlus size={16} className="mr-2" />New Sheet</Button>
              <Button variant="outline" onClick={() => { setImportMode('new-sheet'); fileInputRef.current?.click(); }}><Upload size={16} className="mr-2" />Import Workbook</Button>
            </div>
          </div>
        ) : tasksLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-500">Loading tasks...</div>
        ) : (
          <table className="w-full border-collapse text-sm table-fixed min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="w-12 min-w-[48px] bg-zinc-900 border border-zinc-700 text-zinc-500 text-xs font-medium py-1.5">#</th>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs font-semibold py-1.5 px-2 text-left">
                    <span className="text-zinc-500 font-mono mr-1.5">{col.label}</span>{col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr><td colSpan={COLUMNS.length + 1} className="border border-zinc-800 text-center py-16 text-zinc-500">
                  No tasks in this sheet. <button type="button" className="ml-2 text-emerald-400 hover:underline" onClick={() => setIsTaskModalOpen(true)}>Add a task</button>
                </td></tr>
              ) : filteredTasks.map((task, idx) => (
                <tr key={task.id} className="hover:bg-zinc-900/40">
                  <td className="border border-zinc-800 bg-zinc-900/60 text-center text-xs text-zinc-500 font-mono">{idx + 1}</td>
                  {COLUMNS.map((col) => {
                    const isSelected = selectedCell?.rowId === task.id && selectedCell?.colKey === col.key;
                    return (
                      <td key={col.key} onClick={() => onSelectCell(task, col.key)} className={`border border-zinc-800 px-2 py-1.5 align-middle cursor-cell ${isSelected ? 'ring-2 ring-inset ring-emerald-500/80 bg-emerald-500/5' : ''}`}>
                        {col.key === 'status' ? (
                          <Select value={task.status || 'todo'} onValueChange={(v) => handleStatusChange(task.id, v)}>
                            <SelectTrigger className={`h-7 border-0 bg-transparent text-xs px-1 shadow-none ${statusColors[task.status] || ''}`}><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : col.key === 'priority' ? (
                          <Select value={task.priority || 'medium'} onValueChange={(v) => handlePriorityChange(task.id, v)}>
                            <SelectTrigger className={`h-7 border-0 bg-transparent text-xs px-1 shadow-none ${priorityColors[task.priority] || 'text-zinc-300'}`}><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">{PRIORITY_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : col.key === 'due_date' || col.key === 'created_at' ? (
                          <span className="text-zinc-400 text-xs">{formatDate(task[col.key])}</span>
                        ) : col.key === 'title' ? (
                          <span className="text-white font-medium line-clamp-1">{task.title}</span>
                        ) : col.key === 'description' ? (
                          <span className="text-zinc-400 line-clamp-1 text-xs">{task.description || '—'}</span>
                        ) : (
                          <span className="text-zinc-400 text-xs">{task[col.key] != null ? String(task[col.key]) : '—'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 12 - filteredTasks.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border border-zinc-800/80 bg-zinc-900/40 text-center text-xs text-zinc-600 font-mono h-8">{filteredTasks.length + i + 1}</td>
                  {COLUMNS.map((col) => <td key={col.key} className="border border-zinc-800/60 h-8" />)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex items-end gap-0 px-1 pt-1 bg-zinc-900 border-t border-zinc-700 min-h-[36px] overflow-x-auto">
        <button type="button" title="New sheet" onClick={() => setIsProjectModalOpen(true)} className="shrink-0 w-8 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-t mb-0.5"><Plus size={14} /></button>
        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <div key={project.id} className={`group relative flex items-center shrink-0 max-w-[180px] ${isActive ? 'bg-[#0f0f0f] border border-b-0 border-zinc-600 rounded-t-md z-10 -mb-px' : 'bg-zinc-800/80 border border-transparent rounded-t hover:bg-zinc-800'}`}>
              <button type="button" onClick={() => setActiveProjectId(project.id)} className={`px-3 py-1.5 text-xs truncate text-left ${isActive ? 'text-emerald-400 font-medium' : 'text-zinc-400'}`} title={project.name}>{project.name}</button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-200 mr-0.5"><CaretDown size={12} /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-700">
                  <DropdownMenuItem onClick={async () => {
                    let list = project.id === activeProjectId ? tasks : [];
                    if (project.id !== activeProjectId) {
                      try { const result = await fetchProjectTasks(project.id).unwrap(); list = result?.data || result || []; } catch { list = []; }
                    }
                    exportSheet(project, list, `${sanitizeSheetName(project.name)}.xlsx`);
                  }}><Download size={14} className="mr-2" />Export sheet</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-400 focus:text-red-300" onClick={() => handleDeleteProject(project.id)}><Trash size={14} className="mr-2" />Delete sheet</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
        <div className="flex-1 border-b border-zinc-700 self-end" />
        <div className="text-[10px] text-zinc-600 px-2 pb-1.5 font-mono shrink-0">{filteredTasks.length} row{filteredTasks.length !== 1 ? 's' : ''}{activeProject ? ` · ${activeProject.name}` : ''}</div>
      </div>
      <ProjectCreateModal open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen} onProjectCreated={() => refetchProjects()} />
      <TaskCreateModal open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen} projectId={activeProjectId} />
    </div>
  );
};

export default TaskWorkbook;
