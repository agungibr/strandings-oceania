'use client';

interface SpeciesFilterProps {
  species: string[];
  selectedSpecies: string[];
  onSpeciesChange: (species: string[]) => void;
}

const SpeciesFilter = ({ species, selectedSpecies, onSpeciesChange }: SpeciesFilterProps) => {
  const toggleSpecies = (species: string) => {
    if (selectedSpecies.includes(species)) {
      onSpeciesChange(selectedSpecies.filter(s => s !== species));
    } else {
      onSpeciesChange([...selectedSpecies, species]);
    }
  };

  const showAllSpecies = () => {
    onSpeciesChange([]);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Filter by Species</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={showAllSpecies}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedSpecies.length === 0
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Species
        </button>
        {species.map(species => (
          <button
            key={species}
            onClick={() => toggleSpecies(species)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedSpecies.includes(species)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {species}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeciesFilter;