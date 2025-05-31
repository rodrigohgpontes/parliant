export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface PaginationLinks {
    self: string;
    next?: string;
    previous?: string;
    first?: string;
    last?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
    links: PaginationLinks;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    return {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit))
    };
}

export function createPaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    const pages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        pages,
        has_next: page < pages,
        has_previous: page > 1
    };
}

export function createPaginationLinks(
    baseUrl: string,
    page: number,
    limit: number,
    total: number
): PaginationLinks {
    const pages = Math.ceil(total / limit);
    const url = new URL(baseUrl);

    // Self link
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    const self = url.toString();

    const links: PaginationLinks = { self };

    // Next link
    if (page < pages) {
        url.searchParams.set('page', (page + 1).toString());
        links.next = url.toString();
    }

    // Previous link
    if (page > 1) {
        url.searchParams.set('page', (page - 1).toString());
        links.previous = url.toString();
    }

    // First link
    if (page > 1) {
        url.searchParams.set('page', '1');
        links.first = url.toString();
    }

    // Last link
    if (page < pages) {
        url.searchParams.set('page', pages.toString());
        links.last = url.toString();
    }

    return links;
}

export function createPaginatedResponse<T>(
    data: T[],
    baseUrl: string,
    page: number,
    limit: number,
    total: number
): PaginatedResponse<T> {
    return {
        data,
        pagination: createPaginationMeta(page, limit, total),
        links: createPaginationLinks(baseUrl, page, limit, total)
    };
} 