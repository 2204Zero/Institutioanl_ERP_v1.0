import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { GlobalState, initialGlobalState, storeReducer, GlobalAction } from './storeReducer';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';
import { onUnauthorized } from '../services/apiClient';

export interface StoreContextValue {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialGlobalState);

  // 1. Subscribe to unauthorized events from ApiClient response interceptor
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      dispatch({ type: 'LOGOUT' });
    });
    return unsubscribe;
  }, []);

  // 2. Initialize and restore Auth session state on startup
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userResp = await authService.getCurrentUser();
          const accessToken = tokenStorage.getAccessToken() || '';
          const refreshToken = tokenStorage.getRefreshToken() || '';

          if (userResp.success && userResp.data) {
            dispatch({
              type: 'SET_AUTH',
              payload: {
                user: userResp.data,
                tokens: {
                  accessToken,
                  refreshToken,
                  tokenType: 'Bearer',
                  expiresIn: 15 * 60,
                  issuedAt: Date.now(),
                },
              },
            });
          }
        } catch {
          authService.removeToken();
          dispatch({ type: 'LOGOUT' });
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
