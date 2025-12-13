interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'circle' | 'chart';
  width?: string;
  height?: string;
  count?: number;
}

export default function SkeletonLoader({ 
  type = 'card', 
  width, 
  height, 
  count = 1 
}: SkeletonLoaderProps) {
  const getSkeletonStyle = () => {
    const baseStyle: React.CSSProperties = {
      background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '8px'
    };

    switch (type) {
      case 'card':
        return {
          ...baseStyle,
          width: width || '100%',
          height: height || '200px',
          borderRadius: '20px'
        };
      case 'text':
        return {
          ...baseStyle,
          width: width || '100%',
          height: height || '1rem',
          borderRadius: '4px'
        };
      case 'circle':
        return {
          ...baseStyle,
          width: width || '60px',
          height: height || '60px',
          borderRadius: '50%'
        };
      case 'chart':
        return {
          ...baseStyle,
          width: width || '100%',
          height: height || '200px',
          borderRadius: '12px'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={getSkeletonStyle()} />
      ))}
    </>
  );
}

