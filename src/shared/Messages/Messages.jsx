import { useState, useEffect, useRef } from "react";
import { MessageList } from "../../components/Messages/MessageList";
import { MessageInput } from "../../components/Messages/MessageInput";
import io from "socket.io-client";
import adminApi from "../../redux/fetures/admin/adminApi";
import { selectCurrentUser } from "../../redux/fetures/auth/authSlice";
import { useSelector } from "react-redux";
import ownerApi from "../../redux/fetures/owner/ownerApi";
import { skipToken } from "@reduxjs/toolkit/query";
import tenantApi from "../../redux/fetures/tenant/tenantApi";
import { url } from "../../globalConst/const";
import moment from "moment";
const socket = io("https://backend.rentpadhomes.com");

const Messages = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [user, setUser] = useState("");
  const currentUser = useSelector(selectCurrentUser);
  const [recipient, setRecipient] = useState(currentUser?.email);

  const { data: userData } = adminApi.useGetALlUserQuery("");

  const { data: tenantDataByOwner } = ownerApi.useGetAllTenantsForMessageQuery(
    currentUser.role === "owner" ? currentUser?.userId : skipToken
  );

  const { data: eachTenantSameProperAllTenant } =
    tenantApi.useGetAllTenantsForMessageForEachPropertyTenantQuery(
      currentUser?.userId
    );


  const [unreadMessages, setUnreadMessages] = useState(() => {
    const saved = localStorage.getItem("unreadMessages");
    return saved ? JSON.parse(saved) : {};
  });
  const [lastMessages, setLastMessages] = useState(() => {
    const saved = localStorage.getItem("lastMessages");
    return saved ? JSON.parse(saved) : {};
  });
  const messagesEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch message history when component mounts or recipient changes
  useEffect(() => {
    if (recipient) {
      fetch(`https://backend.rentpadhomes.com/chats?email=${currentUser?.email}`)
        .then((response) => response.json())
        .then((data) => {
          setMessages(data);
          const lastMessagesMap = {};
          data.forEach((msg) => {
            const otherUser =
              msg.sender === currentUser?.email ? msg.recipient : msg.sender;
            if (
              !lastMessagesMap[otherUser] ||
              new Date(msg.timestamp) >
                new Date(lastMessagesMap[otherUser].timestamp)
            ) {
              lastMessagesMap[otherUser] = {
                content: msg.content,
                timestamp: msg.timestamp,
              };
            }
          });
          setLastMessages(lastMessagesMap);
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [recipient, currentUser]);

  useEffect(() => {
    socket.emit("join", currentUser?.email);

    socket.on("connect", () => {
      // console.log("Connected to socket server");
      socket.emit("user_online", currentUser?.email);
    });

    // Listen for online users updates
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_connected", (userId) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: true,
      }));
    });

    socket.on("user_disconnected", (userId) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: false,
      }));
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);

      // Only update unread count for incoming messages not from current chat
      if (
        message.recipient === currentUser?.email &&
        message.sender !== currentUser?.email &&
        (!currentChat || message.sender !== currentChat.email)
      ) {
        setUnreadMessages((prev) => {
          const newUnreadMessages = {
            ...prev,
            [message.sender]: (prev[message.sender] || 0) + 1,
          };
          localStorage.setItem(
            "unreadMessages",
            JSON.stringify(newUnreadMessages)
          );
          return newUnreadMessages;
        });
      }

      // Update last messages
      const otherUser =
        message.sender === currentUser?.email
          ? message.recipient
          : message.sender;
      setLastMessages((prev) => {
        const newLastMessages = {
          ...prev,
          [otherUser]: {
            content: message.content,
            timestamp: message.timestamp,
          },
        };
        localStorage.setItem("lastMessages", JSON.stringify(newLastMessages));
        return newLastMessages;
      });
    });

    socket.on("message history", (history) => {
      setMessages(history);
    });

    socket.on("user list", (userList) => {
      // console.log("User list updated:", userList);
    });

    // Fetch initial unread messages when component mounts
    const fetchInitialUnreadMessages = async () => {
      try {
        // Get unread messages count directly from the server
        const response = await fetch(
          `https://backend.rentpadhomes.com/messages/unread/${currentUser?.email}`
        );
        const unreadCounts = await response.json();

        // console.log("Initial unread counts:", unreadCounts); // Debug log

        // Update unread messages state and localStorage
        setUnreadMessages(unreadCounts);
        localStorage.setItem("unreadMessages", JSON.stringify(unreadCounts));
      } catch (error) {
        console.error("Error fetching initial unread messages:", error);
      }
    };

    if (currentUser?.email) {
      fetchInitialUnreadMessages();
    }

    return () => {
      socket.emit("user_offline", currentUser?.email);
      socket.off("online_users");
      socket.off("user_connected");
      socket.off("user_disconnected");
      socket.off("message");
      socket.off("message history");
      socket.off("user list");
    };
  }, [currentUser]);
  useEffect(() => {
    if (recipient) {
      const foundUser = userData?.data.find((u) => u.email === recipient);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  }, [recipient, userData?.data]);
  const sendMessage = (e) => {
    e.preventDefault();
    if (message && currentChat) {
      const messageData = {
        content: message, // Changed from 'message' to 'content'
        recipient: currentChat.email,
        sender: currentUser?.email,
        timestamp: new Date().toISOString(),
        read: false,
      };

      socket.emit("message", messageData);
      setMessage("");
    }
  };
  const handleChatSelect = async (user) => {
    setCurrentChat(user);

    try {
      // Mark messages as read in the backend
      const response = await fetch("https://backend.rentpadhomes.com/messages/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: user.email,
          recipient: currentUser?.email,
        }),
      });

      if (response.ok) {
        // Update local messages state
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender === user.email && msg.recipient === currentUser?.email
              ? { ...msg, read: true }
              : msg
          )
        );

        // Clear unread count for this user
        setUnreadMessages((prev) => {
          const newUnreadMessages = { ...prev };
          delete newUnreadMessages[user.email]; // Remove the unread count for this user
          localStorage.setItem(
            "unreadMessages",
            JSON.stringify(newUnreadMessages)
          );
          return newUnreadMessages;
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const deleteMessage = (messageId) => {
    socket.emit("delete_message", messageId);
  };

  useEffect(() => {
    socket.on("message_deleted", (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    });

    return () => {
      socket.off("message_deleted");
    };
  }, []);

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-manrope text-2xl font-bold mb-1">Messages</h2>
        <p className="text-[#64748B] text-sm">
          <span className="opacity-60">Messages / </span> Inbox
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg h-[660px] hidden md:grid md:grid-cols-3 shadow-sm">
        {/* Left Sidebar */}
        <div className="col-span-1 border-r border-gray-100">
          {/* Search and Add Button */}

          <div className="overflow-y-auto h-full">
            <MessageList
              onChatSelect={handleChatSelect}
              userData={
                currentUser?.role === "owner"
                  ? tenantDataByOwner?.data?.map((user) => ({
                      ...user,
                      hasUnread: Boolean(unreadMessages[user.email]),
                      lastMessage: lastMessages[user.email],
                      isOnline: onlineUsers[user.email] || false,
                      unreadCount: unreadMessages[user.email] || 0,
                    }))
                  : currentUser?.role === "tenant"
                  ? eachTenantSameProperAllTenant?.data?.map((user) => ({
                      ...user,
                      hasUnread: Boolean(unreadMessages[user.email]),
                      lastMessage: lastMessages[user.email],
                      isOnline: onlineUsers[user.email] || false,
                      unreadCount: unreadMessages[user.email] || 0,
                    }))
                  : userData?.data?.map((user) => ({
                      ...user,
                      hasUnread: Boolean(unreadMessages[user.email]),
                      lastMessage: lastMessages[user.email],
                      isOnline: onlineUsers[user.email] || false,
                      unreadCount: unreadMessages[user.email] || 0,
                    }))
              }
              currentUser={currentUser?.email}
              role={currentUser?.role}
            />
          </div>
        </div>

        <div className="col-span-2 flex flex-col bg-white relative">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
            {currentChat?.profileImage ? (
                  <img
                    src={`${url}${currentChat?.profileImage}`}
                    alt={currentChat?.name?.slice(0, 2).toUpperCase()}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">
                      {currentChat?.name?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              <div>
                <h3 className="font-semibold">
                  {currentChat?.name || "Select a chat"}
                </h3>
                <span
                  className={`text-sm ${
                    onlineUsers[currentChat?.email]
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {onlineUsers[currentChat?.email] ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          {currentChat ? (
            <>
              <div
                className="flex-grow h-[540px] overflow-y-auto p-4 mb-10"
                style={{ display: "flex", flexDirection: "column-reverse" }}
              >
                <div ref={messagesEndRef} />
                {messages
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((msg, index) => (
                    <div key={index}>
                      {((msg.sender === currentUser?.email &&
                        msg.recipient === currentChat?.email) ||
                        (msg.recipient === currentUser?.email &&
                          msg.sender === currentChat?.email)) && (
                        <div
                          key={msg._id || index}
                          className={`mb-4 ${
                            msg.sender === currentUser?.email
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          <div className="relative group inline-block">
                            {msg.sender === currentUser?.email && (
                              <button
                                onClick={() => deleteMessage(msg._id)}
                                className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
                                title="Delete message"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-500 hover:text-red-700"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                            <div
                              className={`p-3 rounded-lg ${
                                msg.sender === currentUser?.email
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {/* {new Date(msg.timestamp).toLocaleTimeString()} */}
                              {moment(msg?.timestamp).format("DD MMMM YYYY, h:mm A")}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <MessageInput
                currentChat={currentChat}
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
      <div className="md:hidden mt-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-black rounded-lg"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 w-3/4 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Search Header */}
        <div className="flex justify-between items-center m-4 mt-8">
          <h3 className="font-bold">Messages</h3>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-137px)]">
          <MessageList
            onChatSelect={handleChatSelect}
            userData={
              currentUser?.role === "owner"
                ? tenantDataByOwner?.data?.map((user) => ({
                    ...user,
                    hasUnread: Boolean(unreadMessages[user.email]),
                    lastMessage: lastMessages[user.email],
                    isOnline: onlineUsers[user.email] || false,
                    unreadCount: unreadMessages[user.email] || 0,
                  }))
                : currentUser?.role === "tenant"
                ? eachTenantSameProperAllTenant?.data?.map((user) => ({
                    ...user,
                    hasUnread: Boolean(unreadMessages[user.email]),
                    lastMessage: lastMessages[user.email],
                    isOnline: onlineUsers[user.email] || false,
                    unreadCount: unreadMessages[user.email] || 0,
                  }))
                : userData?.data?.map((user) => ({
                    ...user,
                    hasUnread: Boolean(unreadMessages[user.email]),
                    lastMessage: lastMessages[user.email],
                    isOnline: onlineUsers[user.email] || false,
                    unreadCount: unreadMessages[user.email] || 0,
                  }))
            }
            currentUser={currentUser?.email}
          />
        </div>
      </div>
      <div className="md:hidden mt-4 bg-white rounded-lg  h-[660px] p-4 relative">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
          {currentChat?.profileImage ? (
                  <img
                    src={`${url}${currentChat?.profileImage}`}
                    alt={currentChat?.name?.slice(0, 2).toUpperCase()}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">
                      {currentChat?.name?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
            <div>
              <h3 className="font-semibold">
                {currentChat?.name || "Select a chat"}
              </h3>
              <span
                className={`text-sm ${
                  onlineUsers[currentChat?.email]
                    ? "text-green-500"
                    : "text-gray-500"
                }`}
              >
                {onlineUsers[currentChat?.email] ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        {currentChat ? (
          <>
            <div
              className="flex-grow h-[540px] overflow-y-auto p-4 mb-10 pb-10"
              style={{ display: "flex", flexDirection: "column-reverse" }}
            >
              <div ref={messagesEndRef} />
              {messages
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((msg, index) => (
                  <div key={index}>
                    {((msg.sender === currentUser?.email &&
                      msg.recipient === currentChat?.email) ||
                      (msg.recipient === currentUser?.email &&
                        msg.sender === currentChat?.email)) && (
                      <div
                        key={msg._id || index}
                        className={`mb-4 ${
                          msg.sender === currentUser?.email
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        <div className="relative group inline-block">
                          {msg.sender === currentUser?.email && (
                            <button
                              onClick={() => deleteMessage(msg._id)}
                              className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
                              title="Delete message"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-red-500 hover:text-red-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              msg.sender === currentUser?.email
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <MessageInput
              currentChat={currentChat}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
