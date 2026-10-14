import React, { useState, useEffect } from 'react';
import { getStudentPhotoUrl } from '../config/api';

export interface StudentAvatarProps {
  studentId?: number | string | null;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  photoTimestamp?: number;
  className?: string;
  sizeClassName?: string;
  textClassName?: string;
  alt?: string;
  onLoad?: () => void;
  onError?: () => void;
  children?: React.ReactNode;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  studentId,
  firstName,
  lastName,
  fullName,
  photoTimestamp,
  className = '',
  sizeClassName = 'h-8 w-8 rounded',
  textClassName = 'text-xs',
  alt = 'Student avatar',
  onLoad,
  onError,
  children,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Compute initials
  const computeInitials = () => {
    if (firstName || lastName) {
      const f = firstName?.trim()?.[0] || '';
      const l = lastName?.trim()?.[0] || '';
      const combined = `${f}${l}`.toUpperCase();
      if (combined) return combined;
    }
    if (fullName) {
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      if (parts.length === 1 && parts[0].length > 0) {
        return parts[0].substring(0, 2).toUpperCase();
      }
    }
    return 'ST';
  };

  const initials = computeInitials();

  // Reset loading & error states when studentId or photoTimestamp changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [studentId, photoTimestamp]);

  const photoUrl = studentId ? getStudentPhotoUrl(studentId, photoTimestamp) : null;
  const showImage = Boolean(photoUrl && !hasError);

  return (
    <div
      className={`relative overflow-hidden shrink-0 select-none bg-slate-800 text-white flex items-center justify-center font-bold ${sizeClassName} ${className}`}
    >
      {showImage && (
        <img
          src={photoUrl!}
          alt={alt}
          className={`w-full h-full object-cover object-center transition-opacity duration-150 ${
            isLoaded ? 'opacity-100 block' : 'opacity-0 absolute'
          }`}
          onLoad={() => {
            setIsLoaded(true);
            setHasError(false);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
            onError?.();
          }}
        />
      )}

      {/* Fallback initials: Rendered ONLY when image is not loaded or encountered an error */}
      {(!showImage || !isLoaded) && (
        <span className={`uppercase tracking-wider ${textClassName}`}>
          {initials}
        </span>
      )}

      {children}
    </div>
  );
};
