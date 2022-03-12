export default function TaskAddModule() {
  return (
    <div className="col-12 col-lg-6 col-xl-4">
      <a
        className="task-module task-add-module task-link bg-light w-100"
        href="/tasks/new"
      >
        <br />
        <h3 className="text-center text-danger">+ New Task</h3>
      </a>
    </div>
  );
}
