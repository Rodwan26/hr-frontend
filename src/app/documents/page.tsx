'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Document, documentService } from '@/services/documentService';
import {
    CloudArrowUpIcon,
    DocumentTextIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [queryResult, setQueryResult] = useState<string | null>(null);
    const [querying, setQuerying] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [docChunks, setDocChunks] = useState<any[]>([]);
    const [loadingChunks, setLoadingChunks] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const data = await documentService.list();
            setDocuments(data);
        } catch (err) {
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setSuccess(null);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await documentService.upload(formData);
            setSuccess('Document uploaded successfully');
            fetchDocuments();
            if (e.target) e.target.value = ''; // Reset input
        } catch (err) {
            setError('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleQuery = async () => {
        if (!query.trim()) return;
        setQuerying(true);
        setError(null);
        try {
            const result = await documentService.query(query);
            // Alignment with TrustedAIResponse (uses .content instead of .answer)
            setQueryResult(result.content);
        } catch (err) {
            setError('AI Query failed');
        } finally {
            setQuerying(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        setError(null);
        setSuccess(null);
        try {
            await documentService.delete(id);
            setSuccess('Document deleted');
            fetchDocuments();
        } catch (err) {
            setError('Delete failed');
        }
    };

    const handleViewDocument = async (doc: Document) => {
        setSelectedDoc(doc);
        setLoadingChunks(true);
        setError(null);
        try {
            const chunks = await documentService.getChunks(doc.id);
            setDocChunks(chunks);
        } catch (err) {
            setError('Failed to load document preview');
        } finally {
            setLoadingChunks(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Knowledge Hub</h1>
                    <p className="text-gray-500 font-medium italic">Manage company policies and query them using AI.</p>
                </div>

                <div className="relative">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <Button
                        variant="primary"
                        loading={uploading}
                        className="cursor-pointer shadow-lg hover:shadow-xl"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                        Upload Document
                    </Button>
                </div>
            </div>

            {error && <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert variant="success" title="Success" onClose={() => setSuccess(null)}>{success}</Alert>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden" title="AI Document Assistant">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10" />
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400 font-medium italic">Ask anything across your uploaded knowledge base.</p>
                        <div className="relative group">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="e.g. What are the rules for parental leave?"
                            />
                            <Button
                                onClick={handleQuery}
                                className="absolute bottom-3 right-3 h-8 px-4 text-xs font-bold uppercase tracking-widest bg-blue-600 hover:bg-blue-500 shadow-lg"
                                loading={querying}
                            >
                                Ask AI
                            </Button>
                        </div>

                        {queryResult && (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-4 animate-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[8px] font-black">AI</div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Response</span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-200 font-medium">{queryResult}</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="lg:col-span-2" title="Company Repository" subtitle="All indexed documents available for AI processing.">
                    {loading ? (
                        <div className="flex justify-center py-20"><Spinner /></div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-20 grayscale opacity-40">
                            <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-bold uppercase tracking-widest">No documents found</p>
                        </div>
                    ) : (
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Filename</TH>
                                    <TH>Uploaded</TH>
                                    <TH className="text-right">Actions</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {documents.map((doc) => (
                                    <TR key={doc.id}>
                                        <TD className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <DocumentTextIcon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900">{doc.filename}</span>
                                        </TD>
                                        <TD className="text-gray-500 font-medium italic">{new Date(doc.created_at).toLocaleDateString()}</TD>
                                        <TD className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc)} className="hover:text-blue-600">
                                                    <EyeIcon className="w-5 h-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)} className="hover:text-red-600">
                                                    <TrashIcon className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </Card>
            </div>

            <Modal
                isOpen={!!selectedDoc}
                onClose={() => {
                    setSelectedDoc(null);
                    setDocChunks([]);
                }}
                title={selectedDoc?.filename || 'Document Preview'}
            >
                <div className="space-y-4">
                    {loadingChunks ? (
                        <div className="flex justify-center py-10"><Spinner /></div>
                    ) : docChunks.length > 0 ? (
                        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {docChunks.map((chunk, idx) => (
                                <div key={chunk.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Chunk {idx + 1}</div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{chunk.chunk_text}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-10 text-slate-500 font-medium italic">No content chunks available for this document.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
