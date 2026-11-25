import { useState } from "react";
import { RouteForm } from "./components/RouteForm";
import { MapView } from "./components/MapView";
import { RouteCard } from "./components/RouteCard";
import { WeatherHeatmap } from "./components/WeatherHeatmap";
import { useRouteQuery } from "./hooks/useRouteQuery";

export default function App() {
  const { data, loading, error, submit } = useRouteQuery();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [departureDatetime, setDepartureDatetime] = useState("");

  const handleSubmit = (values: Parameters<typeof submit>[0]) => {
    setDepartureDatetime(values.departure_datetime);
    setSelectedIndex(0);
    submit(values);
  };

  const recommended = data?.recommended_route_index ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🚛</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">TruckRoute</h1>
            <p className="text-xs text-gray-500">Weather-aware route planner</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Plan Route</h2>
            <RouteForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 px-1">Route Options</h2>
              {data.routes.map((route) => (
                <RouteCard
                  key={route.index}
                  route={route}
                  isRecommended={route.index === recommended}
                  isSelected={route.index === selectedIndex}
                  onSelect={() => setSelectedIndex(route.index)}
                />
              ))}
            </div>
          )}
        </aside>

        {/* Map + heatmap */}
        <section className="flex flex-col gap-4">
          <div className="flex-1 min-h-[480px] rounded-xl overflow-hidden border border-gray-200">
            {data ? (
              <MapView
                routes={data.routes}
                recommendedIndex={recommended}
                selectedIndex={selectedIndex}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center min-h-[480px]">
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-3">🗺️</div>
                  <p className="text-sm">Enter a route to see it on the map</p>
                </div>
              </div>
            )}
          </div>

          {data && departureDatetime && (
            <WeatherHeatmap
              routes={data.routes}
              selectedIndex={selectedIndex}
              departureIso={departureDatetime}
            />
          )}
        </section>
      </main>
    </div>
  );
}
