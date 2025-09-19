import { useContext } from 'react';
import { PropertyContext } from '@/contexts/PropertyContext';

// Hook para usar o contexto de propriedades
export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};