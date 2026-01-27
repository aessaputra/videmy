import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    Stack,
    MenuItem,
    Breadcrumbs,
    Link,
    Card,
    CardContent,
    Grid,
    InputAdornment,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Paper,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    NavigateNext as NavigateNextIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    School as SchoolIcon,
    Image as ImageIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { databases, ID, COLLECTIONS, DATABASE_ID, Permission, Role } from '../../lib/appwrite';
import { ThumbnailUploader } from '../../components/admin/ThumbnailUploader';

const courseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Category is required'),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    isPublished: z.boolean(),
    thumbnail: z.string().optional(),
});

const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Design',
    'Business',
    'Marketing'
];

const steps = [
    {
        label: 'Course Essentials',
        description: 'Start with the core details of your course.',
        icon: <DescriptionIcon />
    },
    {
        label: 'Media & Categorization',
        description: 'Add a thumbnail and categorize your content.',
        icon: <ImageIcon />
    },
    {
        label: 'Review & Launch',
        description: 'Double check everything before creating.',
        icon: <CheckCircleIcon />
    },
];

export function CreateCourse() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // React Hook Form setup
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        trigger,
        getValues,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            category: 'Web Development',
            price: 0,
            isPublished: false,
            thumbnail: '',
        }
    });

    const priceValue = watch('price');
    const formValues = watch();

    const handleNext = async () => {
        let valid = false;
        if (activeStep === 0) {
            valid = await trigger(['title', 'description']);
        } else if (activeStep === 1) {
            valid = await trigger(['category', 'price', 'thumbnail']);
        } else {
            valid = true;
        }

        if (valid) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const onSubmit = async (data) => {
        if (!user) {
            toast.error('You must be logged in');
            return;
        }

        setLoading(true);
        try {
            const courseData = {
                title: data.title,
                description: data.description,
                category: data.category,
                price: data.price,
                isPublished: false, // Or default to false and let them publish in Edit
                instructorId: user.$id,
                thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                instructorName: user.name,
                studentsCount: 0,
                lessonsCount: 0,
            };

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.COURSES,
                ID.unique(),
                courseData,
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id)),
                ]
            );

            toast.success('Course created successfully! Now add some content.');
            navigate('/admin/courses');

        } catch (error) {
            console.error('Create course failed:', error);
            toast.error('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="md">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    sx={{ mb: 4 }}
                >
                    <Link component={RouterLink} to="/dashboard" color="inherit" underline="hover">
                        Dashboard
                    </Link>
                    <Link component={RouterLink} to="/admin/courses" color="inherit" underline="hover">
                        Courses
                    </Link>
                    <Typography color="text.primary">Create New</Typography>
                </Breadcrumbs>

                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={6}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Create New Course
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Follow the steps to set up your new course structure.
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/admin/courses')}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                </Stack>

                <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                StepIconProps={{
                                    sx: {
                                        fontSize: 32,
                                        '&.Mui-active': { color: 'primary.main' },
                                        '&.Mui-completed': { color: 'success.main' }
                                    }
                                }}
                            >
                                <Typography variant="h6" fontWeight={600}>{step.label}</Typography>
                                <Typography variant="caption" color="text.secondary">{step.description}</Typography>
                            </StepLabel>
                            <StepContent>
                                <Card elevation={0} variant="outlined" sx={{ mt: 2, mb: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
                                    <CardContent sx={{ p: 4 }}>
                                        {/* STEP 0: ESSENTIALS */}
                                        {index === 0 && (
                                            <Stack spacing={3}>
                                                <Controller
                                                    name="title"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label="Course Title"
                                                            placeholder="e.g. Master ReactJS in 30 Days"
                                                            required
                                                            fullWidth
                                                            variant="outlined"
                                                            error={!!errors.title}
                                                            helperText={errors.title?.message}
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="description"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label="Description"
                                                            placeholder="What will students learn in this course?"
                                                            required
                                                            multiline
                                                            rows={6}
                                                            fullWidth
                                                            variant="outlined"
                                                            error={!!errors.description}
                                                            helperText={errors.description?.message}
                                                        />
                                                    )}
                                                />
                                            </Stack>
                                        )}

                                        {/* STEP 1: MEDIA & INFO */}
                                        {index === 1 && (
                                            <Grid container spacing={4}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Stack spacing={3}>
                                                        <Controller
                                                            name="category"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <TextField
                                                                    {...field}
                                                                    select
                                                                    label="Category"
                                                                    required
                                                                    fullWidth
                                                                    error={!!errors.category}
                                                                    helperText={errors.category?.message}
                                                                >
                                                                    {categories.map((option) => (
                                                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            )}
                                                        />

                                                        <Stack direction="row" spacing={2}>
                                                            <TextField
                                                                select
                                                                label="Type"
                                                                value={priceValue > 0 ? 'paid' : 'free'}
                                                                onChange={(e) => {
                                                                    const isPaid = e.target.value === 'paid';
                                                                    setValue('price', isPaid ? 50000 : 0);
                                                                }}
                                                                fullWidth
                                                            >
                                                                <MenuItem value="free">Free</MenuItem>
                                                                <MenuItem value="paid">Paid</MenuItem>
                                                            </TextField>

                                                            {priceValue > 0 && (
                                                                <Controller
                                                                    name="price"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <TextField
                                                                            {...field}
                                                                            label="Price (Rp)"
                                                                            type="number"
                                                                            required
                                                                            fullWidth
                                                                            InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
                                                                            error={!!errors.price}
                                                                        />
                                                                    )}
                                                                />
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Typography variant="subtitle2" gutterBottom>Course Thumbnail</Typography>
                                                    <Controller
                                                        name="thumbnail"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <ThumbnailUploader
                                                                initialValue={field.value}
                                                                onChange={(url) => field.onChange(url)}
                                                                user={user}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            </Grid>
                                        )}

                                        {/* STEP 2: REVIEW */}
                                        {index === 2 && (
                                            <Stack spacing={3}>
                                                <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
                                                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quick Summary</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid size={{ xs: 12, sm: 6 }}>
                                                            <Typography variant="body2" color="text.secondary">Title</Typography>
                                                            <Typography variant="body1" fontWeight={500}>{formValues.title}</Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 12, sm: 6 }}>
                                                            <Typography variant="body2" color="text.secondary">Category</Typography>
                                                            <Typography variant="body1" fontWeight={500}>{formValues.category}</Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 12 }}>
                                                            <Typography variant="body2" color="text.secondary">Description</Typography>
                                                            <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }} noWrap>
                                                                {formValues.description?.substring(0, 100)}...
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>

                                                <Typography variant="body2" color="text.secondary">
                                                    By clicking "Create Course", a new draft course will be created. You can add lessons and modules in the next screen.
                                                </Typography>
                                            </Stack>
                                        )}

                                        {/* NAVIGATION BUTTONS */}
                                        <Box sx={{ mb: 2, mt: 4 }}>
                                            <Button
                                                variant="contained"
                                                onClick={index === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                                                sx={{ mt: 1, mr: 1, px: 4, borderRadius: 2 }}
                                                size="large"
                                                disabled={loading}
                                            >
                                                {index === steps.length - 1 ? (loading ? 'Creating...' : 'Create Course') : 'Continue'}
                                            </Button>
                                            <Button
                                                disabled={index === 0 || loading}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Container>
        </Box>
    );
}

export default CreateCourse;
