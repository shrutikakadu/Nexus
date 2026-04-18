import { useState, useEffect } from 'react'
import { getSubmissionsForAdmin, getUploadedFile, onStoreUpdate } from '../utils/clearanceStore'

/**
 * DocumentViewer — Shows documents uploaded by students for a specific admin role.
 * Displayed as a modal overlay when triggered.
 */
export default function DocumentViewer({ role, studentId, studentName, onClose }) {
    const [docs, setDocs] = useState([])
    const [previewDoc, setPreviewDoc] = useState(null)

    useEffect(() => {
        function loadDocs() {
            const subs = getSubmissionsForAdmin(role)
            const student = subs.find(s => s.studentId === studentId)
            if (student) {
                setDocs(student.relevantDocs || [])
            }
        }
        loadDocs()
        return onStoreUpdate(loadDocs)
    }, [role, studentId])

    function openPreview(doc) {
        const fileData = getUploadedFile(doc.docId)
        setPreviewDoc({ ...doc, fileData })
    }

    if (!onClose) return null

    return (
        <div className="doc-viewer-overlay" onClick={onClose} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: '#fff', borderRadius: 16, width: 540, maxHeight: '80vh',
                overflow: 'auto', boxShadow: '0 12px 48px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--green, #1a7a4a), #0f4a2a)',
                    borderRadius: '16px 16px 0 0', padding: '1.25rem 1.5rem',
                    color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>📄 Uploaded Documents</div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: 3 }}>
                            {studentName} — {docs.length} document{docs.length !== 1 ? 's' : ''} for {role}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                        borderRadius: 8, padding: '0.4rem 0.8rem', cursor: 'pointer',
                        fontSize: '0.85rem', fontFamily: 'inherit'
                    }}>✕ Close</button>
                </div>

                {/* Document List */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    {docs.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '2rem', color: '#7aaa8a', fontSize: '0.88rem'
                        }}>
                            No documents uploaded yet by this student for {role}.
                        </div>
                    ) : (
                        docs.map(doc => (
                            <div key={doc.docId} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '0.9rem 1rem', borderRadius: 12,
                                border: '1px solid #d4ead9', marginBottom: 10,
                                background: doc.status === 'verified' ? '#eaf7f0' : '#fff',
                                transition: 'all 0.15s'
                            }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 10,
                                    background: doc.status === 'verified' ? '#d6f0e2' : '#fef3e2',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, flexShrink: 0
                                }}>
                                    {doc.type === 'PDF' ? '📄' : doc.type === 'JPG' || doc.type === 'JPEG' || doc.type === 'PNG' ? '🖼️' : '📎'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f2718' }}>{doc.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#7aaa8a', marginTop: 2 }}>
                                        {doc.type} · {doc.size} · Uploaded {doc.uploadedAt}
                                    </div>
                                </div>
                                <span style={{
                                    background: doc.status === 'verified' ? '#d6f0e2' : doc.status === 'rejected' ? '#fdecea' : '#fef3e2',
                                    color: doc.status === 'verified' ? '#1a7a4a' : doc.status === 'rejected' ? '#c0392b' : '#c97a10',
                                    borderRadius: 100, padding: '0.2rem 0.65rem',
                                    fontSize: '0.68rem', fontWeight: 700
                                }}>
                                    {doc.status}
                                </span>
                                <button onClick={() => openPreview(doc)} style={{
                                    background: '#eaf7f0', border: '1px solid #c0dfc8',
                                    borderRadius: 7, padding: '0.3rem 0.7rem',
                                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                    color: '#1a7a4a', fontFamily: 'inherit'
                                }}>
                                    👁 View
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Preview Modal */}
                {previewDoc && (
                    <div style={{
                        borderTop: '1px solid #d4ead9', padding: '1.25rem 1.5rem',
                        background: '#f0f7f3'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f2718' }}>
                                Preview: {previewDoc.name}
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{
                                background: 'none', border: '1px solid #d4ead9',
                                borderRadius: 6, padding: '0.25rem 0.6rem',
                                fontSize: '0.72rem', cursor: 'pointer', color: '#7aaa8a', fontFamily: 'inherit'
                            }}>✕ Close Preview</button>
                        </div>
                        {previewDoc.fileData ? (
                            previewDoc.fileData.startsWith('data:image') ? (
                                <img src={previewDoc.fileData} alt={previewDoc.name} style={{
                                    width: '100%', borderRadius: 10, border: '1px solid #d4ead9'
                                }} />
                            ) : previewDoc.fileData.startsWith('data:application/pdf') ? (
                                <iframe src={previewDoc.fileData} title={previewDoc.name} style={{
                                    width: '100%', height: 400, borderRadius: 10, border: '1px solid #d4ead9'
                                }} />
                            ) : (
                                <div style={{
                                    background: '#fff', borderRadius: 10, padding: '2rem',
                                    textAlign: 'center', border: '1px solid #d4ead9'
                                }}>
                                    <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                                    <div style={{ fontSize: '0.85rem', color: '#3d6b4f', fontWeight: 600 }}>
                                        File uploaded successfully
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#7aaa8a', marginTop: 4 }}>
                                        {previewDoc.type} · {previewDoc.size}
                                    </div>
                                    <a href={previewDoc.fileData} download={previewDoc.name} style={{
                                        display: 'inline-block', marginTop: '1rem',
                                        background: '#1a7a4a', color: '#fff', borderRadius: 8,
                                        padding: '0.5rem 1.2rem', fontSize: '0.82rem', fontWeight: 600,
                                        textDecoration: 'none', fontFamily: 'inherit'
                                    }}>↓ Download File</a>
                                </div>
                            )
                        ) : (
                            <div style={{
                                background: '#fff', borderRadius: 10, padding: '2rem',
                                textAlign: 'center', border: '1px solid #d4ead9'
                            }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                                <div style={{ fontSize: '0.85rem', color: '#3d6b4f', fontWeight: 600 }}>
                                    Document record exists (simulated upload)
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#7aaa8a', marginTop: 4 }}>
                                    {previewDoc.type} · {previewDoc.size} · No file data available
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
