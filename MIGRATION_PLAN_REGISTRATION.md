# Task: Migrate Registration Logic to Appwrite Function

**Objective**: Enhance security by moving the database document creation from the client-side (`AuthContext`) to a server-side Appwrite Function triggers by the `users.create` event. This prevents malicious users from setting their own Role or Status.

## 1. Create New Appwrite Function
- [ ] Initialize a new function named `on-user-create` (or add to `user-management` if preferred, but separate event-driven function is cleaner).
- [ ] Runtime: Node.js (matches project).

## 2. Configure Function Triggers & Variables
- [ ] **Trigger**: Set function to execute on event `users.create`.
- [ ] **Environment Variables**:
    - `APPWRITE_API_KEY`: API Key with `documents.write` permission.
    - `DATABASE_ID`: ID of the database.
    - `COLLECTION_USERS_ID`: ID of the `users` collection.
    - `APPWRITE_ENDPOINT`: Your Appwrite endpoint.

## 3. Implement Function Logic
- [ ] **Parse Event Payload**:
    - The function receives the user object (userId, email, name, prefs).
- [ ] **Determine Role**:
    - Read `prefs.role` from the created user (set by client during `account.create`).
    - Validate role (default to 'student' if invalid).
- [ ] **Determine Status**:
    - If `role === 'instructor'`, set `status: 'pending'`.
    - Else, set `status: 'active'`.
- [ ] **Create Database Document**:
    - Use `databases.createDocument`.
    - **Permissions**:
        - `read("user:<userId>")` (User can read their own profile).
        - **NO** `update` or `write` permission for the user (prevents tampering).
        - Allow `update` only for Admins or generic `update("users")` if you want admins to edit. (Better: strict permissions).

## 4. Update Client-Side (`AuthContext.jsx`)
- [ ] **Remove DB Logic**: Delete the `databases.createDocument` call inside the `register` function.
- [ ] **Keep Auth Logic**:
    - `account.create(...)`
    - `account.updatePrefs({ role })` (This triggers the function logic).
    - `account.createEmailPasswordSession(...)`
- [ ] **Optimistic UI / Error Handling**:
    - Note: Login might happen faster than Function creates the document. `init()` might need a retry mechanism or wait for the doc to exist.

## 5. Testing
- [ ] **Security Test**: Try to register via script/curl with `status: active` as instructor. Verify it fails or is overwritten by the function.
- [ ] **Flow Test**: Register as Student (Active), Instructor (Pending).
- [ ] **Permission Test**: Verify user cannot update their own status field via console/API.

## 6. Deployment
- [ ] `appwrite push function`
- [ ] Verify event listeners actve in Appwrite Console.
