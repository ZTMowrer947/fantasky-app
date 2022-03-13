import { DateTime, Interval } from 'luxon';

import {
  formatDaysToRepeat,
  getStartOfCompletionStreak,
} from '@/lib/helpers/days';
import { DetailedTask } from '@/lib/queries/tasks/fetchTask';

interface PropTypes {
  task: DetailedTask;
  csrfToken: string;
}

export type TaskDetailProps = PropTypes;
export default function TaskDetail({ task, csrfToken }: PropTypes) {
  const streakStart = getStartOfCompletionStreak(task);

  // Determine streak text
  const streakText = streakStart
    ? `Streak ongoing since ${streakStart.toLocaleString({
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      })}`
    : 'No Streak';

  // Find next Sunday that is not today
  const today = DateTime.utc().startOf('day');
  const sundayOfWeek = today.endOf('week').startOf('day');
  const nextSunday = today.equals(sundayOfWeek)
    ? sundayOfWeek.plus({ week: 1 })
    : sundayOfWeek;

  // Back up three weeks
  const sundayThreeWeeksAgo = nextSunday.minus({ week: 3 });

  // Define the interval between the Sunday three weeks ago and the present/future Saturday
  const chartInterval = Interval.fromDateTimes(sundayThreeWeeksAgo, nextSunday);

  // Split the interval up by days, then reverse it
  const pastThreeWeeks = chartInterval
    .splitBy({ weeks: 1 })
    .map((weekInterval) =>
      weekInterval.splitBy({ days: 1 }).map((dayInterval) => {
        // Get start date of interval
        const day = dayInterval.start.startOf('day');

        // Format date as numeric months and day
        return {
          date: day.toLocaleString({ day: 'numeric', month: 'numeric' }),
          marked: task.completedDays.some(
            (completedDay) => completedDay.date.valueOf() === day.toMillis()
          ),
        };
      })
    );

  // Format active days
  const activeDayString = formatDaysToRepeat(task.activeDays);

  return (
    <>
      <a className="text-danger text-decoration-none" href="/tasks">
        &lt; Return to Task Listing
      </a>

      <h1 className="mt-4">{task.name}</h1>
      <p>{activeDayString}</p>

      {task.description && <p className="lead">{task.description}</p>}

      <div className="row mt-3">
        <div className="col-2" />
        <div className="col">
          <table className="table table-bordered">
            <caption className="text-center">{streakText}</caption>
            <thead>
              <tr>
                <th scope="col">S</th>
                <th scope="col">M</th>
                <th scope="col">T</th>
                <th scope="col">W</th>
                <th scope="col">T</th>
                <th scope="col">F</th>
                <th scope="col">S</th>
              </tr>
            </thead>
            <tbody>
              {pastThreeWeeks.map((week, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={index}>
                  {week.map((day) => (
                    <td
                      key={day.date}
                      className={day.marked ? 'bg-danger text-white' : ''}
                    >
                      {day.date}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-2" />
      </div>

      <form className="form-inline" method="POST">
        <div className="btn-group">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <button type="submit" className="btn btn-outline-danger">
            Toggle for Today
          </button>
          <a href={`/tasks/${task.id}/edit`} className="btn btn-outline-danger">
            Edit Task
          </a>
          <a href={`/tasks/${task.id}/delete`} className="btn btn-danger">
            DELETE Task
          </a>
        </div>
      </form>
    </>
  );
}
