
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_URLS } from '@/utils/constants';

/**
 * DeleteAccount - Special route to comply with Google Play Store requirements.
 * Redirects users to the Settings page with the delete account section.
 */
const DeleteAccount = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to settings page with a flag to open the delete dialog
    navigate(APP_URLS.SETTINGS, { state: { openDeleteDialog: true } });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">
          Taking you to the account deletion page.
        </p>
      </div>
    </div>
  );
};

export default DeleteAccount;
