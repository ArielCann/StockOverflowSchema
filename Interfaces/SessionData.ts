import 'express-session'
declare module 'express-session' {
    /**
     * this interface is responsible for delegating types for the session stored in the Request object
     */
    interface SessionData {
        loggedIn?: boolean,
        currAccount?: string
    }
}