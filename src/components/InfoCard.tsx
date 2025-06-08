'use client';

interface InfoCardProps {
  title: string;
  value: string | number;
  description: string;
  color: string;
  trend?: number;
}

const InfoCard = ({ title, value, description, color, trend }: InfoCardProps) => {
  return (
    <div className={`${color} card`}>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-3xl font-bold my-2">{value}</p>
      <p className="text-sm text-gray-600">{description}</p>
      {trend !== undefined && (
        <div className={`mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous year
        </div>
      )}
    </div>
  );
};

export default InfoCard;
