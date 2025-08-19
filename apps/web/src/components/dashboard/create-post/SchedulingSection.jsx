"use client";
import { Calendar, Info, CheckCircle } from "lucide-react";

export default function SchedulingSection({ formData, setFormData, timezone }) {
  // Convert UTC datetime to user's timezone for display in datetime-local input
  const formatDateTime = (date) => {
    if (!date) return "";

    try {
      // If date is already a datetime-local format (YYYY-MM-DDTHH:mm), use it directly
      if (
        typeof date === "string" &&
        date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
      ) {
        return date;
      }

      const d = new Date(date);

      // Check if the date is valid
      if (isNaN(d.getTime())) {
        return "";
      }

      // Convert to user's timezone and format for datetime-local input
      const userTimezoneDatetime = new Intl.DateTimeFormat("sv-SE", {
        timeZone: timezone || "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d);

      // Convert "YYYY-MM-DD HH:mm" to "YYYY-MM-DDTHH:mm"
      return userTimezoneDatetime.replace(" ", "T");
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return "";
    }
  };

  // Convert user's local datetime input to a format that can be sent to server
  const handleDateTimeChange = (inputValue) => {
    if (!inputValue) {
      setFormData((prev) => ({
        ...prev,
        scheduledFor: "",
      }));
      return;
    }

    try {
      // inputValue is in format: YYYY-MM-DDTHH:mm (user's intended timezone)
      // We need to convert this to a proper datetime that represents the user's intention
      const [datePart, timePart] = inputValue.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);

      // Create date object in user's timezone
      const userDate = new Date();
      userDate.setFullYear(year, month - 1, day);
      userDate.setHours(hour, minute, 0, 0);

      // Get the timezone offset difference
      const userTimezone = timezone || "America/New_York";
      const tempDate = new Date();
      const userOffset = new Intl.DateTimeFormat("en", {
        timeZone: userTimezone,
        timeZoneName: "longOffset",
      })
        .formatToParts(tempDate)
        .find((part) => part.type === "timeZoneName")?.value;

      // Store the datetime-local input value directly
      // The server will handle timezone conversion
      setFormData((prev) => ({
        ...prev,
        scheduledFor: inputValue,
      }));
    } catch (error) {
      console.error("Error handling datetime change:", error);
      setFormData((prev) => ({
        ...prev,
        scheduledFor: inputValue,
      }));
    }
  };

  // Get current datetime in user's timezone for min attribute
  const getCurrentDateTimeInUserTimezone = () => {
    try {
      const now = new Date();
      const userTimezoneDatetime = new Intl.DateTimeFormat("sv-SE", {
        timeZone: timezone || "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);

      return userTimezoneDatetime.replace(" ", "T");
    } catch (error) {
      console.error("Error getting current datetime:", error);
      return new Date().toISOString().slice(0, 16);
    }
  };

  // Get timezone display name
  const getTimezoneDisplayName = (tz) => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short",
      });
      const timezoneName = formatter
        .formatToParts(now)
        .find((part) => part.type === "timeZoneName")?.value;

      // Create a more user-friendly display
      const offset = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "longOffset",
      })
        .formatToParts(now)
        .find((part) => part.type === "timeZoneName")?.value;

      return `${tz.split("/")[1]?.replace("_", " ")} (${timezoneName || offset})`;
    } catch (error) {
      return tz;
    }
  };

  // Notification alert based on selected scheduling option
  const getSchedulingAlert = () => {
    if (formData.isDraft) {
      return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
            <p className="text-yellow-200 text-sm">
              Post will be saved as a draft and can be scheduled or published
              later
            </p>
          </div>
        </div>
      );
    }

    if (formData.publishNow) {
      return (
        <div className="bg-green-500/10 border border-green-500/30 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
            <p className="text-green-200 text-sm">
              Post will be published immediately to all selected platforms
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Scheduling</h2>

      <div className="space-y-6">
        {/* Radio Button Options - Horizontal layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Publish Now */}
          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all group ${
              formData.publishNow
                ? "border-green-500 bg-green-500/10"
                : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/30"
            }`}
          >
            <input
              type="radio"
              name="schedulingOption"
              checked={formData.publishNow}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  publishNow: true,
                  isDraft: false,
                }))
              }
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 transition-all ${
                formData.publishNow
                  ? "border-green-500 bg-green-500"
                  : "border-gray-400 group-hover:border-gray-300"
              }`}
            >
              {formData.publishNow && (
                <div className="w-full h-full rounded-full bg-white scale-50 transform"></div>
              )}
            </div>
            <div className="flex-1">
              <div
                className={`font-medium text-sm transition-colors ${
                  formData.publishNow
                    ? "text-green-400"
                    : "text-white group-hover:text-gray-200"
                }`}
              >
                Publish now
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Post immediately
              </div>
            </div>
          </label>

          {/* Save as Draft */}
          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all group ${
              formData.isDraft
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/30"
            }`}
          >
            <input
              type="radio"
              name="schedulingOption"
              checked={formData.isDraft}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  isDraft: true,
                  publishNow: false,
                }))
              }
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 transition-all ${
                formData.isDraft
                  ? "border-yellow-500 bg-yellow-500"
                  : "border-gray-400 group-hover:border-gray-300"
              }`}
            >
              {formData.isDraft && (
                <div className="w-full h-full rounded-full bg-white scale-50 transform"></div>
              )}
            </div>
            <div className="flex-1">
              <div
                className={`font-medium text-sm transition-colors ${
                  formData.isDraft
                    ? "text-yellow-400"
                    : "text-white group-hover:text-gray-200"
                }`}
              >
                Save as draft
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Save for later</div>
            </div>
          </label>

          {/* Schedule for Later */}
          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all group ${
              !formData.publishNow && !formData.isDraft
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/30"
            }`}
          >
            <input
              type="radio"
              name="schedulingOption"
              checked={!formData.publishNow && !formData.isDraft}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  publishNow: false,
                  isDraft: false,
                }))
              }
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 transition-all ${
                !formData.publishNow && !formData.isDraft
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-400 group-hover:border-gray-300"
              }`}
            >
              {!formData.publishNow && !formData.isDraft && (
                <div className="w-full h-full rounded-full bg-white scale-50 transform"></div>
              )}
            </div>
            <div className="flex-1">
              <div
                className={`font-medium text-sm transition-colors ${
                  !formData.publishNow && !formData.isDraft
                    ? "text-blue-400"
                    : "text-white group-hover:text-gray-200"
                }`}
              >
                Schedule for later
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Choose date & time
              </div>
            </div>
          </label>
        </div>

        {/* Scheduling Alert - Inside the container */}
        {getSchedulingAlert()}

        {/* Date Time Picker - Only show when scheduling */}
        {!formData.publishNow && !formData.isDraft && (
          <div className="pt-4 border-t border-gray-700/50">
            <label className="block text-lg font-medium text-gray-200 mb-4">
              Schedule Date & Time
            </label>
            <div className="max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={formatDateTime(formData.scheduledFor)}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all"
                  min={getCurrentDateTimeInUserTimezone()}
                />
              </div>
              <div className="flex items-center mt-3 px-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <p className="text-sm text-gray-400">
                  Time zone:{" "}
                  <span className="text-gray-300 font-medium">
                    {getTimezoneDisplayName(timezone || "America/New_York")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
