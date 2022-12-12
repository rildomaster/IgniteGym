import axios, { AxiosInstance } from 'axios';
import { AppError } from '@utils/AppError';

import { storageTokenGet, storageTokenSave } from '@storage/storageAuthToken';


type ProcessQueueParams = {
    error: Error | null;
    token: string | null;
};

type RegisterInterceptTokenManagerProps = {
    signOut: () => void;
    refreshTokenUpdate: (newToken: string) => void;
}

type APIInstanceProps = AxiosInstance & {
    registerInterceptTokenManager: ({}: RegisterInterceptTokenManagerProps) => () => void;
};

type PromiseType = {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}

const api = axios.create({
    baseURL: 'http://192.168.0.29:3333',
    headers: {
        'Accept': 'application/json', 
        'Content-Type': 'application/json'
    }
}) as APIInstanceProps;

let isRefreshing = false;
let failedQueue: Array<PromiseType> = [];

const processQueue = ({ error, token = null }: ProcessQueueParams): void => {
    failedQueue.forEach(request => {
        if(error) {
            request.reject(error);
        } else {
            request.resolve(token);
        }
    });

    failedQueue = [];
}

//Criando acesso ao SignOut do contexto para deslogar o usuário caso o refresh token não funcione
api.registerInterceptTokenManager = ({signOut, refreshTokenUpdate }) => {
    const interceptTokenManager = api.interceptors.response.use(response => response, async requestError => {
        
        //validando token expirado
        if(requestError?.response?.status === 401) {
            if(requestError.response.data?.message === 'token.expired' || requestError.response.data?.message === 'token.invalid') {
                const currentToken = await storageTokenGet();

                if(!currentToken) {
                    signOut();
                    return Promise.reject(requestError);
                }

                const originalRequest = requestError.config;

                if(isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });

                    }).then(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return axios(originalRequest);

                    }).catch(error => {
                        throw error;
                    })
                }

                isRefreshing = true;

                return new Promise(async (resolve, reject) => {
                    try {
                        const { data } = await api.post('/sessions/refresh-token', { token: currentToken });
                        await storageTokenSave(data.token);
    
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
                        
                        refreshTokenUpdate(data.token);
                        processQueue({ error: null, token: data.token });
                        
                        resolve(originalRequest);
                    } catch (error: any) {
                        processQueue({ error, token: null });
                        signOut();
                        reject(error);
                    } finally {
                        isRefreshing = false;
                    }
                });
            }

            signOut();
        }
        
        if(requestError.response && requestError.response.data) {
            return Promise.reject(new AppError(requestError.response.data.message));
        } else {
            return Promise.reject(requestError);
        }

    });

    return () => {
        api.interceptors.response.eject(interceptTokenManager);
    };
}

//Interceptando qualquer request
api.interceptors.request.use((config) => {
    return config;
}, (error) => {
    return Promise.reject(error);
});


//Interceptando qualquer response
// api.interceptors.response.use((response) => {
//     return response;
// }, (error) => {

//     if(error.response && error.response.data) {
//         return Promise.reject(new AppError(error.response.data.message));
//     }

//     return Promise.reject(error);
// });


export { api };