import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Stack,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    DarkMode as DarkModeIcon,
    Language as LanguageIcon,
    Security as SecurityIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import { useColorScheme } from '@mui/material/styles';
import { toast } from 'sonner';

/**
 * Settings Page
 * 
 * User preferences and application settings.
 */
export function Settings() {
    const { mode, setMode } = useColorScheme();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        language: 'en',
        twoFactorAuth: false,
    });

    const handleSettingChange = (key) => (event) => {
        const value = event.target.checked ?? event.target.value;
        setSettings(prev => ({ ...prev, [key]: value }));
        toast.success('Setting updated');
    };

    const handleThemeChange = (event) => {
        setMode(event.target.value);
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Manage your account preferences and application settings.
            </Typography>

            {/* Appearance Section */}
            <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Appearance
                    </Typography>
                </Box>
                <List disablePadding>
                    <ListItem>
                        <ListItemIcon>
                            <DarkModeIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Theme"
                            secondary="Choose your preferred color scheme"
                        />
                        <ListItemSecondaryAction>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={mode || 'system'}
                                    onChange={handleThemeChange}
                                >
                                    <MenuItem value="light">Light</MenuItem>
                                    <MenuItem value="dark">Dark</MenuItem>
                                    <MenuItem value="system">System</MenuItem>
                                </Select>
                            </FormControl>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                        <ListItemIcon>
                            <LanguageIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Language"
                            secondary="Select your preferred language"
                        />
                        <ListItemSecondaryAction>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={settings.language}
                                    onChange={handleSettingChange('language')}
                                >
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="id">Indonesia</MenuItem>
                                </Select>
                            </FormControl>
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Paper>

            {/* Notifications Section */}
            <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Notifications
                    </Typography>
                </Box>
                <List disablePadding>
                    <ListItem>
                        <ListItemIcon>
                            <EmailIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Email Notifications"
                            secondary="Receive updates about your courses via email"
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                checked={settings.emailNotifications}
                                onChange={handleSettingChange('emailNotifications')}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                        <ListItemIcon>
                            <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Push Notifications"
                            secondary="Receive real-time notifications in browser"
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                checked={settings.pushNotifications}
                                onChange={handleSettingChange('pushNotifications')}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Paper>

            {/* Security Section */}
            <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Security
                    </Typography>
                </Box>
                <List disablePadding>
                    <ListItem>
                        <ListItemIcon>
                            <SecurityIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Two-Factor Authentication"
                            secondary="Add an extra layer of security to your account"
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                checked={settings.twoFactorAuth}
                                onChange={handleSettingChange('twoFactorAuth')}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
}

export default Settings;
