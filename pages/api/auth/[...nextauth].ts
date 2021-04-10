import NextAuth, { NextAuthOptions } from 'next-auth';
import Providers from 'next-auth/providers';

const options: NextAuthOptions = {
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Providers.Discord({
      clientId: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET,
    }),
    Providers.Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  database: {
    type: 'mysql',
    url: process.env.DATABASE_URL,
    synchronize: true,
  },
  secret: process.env.SESSION_SECRET,
};

export default NextAuth(options);
