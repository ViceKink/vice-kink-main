
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  sectionClassName?: string;
  gridSpan?: {
    cols?: string;
    rows?: string;
    colsStart?: string;
    colsEnd?: string;
    rowsStart?: string;
    rowsEnd?: string;
  };
}

const ProfileSection = ({
  title,
  children,
  className = '',
  sectionClassName = '',
  gridSpan,
}: ProfileSectionProps) => {
  // Generate grid classes based on gridSpan prop
  const gridClasses = gridSpan
    ? cn(
        gridSpan.cols,
        gridSpan.rows,
        gridSpan.colsStart,
        gridSpan.colsEnd,
        gridSpan.rowsStart,
        gridSpan.rowsEnd
      )
    : '';

  return (
    <section className={cn("bento-card group", gridClasses, sectionClassName)}>
      <div
        className={cn(
          "w-full h-full rounded-2xl transition-all duration-300 ease-out overflow-hidden",
          className
        )}
      >
        {title && (
          <h3 className="text-lg font-semibold p-4 pb-2">{title}</h3>
        )}
        {children}
      </div>
    </section>
  );
};

export default ProfileSection;
