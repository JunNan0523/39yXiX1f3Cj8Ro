"use client";
import { Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TwitterThreadEditor({
  twitterFields,
  setTwitterFields,
  mainContent,
}) {
  const tweetRefs = useRef([]);

  const handleTwitterThreadChange = () => {
    setTwitterFields((prev) => {
      if (!prev.isThread) {
        return {
          ...prev,
          isThread: true,
          threadItems: [{ content: mainContent }, { content: "" }],
        };
      } else {
        return { ...prev, isThread: false, threadItems: [] };
      }
    });
  };

  useEffect(() => {
    if (twitterFields.isThread) {
      setTwitterFields((prev) => ({
        ...prev,
        threadItems: prev.threadItems.map((item, i) =>
          i === 0 ? { ...item, content: mainContent } : item,
        ),
      }));
    }
  }, [mainContent, twitterFields.isThread, setTwitterFields]);

  const addTweetToThread = () => {
    setTwitterFields((prev) => ({
      ...prev,
      threadItems: [...prev.threadItems, { content: "" }],
    }));
  };

  const updateTweetContent = (index, content) => {
    setTwitterFields((prev) => ({
      ...prev,
      threadItems: prev.threadItems.map((item, i) =>
        i === index ? { ...item, content } : item,
      ),
    }));
    // Force re-render to update line heights
    setTimeout(() => {
      setTwitterFields((prev) => ({ ...prev }));
    }, 0);
  };

  const removeTweetFromThread = (index) => {
    if (twitterFields.threadItems.length > 2) {
      setTwitterFields((prev) => ({
        ...prev,
        threadItems: prev.threadItems.filter((_, i) => i !== index),
      }));
    }
  };

  const moveTweetUp = (index) => {
    if (index <= 1) return; // Don't allow moving first tweet or moving second tweet above first

    setTwitterFields((prev) => {
      const newThreadItems = [...prev.threadItems];
      const temp = newThreadItems[index];
      newThreadItems[index] = newThreadItems[index - 1];
      newThreadItems[index - 1] = temp;
      return { ...prev, threadItems: newThreadItems };
    });
  };

  const moveTweetDown = (index) => {
    if (index === 0 || index >= twitterFields.threadItems.length - 1) return; // Don't allow moving first tweet or last item down

    setTwitterFields((prev) => {
      const newThreadItems = [...prev.threadItems];
      const temp = newThreadItems[index];
      newThreadItems[index] = newThreadItems[index + 1];
      newThreadItems[index + 1] = temp;
      return { ...prev, threadItems: newThreadItems };
    });
  };

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea) => {
    if (textarea) {
      textarea.style.height = "auto";
      const minHeight = 72; // 3 lines approximately
      textarea.style.height = Math.max(textarea.scrollHeight, minHeight) + "px";
    }
  };

  // Get dynamic line height based on tweet container height
  const getLineHeight = (index) => {
    if (tweetRefs.current[index]) {
      const containerHeight = tweetRefs.current[index].offsetHeight;
      return Math.max(containerHeight - 40, 24); // Subtract circle height, min 24px
    }
    return 24; // fallback
  };

  return (
    <div
      className={`mt-6 bg-gray-700/50 rounded-lg ${twitterFields.isThread ? "p-6" : "p-4"}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Twitter Thread</h3>
        {/* Toggle Switch */}
        <div className="flex items-center">
          <span className="text-sm text-gray-300 mr-3">Create thread</span>
          <button
            type="button"
            onClick={handleTwitterThreadChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              twitterFields.isThread ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twitterFields.isThread ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {twitterFields.isThread && (
        <div className="mt-6 space-y-3">
          {twitterFields.threadItems.map((tweet, index) => (
            <div key={index} className="flex items-start gap-4">
              {/* Thread Line */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                {index < twitterFields.threadItems.length - 1 && (
                  <div
                    className="w-0.5 bg-gray-600 mt-2"
                    style={{
                      height: getLineHeight(index) + "px",
                      transition: "height 0.2s ease",
                    }}
                  ></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  ref={(el) => (tweetRefs.current[index] = el)}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-4"
                >
                  {index === 0 ? (
                    // First tweet shows main content or instructions
                    <div>
                      {mainContent.trim() ? (
                        <div>
                          <p className="text-white whitespace-pre-wrap break-words leading-relaxed">
                            {mainContent}
                          </p>
                          <div className="text-xs text-gray-400 mt-2">
                            {mainContent.length}/280 characters
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">
                          Write your first tweet in the main content area above
                        </div>
                      )}
                    </div>
                  ) : (
                    // Subsequent tweets are editable
                    <div>
                      <textarea
                        value={tweet.content}
                        onChange={(e) => {
                          updateTweetContent(index, e.target.value);
                          autoResizeTextarea(e.target);
                        }}
                        onInput={(e) => autoResizeTextarea(e.target)}
                        placeholder={`Tweet ${index + 1} content...`}
                        className="w-full bg-transparent border-none text-white placeholder-gray-400 resize-none focus:outline-none leading-relaxed overflow-hidden"
                        style={{ minHeight: "72px", height: "72px" }}
                        maxLength={280}
                      />
                      <div className="text-xs text-gray-400 mt-2">
                        {tweet.content.length}/280 characters
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reorder and Remove buttons for tweets after the first one */}
              {index > 0 && (
                <div className="flex flex-col gap-1 mt-3">
                  {/* Move Up Button */}
                  <button
                    type="button"
                    onClick={() => moveTweetUp(index)}
                    disabled={index <= 1}
                    className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  {/* Move Down Button */}
                  <button
                    type="button"
                    onClick={() => moveTweetDown(index)}
                    disabled={index >= twitterFields.threadItems.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Remove Button - only for tweets after the second one */}
                  {index > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTweetFromThread(index)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors mt-1"
                      title="Remove tweet"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Tweet Button */}
          <div className="flex items-center gap-4 pt-2">
            <div className="w-10 flex justify-center">
              <div className="w-0.5 h-4 bg-gray-600"></div>
            </div>
            <button
              type="button"
              onClick={addTweetToThread}
              className="flex items-center px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tweet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
