import React from "react";
import { format } from "date-fns";

function Message({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwn ? "bg-blue-600" : "bg-gray-700"
        }`}
      >
        <div className="text-sm text-gray-300 mb-1">
          {isOwn ? "You" : message.username}
        </div>
        <div className="text-white break-words">{message.content}</div>
        <div className="text-xs text-gray-400 mt-1">
          {format(new Date(message.timestamp), "HH:mm")}
        </div>
      </div>
    </div>
  );
}

export default Message;
