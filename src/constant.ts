export class Constant {
    public static MERGE_REQUEST_HOOK: string = 'Merge Request Hook'

    public static WS_FUNCTION_UPDATE_GRADE: string = 'mod_assign_save_grade'
    public static WS_FUNCTION_UPDATE_USER: string = 'core_user_update_users'

    public static WORKFLOWSTATE: string = 'Released'

    public static DOCKER_NETWORK: string = 'bridge_service'
    public static CONTAINER_LABEL: string = 'autograder'

    public static GRADER_PORT: string = '5000'
    public static GRADER_HEALTHCHECK_ENDPOINT: string = '/health-check'
    public static GRADER_DESCRIPTION_ENDPOINT: string = '/description'
    public static GRADER_GRADING_ENDPOINT: string = '/grade'
}
