interface PropTypes {
  userName: string;
  path: string;
}

export type HeaderProps = PropTypes;
export default function Header({ userName, path }: PropTypes) {
  return (
    <header className="flex-shrink-0">
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
        <a href="/tasks" className="navbar-brand">
          Fantasky
        </a>
        <button
          type="button"
          className="navbar-toggler"
          data-toggle="collapse"
          data-target="#navbar-collapse"
          aria-controls="navbar-collapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbar-collapse">
          <div className="navbar-nav d-flex justify-content-start w-100">
            {userName && (
              <>
                <div className="nav-item m-2 ml-lg-auto text-center text-white">
                  Welcome {userName}!
                </div>
                <div className="nav-item">
                  <a href="/logout" className="nav-link">
                    Log Out
                  </a>
                </div>
              </>
            )}
            {!userName && (
              <>
                <div className="nav-item ml-auto">
                  <a
                    href="/login"
                    className={path === '/login' ? 'nav-link active' : 'active'}
                  >
                    Log In
                  </a>
                </div>
                <div className="nav-item">
                  <a
                    href="/register"
                    className={
                      path === '/register' ? 'nav-link active' : 'active'
                    }
                  >
                    Register
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
