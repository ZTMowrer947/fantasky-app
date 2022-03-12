import { DateTime, Interval } from 'luxon';

import { formatDaysToRepeat } from '@/lib/helpers/days';
import { DetailedTask } from '@/lib/queries/tasks/fetchTask';

interface PropTypes {
  task: DetailedTask;
  csrfToken: string;
}

export type TaskDetailProps = PropTypes;
export default function TaskDetail({ task, csrfToken }: PropTypes) {
  const days = task.completedDays.map((day) =>
    DateTime.fromJSDate(day.date, { zone: 'utc' })
  );

  const reversedStreakStartIndex = [...days]
    .reverse()
    .findIndex((day, idx, array) => {
      const nextDay = idx < array.length - 1 ? array[idx + 1] : null;

      return nextDay && day.plus({ days: 1 }).equals(nextDay);
    });
  const streakStartIndex =
    reversedStreakStartIndex >= 0
      ? days.length - 1 - reversedStreakStartIndex
      : reversedStreakStartIndex;

  const streak = days.slice(streakStartIndex);

  // Determine streak text
  const streakText =
    streak.length > 0
      ? `Streak ongoing since ${streak[0].toLocaleString({
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
        })}`
      : 'No Streak';

  // Declare variable for Saturday in week that today falls into
  const nextSaturday = DateTime.utc()
    .endOf('week')
    .startOf('day')
    .minus({ days: 1 });

  // Get the Sunday after the present/future Saturday, then back up three weeks
  const sundayThreeWeeksAgo = nextSaturday.minus({ days: 20 });

  // Define the interval between the Sunday three weeks ago and the present/future Saturday
  const chartInterval = Interval.fromDateTimes(
    sundayThreeWeeksAgo,
    nextSaturday.plus({ days: 1 })
  );

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
          marked: days.some((completedDay) => completedDay.equals(day)),
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
