import { Client, Users, Databases } from 'node-appwrite';

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body parameters as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200
*/

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY); // Must be set in Appwrite Function Settings

    const users = new Users(client);

    try {
        // 1. Parse Payload (Support both req.payload and req.body)
        const rawPayload = req.payload || req.body;
        if (!rawPayload) {
            throw new Error('Payload is missing.');
        }

        const payload = typeof rawPayload === 'string'
            ? JSON.parse(rawPayload)
            : rawPayload;

        const { action, userId, documentId, status, role } = payload;

        // 2. Simple Routing
        if (action === 'toggle_status') {
            if (!userId) throw new Error('UserId is required');

            // 'status' from frontend should be boolean (true = blocked, false = active) or string 'active'/'inactive'
            // Appwrite API expects: secure status (boolean).
            // users.updateStatus(userId, status) -> status: boolean (true = active (unblocked), false = blocked)

            // Wait, check Appwrite Docs for updateStatus param:
            // status: User status. True to enable the user, False to disable the user.

            const appwriteStatus = status === 'active'; // If desired is 'active', pass true. If 'inactive', pass false.

            const updatedUser = await users.updateStatus(userId, appwriteStatus);

            log(`User ${userId} status updated to ${appwriteStatus}`);

            // 3. Update Database Record (Visual Status)
            try {
                // Initialize Databases
                const databases = new Databases(client);

                const databaseId = process.env.DATABASE_ID;
                const collectionId = process.env.COLLECTION_USERS_ID;

                if (!databaseId || !collectionId) {
                    throw new Error('Server configuration error: Missing Database or Collection ID');
                }

                // Use documentId from payload if available, otherwise try to query or assume userId
                let docId = documentId;

                if (!docId) {
                    // Fallback: Query by userId if we don't have docId
                    // Or assuming docId == userId if that's the convention. 
                    // Safest is to rely on frontend passing it. 
                    // For this fix, let's assume valid docId is passed.
                    log('Warning: No documentId provided. Skipping database update.');
                } else {
                    await databases.updateDocument(
                        databaseId,
                        collectionId,
                        docId,
                        { status: status } // 'active' or 'inactive' string
                    );
                    log(`Database document ${docId} updated to ${status}`);
                }
            } catch (dbError) {
                // Log but don't fail the whole request since Auth status is critical
                error(`Failed to update database for user ${userId}: ${dbError.message}`);
            }

            return res.json({
                success: true,
                data: updatedUser
            });
        } else if (action === 'update_role') {
            if (!documentId) throw new Error('DocumentId is required');
            if (!role) throw new Error('Role is required');

            // Update Database Record
            const databases = new Databases(client);
            const databaseId = process.env.DATABASE_ID;
            const collectionId = process.env.COLLECTION_USERS_ID;

            if (!databaseId || !collectionId) {
                throw new Error('Server configuration error: Missing Database or Collection ID');
            }

            await databases.updateDocument(
                databaseId,
                collectionId,
                documentId,
                { role: role }
            );

            log(`User document ${documentId} role updated to ${role}`);

            return res.json({
                success: true,
                message: 'Role updated successfully'
            });
        }

        return res.json({ success: false, error: 'Invalid action' }, 400);

    } catch (err) {
        error(err.toString());
        return res.json({
            success: false,
            error: err.message
        }, 500);
    }
};
