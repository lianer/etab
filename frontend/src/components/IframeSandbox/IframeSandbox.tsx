import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CardState } from '../../types/dashboard';
import styles from './IframeSandbox.module.css';

interface IframeSandboxProps {
  card: CardState;
}

const SCRIPT_TIMEOUT_MS = 5000;

const INJECTED_SCRIPT = `
<script>
  // Dashboard API
  const dashboardAPI = {
    postMessage(type, data) {
      window.parent.postMessage({ source: 'card', type, data }, '*');
    },
    getState() {
      return new Promise((resolve) => {
        const id = Math.random().toString(36);
        const handler = (e) => {
          if (e.data && e.data.type === 'state-response' && e.data.id === id) {
            window.removeEventListener('message', handler);
            resolve(e.data.state);
          }
        };
        window.addEventListener('message', handler);
        window.parent.postMessage({ source: 'card', type: 'get-state', id }, '*');
      });
    }
  };

  // Timeout detection
  const _startTime = Date.now();
  const _checkTimeout = () => {
    if (Date.now() - _startTime > ${SCRIPT_TIMEOUT_MS}) {
      dashboardAPI.postMessage('error', { message: 'Script execution timeout' });
      return true;
    }
    return false;
  };
<\/script>
`;

const IframeSandbox: React.FC<IframeSandboxProps> = ({ card }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasError, setHasError] = useState(false);
  const [srcDoc, setSrcDoc] = useState('');

  const buildIframeContent = useCallback(() => {
    const raw = card.customCode;
    const html = typeof raw === 'string' ? raw : '';
    if (!html) return '';

    // Inject dashboard API script before </body>, or append at end
    const closingBody = html.lastIndexOf('</body>');
    if (closingBody !== -1) {
      return html.slice(0, closingBody) + INJECTED_SCRIPT + html.slice(closingBody);
    }
    return html + INJECTED_SCRIPT;
  }, [card.customCode]);

  // Update srcdoc when content changes
  useEffect(() => {
    setSrcDoc(buildIframeContent());
  }, [buildIframeContent]);

  // Listen for card error messages
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.source !== 'card') return;
      if (e.data?.type === 'error') {
        console.error(`Card error (${card.id}):`, e.data.data?.message);
        setHasError(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [card.id]);

  if (hasError) {
    return (
      <div className={styles.errorBoundary}>
        <p>卡片运行出错</p>
        <button className={styles.retryBtn} onClick={() => setHasError(false)}>重试</button>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className={styles.iframe}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-same-origin"
      title={`card-${card.id}`}
    />
  );
};

export default IframeSandbox;
