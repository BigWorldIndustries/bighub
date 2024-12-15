import type { User } from "firebase/auth";
import { get, writable, type Writable } from "svelte/store";

// all stores have these fields
export interface Store {
    lastAction: string | null;
    lastActionSuccess: boolean | null;
    errorMessage: string | null; 
}

// an action takes the current state of a store S, does something, and returns a changed subset of that store
type Action<S>  = (store: S, ...args: Array<any>) => Promise<Partial<S>>;

// a map of actions for a store S
export interface Actions<S> {
    [name: string]: Action<S>;
}

// a handler is an exported function of the store that returns nothing
type Handler<T extends any[]> = (...args: T) => Promise<void>;

// a map of handlers, meant to be exposed for frontend use
export interface Handlers {
    [name: string]: Handler<any>;
}

export function clearStoreCache() {
    if (typeof window !== 'undefined') {
        for (const key of cachedKeys) {
            localStorage.removeItem(key);
        }
        cachedKeys = [];
    }
}

let cachedKeys: string[] = [];

let genericDefaults: Store = {
    lastAction: null,
    lastActionSuccess: null,
    errorMessage: null
};

// returns a writable but with initial state
export function writableWithCache<S extends Store>(key: string, initialState: S, overrides: Partial<S> = {}) {
    
    if (typeof window !== 'undefined') {
        let localStore = localStorage.getItem(key);
        let cachedState = localStore ? JSON.parse(localStore) : null;
        initialState = { ...initialState, ...cachedState, ...genericDefaults, ...overrides };
        console.log("cache hit");
        console.log(initialState);
    }

    const store = writable(initialState);

    if (typeof window !== 'undefined') {
        store.subscribe((value) => {
            cachedKeys.push(key);
            localStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
}

export function updateStore<S extends Store>(store: Writable<S>, updates: Partial<S>) {
    store.update((store) => {
        return {...store,
            ...updates
        };
    });
}

// converts an action into a handler
// gets current state, runs the action, performs any state changes deigned by the action on the store, and handles errors
export function withErrorHandler<S extends Store, T extends any[]>(
    store: Writable<S>,
    actionName: string,
    fn: Action<S>
): Handler<T> {
    return async (...args: T) => {
        let error: any = null;
        let storeUpdates: Partial<S> = {};

        const currentStore = get(store);

        try {
            storeUpdates = await fn(currentStore, ...args);
        } catch (err) {
            error = err;
        }

        store.update((store) => {
            return {...store,
                ...storeUpdates,
                isLoading: false,
                lastAction: actionName,
                lastActionSuccess: !error,
                errorMessage: error
            };
        });
    };
}

// coverts the actions to handlers - wraps the actions with error handling and state change
export function handlersForActions<S extends Store>(store: Writable<S>, actions: Actions<S>): Handlers {
    return Object.entries(actions).reduce<Handlers>((handlers, [actionName, action]) => {
        handlers[actionName] = withErrorHandler(store, actionName, action);
        return handlers;
    }, {});
}

export async function api(method: string, endpoint: string, requestBody: any = null): Promise<any> {
    //const token = await user.getIdToken();
    const response = await fetch(endpoint, {
        method: method,
        body: requestBody ? JSON.stringify(requestBody) : null,
        headers: {
            //'Authorization': `Bearer ${token}`
        }
    });
    const responseBody = await response.json();
    if (!response.ok) {
        throw(responseBody.message);
    }
    return responseBody; 
}