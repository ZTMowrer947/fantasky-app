import { formatDaysToRepeat } from '@/lib/helpers/days';
import { TaskPreview } from '@/lib/queries/tasks/fetchTasks';

interface PropTypes {
  tasks: TaskPreview[];
}

export type TaskListProps = PropTypes;
export default function TaskList({ tasks }: PropTypes) {
  return (
    <div className="row w-100">
      {tasks.map((task) => {
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

        return (
          <div className="col-12 col-lg-6 col-xl-4" key={task.id.toString()}>
            <a
              className="task-module task-link bg-danger w-100"
              href={`/tasks/${task.id}`}
            >
              <h3 className="task-title">{task.name}</h3>

              <p className="task-timing">{activeDayString}</p>
            </a>
          </div>
        );
      })}

      <div className="col-12 col-lg-6 col-xl-4">
        <a
          className="task-module task-add-module task-link bg-light w-100"
          href="/tasks/new"
        >
          <br />
          <h3 className="text-center text-danger">+ New Task</h3>
        </a>
      </div>

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
