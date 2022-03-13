import FormControl from '@/components/FormControl';
import FormFieldFeedback from '@/components/FormFieldFeedback';
import FormLabel from '@/components/FormLabel';
import { UserCreateViewModel } from '@/lib/queries/user/createUser';

interface PropTypes {
  csrfToken: string;
  prevValues?: Omit<UserCreateViewModel, 'password'>;
  errors?: Record<
    keyof UserCreateViewModel | 'confirmPassword',
    { msg: string }
  >;
}

const fieldData: {
  name: keyof UserCreateViewModel | 'confirmPassword';
  labelText: string;
  type?: string;
}[] = [
  {
    name: 'firstName',
    labelText: 'First Name',
  },
  {
    name: 'lastName',
    labelText: 'Last Name',
  },
  {
    name: 'emailAddress',
    labelText: 'Email Address',
    type: 'email',
  },
  {
    name: 'password',
    labelText: 'Password',
    type: 'password',
  },
  {
    name: 'confirmPassword',
    labelText: 'Confirm Password',
    type: 'password',
  },
];

export type RegisterProps = PropTypes;
export default function Register({ csrfToken, prevValues, errors }: PropTypes) {
  return (
    <div className="row">
      <div className="col" />
      <div className="col-8 col-md-6 col-lg-5">
        <h1>New Task</h1>

        <form method="POST" noValidate>
          {fieldData.map(({ name, labelText, type }) => (
            <div className="form-group" key={name}>
              <FormLabel htmlFor="name">{labelText}</FormLabel>
              <FormControl
                name={name}
                type={type ?? 'text'}
                isValid={!errors?.[name]?.msg}
                value={
                  name === 'password' || name === 'confirmPassword'
                    ? undefined
                    : prevValues?.[name]?.toString() ?? undefined
                }
              />
              <FormFieldFeedback error={errors?.[name]?.msg} />
            </div>
          ))}

          <input type="hidden" name="_csrf" value={csrfToken} />

          <div className="btn-group mb-3">
            <button type="submit" className="btn btn-danger">
              Register
            </button>
            <a href="/login" className="btn btn-outline-danger">
              Log In
            </a>
          </div>
        </form>
      </div>
      <div className="col" />
    </div>
  );
}
