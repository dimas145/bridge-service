export namespace Webhook {

    type User = {
        id: number,
        name: string,
        username: string,
        avatar_url: string,
        email: string
    }

    type Project = {
        id: string,
        name: string,
        description: string,
        web_url: string,
        avatar_url: string,
        git_ssh_url: string,
        git_http_url: string,
        namespace: string,
        visibility_level: number,
        path_with_namespace: string,
        default_branch: string,
        ci_config_path: string,
        homepage: string,
        url: string,
        ssh_url: string,
        http_url: string
    }

    type Author = {
        name: string,
        email: string
    }

    type lastCommit = {
        id: string,
        message: string,
        title: string,
        timestamp: string,
        url: string,
        author: Author
    }

    type ObjectAttributes = {
        assignee_id: number,
        author_id: number,
        created_at: string,
        description: string,
        head_pipeline_id: string,
        id: string,
        iid: number,
        last_edited_at: string,
        last_edited_by_id: string,
        merge_commit_sha: string,
        merge_error: string,
        merge_params: {
        },
        merge_status: string,
        merge_user_id: string,
        merge_when_pipeline_succeeds: boolean,
        milestone_id: string,
        source_branch: string,
        source_project_id: string,
        state_id: number,
        target_branch: string,
        target_project_id: string,
        time_estimate: number,
        title: string,
        updated_at: string,
        updated_by_id: string,
        url: string,
        source: Project,
        target: Project,
        last_commit: lastCommit,
        work_in_progress: boolean,
        total_time_spent: number,
        human_total_time_spent: string,
        human_time_estimate: string,
        assignee_ids: string[],
        state: string
    }

    type Repository = {
        name: string,
        url: string,
        description: string,
        homepage: string
    }

    export type WebhookBody = {
        object_kind: string,
        event_type: string,
        user: User,
        project: Project,
        object_attributes: ObjectAttributes,
        labels: string[],
        changes: {
        },
        repository: Repository
    }
}
