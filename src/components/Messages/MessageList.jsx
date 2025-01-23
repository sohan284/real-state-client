import { useState } from "react";

export const MessageList = ({ onChatSelect, userData, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safe filtering of chats - exclude current user and apply search filter
  const filteredUsers = userData?.filter(
    (user) =>
      user.email !== currentUser &&
      (user?.name || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase())
  );

  if (!isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }
  console.log(filteredUsers);

  return (
    <div className="h-[600px]">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-y-auto">
        {filteredUsers?.map((user) => (
          <button
            key={user.id}
            onClick={() => onChatSelect(user)}
            className={`w-full text-left hover:bg-gray-50 p-4 border-b border-gray-100 ${
              user.hasUnread ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt={user.name || "User"}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    user.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm ${
                      user.hasUnread
                        ? "font-bold text-blue-900"
                        : "font-semibold"
                    }`}
                  >
                    {user.name || "Unknown User"}
                  </h3>
                  {user.lastMessage?.timestamp && (
                    <span className="text-xs text-gray-400">
                      {new Date(user.lastMessage.timestamp).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm truncate ${
                    user.hasUnread
                      ? "font-semibold text-blue-800"
                      : "text-gray-500"
                  }`}
                >
                  {user.lastMessage?.content || "No messages yet"}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`text-xs ${
                    user.hasUnread ? "text-blue-600 font-bold" : "text-gray-400"
                  }`}
                >
                  {user.lastMessageTime
                    ? new Date(user.lastMessageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
                {user.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white font-bold text-xs rounded-full px-2 py-1 mt-1">
                    {user.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}

        {userData?.data?.length === 0 && (
          <div className="text-center text-gray-500 p-4">
            {searchTerm ? "No chats found" : "No chats available"}
          </div>
        )}
      </div>
    </div>
  );
};
