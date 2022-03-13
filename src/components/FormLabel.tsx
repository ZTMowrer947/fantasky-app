import { PropsWithChildren } from 'react';

interface PropTypes {
  htmlFor: string;
}

export type FormLabelProps = PropTypes;
export default function FormLabel({
  htmlFor,
  children,
}: PropsWithChildren<PropTypes>) {
  return <label htmlFor={htmlFor}>{children}</label>;
}
