import { useDestinations as useDestinationsContext } from '../context/DestinationContext';

export const useDestinations = () => {
  return useDestinationsContext();
};

