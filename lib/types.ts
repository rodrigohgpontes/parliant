export interface User {
    id: string;
    auth0_id: string;
    email: string;
    name?: string;
    plan: string;
    is_email_verified: boolean;
}

export interface Survey {
    id: string;
    objective: string;
    orientations?: string;
    created_at: Date;
    updated_at: Date;
    creator_id: string;
    is_active?: boolean;
    allow_anonymous: boolean;
    is_one_per_respondent: boolean;
    end_date?: Date;
    max_questions?: number;
    max_characters?: number;
    survey_summary?: string;
    survey_tags?: string[];
}

export interface Response {
    id: string;
    survey_id: string;
    respondent_id?: string;
    respondent_email?: string;
    respondent_name?: string;
    conversation: any[];
    summary?: string;
    tags?: string[];
    completed_at?: Date;
    deleted_at?: Date;
    created_at: Date;
} 