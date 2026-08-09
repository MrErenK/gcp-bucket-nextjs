"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InfoIcon,
  FileManagerIcon,
  UploadIcon,
  AlertIcon,
} from "@/components/ui/Icons";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Separator } from "@/components/ui/seperator";

interface ContentItem {
  subtitle: string;
  description: string;
  steps?: string[];
  details?: string[];
  features?: string[];
  notes?: string[];
  content?: React.ReactNode;
}

interface Section {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: ContentItem[];
}

export default function InfoPage() {
  const sections: Section[] = [
    {
      title: "File Upload Methods",
      icon: UploadIcon,
      content: [
        {
          subtitle: "Upload Methods",
          description: "How to upload files to the platform",
          content: (
            <div className="space-y-4">
              <Card className="bg-accent p-4">
                <h5 className="font-medium mb-2">Direct Link Upload</h5>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Go to the main page</li>
                  <li>Paste a direct download URL into the input field</li>
                  <li>Click &quot;Upload from Link&quot;</li>
                  <li>Wait for the server to fetch and store the file</li>
                </ol>
              </Card>
            </div>
          ),
        },
        {
          subtitle: "File Requirements",
          description: "Requirements and limitations for file uploads",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-accent p-4">
                <h5 className="font-medium mb-2">Size Limits</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Minimum size: 1MB</li>
                  <li>• Maximum size: 5GB</li>
                </ul>
              </Card>
              <Card className="bg-accent p-4">
                <h5 className="font-medium mb-2">Supported Types</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Archive files (.zip, .rar, etc.)</li>
                  <li>• Binary files</li>
                  <li>• System images</li>
                </ul>
              </Card>
              <Card className="bg-accent p-4">
                <h5 className="font-medium mb-2">Restrictions</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• No audio files</li>
                  <li>• No video files</li>
                  <li>• No text files</li>
                </ul>
              </Card>
            </div>
          ),
        },
      ],
    },
    {
      title: "File Restrictions",
      icon: AlertIcon,
      content: [
        {
          subtitle: "Size Limitations",
          description: "File size requirements and limits",
          details: [
            "Minimum size: 1MB",
            "Maximum size: 5GB",
            "Files outside these limits will be rejected",
          ],
        },
        {
          subtitle: "Forbidden File Types",
          description: "Types of files that cannot be uploaded",
          details: [
            "Audio files (all audio formats)",
            "Video files (all video formats)",
            "Text files (including documents)",
          ],
          notes: [
            "These restrictions are strictly enforced",
            "Attempts to upload forbidden file types will be rejected",
          ],
        },
      ],
    },
    {
      title: "API Endpoints",
      icon: FileManagerIcon,
      content: [
        {
          subtitle: "Available Endpoints",
          description: "REST API endpoints for file operations",
          content: (
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-accent p-4">
                <h5 className="font-medium mb-2">Upload</h5>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <code className="bg-card px-2 py-1 rounded">
                      POST /api/upload
                    </code>
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>
                        • Body:{" "}
                        <code>
                          &#123;&quot;directLink&quot;:
                          &quot;https://…&quot;&#125;
                        </code>
                      </li>
                      <li>• Returns file name and download URL</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          ),
        },
        {
          subtitle: "API Usage",
          description: "Example curl command",
          content: (
            <div className="space-y-4">
              <Card className="bg-accent p-4">
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-card p-2 rounded-lg">
                    {'curl -X POST -H "Content-Type: application/json" \\'}
                    <br />
                    {
                      '-d \'{{"directLink":"https://example.com/file.zip"}}\'  \\'
                    }
                    <br />
                    {"http://localhost:3000/api/upload"}
                  </div>
                </div>
              </Card>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mx-auto p-4 bg-accent border rounded-2xl w-fit"
            >
              <InfoIcon className="w-10 h-10" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Documentation & Usage Guide
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Learn how to use our file hosting service effectively. This
                comprehensive guide covers all features and requirements.
              </p>
            </div>
            <Separator className="max-w-md mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 gap-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="overflow-hidden">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent rounded-lg">
                        <section.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-2xl pt-4">
                        {section.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-primary">
                            {item.subtitle}
                          </h3>
                          <p className="text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        {item.content && (
                          <div className="mt-4">{item.content}</div>
                        )}

                        {!item.content && (
                          <>
                            {item.steps && (
                              <div className="space-y-2">
                                <h4 className="font-medium">Steps:</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {item.steps.map((step, stepIndex) => (
                                    <li key={stepIndex}>{step}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {item.details && (
                              <div className="space-y-2">
                                <h4 className="font-medium">Details:</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {item.details.map((detail, detailIndex) => (
                                    <li key={detailIndex}>{detail}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {item.features && (
                              <div className="space-y-2">
                                <h4 className="font-medium">Features:</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {item.features.map(
                                    (feature, featureIndex) => (
                                      <li key={featureIndex}>{feature}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          </>
                        )}

                        {item.notes && (
                          <div className="bg-accent rounded-lg p-4 border">
                            <h4 className="font-medium mb-2">
                              Important Notes:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {item.notes.map((note, noteIndex) => (
                                <li key={noteIndex}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
