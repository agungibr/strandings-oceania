'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import dynamic from 'next/dynamic';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import SpeciesTrend from '../components/SpeciesTrend';
import SpeciesFilter from '../components/SpeciesFilter';
import InfoCard from '../components/InfoCard';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const StrandingsMap = dynamic(() => import('../components/StrandingsMap'), {
  ssr: false,
});

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StrandingData {
  year: string;
  species: string;
  location: string;
  status: string;
  latitude: string;
  longitude: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  sex: string;
  lifeStage: string;
  country: string;
}

export default function Home() {
  const [data, setData] = useState<StrandingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch('/data/strandings_oceania.csv');
      const csvData = await response.text();
      const results = Papa.parse<StrandingData>(csvData, {
        header: true,
        transform: (value, field) => {
          if (field === 'decimalLatitude' || field === 'decimalLongitude') {
            // Convert to number and handle potential invalid values
            const num = parseFloat(value);
            return !isNaN(num) ? num : undefined;
          }
          return value;
        },
        skipEmptyLines: true
      });

      setData(results.data);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredData = data.filter(d => {
    const matchesSpecies = selectedSpecies.length === 0 || selectedSpecies.includes(d.species);
    const matchesYear = selectedYear === 'all' || d.year === selectedYear;
    return matchesSpecies && matchesYear;
  });

  // Calculate yearly trend
  const calculateYearlyTrend = (currentYear: string) => {
    const thisYear = filteredData.filter(d => d.year === currentYear).length;
    const lastYear = filteredData.filter(d => d.year === (parseInt(currentYear) - 1).toString()).length;
    if (lastYear === 0) return 0;
    return ((thisYear - lastYear) / lastYear) * 100;
  };

  const currentYear = Math.max(...data.map(d => parseInt(d.year))).toString();
  const yearlyTrend = calculateYearlyTrend(currentYear);

  // Prepare chart data
  const speciesData = {
    labels: Array.from(new Set(filteredData.map(d => d.species)))
      .sort((a, b) => {
        const countA = filteredData.filter(d => d.species === a).length;
        const countB = filteredData.filter(d => d.species === b).length;
        return countB - countA;
      })
      .slice(0, 10),
    datasets: [{
      data: Array.from(new Set(filteredData.map(d => d.species)))
        .sort((a, b) => {
          const countA = filteredData.filter(d => d.species === a).length;
          const countB = filteredData.filter(d => d.species === b).length;
          return countB - countA;
        })
        .slice(0, 10)
        .map(species => filteredData.filter(d => d.species === species).length),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
    }],
  };
  const countryData = {
    labels: Array.from(new Set(filteredData.map(d => d.country))),
    datasets: [{
      data: Array.from(new Set(filteredData.map(d => d.country)))
        .map(country => filteredData.filter(d => d.country === country).length),
      backgroundColor: [
        'rgba(188, 212, 230, 0.8)', // Soft Blue
        'rgba(255, 218, 193, 0.8)', // Soft Peach
        'rgba(204, 229, 255, 0.8)', // Light Sky Blue
        'rgba(215, 196, 226, 0.8)', // Soft Purple
        'rgba(198, 226, 199, 0.8)', // Soft Green
        'rgba(255, 230, 204, 0.8)', // Soft Orange
        'rgba(230, 230, 250, 0.8)', // Lavender
        'rgba(255, 240, 245, 0.8)', // Lavender Blush
        'rgba(240, 248, 255, 0.8)', // Alice Blue
        'rgba(245, 245, 245, 0.8)', // White Smoke
      ],
    }],
  };
  const sexData = {
    labels: Array.from(new Set(filteredData.map(d => d.sex))),
    datasets: [{
      data: Array.from(new Set(filteredData.map(d => d.sex)))
        .map(sex => filteredData.filter(d => d.sex === sex).length),
      backgroundColor: [
        'rgba(173, 216, 230, 0.8)', // Light Blue
        'rgba(255, 182, 193, 0.8)', // Light Pink
        'rgba(221, 221, 221, 0.8)', // Light Gray (for unknown/other)
      ],
    }],
  };

  const lifeStageData = {
    labels: Array.from(new Set(filteredData.map(d => d.lifeStage))),
    datasets: [{
      data: Array.from(new Set(filteredData.map(d => d.lifeStage)))
        .map(stage => filteredData.filter(d => d.lifeStage === stage).length),
      backgroundColor: [
        'rgba(176, 224, 230, 0.8)', // Powder Blue
        'rgba(255, 218, 185, 0.8)', // Peach
        'rgba(221, 160, 221, 0.8)', // Plum
        'rgba(144, 238, 144, 0.8)', // Light Green
        'rgba(250, 250, 210, 0.8)', // Light Goldenrod
      ],
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const speciesOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
  };

  const commonSpecies = Array.from(new Set(filteredData.map(d => d.species)))
    .map(species => ({
      species,
      count: filteredData.filter(d => d.species === species).length
    }))
    .sort((a, b) => b.count - a.count)[0]?.species || 'N/A';

  if (loading) {
    return <div>Loading...</div>;
  }

  return (    <div className="min-h-screen">
      <div className="p-8 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 style={{ color: "#0787fc" }} className="text-4xl font-bold mb-2">Strandings of Oceania Dashboard</h1>
          <p className="text-blue-100 text-lg font-bold">
            Monitoring and analyzing marine mammal strandings across the Pacific region
          </p>
        </div>        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <InfoCard
            title="Total Strandings"
            value={filteredData.length}
            description="Total recorded stranding events"
            color="bg-white/90 backdrop-blur-sm"
            trend={yearlyTrend}
          />
          <InfoCard
            title="Species Diversity"
            value={new Set(filteredData.map(d => d.species)).size}
            description="Unique species identified"            color="bg-white/90 backdrop-blur-sm"
          />
          <InfoCard
            title="Most Common Species"
            value={commonSpecies}
            description="Highest frequency of strandings"
            color="bg-white/90 backdrop-blur-sm"
          />
          <InfoCard
            title="Locations"
            value={new Set(filteredData.map(d => d.location)).size}
            description="Different stranding locations"
            color="bg-white/90 backdrop-blur-sm"
          />
        </div>        {/* Filters Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-6 mb-8">
          <SpeciesFilter
            species={Array.from(new Set(data.map(d => d.species)))}
            selectedSpecies={selectedSpecies}
            onSpeciesChange={setSelectedSpecies}
          />
        </div>        {/* Map Section - Full Width */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Stranding Locations</h3>
            <span className="text-sm text-gray-500">
              {filteredData.filter(d => d.decimalLatitude && d.decimalLongitude).length} locations
            </span>
          </div>
          <div className="relative w-full rounded-lg overflow-hidden border border-gray-200">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Loading map data...</div>
              </div>
            ) : (
              <StrandingsMap data={filteredData} />
            )}
          </div>
        </div>

        {/* Species Distribution and Top 10 Species */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Species Distribution Chart */}          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Species Distribution by Year</h3>
            <Bar
              options={{
                ...chartOptions,
                indexAxis: 'x',
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: false
                  }
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
                }
              }} 
              data={{
                labels: Array.from(new Set(filteredData.map(d => d.year))).sort(),
                datasets: [{
                  data: Array.from(new Set(filteredData.map(d => d.year)))
                    .sort()
                    .map(year => filteredData.filter(d => d.year === year).length),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
                }]
              }}
            />
          </div>

          {/* Top 10 Species Chart */}          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 Species</h3>
            <Bar
              options={{
                ...chartOptions,
                indexAxis: 'y',
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: false
                  }
                }
              }} 
              data={{
                ...speciesData,
                datasets: [{
                  ...speciesData.datasets[0],
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 255, 0.6)',
                    'rgba(75, 192, 255, 0.6)',
                    'rgba(255, 206, 192, 0.6)',
                    'rgba(54, 162, 192, 0.6)',
                  ]
                }]
              }}
            />
          </div>
        </div>

        {/* Three Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Sex Distribution */}          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Sex Distribution</h3>
            <Pie options={{ ...chartOptions, cutout: '60%' }} data={sexData} />
          </div>

          {/* Life Stage Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Life Stage Distribution</h3>
            <Pie options={{...chartOptions, cutout: '60%'}} data={lifeStageData} />
          </div>

          {/* Country Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
            <Pie options={chartOptions} data={countryData} />
          </div>
        </div>

        {/* Species Trend Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Species Trend Over Time</h3>
          <SpeciesTrend data={filteredData} selectedSpecies={selectedSpecies} />
        </div>

        {/* Conclusion Section */}
        <div className="flex justify-center mt-8">
          <div className="text-justify max-w-2xl">
            <h1 style={{ fontSize: '35px' }} className="text-lg font-bold mb-4">Conclusion</h1>
            <hr className="mt-4 border-gray-300" />
            <p style={{ fontSize: '18px' }}>
              Despite advancements in data collection and visualization, the analysis reveals critical challenges in marine conservation. Species diversity, geographic distribution, and life stage vulnerabilities highlight the need for targeted interventions. 
            </p>
            <br />
             <p style={{ fontSize: '18px' }}>
            By addressing these issues, stakeholders can mitigate the impact of environmental stressors and promote sustainable marine ecosystems.
           </p>
          </div>
        </div>
      </div>
    </div>
  );
}