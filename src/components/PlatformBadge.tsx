'use client';

import type { Platform } from '@/types';
import { Badge } from './ui';
import { FacebookIcon, TikTokIcon, YouTubeIcon } from './ui/Icons';

export const PlatformBadge = ({ platform, showIcon = true, className = '' }: {
  platform: Platform;
  showIcon?: boolean;
  className?: string;
}) => {
  const config = {
    tiktok: {
      label: 'TikTok',
      icon: TikTokIcon,
      variant: 'tiktok' as const,
    },
    facebook: {
      label: 'Facebook',
      icon: FacebookIcon,
      variant: 'facebook' as const,
    },
    youtube: {
      label: 'YouTube',
      icon: YouTubeIcon,
      variant: 'youtube' as const,
    },
  };

  const { label, icon: Icon, variant } = config[platform];

  return (
    <Badge variant={variant} className={className}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  );
};
