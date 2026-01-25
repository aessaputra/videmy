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
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { account, storage, ID, STORAGE_BUCKET_ID } from '../../lib/appwrite';

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
    const { user } = useAuth();
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
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                STORAGE_BUCKET_ID,
                ID.unique(),
                file
            );

            // Get Preview URL
            const fileUrl = storage.getFilePreview(
                STORAGE_BUCKET_ID,
                response.$id,
            );

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

            // Update Prefs (Bio & Avatar)
            const prefs = {
                ...user.prefs,
                bio: profileData.bio,
                avatar: profileData.avatar,
                role: user.prefs?.role // Persist role
            };
            await account.updatePrefs(prefs);

            toast.success('Profile updated successfully');
            // Optimistic update mechanism via AuthContext would be better, 
            // but for now local state + toast is feedback enough unless we force refresh user.
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
                                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

                                <Grid item xs={12} md={8}>
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
