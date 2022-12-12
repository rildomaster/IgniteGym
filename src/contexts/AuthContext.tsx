import { createContext, ReactNode, useState, useEffect } from 'react';

import { api } from '@services/api';
import { storageUserSave, storageUserGet, storageUserRemove } from '@storage/storageUser';
import { storageTokenSave, storageTokenGet, storageTokenRemove } from '@storage/storageAuthToken';
import { UserDTO } from '@dtos/UseDTO';

export type AuthContextDataProps = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
    isLoadingUserStorageData: boolean;
    refreshedToken: string;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {

    const [ user, setUser ] = useState<UserDTO>({} as UserDTO);
    const [refreshedToken, setRefreshedToken] = useState('');
    const [ isLoadingUserStorageData, setIsLoadingUserStorageData ] = useState(true);

    function userAndTokenUpdate(userData: UserDTO, token: string) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    }

    function storageUserAndTokenSave(userData: UserDTO, token: string) {
    }

    async function signIn(email: string, password: string) {

        try {
         
            const { data } = await api.post('/sessions', { email, password });

            if(data?.user && data?.token) {
                await storageUserSave(data.user);
                await storageTokenSave(data.token);

                userAndTokenUpdate(data.user, data.token);
            }
            
        } catch (error) {
            throw error;
        }
    }

    async function signOut() {

        try {
            //setIsLoadingUserStorageData(true);

            setUser({} as UserDTO);
            await storageUserRemove();
            await storageTokenRemove();

        } catch (error) {
            throw error;

        }finally{
            //setIsLoadingUserStorageData(false);
        }
    }

    async function updateUserProfile(userUpdated: UserDTO) {

        try {
            
            setUser(userUpdated);
            await storageUserSave(userUpdated);

        } catch (error) {
            throw error;
        }
    }

    async function loadUserData() {

        try {
            setIsLoadingUserStorageData(true);

            const userLogged = await storageUserGet();
            const token = await storageTokenGet();

            //TODO: Chamar a função Login para validar o usuario e receber um novo token
            //pois o token pode está espirado ou o usuario desativado/bloqueado
            
            if(userLogged.id && token) {
                userAndTokenUpdate(userLogged, token);
            }

        } catch (error) {
            throw error;

        }finally{
            setIsLoadingUserStorageData(false);
        }
    }

    function refreshTokenUpdate(newToken: string) {
        setRefreshedToken(newToken);
    }

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        const subscribe = api.registerInterceptTokenManager({ signOut, refreshTokenUpdate });
        return () => {
            subscribe();
        }
    }, [signOut]);

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, updateUserProfile, isLoadingUserStorageData, refreshedToken }}>
            {children}
        </AuthContext.Provider>
    );
}
