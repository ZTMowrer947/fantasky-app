interface PropTypes {
  error?: string;
}

export type FormFieldFeedbackProps = PropTypes;
export default function FormFieldFeedback({ error }: PropTypes) {
  return error ? <div className="invalid-feedback">{error}</div> : null;
}
