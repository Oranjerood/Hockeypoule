"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Send, MessageCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { initials } from "@/lib/utils";
import type { User } from "@/types";

export default function ChatTab({ poolId, members }: { poolId: string; members: User[] }) {
  const locale = useLocale();
  const t = useTranslations("Common");
  const currentUser = useAppStore((s) => s.currentUser());
  const chatMessages = useAppStore((s) => s.chatMessages);
  const sendChatMessage = useAppStore((s) => s.sendChatMessage);

  const [text, setText] = useState("");

  const poolMessages = chatMessages
    .filter((m) => m.poolId === poolId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  function handleSend() {
    if (!text.trim()) return;
    sendChatMessage(poolId, text);
    setText("");
  }

  return (
    <div className="flex h-[28rem] flex-col rounded-2xl border border-border">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <MessageCircle size={16} className="text-primary" />
        <span className="text-sm font-semibold">{t("chat")}</span>
        <span className="text-xs text-muted">{t("chatVisibility")}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {poolMessages.length === 0 ? (
          <p className="text-sm text-muted">{t("chatEmpty")}</p>
        ) : (
          poolMessages.map((message) => {
            const author = members.find((u) => u.id === message.userId);
            const isMe = message.userId === currentUser?.id;
            return (
              <div key={message.id} className={`flex gap-2 ${isMe ? "flex-row-reverse text-right" : ""}`}>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: author?.avatarColor ?? "#94a3b8" }}
                >
                  {author ? initials(author.name) : "?"}
                </span>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-primary/10" : "bg-background"}`}>
                  <p className="text-xs font-medium text-muted">{author?.name ?? t("chatUnknown")}</p>
                  <p className="mt-0.5">{message.text}</p>
                  <p className="mt-1 text-[10px] text-muted">
                    {new Date(message.createdAt).toLocaleTimeString(locale === "en" ? "en-GB" : "nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("chatPlaceholder")}
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm"
        />
        <button
          onClick={handleSend}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label={t("chatSend")}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
