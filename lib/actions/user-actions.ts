"use server";

import { db } from "@/lib/db/index";
import { auth0 } from "@/lib/auth0";

export async function createOrUpdateUser(auth0User: any) {
    // Check if user exists
    const existingUser = await db`
        SELECT * FROM users 
        WHERE auth0_id = ${auth0User.sub}
        OR email = ${auth0User.email}
    `;

    if (existingUser.length === 0) {
        // Create new user
        await db`
            INSERT INTO users (auth0_id, email, name, plan, is_email_verified)
            VALUES (${auth0User.sub}, ${auth0User.email}, ${auth0User.name}, 'free', ${auth0User.email_verified})
        `;
    } else {
        // Update existing user - update auth0_id if it's different
        await db`
            UPDATE users 
            SET email = ${auth0User.email}, 
                name = ${auth0User.name},
                is_email_verified = ${auth0User.email_verified},
                auth0_id = ${auth0User.sub},
                updated_at = CURRENT_TIMESTAMP
            WHERE auth0_id = ${auth0User.sub} 
            OR email = ${auth0User.email}
        `;
    }
}

export async function getUserByAuth0Id(auth0Id: string) {
    const result = await db`
        SELECT * FROM users 
        WHERE auth0_id = ${auth0Id}
    `;
    return result[0] || null;
} 