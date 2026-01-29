import { useEffect, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { apiFetch } from "../api/fetcher";

import type {
  Farmer,
  FarmerDetails,
  FarmerTunnel,
  AppSettings,
} from "../types/backend";

const API_BASE_URL = "http://localhost:8080";

export function useMeData() {
  const { getToken, isAuthenticated } = useKindeAuth();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [details, setDetails] = useState<FarmerDetails | null>(null);
  const [tunnels, setTunnels] = useState<FarmerTunnel[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function load() {
      try {
        setLoading(true);

        const token = await getToken();
        if (!token) throw new Error("Brak tokena Kinde");

        // ===== 1️⃣ ME =====
        const me = await apiFetch<Farmer>(
          `${API_BASE_URL}/api/me`,
          token
        );
        setFarmer(me);

        const farmerId = me.id;

        // ===== 2️⃣ reszta =====
        const [detailsRes, tunnelsRes, settingsRes] =
          await Promise.all([
            apiFetch<FarmerDetails>(
              `${API_BASE_URL}/api/farmer-details/${farmerId}`,
              token
            ),
            apiFetch<FarmerTunnel[]>(
              `${API_BASE_URL}/api/farmer-tunnels/${farmerId}`,
              token
            ),
            apiFetch<AppSettings>(
              `${API_BASE_URL}/api/app-settings/${farmerId}`,
              token
            ),
          ]);

        setDetails(detailsRes);
        setTunnels(tunnelsRes);
        setSettings(settingsRes);
      } catch (e) {
        console.error(e);
        setError("Błąd pobierania danych użytkownika");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAuthenticated, getToken]);

  return {
    farmer,
    farmerDetails: details,
    farmerTunnels: tunnels,
    appSettings: settings,
    loading,
    error,
  };
}
