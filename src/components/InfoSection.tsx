'use client';

interface InfoSectionProps {
  title: string;
  content: string;
}

const InfoSection = ({ title, content }: InfoSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="prose max-w-none">
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  );
};

export default InfoSection;
