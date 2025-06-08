'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SpeciesTrendProps {
  data: Array<{
    species: string;
    year: string;
  }>;
  selectedSpecies: string[];
}

export default function SpeciesTrend({ data, selectedSpecies }: SpeciesTrendProps) {
  const years = Array.from(new Set(data.map(d => d.year))).sort();
  
  const speciesData = {
    labels: years,
    datasets: selectedSpecies.length === 0
      ? [{
          label: 'All Species',
          data: years.map(year => 
            data.filter(d => d.year === year).length
          ),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }]
      : selectedSpecies.map((species, index) => ({
          label: species,
          data: years.map(year => 
            data.filter(d => d.species === species && d.year === year).length
          ),
          borderColor: `hsl(${index * 360 / selectedSpecies.length}, 70%, 50%)`,
          backgroundColor: `hsla(${index * 360 / selectedSpecies.length}, 70%, 50%, 0.5)`,
        })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Strandings'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      }
    },
  };

  return <Line options={options} data={speciesData} />;
}