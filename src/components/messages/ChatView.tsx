
import React, { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ArrowLeft, Send } from "lucide-react";

const ChatView = ({ 
  userId, 
  partnerId, 
  partnerName, 
  partnerAvatar, 
  onBack 
}) => {
  const { messages, isLoading, isSending, sendTextMessage } = useChat({
    userId,
    partnerId,
  });
  const [input, setInput] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() && !isSending) {
      const sent = await sendTextMessage(input);
      if (sent) setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-900 p-2 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={partnerAvatar} />
            <AvatarFallback>{partnerName?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{partnerName}</h3>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  msg.sender_id === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div>{msg.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.sender_id === userId
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(new Date(msg.created_at), "p")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-2 border-t flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none"
          disabled={isSending}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isSending}
          className="rounded-l-none"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatView;
