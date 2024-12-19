import { error, type RequestEvent } from '@sveltejs/kit';
//import { authenticateAndReturnUser, type OutputUrls } from '$lib/server/firebase/firebase.server.js';
//import type { UserRecord } from 'firebase-admin/lib/auth/user-record';
import type { Timestamp } from 'firebase/firestore';

export class ControlledError extends Error {
    public code: number;
    public msg: string;
    public context: any;
    public guts: any;

    constructor(code: number, message: string, errorObj: any = {}, context: any = {}) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(`${message}`);

        this.name = 'ControlledError'; // Custom name for error
        this.code = code;
        this.msg = message;
        this.context = context;
        this.guts = errorObj;

        // Maintains proper stack trace (only available on V8 engines, but it's a nice to have)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ControlledError);
        }

        // bubble up inner context fields
        if (errorObj instanceof ControlledError) {
            this.context = {...errorObj.context, ...context }
        }
    }
}

// HOF for user authentication & error handling
export function withErrorHandling(routeHandler: (/*user: UserRecord,*/ event: RequestEvent) => Promise<any>) {
    return async function(event: any) {
        try {
            // Check for authentication token
            // const idToken = event.request.headers.get('Authorization')?.replace('Bearer ', '');
            // if (!idToken) {
            //     throw new ControlledError(401, "No Authorization header provided.");
            // }
            
            // Authenticate and get user
            //const user = await authenticateAndReturnUser(idToken);
            
            // If successful, pass the user into the routeHandler
            return await routeHandler(/*user,*/ event);

        } catch (e: any) {
            console.log(e);
            if (e instanceof ControlledError) {
                let statusCode = e.code;
                let msg = e.msg;
                throw error(statusCode, { message: msg });
            } else {
                let statusCode = 500;
                let msg = "Error occurred during operation.";
                throw error(statusCode, { message: msg });
            }
        }
    }
}

function convertToDate(timestamp: Timestamp | null) {
    let result = null;
    try {
        result = timestamp ? timestamp.toDate() : null;
    }
    catch {
        result = null;
    }
    return result;
}