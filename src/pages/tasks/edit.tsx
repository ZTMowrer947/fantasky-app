import FormControl from '@/components/FormControl';
import FormFieldFeedback from '@/components/FormFieldFeedback';
import FormLabel from '@/components/FormLabel';
import { TaskUpdateViewModel } from '@/lib/queries/tasks/editTask';

interface PropTypes {
  csrfToken: string;
  errors?: Record<keyof TaskUpdateViewModel, { msg: string }>;
  prevValues: TaskUpdateViewModel;
  taskId: bigint | number;
}

const baseFields: {
  name: keyof TaskUpdateViewModel;
  labelText: string;
  type?: string;
}[] = [
  {
    name: 'name',
    labelText: 'Name',
  },
  {
    name: 'description',
    labelText: 'Description (optional)',
    type: 'textarea',
  },
  {
    name: 'startDate',
    labelText: 'Start Date',
    type: 'date',
  },
];

const checkboxFields: {
  name: keyof TaskUpdateViewModel['activeDays'];
  labelText: string;
}[] = [
  {
    name: 'sunday',
    labelText: 'Sundays',
  },
  {
    name: 'monday',
    labelText: 'Mondays',
  },
  {
    name: 'tuesday',
    labelText: 'Tuesdays',
  },
  {
    name: 'wednesday',
    labelText: 'Wednesday',
  },
  {
    name: 'thursday',
    labelText: 'Thursdays',
  },
  {
    name: 'friday',
    labelText: 'Fridays',
  },
  {
    name: 'saturday',
    labelText: 'Saturdays',
  },
];

export type EditTaskProps = PropTypes;
export default function EditTask({
  csrfToken,
  errors,
  prevValues,
  taskId,
}: PropTypes) {
  return (
    <div className="row">
      <div className="col" />
      <div className="col-8 col-md-6 col-lg-5">
        <h1>Edit Task</h1>

        <form method="POST">
          {baseFields.map(({ name, labelText, type }) => (
            <div className="form-group" key={name}>
              <FormLabel htmlFor="name">{labelText}</FormLabel>
              <FormControl
                name={name}
                type={type ?? 'text'}
                isValid={!errors?.[name]?.msg}
                value={prevValues[name]?.toString() ?? undefined}
              />
              <FormFieldFeedback error={errors?.[name]?.msg} />
            </div>
          ))}

          <div className="form-group">
            <legend>Active Days</legend>
            {checkboxFields.map(({ name, labelText }) => (
              <div className="form-check" key={name}>
                <input
                  type="checkbox"
                  name={name}
                  id={name}
                  className="form-check-input"
                  checked={prevValues.activeDays[name]}
                />
                <label htmlFor={name} className="form-check-label">
                  {labelText}
                </label>
              </div>
            ))}

            {errors?.activeDays && (
              <div className="invalid-feedback d-block">
                {errors.activeDays.msg}
              </div>
            )}
          </div>

          <input type="hidden" name="_csrf" value={csrfToken} />

          <div className="btn-group mb-3">
            <button type="submit" className="btn btn-danger">
              Create Task
            </button>
            <a
              href={`/tasks/${taskId.toString()}`}
              className="btn btn-outline-danger"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
      <div className="col" />
    </div>
  );
}
