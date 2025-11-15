import { useContext } from 'react';
import { AuthContext } from './AuthContextValue';

export const useAuth = () => useContext(AuthContext);

// how to  use this in other Files to  get user info in any page
// import { useAuth } from '../contexts/useAuth';
// const { user, logout, isAuthenticated } = useAuth();
// name = user.name,
// email = user.email
export default useAuth;
