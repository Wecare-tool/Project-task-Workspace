import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@layouts/index';
// Module imports
import { DashboardPage } from '@modules/dashboard';
import { ProjectPage } from '@modules/project';
import { TaskTypePage } from '@modules/task-type';
import { TaskInstancePage } from '@modules/task-instance';
import { DailyTaskPage } from '@modules/daily-task';
import { ActionTypePage } from '@modules/action-type';
import { EventTypePage } from '@modules/event-type';
import { EventSourceTypePage } from '@modules/event-source-type';
import { ActionInstancePage } from '@modules/action-instance';
import { EventInstancePage } from '@modules/event-instance';
import { TaskTypeAttributePage } from '@modules/task-type-attribute';
import { EventTaskMappingPage, TaskActionMappingPage, TaskAttributeMappingPage } from '@modules/mappings';
import { DataversePage } from '@modules/dataverse';

function App() {
    return (
        <>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/projects" element={<ProjectPage />} />
                    <Route path="/tasks" element={<TaskInstancePage />} />
                    <Route path="/daily-tasks" element={<DailyTaskPage />} />
                    <Route path="/task-types" element={<TaskTypePage />} />
                    <Route path="/action-types" element={<ActionTypePage />} />
                    <Route path="/event-types" element={<EventTypePage />} />
                    <Route path="/event-source-types" element={<EventSourceTypePage />} />
                    <Route path="/action-instances" element={<ActionInstancePage />} />
                    <Route path="/event-instances" element={<EventInstancePage />} />
                    <Route path="/task-type-attributes" element={<TaskTypeAttributePage />} />
                    {/* Dataverse */}
                    <Route path="/dataverse" element={<DataversePage />} />
                    {/* Mapping routes */}
                    <Route path="/event-task-mapping" element={<EventTaskMappingPage />} />
                    <Route path="/task-action-mapping" element={<TaskActionMappingPage />} />
                    <Route path="/task-attribute-mapping" element={<TaskAttributeMappingPage />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
