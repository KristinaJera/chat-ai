import React from "react";

interface Props {
  typingUsers: Set<string>;
}

export const TypingFooter: React.FC<Props> = ({ typingUsers }) => {
  if (typingUsers.size === 0) return null;
  const list = Array.from(typingUsers).join(", ");
  return (
    <div className="px-4 pb-2 text-sm italic text-gray-500">
      {list} {typingUsers.size > 1 ? "are" : "is"} typing…
    </div>
  );
};
