interface PropTypes {
  stack?: string;
}

export type UnexpectedErrorProps = PropTypes;
export default function UnexpectedError({ stack }: PropTypes) {
  return (
    <div className="row">
      <div className="col" />
      <div className="col-8">
        <h1 className="display-4">Error</h1>

        <p>An unexpected error has occurred.</p>

        <p>
          You should be redirected to the task listing in about 3 seconds. If
          this does not occur, click{' '}
          <a href="/tasks" className="text-danger">
            here.
          </a>
        </p>
        {stack && (
          <>
            <p>
              Below contains a stack trace of the error that was encountered:
            </p>
            <pre>{stack}</pre>
          </>
        )}
      </div>
      <div className="col" />
    </div>
  );
}
