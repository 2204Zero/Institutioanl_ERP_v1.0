import { User, Token } from '../types/authTypes';
import { Student, StudentFilter } from '../types/studentTypes';
import { PaginatedResponse, ErrorResponse, LoadingState } from '../types/apiTypes';

export interface GlobalState {
  auth: {
    user: User | null;
    tokens: Token | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
  };
  students: {
    items: Student[];
    paginatedResult: PaginatedResponse<Student> | null;
    selectedStudent: Student | null;
  };
  loading: Record<string, LoadingState>;
  errors: Record<string, ErrorResponse | null>;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  search: {
    keyword: string;
    fields: (keyof Student)[];
  };
  filter: {
    activeFilters: StudentFilter;
    sortBy: keyof Student;
    sortOrder: 'asc' | 'desc';
  };
  cacheStats: {
    lastInvalidatedAt: number | null;
    keysCount: number;
  };
}

export const initialGlobalState: GlobalState = {
  auth: {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isAuthenticating: false,
  },
  students: {
    items: [],
    paginatedResult: null,
    selectedStudent: null,
  },
  loading: {},
  errors: {},
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  },
  search: {
    keyword: '',
    fields: ['name', 'rollNo', 'email', 'department'],
  },
  filter: {
    activeFilters: {},
    sortBy: 'name',
    sortOrder: 'asc',
  },
  cacheStats: {
    lastInvalidatedAt: null,
    keysCount: 0,
  },
};

export type GlobalAction =
  | { type: 'SET_AUTH'; payload: { user: User; tokens: Token } }
  | { type: 'LOGOUT' }
  | { type: 'SET_STUDENTS'; payload: PaginatedResponse<Student> }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'REMOVE_STUDENT'; payload: string }
  | { type: 'SET_SELECTED_STUDENT'; payload: Student | null }
  | { type: 'SET_LOADING'; payload: { key: string; state: LoadingState } }
  | { type: 'SET_ERROR'; payload: { key: string; error: ErrorResponse | null } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'SET_PAGINATION'; payload: Partial<GlobalState['pagination']> }
  | { type: 'SET_SEARCH'; payload: { keyword: string; fields?: (keyof Student)[] } }
  | { type: 'SET_FILTER'; payload: Partial<GlobalState['filter']> }
  | { type: 'INVALIDATE_CACHE' };

export function storeReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        auth: {
          user: action.payload.user,
          tokens: action.payload.tokens,
          isAuthenticated: true,
          isAuthenticating: false,
        },
      };

    case 'LOGOUT':
      return {
        ...state,
        auth: {
          user: null,
          tokens: null,
          isAuthenticated: false,
          isAuthenticating: false,
        },
        students: {
          items: [],
          paginatedResult: null,
          selectedStudent: null,
        },
      };

    case 'SET_STUDENTS':
      return {
        ...state,
        students: {
          ...state.students,
          items: action.payload.items,
          paginatedResult: action.payload,
        },
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalItems: action.payload.total,
          totalPages: action.payload.totalPages,
        },
      };

    case 'ADD_STUDENT':
      return {
        ...state,
        students: {
          ...state.students,
          items: [action.payload, ...state.students.items],
        },
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems + 1,
        },
      };

    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: {
          ...state.students,
          items: state.students.items.map((s) => (s.id === action.payload.id ? action.payload : s)),
          selectedStudent:
            state.students.selectedStudent?.id === action.payload.id ? action.payload : state.students.selectedStudent,
        },
      };

    case 'REMOVE_STUDENT':
      return {
        ...state,
        students: {
          ...state.students,
          items: state.students.items.filter((s) => s.id !== action.payload && s.rollNo !== action.payload),
          selectedStudent:
            state.students.selectedStudent?.id === action.payload ? null : state.students.selectedStudent,
        },
        pagination: {
          ...state.pagination,
          totalItems: Math.max(0, state.pagination.totalItems - 1),
        },
      };

    case 'SET_SELECTED_STUDENT':
      return {
        ...state,
        students: {
          ...state.students,
          selectedStudent: action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.state,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };

    case 'CLEAR_ERROR': {
      const nextErrors = { ...state.errors };
      delete nextErrors[action.payload];
      return {
        ...state,
        errors: nextErrors,
      };
    }

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {},
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload,
        },
      };

    case 'SET_SEARCH':
      return {
        ...state,
        search: {
          keyword: action.payload.keyword,
          fields: action.payload.fields || state.search.fields,
        },
        pagination: {
          ...state.pagination,
          page: 1, // Reset to first page on search
        },
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload,
        },
        pagination: {
          ...state.pagination,
          page: 1, // Reset to first page on filter change
        },
      };

    case 'INVALIDATE_CACHE':
      return {
        ...state,
        cacheStats: {
          lastInvalidatedAt: Date.now(),
          keysCount: 0,
        },
      };

    default:
      return state;
  }
}
