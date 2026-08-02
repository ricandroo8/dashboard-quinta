import { useEffect, useState } from 'react';

function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const savedValue = localStorage.getItem(key);
            return savedValue !== null
                ? JSON.parse(savedValue)
                : initialValue;
        } catch (error) {
            console.error(
                `Errore durante la lettura di "${key}" dal localStorage:`,
                error
            );

            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(
                `Errore durante la scrittura di "${key}" nel localStorage:`,
                error
            );
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}

export default useLocalStorage;