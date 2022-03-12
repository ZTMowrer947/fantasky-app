import TaskAddModule from '@/components/TaskAddModule';
import TaskModule from '@/components/TaskModule';
import { TaskPreview } from '@/lib/queries/tasks/fetchTasks';

interface PropTypes {
  tasks: TaskPreview[];
}

export type TaskListProps = PropTypes;
export default function TaskList({ tasks }: PropTypes) {
  return (
    <div className="row w-100">
      {tasks.map((task) => (
        <TaskModule task={task} key={task.id.toString()} />
      ))}

      <TaskAddModule />

      <style>{`
        .task-module {
          border-radius: 8px;
          min-height: 107px;
          padding: 30px;
          margin-bottom: 30px;
        }

        .task-module:hover {
          background: firebrick;
        }

        .task-module,
        .task-module:hover {
          text-decoration: none;
        }

        .task-module.task-add-module:hover {
          background: gray;
        }

        .task-link {
          display: block;
          cursor: pointer;
          border: 0;
        }

        .task-title {
          font-size: 20px;
          font-weight: bold;
          color: var(--light);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-module:hover .task-title {
          color: gray;
        }

        .task-timing,
        .task-title,
        .task-streak {
          color: var(--light);
        }
      `}</style>
    </div>
  );
}
