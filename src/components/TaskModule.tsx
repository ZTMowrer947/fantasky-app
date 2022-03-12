import { formatDaysToRepeat } from '@/lib/helpers/days';
import { TaskPreview } from '@/lib/queries/tasks/fetchTasks';

interface PropTypes {
  task: TaskPreview;
}

export type TaskModuleProps = PropTypes;
export default function TaskModule({ task }: PropTypes) {
  // Map tasks into view model data
  const {
    sunday,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
  } = task.activeDays;
  const activeDays = {
    sun: sunday,
    mon: monday,
    tue: tuesday,
    wed: wednesday,
    thu: thursday,
    fri: friday,
    sat: saturday,
  };

  // Calculate active days
  const activeDayString = formatDaysToRepeat(activeDays);

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
