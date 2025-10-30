// A custom error class to handle expected application errors (e.g., "Not Found", "Forbidden")
// with specific HTTP status codes. This allows the global error handler to distinguish
// between expected errors and true server failures.
export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        // This is necessary for custom errors in Node.js when using TypeScript
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
