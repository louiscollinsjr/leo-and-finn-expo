/**
 * Authentication hook.
 * 
 * Re-exports the useAuth hook from StackAuthProvider for backward compatibility.
 * All components using useAuth() will automatically use Stack Auth.
 */

export { useAuth } from '@/providers/StackAuthProvider';
