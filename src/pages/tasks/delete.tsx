import { DetailedTask } from '@/lib/queries/tasks/fetchTask';

interface PropTypes {
  csrfToken: string;
  task: Pick<DetailedTask, 'id' | 'name'>;
}

export type DeleteTaskProps = PropTypes;
export default function DeleteTask({ csrfToken, task }: PropTypes) {
  return (
    <div className="row">
      <div className="col" />
      <div className="col-8 col-md-6 col-lg-5">
        <h1 className="display-4">WARNING!</h1>

        <p>
          This will <em>permanently</em> delete the task &quot;{task.name}
          &quot;. Once it is deleted, it <strong>CANNOT</strong> be recovered.
        </p>

        <p>
          Are you <strong>absolutely</strong> sure you would like to proceed
          with deleting this task?
        </p>

        <form method="POST">
          <div className="btn-group">
            <input type="hidden" name="_csrf" value={csrfToken} />

            <button type="submit" className="btn btn-danger">
              Yes, delete anyway
            </button>
            <a href={`/tasks/${task.id}`} className="btn btn-outline-danger">
              No, go back
            </a>
          </div>
        </form>
      </div>
      <div className="col" />
    </div>
  );
}
