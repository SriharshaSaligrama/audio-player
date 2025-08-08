export class CustomError extends Error {
    public statusCode: number;
    public type?: string;
    public details?: unknown;
    constructor({ message, statusCode, type, details }: {
        message: string,
        statusCode: number,
        type?: string,
        details?: unknown
    }) {
        super(message);
        this.statusCode = statusCode;
        this.type = type;
        this.details = details;
    }
}

/**
 * Generic required fields validator.
 * @param obj The object to validate
 * @param fields Array of required field names (string)
 * @param errorMessages Object mapping field names to custom error messages, or a function (field) => message
 * @param errorContext Optional: a single value or an object mapping field names to context values
 * @param statusCode Optional: a single value or an object mapping field names to status codes (with 'default' fallback)
 * @param ErrorClass Error class to throw (default: CustomError)
 * @param type Error type (default: 'ValidationError')
 */
export function validateRequiredFields({
    obj,
    fields,
    errorMessages = {},
    errorContext = undefined,
    statusCode = 400,
    ErrorClass = CustomError,
    type = 'ValidationError',
}: {
    obj: Record<string, unknown>,
    fields: string[],
    errorMessages?: Record<string, string> | ((field: string) => string),
    errorContext?: unknown | Record<string, unknown>,
    statusCode?: number | Record<string, number>,
    ErrorClass?: typeof CustomError,
    type?: string,
}) {
    for (const field of fields) {
        if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
            const message =
                typeof errorMessages === 'function'
                    ? errorMessages(field)
                    : errorMessages[field] || `${field} is required`;
            // Support per-field error context, with 'default' fallback
            let context: unknown = errorContext;
            if (
                errorContext &&
                typeof errorContext === 'object' &&
                !Array.isArray(errorContext)
            ) {
                const ctxObj = errorContext as Record<string, unknown>;
                if (field in ctxObj) {
                    context = ctxObj[field];
                } else if ('default' in ctxObj) {
                    context = ctxObj['default'];
                }
            }
            // Support per-field statusCode, with 'default' fallback
            let code: number = 400;
            if (
                statusCode &&
                typeof statusCode === 'object' &&
                !Array.isArray(statusCode)
            ) {
                const codeObj = statusCode as Record<string, number>;
                if (field in codeObj) {
                    code = codeObj[field];
                } else if ('default' in codeObj) {
                    code = codeObj['default'];
                }
            } else if (typeof statusCode === 'number') {
                code = statusCode;
            }
            throw new ErrorClass({
                message,
                statusCode: code,
                type,
                details: context,
            });
        }
    }
}

/**
 * Helper to handle errors in action functions with consistent logic.
 * Wraps ErrorHandler.handleError and infers status/type from CustomError if present.
 */
export function handleActionError({
    error,
    source,
    details,
    defaultStatusCode = 500,
    defaultType = 'DatabaseError',
}: {
    error: unknown,
    source: string,
    details?: unknown,
    defaultStatusCode?: number,
    defaultType?: string,
}) {
    const statusCode = error instanceof CustomError ? error.statusCode : defaultStatusCode;
    const type = error instanceof CustomError ? error.type : defaultType;
    ErrorHandler.handleError({
        error: error instanceof Error ? error : new Error(String(error)),
        statusCode,
        source,
        type,
        details,
    });
}

export class ErrorHandler {
    /**
     * Handles errors in a production-grade way:
     * - Logs error (to console in dev, to service in prod)
     * - Masks sensitive details in production
     * - Throws a CustomError with standard structure
     */
    static handleError({ error, statusCode = 500, source = 'ErrorHandler', type, details }: {
        error: Error,
        statusCode?: number,
        source?: string,
        type?: string,
        details?: unknown
    }) {
        const env = process.env.NODE_ENV || 'development';
        // Log error
        if (env === 'development') {
            console.error(`[${source}]`, error);
        } else {
            // In production, log to a service or file (placeholder)
            // e.g., send to Sentry, LogRocket, etc.
            // logErrorToService(error, { source, type, details });
        }
        // Mask error details in production
        const message = env === 'development' ? error.message : 'An unexpected error occurred.';
        throw new CustomError({
            message,
            statusCode,
            type,
            details: env === 'development' ? details : undefined
        });
    }
    /**
     * Returns a standard error response object
     */
    static errorResponse(error: CustomError) {
        return {
            success: false,
            error: {
                message: error.message,
                statusCode: error.statusCode,
                type: error.type,
                details: error.details,
            },
        };
    }
}