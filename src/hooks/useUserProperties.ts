import { useState, useEffect } from 'react';
import { propertyService } from '@/services/propertyService';
import type { Property } from '@/types/property';

export const useUserProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await propertyService.getMyProperties();
      setProperties(data);
    } catch (err) {
      console.error('Erro ao carregar propriedades:', err);
      setError('Erro ao carregar suas propriedades');
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProperties = () => {
    loadProperties();
  };

  return {
    properties,
    isLoading,
    error,
    refreshProperties
  };
};