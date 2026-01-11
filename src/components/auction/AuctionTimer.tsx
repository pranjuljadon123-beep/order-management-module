import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuctionTimerProps {
  endTime: string;
  startTime?: string;
  size?: 'sm' | 'md' | 'lg';
  onEnd?: () => void;
}

export function AuctionTimer({ endTime, startTime, size = 'md', onEnd }: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  const [status, setStatus] = useState<'scheduled' | 'live' | 'ended'>('live');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const start = startTime ? new Date(startTime).getTime() : now;

      if (now < start) {
        // Auction not started yet
        const diff = start - now;
        setStatus('scheduled');
        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          total: diff,
        };
      }

      if (now >= end) {
        setStatus('ended');
        onEnd?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      setStatus('live');
      const diff = end - now;
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, startTime, onEnd]);

  const isUrgent = status === 'live' && timeLeft.total < 5 * 60 * 1000; // Less than 5 minutes
  const isWarning = status === 'live' && timeLeft.total < 15 * 60 * 1000; // Less than 15 minutes

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-lg gap-3',
  };

  const unitClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  if (status === 'ended') {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", sizeClasses[size])}>
        <Clock className="h-4 w-4" />
        <span className="font-medium">Auction Ended</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", sizeClasses[size])}>
      <div className="flex items-center gap-1 mb-2">
        {isUrgent ? (
          <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
        ) : (
          <Clock className={cn("h-4 w-4", status === 'live' ? 'text-success' : 'text-muted-foreground')} />
        )}
        <span className={cn(
          "font-medium",
          status === 'scheduled' && "text-muted-foreground",
          status === 'live' && !isWarning && "text-success",
          isWarning && !isUrgent && "text-warning",
          isUrgent && "text-destructive"
        )}>
          {status === 'scheduled' ? 'Starts in' : 'Time Remaining'}
        </span>
      </div>

      <div className={cn("flex items-center", sizeClasses[size])}>
        {timeLeft.days > 0 && (
          <>
            <div className={cn(
              "flex flex-col items-center justify-center rounded-lg bg-muted",
              unitClasses[size]
            )}>
              <span className="font-bold">{timeLeft.days}</span>
              <span className="text-[10px] text-muted-foreground uppercase">Days</span>
            </div>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <div className={cn(
          "flex flex-col items-center justify-center rounded-lg",
          isUrgent ? "bg-destructive/20" : isWarning ? "bg-warning/20" : "bg-muted",
          unitClasses[size]
        )}>
          <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[10px] text-muted-foreground uppercase">Hrs</span>
        </div>
        <span className="text-muted-foreground">:</span>
        <div className={cn(
          "flex flex-col items-center justify-center rounded-lg",
          isUrgent ? "bg-destructive/20" : isWarning ? "bg-warning/20" : "bg-muted",
          unitClasses[size]
        )}>
          <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] text-muted-foreground uppercase">Min</span>
        </div>
        <span className="text-muted-foreground">:</span>
        <div className={cn(
          "flex flex-col items-center justify-center rounded-lg",
          isUrgent ? "bg-destructive/20 animate-pulse" : isWarning ? "bg-warning/20" : "bg-muted",
          unitClasses[size]
        )}>
          <span className="font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] text-muted-foreground uppercase">Sec</span>
        </div>
      </div>
    </div>
  );
}
