"use client";

import React, { useState, useEffect } from "react";
import { ModelProviderConfig } from "@/types/model";
import { getStoredModels, saveStoredModels } from "@/lib/storage";
import { Cpu, Key, ShieldCheck, Check, Plus, Globe, Sliders, ToggleLeft, ToggleRight } from "lucide-react";

export function ModelManager() {
  const [models, setModels] = useState<ModelProviderConfig[]>([]);
  const [geminiKeyConfigured, setGeminiKeyConfigured] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // New custom model form state
  const [newModelName, setNewModelName] = useState("");
  const [newEndpoint, setNewEndpoint] = useState("https://api.custom-model.internal/v1");
  const [newApiKey, setNewApiKey] = useState("");
  const [newModality, setNewModality] = useState<"multimodal" | "image" | "text">("multimodal");

  useEffect(() => {
    // Fetch models and server secret status from /api/models
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.models) {
          setModels(data.models);
          setGeminiKeyConfigured(data.geminiKeyConfigured);
        } else {
          setModels(getStoredModels());
        }
      })
      .catch(() => {
        setModels(getStoredModels());
      });
  }, []);

  const handleToggleModel = (id: string) => {
    const updated = models.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    setModels(updated);
    saveStoredModels(updated);
  };

  const handleCreateCustomModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;

    const customConfig: Partial<ModelProviderConfig> = {
      id: `custom_${Date.now()}`,
      name: newModelName,
      provider: "custom-endpoint",
      modelName: newModelName.toLowerCase().replace(/\s+/g, "-"),
      modality: newModality,
      contextWindow: 32768,
      maxOutputTokens: 4096,
      supportsImageInput: true,
      supportsImageOutput: newModality !== "text",
      supportsStreaming: false,
      enabled: true,
      isCustom: true,
      customEndpoint: newEndpoint,
    };

    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelConfig: customConfig,
          apiKey: newApiKey,
        }),
      });
      const data = await res.json();
      if (data.model) {
        const nextModels = [...models, data.model];
        setModels(nextModels);
        saveStoredModels(nextModels);
        setIsAddingCustom(false);
        setNewModelName("");
        setNewApiKey("");
      }
    } catch (e) {
      console.error("Failed to add model", e);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto text-[#171717] bg-[#FAF8F5] text-xs">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D8D3CA] mb-6">
        <div>
          <h1 className="font-serif font-black text-xl text-[#171717] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#B84A39]" />
            AI Model Registry & Custom Gateway
          </h1>
          <p className="text-xs text-[#77736C] mt-0.5">
            Manage official Google Gemini multimodal reasoning models and configure custom server-side endpoints.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCustom(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Model</span>
        </button>
      </div>

      {/* Server Security Status */}
      <div className="bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg p-4 mb-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FAF6ED] border border-[#D8D3CA] flex items-center justify-center text-[#B84A39]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-[#171717]">Server-Side Secret Isolation</div>
            <div className="text-[11px] text-[#77736C]">
              All API keys remain securely guarded on the server-side AI gateway and are never sent to the browser.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Gateway: Active & Ready
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="space-y-3">
        <div className="font-bold text-xs text-[#171717] uppercase tracking-wider">
          Available Models in Registry
        </div>

        {models.map((model) => (
          <div
            key={model.id}
            className={`p-4 rounded-lg border transition-all ${
              model.enabled
                ? "bg-[#FFFFFF] border-[#D8D3CA] shadow-xs"
                : "bg-[#EBE6DE]/40 border-[#D8D3CA] opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-[#171717]">{model.name}</span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 rounded bg-[#FAF6ED] border border-[#D8D3CA] text-[#B84A39]">
                    {model.provider}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#EBE6DE] text-[#77736C] capitalize">
                    {model.modality}
                  </span>
                </div>
                <div className="text-[11px] text-[#77736C] font-mono" suppressHydrationWarning>
                  Identifier: {model.modelName} • Context: {model.contextWindow.toLocaleString("en-US")} tokens
                </div>
              </div>

              <button
                onClick={() => handleToggleModel(model.id)}
                className="text-xs font-semibold cursor-pointer p-1"
                title={model.enabled ? "Disable model" : "Enable model"}
              >
                {model.enabled ? (
                  <span className="text-[#2D6A4F] flex items-center gap-1 font-sans">
                    <Check className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-[#77736C] font-sans">Disabled</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Model Modal */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#171717] rounded-lg p-6 max-w-md w-full shadow-editorial space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D3CA]">
              <h3 className="font-serif font-bold text-sm text-[#171717]">Configure Custom AI Endpoint</h3>
              <button
                onClick={() => setIsAddingCustom(false)}
                className="text-sm text-[#77736C] hover:text-[#171717]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomModel} className="space-y-3">
              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="e.g. Fine-Tuned Manga Diffusion XL"
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">API Key / Bearer Secret</label>
                <input
                  type="password"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Stored safely on server only"
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Modality</label>
                <select
                  value={newModality}
                  onChange={(e) => setNewModality(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                >
                  <option value="multimodal">Multimodal (Text + Vision + Image)</option>
                  <option value="image">Image Generation Only</option>
                  <option value="text">Story Reasoning Only</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D3CA]">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-3 py-1.5 rounded text-[#77736C] hover:text-[#171717]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#171717] text-[#FAF8F5] font-semibold"
                >
                  Register Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
