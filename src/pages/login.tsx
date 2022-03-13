import FormControl from '@/components/FormControl';
import FormLabel from '@/components/FormLabel';

interface PropTypes {
  csrfToken: string;
  failureFlash?: string;
}

export type LoginProps = PropTypes;
export default function Login({ csrfToken, failureFlash }: PropTypes) {
  return (
    <div className="row">
      <div className="col" />
      <div className="col-8 col-md-6 col-lg-4">
        {failureFlash && (
          <div className="alert alert-danger" role="alert">
            {failureFlash}
          </div>
        )}

        <h1>Log In</h1>

        <form method="POST">
          <div className="form-group">
            <FormLabel htmlFor="emailAddress">Email</FormLabel>
            <FormControl name="emailAddress" type="text" isValid />
          </div>
          <div className="form-group">
            <FormLabel htmlFor="password">Password</FormLabel>
            <FormControl name="password" type="password" isValid />
          </div>

          <input type="hidden" name="_csrf" value={csrfToken} />

          <div className="btn-group">
            <button type="submit" className="btn btn-danger">
              Submit
            </button>
            <a href="/register" className="btn btn-outline-danger">
              Register
            </a>
          </div>
        </form>
      </div>
      <div className="col" />
    </div>
  );
}
