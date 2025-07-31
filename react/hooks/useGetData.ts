import { useState, useEffect, useCallback } from 'react'
import { getData } from '../services/getData.service'
import { Register } from '../models/Register.interface';
const useGetData = (endpoint: string, retries: number, delay: number) => {
    const [data, setData] = useState<Register[]>([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const result = await getData(endpoint, retries, delay);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [endpoint, retries, delay]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, error, loading };
};

export default useGetData;