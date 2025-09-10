import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, Building2, Shield, PiggyBank, LineChart, TrendingUp, TrendingDown, Percent, Users, Target, Zap } from 'lucide-react';

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  statusIcon: StatusIcon,
  gradient = 'from-blue-500 to-blue-600',
  textColor = 'blue',
  className = '',
  size = 'normal',
  pulseIcon = false,
  style = 'gradient', // new prop: 'gradient', 'glass', 'neumorphic'
  animated = false, // new prop for value animation
  progress = null, // new prop for progress bar (0-100)
  onClick = null // new prop for interactivity
}) => {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
  
  // Animate value counting up
    useEffect(() => {
        // Only animate numbers
        if (!animated || typeof value !== 'number') {
        setDisplayValue(value);
        return;
        }

        // Start from 0 and animate to target value
        let start = 0;
        const duration = 2000; // 2 seconds
        const startTime = Date.now();

        const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(start + (value - start) * easeProgress);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setDisplayValue(value); // Ensure final value is exact
        }
        };

        animate();
    }, [value, animated]);


  const colorClasses = {
    blue: {
      title: 'text-blue-100',
      icon: 'text-blue-200',
      status: 'text-blue-300',
      glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
      progress: 'bg-blue-300'
    },
    purple: {
      title: 'text-purple-100',
      icon: 'text-purple-200',
      status: 'text-purple-300',
      glow: 'drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]',
      progress: 'bg-purple-300'
    },
    emerald: {
      title: 'text-emerald-100',
      icon: 'text-emerald-200',
      status: 'text-emerald-300',
      glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      progress: 'bg-emerald-300'
    },
    green: {
      title: 'text-green-100',
      icon: 'text-green-200',
      status: 'text-green-300',
      glow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
      progress: 'bg-green-300'
    },
    red: {
      title: 'text-red-100',
      icon: 'text-red-200',
      status: 'text-red-300',
      glow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      progress: 'bg-red-300'
    },
    orange: {
      title: 'text-orange-100',
      icon: 'text-orange-200',
      status: 'text-orange-300',
      glow: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]',
      progress: 'bg-orange-300'
    },
    gray: {
      title: 'text-gray-100',
      icon: 'text-gray-200',
      status: 'text-gray-300',
      glow: 'drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]',
      progress: 'bg-gray-300'
    }
  };

  const sizeClasses = {
    compact: {
      container: 'p-3 md:p-4 rounded-xl min-h-[120px] md:min-h-[130px]',
      title: 'text-xs',
      value: 'text-lg md:text-xl 2xl:text-2xl',
      subtitle: 'text-xs',
      icon: 'w-4 h-4',
      statusIcon: 'w-3 h-3',
      iconContainer: 'p-2'
    },
    normal: {
      container: 'p-6 rounded-2xl min-h-[140px]',
      title: 'text-sm',
      value: 'text-3xl',
      subtitle: 'text-sm',
      icon: 'w-5 h-5',
      statusIcon: 'w-4 h-4',
      iconContainer: 'p-3'
    }
  };

  const styleVariants = {
    gradient: `bg-gradient-to-br ${gradient} shadow-xl`,
    glass: `backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl`,
    neumorphic: `bg-gradient-to-br from-gray-100 to-gray-200 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]`
  };

  const colors = colorClasses[textColor] || colorClasses.blue;
  const sizes = sizeClasses[size];
  
  const finalValue = animated ? displayValue : value;

  return (
    <div 
      className={`
        ${styleVariants[style]} 
        ${sizes.container} 
        hover:shadow-2xl 
        hover:scale-105
        transition-all 
        duration-500 
        transform 
        hover:-translate-y-2
        cursor-pointer
        group
        relative
        overflow-hidden
        ${onClick ? 'active:scale-95' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-2 right-2 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-2 left-2 w-12 h-12 bg-white/5 rounded-full blur-lg"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`${colors.title} ${sizes.title} font-medium tracking-wide uppercase group-hover:text-white transition-colors duration-300`}>
            {title}
          </h3>
          {Icon && (
            <div className="relative">
              <Icon 
                className={`
                  ${colors.icon} 
                  ${sizes.icon} 
                  flex-shrink-0 
                  ${pulseIcon ? 'animate-pulse' : ''} 
                  ${colors.glow}
                  group-hover:scale-110
                  transition-all
                  duration-300
                  drop-shadow-lg
                `} 
              />
              {/* Icon background glow */}
              <div className={`absolute inset-0 ${colors.icon} ${sizes.icon} blur-sm opacity-30`}></div>
            </div>
          )}
        </div>
        
        <p className={`
          ${sizes.value} 
          font-bold 
          text-white 
          mb-2 
          leading-tight 
          break-words
          group-hover:scale-105
          transition-transform
          duration-300
          filter
          drop-shadow-sm
        `}>
          {finalValue}
        </p>
        
        {/* Progress Bar */}
        {progress !== null && (
          <div className="mb-3">
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full ${colors.progress} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {subtitle && (
          <div className="flex items-center gap-2">
            {StatusIcon && (
              <StatusIcon 
                className={`
                  ${colors.status} 
                  ${sizes.statusIcon} 
                  flex-shrink-0 
                  ${pulseIcon ? 'animate-pulse' : ''}
                  group-hover:scale-110
                  transition-transform
                  duration-300
                `} 
              />
            )}
            <span className={`${colors.status} ${sizes.subtitle} font-medium group-hover:text-white/90 transition-colors duration-300`}>
              {subtitle}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Ripple Effect */}
      {onClick && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-white/10 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
