import UnifiedLogin from '@/components/UnifiedLogin';
import { useStaffAuth } from './auth';

export default function StaffLogin() {
  const { login } = useStaffAuth();
  return <UnifiedLogin defaultTab="staff" onStaffLogin={login} />;
}
