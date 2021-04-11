/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/client';

const Header: FC = () => {
  const [isCollapsed, setCollapsed] = useState(true);
  const [session, loading] = useSession();

  const performSignIn = () => {
    return signIn();
  };

  const performSignOut = () => {
    return signOut();
  };

  return (
    <header className="flex-shrink-0">
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
        <Link href="/tasks" passHref>
          <a className="navbar-brand">Fantasky</a>
        </Link>
        <button
          type="button"
          className="navbar-toggler"
          data-toggle="collapse"
          data-target="#navbar-collapse"
          aria-controls="navbar-collapse"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
          onClick={() => setCollapsed((prevState) => !prevState)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={
            isCollapsed ? 'collapse navbar-collapse' : 'navbar-collapse'
          }
          id="navbar-collapse"
        >
          <div className="navbar-nav d-flex justify-content-start w-100">
            <div className="nav-item">
              <Link href="/tasks" passHref>
                <a className="nav-link">Tasks</a>
              </Link>
            </div>

            {!loading && (
              <>
                {session ? (
                  <>
                    <div className="nav-item m-2 ml-lg-auto text-center text-white">
                      Welcome {session.user.name}!
                    </div>
                    <div className="nav-item">
                      <button
                        type="button"
                        className="btn btn-link nav-link"
                        onClick={performSignOut}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="nav-item ml-auto">
                    <button
                      type="button"
                      className="btn btn-link nav-link"
                      onClick={performSignIn}
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
