import LocationPicker from "./components/component/react-leaflet";

function App() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-y-4 w-full">
        <LocationPicker
          defaultLocation={[51.505, -0.09]} // Optional default location
          onSave={(location) => console.log("Saved location:", location)}
        />
      </div>
    </main>
  );
}

export default App;
