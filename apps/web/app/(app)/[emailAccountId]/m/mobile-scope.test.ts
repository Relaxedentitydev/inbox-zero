import { describe, expect, it } from "vitest";
import {
  mobileScopeToThreadsQuery,
  parseMobileScope,
} from "@/app/(app)/[emailAccountId]/m/mobile-scope";

describe("parseMobileScope", () => {
  it("prefers label over folder and type", () => {
    expect(
      parseMobileScope({
        type: "sent",
        labelId: "Label_1",
        folderId: "folder-1",
      }),
    ).toEqual({ kind: "label", id: "Label_1" });
  });

  it("defaults to inbox", () => {
    expect(
      parseMobileScope({ type: null, labelId: null, folderId: null }),
    ).toEqual({ kind: "type", type: "inbox" });
  });
});

describe("mobileScopeToThreadsQuery", () => {
  it("maps system types through mailTypeToThreadsQuery", () => {
    expect(mobileScopeToThreadsQuery({ kind: "type", type: "sent" })).toEqual({
      type: "sent",
    });
  });

  it("maps labels and folders", () => {
    expect(mobileScopeToThreadsQuery({ kind: "label", id: "Label_1" })).toEqual(
      { labelId: "Label_1" },
    );
    expect(
      mobileScopeToThreadsQuery({ kind: "folder", id: "folder-1" }),
    ).toEqual({ folderId: "folder-1" });
  });
});
