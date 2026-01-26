import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Avatar,
    Stack,
    Tabs,
    Tab,
    Divider,
    Alert,
    Badge,
    IconButton,
} from '@mui/material';
import {
    Save as SaveIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { account, databases, storage, ID, STORAGE_BUCKET_ID, Permission, Role, DATABASE_ID, COLLECTIONS, Query } from '../../lib/appwrite';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function Profile() {
    const { user, refreshUser } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                bio: user.prefs?.bio || '',
                avatar: user.prefs?.avatar || '',
            });
        }
    }, [user]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image size must be less than 5MB');
            return;
        }

        setLoading(true);
        try {
            // Upload to Appwrite Storage with Explicit Permissions
            // Best Practice: File Security ENABLED + File-level permissions
            const response = await storage.createFile(
                STORAGE_BUCKET_ID,
                ID.unique(),
                file,
                [
                    Permission.read(Role.any()),                // Public Read
                    Permission.update(Role.user(user.$id)),     // Owner Update
                    Permission.delete(Role.user(user.$id))      // Owner Delete
                ]
            );

            // Get Preview URL
            const fileUrl = storage.getFilePreview(
                STORAGE_BUCKET_ID,
                response.$id,
            );

            // DELETE OLD AVATAR IF EXISTS (Best Practice: Avoid storage clutter)
            if (profileData.avatar) {
                try {
                    // Extract File ID from URL: .../files/{FILE_ID}/...
                    const match = profileData.avatar.match(/files\/([^/]+)\//);
                    if (match && match[1]) {
                        const oldFileId = match[1];
                        await storage.deleteFile(STORAGE_BUCKET_ID, oldFileId);
                        console.log('Deleted old avatar:', oldFileId);
                    }
                } catch (delError) {
                    console.warn('Failed to delete old avatar (might be from different bucket or already deleted):', delError);
                }
            }

            setProfileData(prev => ({ ...prev, avatar: fileUrl }));
            toast.success('Image uploaded successfully! Click Save to apply.');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image. Ensure "profile-photos" bucket exists.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update Name
            if (profileData.name !== user.name) {
                await account.updateName(profileData.name);
            }

            // Update Prefs (Bio & Avatar) - Legacy/Auth Store
            const prefs = {
                ...user.prefs,
                bio: profileData.bio,
                avatar: profileData.avatar,
                role: user.prefs?.role // Persist role
            };
            await account.updatePrefs(prefs);

            // SYNC TO PUBLIC PROFILE (Database)
            // Wrap in try-catch so it doesn't block the main update if DB schema is strict/missing attributes
            // SYNC TO PUBLIC PROFILE (Database)
            // DEBUG MODE: We show explicit errors now
            try {
                console.log('Attempting to sync to Public DB. User ID:', user.$id);

                // 1. Find the document
                const userDocs = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    [Query.equal('userId', user.$id)]
                );

                console.log('Found public docs:', userDocs.documents.length);

                if (userDocs.documents.length > 0) {
                    const docId = userDocs.documents[0].$id;
                    console.log('Updating Document ID:', docId, 'with Avatar:', profileData.avatar);

                    await databases.updateDocument(
                        DATABASE_ID,
                        COLLECTIONS.USERS,
                        docId,
                        {
                            name: profileData.name,
                            avatar: profileData.avatar
                        }
                    );
                    console.log('Sync Success!');
                } else {
                    console.warn('No public profile document found for user:', user.$id);
                    toast.warning('Warning: Public profile not found. Avatar might not be visible to others.');
                }
            } catch (dbError) {
                console.error('Sync failed:', dbError);
                toast.error(`Public Profile Sync Failed: ${dbError.message}`);
                // We do NOT re-throw, to allow local save to complete.
            }

            toast.success('Profile updated successfully');
            await refreshUser(); // Update global context immediately
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await account.updatePassword(passwordData.newPassword);
            toast.success('Password updated successfully');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: 6 }}>
            <Container maxWidth="md">
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Account Settings
                </Typography>

                <Paper sx={{ width: '100%', mb: 4 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                            <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
                            <Tab icon={<LockIcon />} iconPosition="start" label="Security" />
                        </Tabs>
                    </Box>

                    {/* Profile Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Box component="form" onSubmit={updateProfile}>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={
                                            <IconButton
                                                color="primary"
                                                aria-label="upload picture"
                                                component="label"
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    boxShadow: 2,
                                                    '&:hover': { bgcolor: 'background.paper' },
                                                }}
                                            >
                                                <input
                                                    hidden
                                                    accept="image/*"
                                                    type="file"
                                                    onChange={handleImageUpload}
                                                />
                                                <PhotoIcon />
                                            </IconButton>
                                        }
                                    >
                                        <Avatar
                                            src={profileData.avatar}
                                            alt={profileData.name}
                                            sx={{ width: 120, height: 120, fontSize: 40 }}
                                        >
                                            {profileData.name.charAt(0)}
                                        </Avatar>
                                    </Badge>
                                    <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                                        Click camera icon to upload
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Stack spacing={3}>
                                        <TextField
                                            label="Full Name"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                            fullWidth
                                            required
                                        />

                                        <TextField
                                            label="Email Address"
                                            value={profileData.email}
                                            disabled
                                            helperText="Contact support to change email"
                                            fullWidth
                                        />



                                        <TextField
                                            label="Bio"
                                            name="bio"
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                            multiline
                                            rows={4}
                                            placeholder="Tell us about yourself..."
                                            fullWidth
                                        />

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                disabled={loading}
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>

                    {/* Security Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Box component="form" onSubmit={updatePassword} maxWidth="sm" sx={{ mx: 'auto' }}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Password must be at least 8 characters long and contain at least one special character.
                            </Alert>

                            <Stack spacing={3}>
                                <TextField
                                    label="New Password"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    fullWidth
                                    required
                                />

                                <TextField
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    fullWidth
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<LockIcon />}
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </Stack>
                        </Box>
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
}

export default Profile;
