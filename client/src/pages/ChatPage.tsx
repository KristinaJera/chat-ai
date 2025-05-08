
// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useMessages } from "../hooks/useMessages";
// import { useTyping } from "../hooks/useTyping";
// import { MessageList } from "../components/chat/MessageList";
// import { Composer } from "../components/chat/Composer";
// import { TypingFooter } from "../components/chat/TypingFooter";
// import { User } from "../hooks/useAuth";
// import { deleteChat } from "../api/chats";

// interface ChatPageProps {
//   user: User;
// }

// export default function ChatPage({ user }: ChatPageProps) {
//   const { id: chatIdParam } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const chatId = chatIdParam ?? "";
//   // const username = user.name;
//   const currentUserId   = user.id;  
//   // Initialize hooks with chatId
//   const { messages, send, edit, remove } = useMessages(chatId, currentUserId);
//   const { typingUsers, onInput } = useTyping(chatId, currentUserId);
//   const [replyTo, setReplyTo] = useState<string | null>(null);

//   if (!chatIdParam) {
//     return <div>Loading chat...</div>;
//   }

//   const handleEdit = (id: string) => {
//     const orig = messages.find((m) => m._id === id)?.body ?? "";
//     const body = prompt("Edit message:", orig);
//     if (body !== null) edit(id, body);
//   };

//   const handleDelete = (id: string) => {
//     if (confirm("Delete this message?")) remove(id);
//   };

//   const handleTranslate = (id: string) => {
//     const msg = messages.find((m) => m._id === id);
//     if (!msg) return;
//     const url =
//       "https://translate.google.com/?sl=auto&tl=en&text=" +
//       encodeURIComponent(msg.body);
//     window.open(url, "_blank");
//   };

//   const handleReply = (id: string) => setReplyTo(id);

//   return (
//     <div className="h-screen flex flex-col bg-gray-100">
// <header className="p-4 bg-white shadow flex justify-between items-center">
//   <h3 className="text-xl font-bold">🗨️ Chat — {user.name}</h3>
//   <button
//     onClick={async () => {
//       if (!confirm('Delete this chat for everyone?')) return;
//       try {
//         await deleteChat(chatId);
//         navigate('/');
//       } catch (e) {
//         alert(`Error: ${e instanceof Error ? e.message : e}`);
//       }
//     }}
//     className="text-red-600 hover:text-red-800"
//   >
//     Delete Chat
//   </button>
// </header>


//       <main className="flex-1 p-4 space-y-2 overflow-y-auto">
//         <MessageList
//           messages={messages}
//           currentUser={currentUserId}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//           onTranslate={handleTranslate}
//           onReply={handleReply}
//         />
//       </main>

//       <TypingFooter typingUsers={typingUsers} />

//       <footer className="p-4 bg-white shadow">
//         {replyTo && (
//           <div className="mb-2 p-2 bg-yellow-200 rounded flex justify-between items-center">
//             <span>
//               Replying to:{" "}
//               {messages.find((m) => m._id === replyTo)?.body}
//             </span>
//             <button
//               className="ml-2 text-red-500"
//               onClick={() => setReplyTo(null)}
//             >
//               ✕
//             </button>
//           </div>
//         )}
//         <Composer
//           draftPlaceholder={
//             replyTo ? "Type your reply…" : "Type a message…"
//           }
//           onInput={onInput}
//           onSend={(body) => {
//             send(body, replyTo ?? undefined);
//             setReplyTo(null);
//           }}
//         />
//       </footer>
//     </div>
//   );
// }

// // src/pages/ChatPage.tsx
// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useMessages } from "../hooks/useMessages";
// import { useTyping } from "../hooks/useTyping";
// import { MessageList } from "../components/chat/MessageList";
// import { Composer } from "../components/chat/Composer";
// import { TypingFooter } from "../components/chat/TypingFooter";
// import { User } from "../hooks/useAuth";
// import { deleteChat } from "../api/chats";

// interface ChatPageProps {
//   user: User;
// }

// export default function ChatPage({ user }: ChatPageProps) {
//   const { id: chatIdParam } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const chatId = chatIdParam ?? "";
//   const currentUserId = user.id;

//   // Hooks
//   const { messages, send, edit, remove } = useMessages(chatId, currentUserId);
//   const { typingUsers, onInput } = useTyping(chatId, currentUserId);
//   const [replyTo, setReplyTo] = useState<string | null>(null);

//   if (!chatIdParam) return <div>Loading chat...</div>;

//   // Handlers
//   const handleEdit = (id: string) => {
//     const orig = messages.find((m) => m._id === id)?.body ?? "";
//     const body = prompt("Edit message:", orig);
//     if (body !== null) edit(id, body);
//   };

//   const handleDelete = (id: string) => {
//     if (confirm("Delete this message?")) remove(id);
//   };

//   const handleTranslate = (id: string) => {
//     const msg = messages.find((m) => m._id === id);
//     if (!msg) return;
//     const url =
//       "https://translate.google.com/?sl=auto&tl=en&text=" +
//       encodeURIComponent(msg.body);
//     window.open(url, "_blank");
//   };

//   const handleReply = (id: string) => setReplyTo(id);

//   // File-attach handler
//   const handleAttach = (file: File) => {
//     // TODO: implement your upload logic, then send URL as a message
//     console.log("Attach file:", file);
//   };

//   return (
//     <div className="h-screen flex flex-col bg-gray-100">
//       <header className="p-4 bg-white shadow flex justify-between items-center">
//         <h3 className="text-xl font-bold">🗨️ Chat — {user.name}</h3>
//         <button
//           onClick={async () => {
//             if (!confirm("Delete this chat for everyone?")) return;
//             try {
//               await deleteChat(chatId);
//               navigate("/");
//             } catch (e) {
//               alert(`Error: ${e instanceof Error ? e.message : e}`);
//             }
//           }}
//           className="text-red-600 hover:text-red-800"
//         >
//           Delete Chat
//         </button>
//       </header>

//       <main className="flex-1 p-4 space-y-2 overflow-y-auto">
//         <MessageList
//           messages={messages}
//           currentUser={currentUserId}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//           onTranslate={handleTranslate}
//           onReply={handleReply}
//         />
//       </main>

//       <TypingFooter typingUsers={typingUsers} />

//       <footer className="p-4 bg-white shadow">
//         {replyTo && (
//           <div className="mb-2 p-2 bg-yellow-200 rounded flex justify-between items-center">
//             <span>
//               Replying to: {messages.find((m) => m._id === replyTo)?.body}
//             </span>
//             <button
//               className="ml-2 text-red-500"
//               onClick={() => setReplyTo(null)}
//             >
//               ✕
//             </button>
//           </div>
//         )}
//         <Composer
//           draftPlaceholder={replyTo ? "Type your reply…" : "Type a message…"}
//           onInput={onInput}
//           onSend={(body) => {
//             send(body, replyTo ?? undefined);
//             setReplyTo(null);
//           }}
//           onAttach={handleAttach}
//         />
//       </footer>
//     </div>
// );
//  }
// src/pages/ChatPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../hooks/useAuth';
import { NavBar } from '../components/NavBar';
import { useMessages } from '../hooks/useMessages';
import { useTyping } from '../hooks/useTyping';
import { MessageList } from '../components/chat/MessageList';
import { Composer } from '../components/chat/Composer';
import { TypingFooter } from '../components/chat/TypingFooter';
import { FiTrash2 } from 'react-icons/fi';
import { deleteChat } from '../api/chats';

interface ChatPageProps {
  user: User;
}

export default function ChatPage({ user }: ChatPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chatId = id || '';
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { messages, send, edit, remove } = useMessages(chatId, user.id);
  const { typingUsers, onInput } = useTyping(chatId, user.id);

  const handleLogout = () =>
    fetch('http://localhost:3001/auth/logout', { credentials: 'include' })
      .finally(() => window.location.reload());

  const handleDeleteChat = async () => {
    if (!confirm('Delete this chat?')) return;
    try {
      await deleteChat(chatId);
      navigate('/contacts');
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen overflow-hidden md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
        <NavBar userName={user.name} onLogout={handleLogout} />

        <header className="flex items-center justify-between p-4 bg-white shadow">
          <h3 className="text-xl font-bold">🗨️ Chat — {user.name}</h3>
          <button onClick={handleDeleteChat} className="text-red-600 hover:text-red-800">
            <FiTrash2 size={20} />
          </button>
        </header>

        <main className="flex-1 p-4 space-y-2 overflow-y-auto">
          <MessageList
            messages={messages}
            currentUser={user.id}
            onEdit={msgId => {
              const orig = messages.find(m => m._id === msgId)?.body || '';
              const body = prompt('Edit message:', orig);
              if (body !== null) edit(msgId, body);
            }}
            onDelete={msgId => {
              if (confirm('Delete this message?')) remove(msgId);
            }}
            onTranslate={msgId => {
              const m = messages.find(m => m._id === msgId);
              if (!m) return;
              window.open(
                'https://translate.google.com/?sl=auto&tl=en&text=' +
                  encodeURIComponent(m.body),
                '_blank'
              );
            }}
            onReply={setReplyTo}
          />
        </main>

        <TypingFooter typingUsers={typingUsers} />

        <footer className="p-4 bg-white shadow">
          {replyTo && (
            <div className="mb-2 p-2 bg-yellow-100 rounded flex justify-between items-center text-sm">
              <span className="truncate">
                Replying to: {messages.find(m => m._id === replyTo)?.body}
              </span>
              <button className="ml-2 text-red-500" onClick={() => setReplyTo(null)}>
                ✕
              </button>
            </div>
          )}
          <Composer
            draftPlaceholder={replyTo ? 'Type your reply…' : 'Type a message…'}
            onInput={onInput}
            onSend={body => {
              send(body, replyTo ?? undefined);
              setReplyTo(null);
            }}
            onAttach={file => console.log('Attach:', file)}
          />
        </footer>
      </div>
    </div>
  );
}
