import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  size = 'sm',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  const cleanUrl = avatarUrl?.trim();
  const showImage = Boolean(cleanUrl && !hasError);
  const initial = name?.trim()?.[0]?.toUpperCase() || 'U';

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-white border border-white/20 select-none ${
        sizeClasses[size]
      } ${className} ${showImage ? 'bg-zinc-800' : 'bg-gradient-to-tr from-sky-500 to-blue-600'}`}
    >
      {showImage ? (
        <img
          src={cleanUrl}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover rounded-full"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};
