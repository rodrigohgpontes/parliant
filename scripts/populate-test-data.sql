-- Create 5 different surveys
INSERT INTO surveys (
    creator_id,
    objective,
    orientations,
    is_active,
    allow_anonymous,
    is_one_per_respondent,
    end_date,
    max_questions,
    max_characters,
    survey_summary,
    survey_tags,
    created_at,
    updated_at
) VALUES
-- Survey 1: Employee Engagement
(
    'ae470658-38a2-4ab0-889b-2d2d92795a5f',
    'Employee Engagement and Workplace Satisfaction',
    'Help us understand how we can improve the workplace experience and employee engagement.',
    true,
    false,
    true,
    '2025-06-30 23:59:59+00',
    20,
    1000,
    'Survey to measure employee engagement and satisfaction levels',
    ARRAY['employee', 'engagement', 'satisfaction', 'workplace'],
    '2025-04-01 10:00:00+00',
    '2025-04-01 10:00:00+00'
),
-- Survey 2: Product Feedback
(
    'ae470658-38a2-4ab0-889b-2d2d92795a5f',
    'AI Assistant Feature Feedback',
    'Share your experience with our AI assistant features and suggest improvements.',
    true,
    true,
    false,
    NULL,
    15,
    500,
    'Gather feedback on AI assistant features and user experience',
    ARRAY['product', 'feedback', 'ai', 'features'],
    '2025-04-15 14:30:00+00',
    '2025-04-15 14:30:00+00'
),
-- Survey 3: Remote Work
(
    'ae470658-38a2-4ab0-889b-2d2d92795a5f',
    'Remote Work Experience and Productivity',
    'Tell us about your experience with remote work and what tools help you stay productive.',
    false,
    true,
    false,
    '2025-05-15 23:59:59+00',
    25,
    2000,
    'Understand remote work challenges and productivity tools',
    ARRAY['remote', 'work', 'productivity', 'tools'],
    '2025-04-20 09:15:00+00',
    '2025-04-20 09:15:00+00'
),
-- Survey 4: Customer Support
(
    'ae470658-38a2-4ab0-889b-2d2d92795a5f',
    'Customer Support Satisfaction',
    'Rate your recent experience with our customer support team.',
    true,
    true,
    true,
    NULL,
    10,
    500,
    'Measure customer satisfaction with support services',
    ARRAY['support', 'customer', 'satisfaction', 'service'],
    '2025-04-25 16:45:00+00',
    '2025-04-25 16:45:00+00'
),
-- Survey 5: Learning & Development
(
    'ae470658-38a2-4ab0-889b-2d2d92795a5f',
    'Learning and Development Needs',
    'Help us understand your learning preferences and development goals.',
    true,
    false,
    false,
    '2025-07-01 23:59:59+00',
    30,
    1500,
    'Identify learning preferences and development opportunities',
    ARRAY['learning', 'development', 'training', 'skills'],
    '2025-05-01 11:30:00+00',
    '2025-05-01 11:30:00+00'
);

-- Function to generate random timestamps within the last 30 days
CREATE OR REPLACE FUNCTION random_timestamp() RETURNS timestamp with time zone AS $$
BEGIN
    RETURN NOW() - (random() * interval '30 days');
END;
$$ LANGUAGE plpgsql;

-- Function to generate a realistic conversation
CREATE OR REPLACE FUNCTION generate_conversation(survey_id uuid) RETURNS jsonb AS $$
DECLARE
    conversation jsonb;
    survey_tags text[];
BEGIN
    -- Get survey tags
    SELECT s.survey_tags INTO survey_tags FROM surveys s WHERE s.id = survey_id;
    
    -- Generate conversation based on survey type
    CASE 
        WHEN survey_id = (SELECT id FROM surveys WHERE objective = 'Employee Engagement and Workplace Satisfaction') THEN
            conversation := jsonb_build_array(
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'Hello! I''d like to understand your experience at work. How would you rate your overall job satisfaction on a scale of 1-10?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I''d say about 8. I generally enjoy my work, but there are some areas that could be improved.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'That''s good to hear! Could you tell me more about what aspects of your work you enjoy the most?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I really appreciate the flexibility in my schedule and the supportive team environment. The projects we work on are also quite interesting.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'And what areas do you think could be improved?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I think we could benefit from more regular feedback and clearer career progression paths. Also, some of our tools could be more efficient.'
                )
            );
        WHEN survey_id = (SELECT id FROM surveys WHERE objective = 'AI Assistant Feature Feedback') THEN
            conversation := jsonb_build_array(
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'Hi! I''d like to get your feedback on our AI assistant. Which features do you use most frequently?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I use the task automation and document analysis features quite often. They save me a lot of time.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'That''s great! How would you rate the accuracy and reliability of these features?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'The accuracy is generally good, but sometimes the document analysis misses important details. It would be helpful if it could highlight uncertain parts.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'What new features would you like to see in the future?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I''d love to see better integration with other tools and maybe a feature that suggests workflow improvements based on my usage patterns.'
                )
            );
        WHEN survey_id = (SELECT id FROM surveys WHERE objective = 'Remote Work Experience and Productivity') THEN
            conversation := jsonb_build_array(
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'Hello! How has your experience been with remote work? What tools do you find most helpful?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'Overall, it''s been positive. I use Zoom for meetings, Slack for communication, and Trello for project management.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'What challenges have you faced while working remotely?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'Sometimes it''s hard to separate work and personal life. Also, internet connectivity issues can be frustrating.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'How do you maintain productivity and collaboration with your team?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'We have regular check-ins and use collaborative tools. I also try to maintain a structured schedule and take regular breaks.'
                )
            );
        WHEN survey_id = (SELECT id FROM surveys WHERE objective = 'Customer Support Satisfaction') THEN
            conversation := jsonb_build_array(
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'Hi! Could you tell me about your recent experience with our customer support?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I had an issue with my account last week, and the support team was very helpful.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'What aspects of the support experience stood out to you?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'The response time was quick, and the agent was knowledgeable. They followed up to make sure everything was resolved.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'Is there anything that could have been improved?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'It would be helpful to have more self-service options for common issues. The phone wait time could also be shorter.'
                )
            );
        ELSE
            conversation := jsonb_build_array(
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'Hello! I''d like to understand your learning preferences and development goals. What areas are you most interested in developing?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I''m particularly interested in improving my technical skills and leadership abilities.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'What learning methods work best for you?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I prefer hands-on learning and practical workshops. Online courses are good too, but I need interactive elements.'
                ),
                jsonb_build_object(
                    'role', 'assistant',
                    'content', 'How much time can you dedicate to learning and development?'
                ),
                jsonb_build_object(
                    'role', 'user',
                    'content', 'I can dedicate about 5-10 hours per week. I''d prefer flexible scheduling to accommodate my work commitments.'
                )
            );
    END CASE;
    
    RETURN conversation;
END;
$$ LANGUAGE plpgsql;

-- Function to generate random respondent data
CREATE OR REPLACE FUNCTION generate_respondent() RETURNS RECORD AS $$
DECLARE
    first_names text[] := ARRAY['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'Thomas', 'Patricia'];
    last_names text[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    domains text[] := ARRAY['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com'];
    result RECORD;
BEGIN
    SELECT 
        first_names[1 + floor(random() * array_length(first_names, 1))] || ' ' || 
        last_names[1 + floor(random() * array_length(last_names, 1))] as name,
        lower(replace(first_names[1 + floor(random() * array_length(first_names, 1))], ' ', '') || '.' || 
        lower(replace(last_names[1 + floor(random() * array_length(last_names, 1))], ' ', '')) || '@' || 
        domains[1 + floor(random() * array_length(domains, 1))]) as email
    INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert responses for each survey
DO $$
DECLARE
    survey_record RECORD;
    respondent RECORD;
    i INTEGER;
BEGIN
    FOR survey_record IN SELECT id FROM surveys LOOP
        FOR i IN 1..50 LOOP
            respondent := generate_respondent();
            
            INSERT INTO responses (
                survey_id,
                respondent_name,
                respondent_email,
                conversation,
                completed_at,
                created_at,
                tags
            ) VALUES (
                survey_record.id,
                respondent.name,
                respondent.email,
                generate_conversation(survey_record.id),
                random_timestamp(),
                random_timestamp(),
                (SELECT survey_tags FROM surveys WHERE id = survey_record.id)
            );
        END LOOP;
    END LOOP;
END $$;

-- Clean up functions
DROP FUNCTION IF EXISTS random_timestamp();
DROP FUNCTION IF EXISTS generate_conversation(uuid);
DROP FUNCTION IF EXISTS generate_respondent(); 