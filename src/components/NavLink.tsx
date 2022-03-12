import { PropsWithChildren } from 'react';

interface PropTypes {
  href: string;
  path: string;
  activateOnMatching?: boolean;
}

export type NavLinkProps = PropTypes;
export default function NavLink({
  children,
  href,
  path,
  activateOnMatching,
}: PropsWithChildren<PropTypes>) {
  const normalizedActivateOnMatching = activateOnMatching ?? true;

  const isActive = normalizedActivateOnMatching && href === path;
  const classList = isActive ? 'nav-link active' : 'nav-link';

  return (
    <a href={href} className={classList}>
      {children}

      {isActive && <span className="sr-only">(active)</span>}
    </a>
  );
}
