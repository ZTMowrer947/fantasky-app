interface PropTypes {
  name: string;
  value?: string;
  type: string;
  isValid: boolean;
}

export type FormControlProps = PropTypes;
export default function FormControl({ name, value, type, isValid }: PropTypes) {
  const validityClass = isValid ? '' : 'is-invalid';

  const className = ['form-control', validityClass].join(' ');

  if (type === 'textarea') {
    return (
      <textarea className={className} name={name} id={name} value={value} />
    );
  }

  return (
    <input
      className={className}
      type={type}
      name={name}
      id={name}
      value={value}
    />
  );
}
