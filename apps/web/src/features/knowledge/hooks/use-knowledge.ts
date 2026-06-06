"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { chatSchema, type ChatFormValues } from "../schemas/chat.schema";
import { askChatbot, listKnowledge } from "../services/knowledge.service";
import { useChatStore } from "../stores/use-chat-store";

export function useKnowledge() {
  return useQuery({
    queryKey: ["knowledge"],
    queryFn: listKnowledge,
  });
}

export function useChatbot() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: { question: "" },
  });

  const mutation = useMutation({
    mutationFn: askChatbot,
    onSuccess: (answer) => {
      addMessage({ id: crypto.randomUUID(), role: "assistant", content: answer.answer });
      form.reset();
    },
  });

  return {
    form,
    messages,
    isLoading: mutation.isPending,
    errorMessage: mutation.error instanceof Error ? mutation.error.message : "",
    onSubmit: form.handleSubmit((values) => {
      addMessage({ id: crypto.randomUUID(), role: "user", content: values.question });
      mutation.mutate(values.question);
    }),
  };
}
