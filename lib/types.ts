export interface Survey {
    id: string;
    title: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    user_id: string;
    is_active: boolean;
}

export interface User {
    id: string;
    auth0_id: string;
    email: string;
}

export interface Response {
    id: number;
    survey_id: string;
    data: any;
    respondent_id: string;
    respondent_name: string;
    respondent_email: string;
    completed_at: Date;
} 