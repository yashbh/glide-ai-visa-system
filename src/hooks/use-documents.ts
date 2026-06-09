import { useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { Document } from "../types";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadResult {
  document: Document | null;
  error: string | null;
}

export function validateFile(file: File): string | null {
  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
    return `Invalid file type. Allowed: PDF, JPEG, PNG. Got: ${file.type || extension}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum 10MB. Got: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}

export function useDocuments(userId: string, country: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchDocuments = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setDocuments(data as Document[]);
    }
  }, [userId]);

  const fetchOnce = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    await fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (
    file: File,
    conversationId: string | null,
    title?: string
  ): Promise<UploadResult> => {
    const validationError = validateFile(file);
    if (validationError) {
      return { document: null, error: validationError };
    }

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${userId}/${country}/${timestamp}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setIsUploading(false);
        return { document: null, error: `Upload failed: ${uploadError.message}` };
      }

      const docTitle = title || file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");

      const { data: docRecord, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          country,
          title: docTitle,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          status: "uploaded",
        })
        .select()
        .single();

      if (dbError) {
        setIsUploading(false);
        return { document: null, error: `Failed to save record: ${dbError.message}` };
      }

      const newDoc = docRecord as Document;
      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      return { document: newDoc, error: null };
    } catch (err: any) {
      setIsUploading(false);
      return { document: null, error: err.message };
    }
  }, [userId, country]);

  const getPublicUrl = useCallback((storagePath: string): string => {
    const { data } = supabase.storage.from("documents").getPublicUrl(storagePath);
    return data.publicUrl;
  }, []);

  const deleteDocument = useCallback(async (doc: Document) => {
    await supabase.storage.from("documents").remove([doc.storage_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }, []);

  return {
    documents,
    isUploading,
    fetchDocuments,
    fetchOnce,
    uploadDocument,
    getPublicUrl,
    deleteDocument,
  };
}
