// separate file to hold context value so files that export component only (like AuthProvider) don't also export non-components and trigger

import { createContext } from 'react';

export const AuthContext = createContext();
