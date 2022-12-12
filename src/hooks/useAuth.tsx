import { useContext } from 'react';

import { AuthContext } from '@contexts/AuthContext';


//export const useAuth = useContext(AuthContext);

export function useAuth() {
    const context = useContext(AuthContext);
    
    return context;
}