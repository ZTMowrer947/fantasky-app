export default function CsrfError() {
  return (
    <div className="row">
      <div className="col" />
      <div className="col-8">
        <h1 className="display-4">Invalid Request</h1>

        <p>
          There was an error verifying the validity of the requested action.
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
