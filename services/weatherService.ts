// Folosim OpenMeteo API (Gratuit, nu necesita API Key)
export const getCurrentTemperature = async (lat: number, lng: number): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`
    );
    const data = await response.json();
    if (data && data.current && typeof data.current.temperature_2m === 'number') {
      return data.current.temperature_2m;
    }
    return null;
  } catch (error) {
    console.error("Eroare preluare meteo:", error);
    return null;
  }
};

export const getUserLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocatia nu e suportata."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};