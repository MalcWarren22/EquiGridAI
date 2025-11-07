import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download, Trash2, Plus, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Template {
  id: number;
  name: string;
  originalFilename: string;
  fileSize: number;
  placeholders: string[];
  uploadedAt: string;
  lastUsedAt: string | null;
}

export default function Reports() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: templates = [], refetch } = useQuery<Template[]>({
    queryKey: ["/api/reports/templates"],
    staleTime: 30000,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; name: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("name", data.name);

      const response = await fetch("/api/reports/templates", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports/templates"] });
      toast({
        title: "Template uploaded",
        description: "Your template has been saved successfully",
      });
      setSelectedFile(null);
      setTemplateName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/reports/templates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Delete failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports/templates"] });
      toast({
        title: "Template deleted",
        description: "The template has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (!files[0].name.endsWith(".docx")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .docx file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !templateName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a template name",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync({ file: selectedFile, name: templateName });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateReport = async (templateId: number) => {
    setIsGenerating(true);
    setSelectedTemplate(templateId);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `report_${Date.now()}.docx`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report generated",
        description: "Your report has been downloaded",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/reports/templates"] });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setSelectedTemplate(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2" data-testid="text-reports-title">
        Custom Report Templates
      </h1>
      <p className="text-muted-foreground mb-8">
        Upload DOCX templates with placeholders and generate personalized reports
      </p>

      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Upload New Template</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., ESG Report 2025"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              data-testid="input-template-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">DOCX File</Label>
            <div className="flex gap-2">
              <Input
                id="file-input"
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                data-testid="input-template-file"
                className="flex-1"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Use placeholders like {'{{company_name}}'}, {'{{total_cost}}'}, {'{{carbon_savings}}'}
            </p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !templateName.trim()}
            data-testid="button-upload-template"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Saved Templates</h2>

        {templates.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No templates uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a DOCX template to get started
            </p>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="p-4" data-testid={`template-${template.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-10 w-10 text-primary mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1" data-testid="text-template-name">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.originalFilename} • {formatFileSize(template.fileSize)}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.placeholders.slice(0, 5).map((placeholder) => (
                        <code
                          key={placeholder}
                          className="text-xs px-2 py-1 rounded bg-muted"
                          data-testid="text-placeholder"
                        >
                          {`{{${placeholder}}}`}
                        </code>
                      ))}
                      {template.placeholders.length > 5 && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          +{template.placeholders.length - 5} more
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(template.uploadedAt).toLocaleDateString()}
                      {template.lastUsedAt &&
                        ` • Last used ${new Date(template.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleGenerateReport(template.id)}
                    disabled={isGenerating}
                    data-testid="button-generate-report"
                  >
                    {isGenerating && selectedTemplate === template.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(template.id)}
                    disabled={deleteMutation.isPending}
                    data-testid="button-delete-template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
