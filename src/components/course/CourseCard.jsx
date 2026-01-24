import { Link } from 'react-router-dom';
import { HiPlay, HiUsers, HiClock } from 'react-icons/hi';

/**
 * Course Card Component
 * 
 * Displays course preview with thumbnail, title, and metadata.
 * 
 * @param {Object} props
 * @param {Object} props.course - Course data object
 */
export function CourseCard({ course }) {
    const {
        id,
        title,
        description,
        category,
        thumbnail,
        lessonsCount = 0,
        studentsCount = 0,
        duration,
    } = course;

    // Generate placeholder thumbnail if none provided
    const imageUrl = thumbnail || `https://via.placeholder.com/800x450/1e293b/6366f1?text=${encodeURIComponent(title)}`;

    return (
        <Link to={`/courses/${id}`} className="course-card">
            <div className="course-card__image">
                <img
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                />
            </div>

            <div className="course-card__content">
                {category && (
                    <span className="course-card__category">{category}</span>
                )}

                <h3 className="course-card__title">{title}</h3>

                {description && (
                    <p className="course-card__desc">{description}</p>
                )}

                <div className="course-card__meta">
                    <span className="course-card__meta-item">
                        <HiPlay size={14} />
                        {lessonsCount} lessons
                    </span>
                    <span className="course-card__meta-item">
                        <HiUsers size={14} />
                        {studentsCount.toLocaleString()} students
                    </span>
                    {duration && (
                        <span className="course-card__meta-item">
                            <HiClock size={14} />
                            {duration}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default CourseCard;
