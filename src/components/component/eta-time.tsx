import { useForm, Controller } from "react-hook-form";

type ETAType = "all" | "manual" | "real_time" | "one_time";

interface FormData {
  etaType: ETAType;
}

export default function ETARadioButtons() {
  const { control, watch, setValue } = useForm<FormData>({
    defaultValues: { etaType: "all" },
  });

  const etaType = watch("etaType");

  return (
    <div className="space-y-4 p-4">
      {/* Main Selection */}
      <Controller
        name="etaType"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2">
            {(["all", "manual"] as ETAType[]).map((option) => (
              <button
                key={option}
                type="button"
                className={`px-4 py-2 rounded-lg ${
                  field.value === option
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => field.onChange(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        )}
      />

      {/* Location Group (Not Selectable) */}
      <div>
        <p className="text-gray-700 font-medium">Location</p>
        <div className="flex gap-2">
          {(["real_time", "one_time"] as ETAType[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`px-4 py-2 rounded-lg ${
                etaType === option ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setValue("etaType", option)}
            >
              {option === "real_time" ? "Real-time" : "One-time"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
