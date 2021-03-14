declare module 'http' {
    interface IncomingHttpHeaders {
        'x-gitlab-event'?: string,
        'x-gitlab-token'?: string
    }
}
