import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, Chip, CircularProgress, Alert } from '@mui/material';
import { CheckCircle, Cancel, CloudQueue, Person, Storage } from '@mui/icons-material';
import { client, account, databases, DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';

/**
 * Connection Debug Component
 * 
 * Verifies Appwrite connection settings and connectivity
 */
export const ConnectionStatus = () => {
    const [status, setStatus] = useState({
        config: null,
        auth: null,
        database: null
    });
    const [loading, setLoading] = useState(false);

    const checkConnection = async () => {
        setLoading(true);
        setStatus({ config: null, auth: null, database: null });

        try {
            // 1. Check Config
            const configStatus = {
                endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
                projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
                databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
                valid: !!import.meta.env.VITE_APPWRITE_PROJECT_ID && !!import.meta.env.VITE_APPWRITE_DATABASE_ID
            };

            // 2. Check Auth (Guest or User)
            let authStatus = { user: null, error: null };
            try {
                const user = await account.get();
                authStatus.user = user;
            } catch (error) {
                // 401 is expected if not logged in, but means connection works
                authStatus.error = error.message;
            }

            // 3. Check Database (Try to list courses - requires permission)
            let dbStatus = { success: false, error: null };
            try {
                await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.COURSES,
                    []
                );
                dbStatus.success = true;
            } catch (error) {
                dbStatus.error = error.message;
            }

            setStatus({
                config: configStatus,
                auth: authStatus,
                database: dbStatus
            });
        } catch (error) {
            console.error('Connection check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    const StatusItem = ({ label, icon: Icon, success, error, details }) => (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Icon color={success ? "success" : "error"} />
                    <Box flex={1}>
                        <Typography variant="h6" fontSize="1rem">{label}</Typography>
                    </Box>
                    <Chip
                        label={success ? "Connected" : "Error"}
                        color={success ? "success" : "error"}
                        size="small"
                    />
                </Stack>
                {details && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {details}
                    </Box>
                )}
                {error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {error}
                    </Alert>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Appwrite Connection Status
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Use this page to verify your Appwrite configuration.
            </Typography>

            <Button
                variant="contained"
                onClick={checkConnection}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudQueue />}
                disabled={loading}
                sx={{ mb: 4 }}
            >
                {loading ? 'Checking...' : 'Refresh Status'}
            </Button>

            {status.config && (
                <StatusItem
                    label="Configuration (.env)"
                    icon={Storage}
                    success={status.config.valid}
                    details={`Project ID: ${status.config.projectId?.slice(0, 4)}*** | DB ID: ${status.config.databaseId}`}
                />
            )}

            {status.auth && (
                <StatusItem
                    label="Auth Service"
                    icon={Person}
                    success={true} // Always success if we get a response (even 401)
                    details={status.auth.user ? `Logged in as: ${status.auth.user.name}` : "Guest (Not logged in)"}
                    error={status.auth.error && status.auth.error !== "User (role: guests) missing scope (account)" ? status.auth.error : null}
                />
            )}

            {status.database && (
                <StatusItem
                    label="Database Access"
                    icon={Storage}
                    success={status.database.success}
                    error={status.database.error}
                    details={status.database.success ? "Successfully listed documents from 'courses'" : "Failed to access collection"}
                />
            )}
        </Box>
    );
};
