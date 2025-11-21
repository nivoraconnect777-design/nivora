import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import authService from '../services/authService';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const result = await authService.googleAuth({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || '',
          displayName: profile.displayName,
          profilePicUrl: profile.photos?.[0]?.value,
        });

        done(null, result);
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

export default passport;
