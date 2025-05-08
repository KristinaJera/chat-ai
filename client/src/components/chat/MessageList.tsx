import React from "react";
import type { Message } from "../../types/message";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  onEdit(id: string): void;
  onDelete(id: string): void;
  onTranslate(id: string): void;
  onReply(id: string): void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  onEdit,
  onDelete,
  onTranslate,
  onReply,
}) => (
  <div className="space-y-4">
    {messages.map((m) => (
      <MessageItem
        key={m._id}
        message={m}
        currentUser={currentUser}
        original={m.replyTo ? messages.find((x) => x._id === m.replyTo) : undefined}
        onEdit={onEdit}
        onDelete={onDelete}
        onTranslate={onTranslate}
        onReply={onReply}
      />
    ))}
  </div>
);
