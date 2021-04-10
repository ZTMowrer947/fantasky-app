import { NextPage } from 'next';
import { signIn, signOut, useSession } from 'next-auth/client';

const Home: NextPage = () => {
  const [session] = useSession();

  return (
    <div>
      {!session && (
        <div>
          Not signed in...
          <button type="button" onClick={() => signIn()}>
            Sign In
          </button>
        </div>
      )}
      {session && (
        <div>
          Logged in as {session.user.email}
          <button onClick={() => signOut()} type="button">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
