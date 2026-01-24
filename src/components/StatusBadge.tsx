import { Badge } from './ui';

export const StatusBadge = ({ status, className = '' }: { 
  status: 'pending' | 'processing' | 'completed' | 'error';
  className?: string; 
}) => {
  const config = {
    pending: { label: 'Chờ xử lý', variant: 'warning' as const },
    processing: { label: 'Đang xử lý', variant: 'warning' as const },
    completed: { label: 'Hoàn thành', variant: 'success' as const },
    error: { label: 'Lỗi', variant: 'error' as const },
  };
  
  const { label, variant } = config[status];
  
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};
