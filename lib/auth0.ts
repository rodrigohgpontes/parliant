"use server";

import { auth0 } from "./auth0-client";

export async function getSession() {
    return await auth0.getSession();
}

export async function getUser() {
    const session = await auth0.getSession();
    return session?.user;
} 