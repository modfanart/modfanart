import React from 'react';
import { Header } from '../../components/layout/Header';
import AgendaNav from '../../components/project-tasks/AgendaNav';
import TaskWorkbook from '../../components/project-tasks/TaskWorkbook';

export const WorkbookPage = () => (
  <div className="min-h-screen bg-zinc-950" data-testid="workbook-page">
    <Header title="Workbook" subtitle="Projects as sheets · Tasks as rows — Excel-style" />
    <div className="p-4 sm:p-6">
      <AgendaNav />
      <TaskWorkbook />
    </div>
  </div>
);

export default WorkbookPage;
