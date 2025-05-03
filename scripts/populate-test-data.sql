-- First, create users
INSERT INTO users (id, auth0_id, email) VALUES
(gen_random_uuid(), 'auth0|1234567890', 'palhacosoneca+1@gmail.com'),
(gen_random_uuid(), 'auth0|0987654321', 'palhacosoneca+2@gmail.com'),
(gen_random_uuid(), 'auth0|1122334455', 'palhacosoneca+3@gmail.com');

-- Create 5 surveys
INSERT INTO surveys (title, description, created_at, updated_at, user_id, is_active) VALUES
('Employee Satisfaction Survey 2025', 'Help us understand how we can improve the workplace experience for our team members.', '2025-04-15', '2025-04-15', (SELECT id FROM users WHERE email = 'palhacosoneca+1@gmail.com'), true),
('Product Feedback: AI Assistant Features', 'Share your thoughts on our AI assistant features and suggest improvements.', '2025-04-20', '2025-04-20', (SELECT id FROM users WHERE email = 'palhacosoneca+1@gmail.com'), true),
('Remote Work Experience', 'Tell us about your experience with remote work and what tools help you stay productive.', '2025-04-25', '2025-04-25', (SELECT id FROM users WHERE email = 'palhacosoneca+2@gmail.com'), true),
('Customer Support Satisfaction', 'Rate your recent experience with our customer support team.', '2025-04-28', '2025-04-28', (SELECT id FROM users WHERE email = 'palhacosoneca+2@gmail.com'), true),
('Learning & Development Needs', 'Help us understand your learning preferences and development goals.', '2025-05-01', '2025-05-01', (SELECT id FROM users WHERE email = 'palhacosoneca+3@gmail.com'), true);

-- Create responses for Employee Satisfaction Survey
INSERT INTO responses (survey_id, data, respondent_name, respondent_email, completed_at) VALUES
((SELECT id FROM surveys WHERE title = 'Employee Satisfaction Survey 2025'), '{"job_satisfaction": "Very Satisfied", "work_life_balance": "Satisfied", "team_collaboration": "Very Satisfied", "suggestions": "More team building activities would be great"}', 'John Smith', 'john.smith@example.com', '2025-04-16 09:15:00'),
((SELECT id FROM surveys WHERE title = 'Employee Satisfaction Survey 2025'), '{"job_satisfaction": "Satisfied", "work_life_balance": "Neutral", "team_collaboration": "Satisfied", "suggestions": "Better communication about company goals"}', 'Sarah Johnson', 'sarah.j@example.com', '2025-04-17 14:30:00'),
((SELECT id FROM surveys WHERE title = 'Employee Satisfaction Survey 2025'), '{"job_satisfaction": "Very Satisfied", "work_life_balance": "Very Satisfied", "team_collaboration": "Very Satisfied", "suggestions": "Keep up the good work!"}', 'Michael Chen', 'm.chen@example.com', '2025-04-18 11:45:00'),
((SELECT id FROM surveys WHERE title = 'Employee Satisfaction Survey 2025'), '{"job_satisfaction": "Neutral", "work_life_balance": "Dissatisfied", "team_collaboration": "Satisfied", "suggestions": "Need more flexible working hours"}', 'Emily Davis', 'emily.d@example.com', '2025-04-19 16:20:00'),
((SELECT id FROM surveys WHERE title = 'Employee Satisfaction Survey 2025'), '{"job_satisfaction": "Satisfied", "work_life_balance": "Satisfied", "team_collaboration": "Very Satisfied", "suggestions": "More opportunities for professional development"}', 'David Wilson', 'd.wilson@example.com', '2025-04-20 10:00:00');

-- Create responses for Product Feedback
INSERT INTO responses (survey_id, data, respondent_name, respondent_email, completed_at) VALUES
((SELECT id FROM surveys WHERE title = 'Product Feedback: AI Assistant Features'), '{"ease_of_use": "Very Easy", "feature_helpfulness": "Very Helpful", "suggested_features": "Voice command support would be great", "rating": 5}', 'Alex Brown', 'alex.b@example.com', '2025-04-21 13:15:00'),
((SELECT id FROM surveys WHERE title = 'Product Feedback: AI Assistant Features'), '{"ease_of_use": "Easy", "feature_helpfulness": "Helpful", "suggested_features": "Better integration with calendar apps", "rating": 4}', 'Lisa Anderson', 'lisa.a@example.com', '2025-04-22 15:30:00'),
((SELECT id FROM surveys WHERE title = 'Product Feedback: AI Assistant Features'), '{"ease_of_use": "Very Easy", "feature_helpfulness": "Very Helpful", "suggested_features": "More customization options", "rating": 5}', 'Robert Taylor', 'r.taylor@example.com', '2025-04-23 11:45:00'),
((SELECT id FROM surveys WHERE title = 'Product Feedback: AI Assistant Features'), '{"ease_of_use": "Neutral", "feature_helpfulness": "Helpful", "suggested_features": "Better error messages", "rating": 3}', 'Jennifer Lee', 'j.lee@example.com', '2025-04-24 16:20:00'),
((SELECT id FROM surveys WHERE title = 'Product Feedback: AI Assistant Features'), '{"ease_of_use": "Easy", "feature_helpfulness": "Very Helpful", "suggested_features": "Mobile app version", "rating": 4}', 'Thomas White', 't.white@example.com', '2025-04-25 10:00:00');

-- Create responses for Remote Work Experience
INSERT INTO responses (survey_id, data, respondent_name, respondent_email, completed_at) VALUES
((SELECT id FROM surveys WHERE title = 'Remote Work Experience'), '{"productivity_level": "High", "challenges": "Sometimes hard to separate work and personal life", "tools_used": "Zoom, Slack, Trello", "suggestions": "More virtual team activities"}', 'Patricia Clark', 'p.clark@example.com', '2025-04-26 09:15:00'),
((SELECT id FROM surveys WHERE title = 'Remote Work Experience'), '{"productivity_level": "Very High", "challenges": "None", "tools_used": "Microsoft Teams, Asana", "suggestions": "Keep current setup"}', 'James Miller', 'j.miller@example.com', '2025-04-27 14:30:00'),
((SELECT id FROM surveys WHERE title = 'Remote Work Experience'), '{"productivity_level": "Medium", "challenges": "Internet connectivity issues", "tools_used": "Google Meet, Slack", "suggestions": "Better IT support for remote workers"}', 'Nancy Martinez', 'n.martinez@example.com', '2025-04-28 11:45:00'),
((SELECT id FROM surveys WHERE title = 'Remote Work Experience'), '{"productivity_level": "High", "challenges": "Time zone differences", "tools_used": "Zoom, Discord, Notion", "suggestions": "More flexible meeting times"}', 'William Garcia', 'w.garcia@example.com', '2025-04-29 16:20:00'),
((SELECT id FROM surveys WHERE title = 'Remote Work Experience'), '{"productivity_level": "Very High", "challenges": "Distractions at home", "tools_used": "Teams, Jira", "suggestions": "More focus time blocks"}', 'Karen Rodriguez', 'k.rodriguez@example.com', '2025-04-30 10:00:00');

-- Create responses for Customer Support Satisfaction
INSERT INTO responses (survey_id, data, respondent_name, respondent_email, completed_at) VALUES
((SELECT id FROM surveys WHERE title = 'Customer Support Satisfaction'), '{"support_rating": 5, "response_time": "Excellent", "issue_resolution": "Fully Resolved", "comments": "Support agent was very helpful and knowledgeable"}', 'Daniel Moore', 'd.moore@example.com', '2025-05-01 09:15:00'),
((SELECT id FROM surveys WHERE title = 'Customer Support Satisfaction'), '{"support_rating": 4, "response_time": "Good", "issue_resolution": "Partially Resolved", "comments": "Good service but took longer than expected"}', 'Susan Thompson', 's.thompson@example.com', '2025-05-01 14:30:00'),
((SELECT id FROM surveys WHERE title = 'Customer Support Satisfaction'), '{"support_rating": 5, "response_time": "Excellent", "issue_resolution": "Fully Resolved", "comments": "Quick and efficient support"}', 'Joseph Allen', 'j.allen@example.com', '2025-05-02 11:45:00'),
((SELECT id FROM surveys WHERE title = 'Customer Support Satisfaction'), '{"support_rating": 3, "response_time": "Average", "issue_resolution": "Partially Resolved", "comments": "Had to follow up multiple times"}', 'Margaret Lewis', 'm.lewis@example.com', '2025-05-02 16:20:00'),
((SELECT id FROM surveys WHERE title = 'Customer Support Satisfaction'), '{"support_rating": 5, "response_time": "Excellent", "issue_resolution": "Fully Resolved", "comments": "Best customer support experience ever"}', 'Charles Walker', 'c.walker@example.com', '2025-05-03 10:00:00');

-- Create responses for Learning & Development
INSERT INTO responses (survey_id, data, respondent_name, respondent_email, completed_at) VALUES
((SELECT id FROM surveys WHERE title = 'Learning & Development Needs'), '{"learning_preference": "Online Courses", "topics": "AI, Data Science", "time_commitment": "5-10 hours/week", "goals": "Career advancement"}', 'Elizabeth Hall', 'e.hall@example.com', '2025-05-01 09:15:00'),
((SELECT id FROM surveys WHERE title = 'Learning & Development Needs'), '{"learning_preference": "Workshops", "topics": "Leadership, Communication", "time_commitment": "2-5 hours/week", "goals": "Team management"}', 'Christopher Young', 'c.young@example.com', '2025-05-01 14:30:00'),
((SELECT id FROM surveys WHERE title = 'Learning & Development Needs'), '{"learning_preference": "Mentoring", "topics": "Technical Skills", "time_commitment": "1-2 hours/week", "goals": "Skill development"}', 'Amanda King', 'a.king@example.com', '2025-05-02 11:45:00'),
((SELECT id FROM surveys WHERE title = 'Learning & Development Needs'), '{"learning_preference": "Self-paced Learning", "topics": "Project Management", "time_commitment": "Flexible", "goals": "Certification"}', 'Matthew Scott', 'm.scott@example.com', '2025-05-02 16:20:00'),
((SELECT id FROM surveys WHERE title = 'Learning & Development Needs'), '{"learning_preference": "Group Learning", "topics": "Soft Skills", "time_commitment": "3-5 hours/week", "goals": "Personal growth"}', 'Stephanie Green', 's.green@example.com', '2025-05-03 10:00:00'); 