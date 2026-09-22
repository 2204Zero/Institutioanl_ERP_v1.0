import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { GlobalState, initialGlobalState, storeReducer, GlobalAction } from './storeReducer';
import { authService } from '../services/authService';

export interface StoreContextValue {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialGlobalState);

  // Initialize Auth state on startup
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userResp = await authService.getCurrentUser();
          if (userResp.success && userResp.data) {
            const token = authService.decodeToken();
            dispatch({
              type: 'SET_AUTH',
              payload: {
                user: userResp.data,
                tokens: {
                  accessToken: token ? 'restored_token' : '',
                  refreshToken: '',
                  tokenType: 'Bearer',
                  expiresIn: 86400,
                  issuedAt: Date.now(),
                },
              },
            });
          }
        } catch {
          authService.removeToken();
        }
      }
    };
    initAuth();
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useGlobalStore = (): StoreContextValue => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useGlobalStore must be used within a StoreProvider');
  }
  return context;
};
