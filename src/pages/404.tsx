export default function NotFound() {
  return (
    <div className="row">
      <div className="col" />
      <div className="col-8">
        <h1 className="display-4">Not Found</h1>

        <p>We could not find the resource you were looking for.</p>
        <p>
          Either it does not exist or you do not have permission to access it.
        </p>

        <p>
          You should be redirected to the task listing in about 3 seconds. If
          this does not occur, click{' '}
          <a href="/tasks" className="text-danger">
            here.
          </a>
        </p>
      </div>
      <div className="col" />
    </div>
  );
}
