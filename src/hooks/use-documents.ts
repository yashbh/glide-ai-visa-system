import { useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { Document } from "../types";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Standard document names that the LLM asks for
const DOC_TYPE_MAP: Record<string, string> = {
  passport: "Passport",
  "passport photo": "Passport Photo",
  "bank statement": "Bank Statement",
  "salary slip": "Salary Slip",
  itr: "ITR",
  "income tax return": "ITR",
  "travel insurance": "Travel Insurance",
  "flight booking": "Flight Booking",
  "hotel booking": "Hotel Booking",
  "accommodation": "Hotel Booking",
  "employment letter": "Employment Letter",
  "leave approval": "Leave Approval",
  "cover letter": "Cover Letter",
  itinerary: "Travel Itinerary",
  noc: "No Objection Certificate",
};

export function detectDocType(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [keyword, docType] of Object.entries(DOC_TYPE_MAP)) {
    if (lower.includes(keyword)) {
      return docType;
    }
  }
  return null;
}

export function detectTravelerName(message: string, knownNames: string[]): string | null {
  const lower = message.toLowerCase();
  for (const name of knownNames) {
    if (lower.includes(name.toLowerCase())) {
      return name;
    }
  }
  // Check common patterns
  if (lower.includes("my wife") || lower.includes("my spouse")) return "__spouse__";
  if (lower.includes("my husband")) return "__spouse__";
  if (lower.includes("my child") || lower.includes("my kid") || lower.includes("my son") || lower.includes("my daughter")) return "__child__";
  if (lower.includes("my ") && lower.includes("passport")) return "__self__";
  if (lower.includes("mine")) return "__self__";
  return null;
}

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
    options?: { travelerName?: string; docType?: string }
  ): Promise<UploadResult> => {
    const validationError = validateFile(file);
    if (validationError) {
      return { document: null, error: validationError };
    }

    setIsUploading(true);

    try {
      const travelerName = options?.travelerName || null;
      const docType = options?.docType || null;

      // Build standardized filename: {DocType}.{ext} or original name
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const standardTitle = docType || file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
      const standardFileName = docType
        ? `${docType.replace(/\s+/g, "_")}.${fileExt}`
        : file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      // Storage path: {userId}/{country}/{travelerName}/{filename}
      const folderName = travelerName || "General";
      const timestamp = Date.now();
      const storagePath = `${userId}/${country}/${folderName}/${timestamp}_${standardFileName}`;

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

      const { data: docRecord, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          country,
          title: standardTitle,
          file_name: standardFileName,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          status: "uploaded",
          traveler_name: travelerName,
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
