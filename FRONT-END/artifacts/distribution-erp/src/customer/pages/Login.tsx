import UnifiedLogin from '@/components/UnifiedLogin';
import { getStoredUser, type CustomerUser } from '../api';

export default function CustomerLogin({ onAuthenticated }: { onAuthenticated: (u: CustomerUser) => void }) {
  return (
    <UnifiedLogin
      defaultTab="customer"
      onSuccess={() => {
        const u = getStoredUser();
        if (u) onAuthenticated(u);
      }}
    />
  );
}
