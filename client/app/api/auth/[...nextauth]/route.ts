import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      // When user signs in with Google, create/login them in the backend
      if (account?.provider === "google") {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                        (process.env.NODE_ENV === 'production' 
                          ? 'https://capstone3-6ywq.onrender.com' 
                          : 'http://localhost:5000');
          
          const response = await axios.post(`${apiUrl}/api/auth/google-login`, {
            email: user.email,
            name: user.name,
            googleId: user.id,
            image: user.image,
          }, {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          user.backendToken = response.data.token;
          user.backendUser = response.data.user;
          
        } catch (error: any) {
          // Continue anyway - user can still browse without backend features
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      if (user?.backendToken) {
        token.backendToken = user.backendToken;
        token.backendUser = user.backendUser;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.sub;
      session.user.backendToken = token.backendToken;
      session.user.backendUser = token.backendUser;
      session.user.provider = token.provider;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };