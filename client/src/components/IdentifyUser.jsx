import { useEffect } from 'react';
import { useClianta } from '@clianta/sdk/react';

// Call tracker.identify() AFTER your user logs in.
// This creates a CRM contact and links all tracking data to them.
//
// Works with any auth provider (Clerk, Supabase, Firebase, etc.)

export default function App() {
  const tracker = useClianta();

  // ── Example with Clerk ──
  // import { useUser } from '@clerk/clerk-react';
  // const { user } = useUser();
  // const email = user?.primaryEmailAddress?.emailAddress;
  // const name = user?.fullName;

  // ── Example with Firebase ──
  // import { getAuth } from 'firebase/auth';
  // const fbUser = getAuth().currentUser;
  // const email = fbUser?.email;
  // const name = fbUser?.displayName;

  const email = ''; // ← replace with your auth user email
  const name = '';  // ← replace with your auth user name

  useEffect(() => {
    if (tracker && email) {
      tracker.identify(email, {
        firstName: name?.split(' ')[0],
        lastName: name?.split(' ').slice(1).join(' '),
      });
    }
  }, [tracker, email]);

  return <div>Your app content...</div>;
}