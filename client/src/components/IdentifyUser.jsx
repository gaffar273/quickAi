import { useEffect } from 'react';
import { useClianta } from '@clianta/sdk/react';

// Drop this component inside <CliantaProvider>, pass your logged-in user's info
export function IdentifyUser({ email, name }) {
  const tracker = useClianta();

  useEffect(() => {
    if (tracker && email) {
      tracker.identify(email, {
        firstName: name?.split(' ')[0],
        lastName: name?.split(' ').slice(1).join(' '),
      });
    }
  }, [tracker, email]);

  return null;
}

// Usage: <IdentifyUser email={user.email} name={user.name} />