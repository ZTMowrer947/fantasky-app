import { formatDaysToRepeat } from '@/lib/helpers/days';
import { TaskPreview } from '@/lib/queries/tasks/fetchTasks';

interface PropTypes {
  task: TaskPreview;
}

export type TaskModuleProps = PropTypes;
export default function TaskModule({ task }: PropTypes) {
  // Format active days
  const activeDayString = formatDaysToRepeat(task.activeDays);

  // Render module
  return (
    <div className="col-12 col-lg-6 col-xl-4">
      <a
        className="task-module task-link bg-danger w-100"
        href={`/tasks/${task.id}`}
      >
        <h3 className="task-title">{task.name}</h3>

        <p className="task-timing">{activeDayString}</p>
      </a>
    </div>
  );
}
