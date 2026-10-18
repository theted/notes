import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const PIXEL = 'https://visits.sundbergsolutions.se/v.gif?s=notes';

// Counts a view on the shared visit counter for each route. Only the first view sends
// document.referrer: it stays the same through client-side navigation, so sending it again would
// count one referral per page. Views count only on notes.sundbergsolutions.se.
const useVisitCounter = () => {
  const { pathname } = useLocation();
  const { isAuthed } = useAuth();
  const isFirstView = useRef(true);
  // RequireAuth sends signed-out visitors on to /login at once; count only the page they land on
  const redirecting = !isAuthed && pathname !== '/login';

  useEffect(() => {
    if (redirecting) return;
    const referrer = isFirstView.current ? `&r=${encodeURIComponent(document.referrer)}` : '';
    isFirstView.current = false;
    new Image().src = PIXEL + referrer;
  }, [pathname, redirecting]);
};

export default useVisitCounter;
