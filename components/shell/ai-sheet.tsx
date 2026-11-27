"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, SendHorizontal, Sparkles } from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Pill } from "@/components/common/display";
import { MessageSkeleton } from "@/components/common/skeletons";
import type { AIAsk } from "@/lib/api/endpoints";
import { useAIAsk, useAIGreeting } from "@/lib/api/queries";
import { useUI, type AIRequest } from "@/lib/stores/ui";

type Msg = { id: string; who: "ai" | "user"; text: string; error?: boolean };

let nextId = 0;
const msg = (who: Msg["who"], text: string, error?: boolean): Msg => ({ id: `m${++nextId}`, who, text, error });

/** Mounts the ProspevaAI sheet from the UI store. */
export function AISheetHost() {
  const ai = useUI((s) => s.ai);
  const setAIOpen = useUI((s) => s.setAIOpen);
  // Re-keyed per openAI() call so the conversation and initial question reset.
  return <AISheet key={ai.id} open={ai.open} request={ai.request} onOpenChange={setAIOpen} />;
}

/** AI messages: bot avatar + muted bubble. User messages: primary bubble on the right. */
function ChatMessage({ who, error, children }: { who: Msg["who"]; error?: boolean; children: React.ReactNode }) {
  if (who === "user")
    return (
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent className="whitespace-pre-wrap">{children}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  return (
    <Message>
      <MessageAvatar className="size-8 self-start bg-[#f1ecff] text-[#6b46d5]" aria-hidden="true">
        <Bot className="size-4" />
      </MessageAvatar>
      <MessageContent>
        <Bubble variant={error ? "destructive" : "muted"}>
          <BubbleContent className="whitespace-pre-wrap">{children}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

function AISheet({ open, request, onOpenChange }: { open: boolean; request?: AIRequest; onOpenChange: (o: boolean) => void }) {
  const greeting = useAIGreeting(open);
  const ask = useAIAsk();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const send = (body: AIAsk, shown: string) => {
    setMessages((m) => [...m, msg("user", shown)]);
    ask.mutate(body, {
      onSuccess: (r) => setMessages((m) => [...m, msg("ai", r.answer || "No answer returned.")]),
      onError: (e) => setMessages((m) => [...m, msg("ai", e.message, true)]),
    });
  };

  // Ask the initial request once, when the sheet opens with one.
  const askedInitial = useRef(false);
  useEffect(() => {
    if (!open || askedInitial.current || !request || (!request.prompt && !request.capability)) return;
    askedInitial.current = true;
    const { label, ...body } = request;
    send(body, label || body.prompt || body.capability || "");
    // `send` is recreated each render; this effect must only fire once per sheet instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, request]);

  const submit = (text: string) => {
    if (!text.trim() || ask.isPending) return;
    setInput("");
    send({ prompt: text.trim() }, text.trim());
  };
  const g = greeting.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="ai-sheet gap-0">
        <SheetHeader>
          <SheetTitle>
            <Sparkles size={18} aria-hidden="true" />
            ProspevaAI Control Copilot
          </SheetTitle>
          <SheetDescription>{g?.disclaimer ?? "Analyzes permitted data. It cannot approve or release funds."}</SheetDescription>
        </SheetHeader>
        {g && (
          <div className="ai-scope">
            {g.badges.role && <Pill tone="blue">Role: {g.badges.role}</Pill>}
            {g.badges.scope && <Pill>Scope: {g.badges.scope}</Pill>}
            {g.badges.accessLabel && <Pill tone="green">{g.badges.accessLabel}</Pill>}
          </div>
        )}
        {g && (
          <div className="ai-prompts">
            {g.quickPrompts.map((p) => (
              <Button key={p} variant="outline" size="sm" className="h-auto whitespace-normal" disabled={ask.isPending} onClick={() => submit(p)}>
                {p}
              </Button>
            ))}
          </div>
        )}
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="mt-3 flex-1 border-t border-border">
            <MessageScrollerViewport aria-label="Conversation with ProspevaAI">
              <MessageScrollerContent className="gap-4 p-4">
                {open && greeting.isPending && <MessageSkeleton label="Connecting to ProspevaAI…" />}
                {greeting.error && (
                  <ChatMessage who="ai" error>
                    {greeting.error.message}
                  </ChatMessage>
                )}
                {g && (
                  <MessageScrollerItem messageId="greeting">
                    <ChatMessage who="ai">{g.message}</ChatMessage>
                  </MessageScrollerItem>
                )}
                {messages.map((m) => (
                  <MessageScrollerItem key={m.id} messageId={m.id} scrollAnchor={m.who === "user"}>
                    <ChatMessage who={m.who} error={m.error}>
                      {m.text}
                    </ChatMessage>
                  </MessageScrollerItem>
                ))}
                {ask.isPending && (
                  <MessageScrollerItem messageId="thinking">
                    <MessageSkeleton label="ProspevaAI is thinking…" />
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
        <form
          className="ai-compose"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <InputGroup className="h-10">
            <InputGroupInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={ask.isPending}
              aria-label="Message ProspevaAI"
              placeholder={g?.inputPlaceholder ?? "Ask about operations, risk, rails or cases…"}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="submit" variant="default" size="sm" disabled={ask.isPending || !input.trim()}>
                {ask.isPending ? <Spinner /> : <SendHorizontal aria-hidden="true" />}
                {ask.isPending ? "Sending…" : "Send"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </SheetContent>
    </Sheet>
  );
}
