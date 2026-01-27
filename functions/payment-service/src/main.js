import { Client, Databases, ID, Permission, Role, Users, Query } from 'node-appwrite';
import Stripe from 'stripe';

/**
 * Payment Service Function
 * 
 * Handles two main actions based on 'path' or 'req.path':
 * 1. /checkout: Creates a Stripe Checkout Session
 * 2. /webhook: Handles Stripe Webhooks (checkout.session.completed)
 */
export default async ({ req, res, log, error }) => {
    // 1. Initialize Clients
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    log(`Init: Project=${process.env.APPWRITE_FUNCTION_PROJECT_ID}, Endpoint=${process.env.APPWRITE_ENDPOINT}`);

    const databases = new Databases(client);
    const users = new Users(client);

    // Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
        error('STRIPE_SECRET_KEY is missing');
        return res.json({ ok: false, error: 'Server configuration error' }, 500);
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // 2. Route Handling
    const path = req.path || '/';
    const method = req.method;

    log(`[${method}] ${path}`);
    log(`Full URL: ${req.url}`);
    log(`Headers: ${JSON.stringify(req.headers)}`);
    log(`Body Type: ${typeof req.body}`);
    // log(`Body: ${req.body}`);

    try {
        // --- ROUTE: CHECKOUT ---
        if ((path === '/checkout' || req.url?.includes('/checkout')) && method === 'POST') {
            return await handleCheckout({ req, res, log, error, stripe, databases, users });
        }
        // --- ROUTE: VERIFY PAYMENT (Sync Fallback) ---
        if ((path === '/verify' || req.url?.includes('/verify')) && method === 'GET') {
            return await handleVerify({ req, res, log, error, stripe, databases });
        }

        // --- ROUTE: WEBHOOK (Stripe) ---
        if (req.headers['stripe-signature']) {
            return await handleWebhook({ req, res, log, error, stripe, databases });
        }

        return res.json({ ok: true, message: 'Payment Service is running' });

    } catch (err) {
        error(err.message);
        return res.json({ ok: false, error: err.message }, 500);
    }
};

/**
 * Handle Checkout Session Creation
 * 
 * @param {Object} context
 * @param {Object} context.req - Request object
 * @param {Object} context.res - Response object
 * @param {Function} context.log - Logger function
 * @param {Function} context.error - Error logger function
 * @param {import('stripe').Stripe} context.stripe - Stripe client
 * @param {import('node-appwrite').Databases} context.databases - Appwrite Databases client
 * @param {import('node-appwrite').Users} context.users - Appwrite Users client
 * @returns {Promise<Object>} Response object
 */
async function handleCheckout({ req, res, log, error, stripe, databases, users }) {
    // ... (Validation logic remains same) ...
    // 1. Validation
    const { courseId, successUrl, cancelUrl } = JSON.parse(req.body || '{}');
    const userId = req.headers['x-appwrite-user-id'];

    if (!userId) return res.json({ ok: false, error: 'Unauthorized' }, 401);
    if (!courseId) return res.json({ ok: false, error: 'Missing courseId' }, 400);

    // 2. Fetch Course Details (Source of Truth)
    const DATABASE_ID = process.env.DATABASE_ID;
    const COURSES_COLLECTION_ID = process.env.COURSES_COLLECTION_ID;

    if (!DATABASE_ID || !COURSES_COLLECTION_ID) {
        throw new Error('Database or Collection ID configuration missing');
    }

    let course;
    try {
        course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION_ID, courseId);
    } catch (e) {
        log(`Failed lookup: DB=${DATABASE_ID} COL=${COURSES_COLLECTION_ID} ID=${courseId}`);
        return res.json({ ok: false, error: 'Course not found' }, 404);
    }

    // 3. Create Stripe Session
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'idr',
                    product_data: {
                        name: course.title,
                        description: course.description?.substring(0, 100),
                        images: course.thumbnail ? [course.thumbnail] : [],
                        metadata: { courseId: course.$id }
                    },
                    unit_amount: Math.round(course.price * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            // CRITICAL: Add session_id to success_url for verification
            success_url: `${successUrl || 'http://localhost:5173/dashboard'}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || 'http://localhost:5173/courses',
            metadata: { userId: userId, courseId: courseId },
            client_reference_id: userId,
        });

        return res.json({ ok: true, url: session.url });
    } catch (e) {
        error(e);
        return res.json({ ok: false, error: 'Stripe Error: ' + e.message }, 500);
    }
}

/**
 * Handle Manual Verification (Sync)
 * 
 * @param {Object} context
 * @param {Object} context.req
 * @param {Object} context.res
 * @param {Function} context.log
 * @param {Function} context.error
 * @param {import('stripe').Stripe} context.stripe
 * @param {import('node-appwrite').Databases} context.databases
 * @returns {Promise<Object>}
 */
async function handleVerify({ req, res, log, error, stripe, databases }) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('session_id') || req.query?.session_id; // Check both parsing styles

    if (!sessionId) {
        // Fallback for simple parsers
        const manualQuery = req.url.split('session_id=')[1];
        if (!manualQuery) return res.json({ ok: false, error: 'Missing session_id' }, 400);
    }

    log(`Verifying session: ${sessionId}`);

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { userId, courseId } = session.metadata;
            await enrollUser({ databases, userId, courseId, log, error });
            return res.json({ ok: true, status: 'enrolled', courseId });
        } else {
            return res.json({ ok: false, error: 'Payment not completed' });
        }
    } catch (e) {
        error(e);
        return res.json({ ok: false, error: e.message }, 500);
    }
}

/**
 * Handle Stripe Webhooks
 * 
 * @param {Object} context
 * @param {Object} context.req
 * @param {Object} context.res
 * @param {Function} context.log
 * @param {Function} context.error
 * @param {import('stripe').Stripe} context.stripe
 * @param {import('node-appwrite').Databases} context.databases
 * @returns {Promise<Object>}
 */
async function handleWebhook({ req, res, log, error, stripe, databases }) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    if (webhookSecret) {
        // Safe / Best Practice
        const signature = req.headers['stripe-signature'];
        try {
            // Appwrite Cloud passes raw body string, but we need to ensure it's not parsed JSON object if we want to verify.
            // Check Appwrite runtime docs: req.bodyRaw might be available or req.body is string.
            // My previous logs showed Body Type: string.
            event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        } catch (err) {
            error(`Webhook Signature Verification Failed: ${err.message}`);
            return res.json({ ok: false, error: 'Webhook Signature Verification Failed' }, 400);
        }
    } else {
        // Unsafe Fallback (User Warned)
        log('WARNING: STRIPE_WEBHOOK_SECRET missing. Skipping signature verification.');
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            event = body;
        } catch (err) {
            return res.json({ ok: false, error: 'Webhook Error' }, 400);
        }
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, courseId } = session.metadata;
        await enrollUser({ databases, userId, courseId, log, error });
    }

    return res.json({ received: true });
}

/**
 * Helper: Enroll User in Database
 * Ensures idempotency by checking if enrollment already exists.
 * 
 * @param {Object} params
 * @param {import('node-appwrite').Databases} params.databases
 * @param {string} params.userId
 * @param {string} params.courseId
 * @param {Function} params.log
 * @param {Function} params.error
 */
async function enrollUser({ databases, userId, courseId, log, error }) {
    const DATABASE_ID = process.env.DATABASE_ID;
    const ENROLLMENTS_COLLECTION_ID = process.env.ENROLLMENTS_COLLECTION_ID;

    if (!ENROLLMENTS_COLLECTION_ID) {
        throw new Error('Enrollments Collection ID configuration missing');
    }

    log(`Enrolling User ${userId} for Course ${courseId}`);

    try {
        // 1. Check if already enrolled (Idempotency)
        const existing = await databases.listDocuments(
            DATABASE_ID,
            ENROLLMENTS_COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.equal('courseId', courseId)
            ]
        );

        if (existing.total > 0) {
            log(`User ${userId} is already enrolled in ${courseId}. Skipping creation.`);
            return;
        }

        // 2. Create Enrollment
        await databases.createDocument(
            DATABASE_ID,
            ENROLLMENTS_COLLECTION_ID,
            ID.unique(),
            {
                userId: userId,
                courseId: courseId,
                enrolledAt: new Date().toISOString()
            },
            [
                Permission.read(Role.user(userId)),
                Permission.read(Role.label('admin')),
                Permission.update(Role.label('admin')),
                Permission.delete(Role.label('admin')),
            ]
        );
        log('Enrollment successful');
    } catch (e) {
        log(`Enrollment info/error: ${e.message}`);
        // Consider whether to throw/error here depending on criticality. 
        // For webhooks, we usually just log so we don't cause Stripe to retry indefinitely for logic errors.
        error(e);
    }
}
