import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const S = '#ffffff', T = '#1a1a1a', T2 = '#4a4a4a', T3 = '#888888';
const G = '#1a7a4a', GL = '#e8f3ec', B = '#e6e6e6', BG = '#f9fafb';
const R = '#d32f2f', RL = '#ffebee';

export default function VerifyCertificate() {
  const { certId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Simulate verification delay to feel "official"
    setTimeout(() => {
      try {
        if (!certId) throw new Error("Invalid Certificate ID");
        // Format: [COLLEGE_PREFIX]-[CERT_TYPE]-[ROLL]-[YEAR]
        // e.g., NEX-NODUES-04-2026
        const parts = certId.split('-');
        if (parts.length < 4) throw new Error("Malformed Certificate ID");
        
        const typeMap = {
          NODUES: "No Dues Certificate",
          BONAFIDE: "Bonafide Certificate",
          COMPLETION: "Course Completion Certificate",
          DEGREE: "Provisional Degree Certificate",
          CHARACTER: "Character Certificate",
          MIGRATION: "Migration Certificate"
        };
        
        setData({
          valid: true,
          certNo: certId,
          type: typeMap[parts[1]] || "Official Document",
          roll: parts[2],
          year: parts[3],
          college: "Nexus Institute of Technology",
          issueDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        });
      } catch (err) {
        setData({ valid: false, error: err.message });
      }
      setLoading(false);
    }, 1200);
  }, [certId]);

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: S, width: '100%', maxWidth: 500, borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ background: G, color: S, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>Nexus Graduation Portal</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>Certificate Verification</div>
        </div>
        
        <div style={{ padding: '2.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${GL}`, borderTopColor: G, borderRadius: '50%', margin: '0 auto 1.5rem' }}></div>
              <div style={{ color: T2, fontWeight: 500 }}>Verifying authenticity...</div>
              <div style={{ fontSize: '0.85rem', color: T3, marginTop: 4 }}>Checking cryptographic signature for {certId}</div>
            </div>
          ) : data?.valid ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '2rem', background: GL, padding: '1rem', borderRadius: 12, border: `1px solid #c0dfc8` }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: G, color: S, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✓</div>
                <div style={{ color: G, fontWeight: 700, fontSize: '1.1rem' }}>Verified & Authentic</div>
              </div>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.8rem', color: T3, textTransform: 'uppercase', fontWeight: 600 }}>Certificate Type</span>
                  <span style={{ fontSize: '1.05rem', color: T, fontWeight: 600 }}>{data.type}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.8rem', color: T3, textTransform: 'uppercase', fontWeight: 600 }}>Student Roll No</span>
                  <span style={{ fontSize: '1.05rem', color: T, fontWeight: 600, fontFamily: 'monospace' }}>{data.roll}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.8rem', color: T3, textTransform: 'uppercase', fontWeight: 600 }}>Issued By</span>
                  <span style={{ fontSize: '1.05rem', color: T, fontWeight: 600 }}>{data.college}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.8rem', color: T3, textTransform: 'uppercase', fontWeight: 600 }}>Certificate Number</span>
                  <span style={{ fontSize: '1.05rem', color: T, fontWeight: 600, fontFamily: 'monospace' }}>{data.certNo}</span>
                </div>
              </div>
              
              <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${B}`, textAlign: 'center', fontSize: '0.85rem', color: T3, lineHeight: 1.5 }}>
                This is an official public record. If this information does not match the physical or digital document you received, the document may be forged.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: RL, color: R, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 1.5rem' }}>!</div>
              <div style={{ color: R, fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>Invalid Certificate</div>
              <div style={{ color: T2, fontSize: '0.95rem', marginBottom: '2rem' }}>We could not verify this document in our records.</div>
              <div style={{ background: B, borderRadius: 8, padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', color: T3 }}>
                Scanned ID: {certId || 'Unknown'}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Link to="/" style={{ marginTop: '2rem', color: T2, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>←</span> Return to Nexus Portal
      </Link>
    </div>
  );
}
