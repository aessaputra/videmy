import { Query } from './appwrite';

/**
 * Query Optimization Utilities
 * 
 * Best practices from Appwrite documentation:
 * - Use Query.select() to reduce response size (60% improvement)
 * - Batch queries with Query.equal(array)
 * - Implement pagination for large datasets
 * 
 * @see https://appwrite.io/docs/products/databases/queries#optimize-performance
 */

// =====================================================
// Field Selectors - Only fetch what we need
// =====================================================

/**
 * Course fields for list views
 * Excludes: description (large text), timestamps
 */
export const courseListFields = [
    '$id',
    'title',
    'thumbnail',
    'price',
    'category',
    'instructorId',
    'instructorName',
    'lessonsCount',
    'studentsCount'
];

/**
 * Course fields for detail view
 * Includes everything
 */
export const courseDetailFields = [
    '$id',
    'title',
    'description',
    'thumbnail',
    'price',
    'category',
    'instructorId',
    'instructorName',
    'lessonsCount',
    'studentsCount',
    '$createdAt'
];

/**
 * Module fields (minimal)
 */
export const moduleFields = [
    '$id',
    'title',
    'courseId',
    'order'
];

/**
 * Lesson fields for list views
 * Excludes: content (use lessonDetailFields for full content)
 */
export const lessonFields = [
    '$id',
    'title',
    'moduleId',
    'youtubeUrl',
    'duration',
    'order',
    'isFree'
];

/**
 * Lesson fields for detail view
 * Includes: content and all other fields
 */
export const lessonDetailFields = [
    '$id',
    'title',
    'moduleId',
    'youtubeUrl',
    'duration',
    'order',
    'content',
    'isFree',
    'videoUrl'
];

/**
 * Enrollment fields
 */
export const enrollmentFields = [
    '$id',
    'userId',
    'courseId',
    'enrolledAt'
];

/**
 * Progress fields
 */
export const progressFields = [
    '$id',
    'userId',
    'lessonId',
    'completedAt'
];

/**
 * User profile fields for public display
 */
export const userPublicFields = [
    '$id',
    'userId',
    'name',
    'avatar',
    'role'
];

// =====================================================
// Batch Query Helpers
// =====================================================

/**
 * Fetch all documents with automatic pagination
 * Handles collections with >100 items
 * 
 * @param {Function} fetchFn - Database fetch function
 * @param {Array} baseQueries - Base Query array (filters, etc)
 * @param {Array} selectFields - Fields to select (optional)
 * @param {number} batchSize - Items per batch (max 100)
 * @returns {Promise<Array>} All documents
 * 
 * @example
 * const allLessons = await fetchAllDocuments(
 *   (queries) => databases.listDocuments(DB_ID, COLLECTIONS.LESSONS, queries),
 *   [Query.equal('courseId', courseId)],
 *   lessonFields
 * );
 */
export async function fetchAllDocuments(
    fetchFn,
    baseQueries = [],
    selectFields = null,
    batchSize = 100
) {
    let allDocuments = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const queries = [
            ...baseQueries,
            Query.limit(batchSize),
            Query.offset(offset)
        ];

        // Add select if provided
        if (selectFields && selectFields.length > 0) {
            queries.push(Query.select(selectFields));
        }

        try {
            const response = await fetchFn(queries);
            allDocuments = allDocuments.concat(response.documents);

            // Check if there are more documents
            hasMore = response.documents.length === batchSize;
            offset += batchSize;

            // Safety limit to prevent infinite loops
            if (offset > 10000) {
                console.warn('Query reached safety limit of 10,000 documents');
                break;
            }
        } catch (error) {
            console.error('Batch fetch error:', error);
            break;
        }
    }

    return allDocuments;
}

/**
 * Fetch documents with field selection (optimized)
 * Single query with Query.select()
 * 
 * @param {Function} fetchFn - Database fetch function  
 * @param {Array} queries - Query array
 * @param {Array} selectFields - Fields to select
 * @returns {Promise<Object>} Query response
 * 
 * @example
 * const courses = await fetchWithSelect(
 *   (q) => databases.listDocuments(DB_ID, COLLECTIONS.COURSES, q),
 *   [Query.equal('$id', courseIds)],
 *   courseListFields
 * );
 */
export async function fetchWithSelect(fetchFn, queries = [], selectFields = []) {
    const queryArray = [...queries];

    if (selectFields && selectFields.length > 0) {
        queryArray.push(Query.select(selectFields));
    }

    return await fetchFn(queryArray);
}

// =====================================================
// Performance Monitoring
// =====================================================

/**
 * Measure query performance
 * Logs timing information for optimization
 * 
 * @param {string} queryName - Name for logging
 * @param {Function} queryFn - Query function to measure
 * @returns {Promise<any>} Query result
 * 
 * @example
 * const courses = await measureQueryPerformance(
 *   'fetchCourses',
 *   () => databases.listDocuments(DB_ID, COLLECTIONS.COURSES, queries)
 * );
 */
export async function measureQueryPerformance(queryName, queryFn) {
    const start = performance.now();

    try {
        const result = await queryFn();
        const duration = performance.now() - start;

        // Log performance in development
        if (import.meta.env.DEV) {
            console.log(`[Query Performance] ${queryName}: ${duration.toFixed(2)}ms`);
        }

        return result;
    } catch (error) {
        const duration = performance.now() - start;
        console.error(`[Query Error] ${queryName} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
    }
}

/**
 * Query cache for reducing duplicate queries
 * TTL-based caching for frequently accessed data
 */
class QueryCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get cached result or fetch new
     * @param {string} key - Cache key
     * @param {Function} fetchFn - Function to fetch if not cached
     * @param {number} ttl - Time to live in milliseconds (default: 60s)
     */
    async getOrFetch(key, fetchFn, ttl = 60000) {
        const now = Date.now();
        const cached = this.cache.get(key);

        if (cached && (now - cached.timestamp) < ttl) {
            if (import.meta.env.DEV) {
                console.log(`[Cache Hit] ${key}`);
            }
            return cached.data;
        }

        // Fetch fresh data
        const data = await fetchFn();
        this.cache.set(key, { data, timestamp: now });

        if (import.meta.env.DEV) {
            console.log(`[Cache Miss] ${key} - Cached for ${ttl}ms`);
        }

        return data;
    }

    /**
     * Clear cache by key or all
     */
    clear(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
}

// Export singleton instance
export const queryCache = new QueryCache();

// =====================================================
// Helper Functions
// =====================================================

/**
 * Build cache key from query parameters
 */
export function buildCacheKey(collectionId, queries) {
    return `${collectionId}:${JSON.stringify(queries)}`;
}

/**
 * Estimate query response size reduction
 * For logging/debugging purposes
 */
export function estimateFieldReduction(totalFields, selectedFields) {
    if (!selectedFields || selectedFields.length === 0) {
        return 0;
    }

    const reduction = ((totalFields - selectedFields.length) / totalFields) * 100;
    return Math.round(reduction);
}
