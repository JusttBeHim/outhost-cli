import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
function formatTimestamp(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const h = pad(date.getHours());
    const m = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${h}:${m}:${s}`;
}
function shouldIgnore(filename) {
    if (!filename)
        return false;
    const parts = filename.replace(/\\/g, '/').split('/');
    for (const part of parts) {
        if (!part)
            continue;
        if (part.startsWith('.') || part === 'node_modules') {
            return true;
        }
    }
    return false;
}
export function startStaticServer(directory, options) {
    const onRequestLog = typeof options === 'function' ? options : options?.onRequestLog;
    return new Promise((resolve, reject) => {
        const rootDir = path.resolve(directory);
        const clients = new Set();
        const watchers = [];
        // Periodic heartbeat to prevent Cloudflare Tunnel / proxies from dropping idle SSE streams
        const heartbeatInterval = setInterval(() => {
            for (const client of clients) {
                try {
                    client.write(': heartbeat\n\n');
                }
                catch {
                    clients.delete(client);
                }
            }
        }, 20000);
        if (heartbeatInterval.unref) {
            heartbeatInterval.unref();
        }
        // Debounced reload broadcast
        let debounceTimer = null;
        const broadcastReload = () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
                debounceTimer = null;
                for (const client of clients) {
                    try {
                        client.write('data: reload\n\n');
                    }
                    catch {
                        clients.delete(client);
                    }
                }
            }, 150);
            if (debounceTimer.unref) {
                debounceTimer.unref();
            }
        };
        const handleFileChange = (_eventType, filename) => {
            try {
                if (shouldIgnore(filename))
                    return;
                broadcastReload();
            }
            catch {
                // Catch any watcher callback errors
            }
        };
        // Watch files with fallback for older kernels
        try {
            const watcher = fs.watch(rootDir, { recursive: true }, handleFileChange);
            watcher.on('error', () => { });
            watchers.push(watcher);
        }
        catch {
            const watchDirRecursively = (dir) => {
                try {
                    const watcher = fs.watch(dir, (eventType, filename) => {
                        const rel = filename ? path.relative(rootDir, path.join(dir, filename)) : null;
                        handleFileChange(eventType, rel);
                    });
                    watcher.on('error', () => { });
                    watchers.push(watcher);
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        if (entry.isDirectory() &&
                            !entry.name.startsWith('.') &&
                            entry.name !== 'node_modules') {
                            watchDirRecursively(path.join(dir, entry.name));
                        }
                    }
                }
                catch {
                    // Ignore directory access errors
                }
            };
            watchDirRecursively(rootDir);
        }
        const server = http.createServer((req, res) => {
            const startTime = Date.now();
            const method = req.method || 'GET';
            let cleanUrlPath = '';
            const emitLog = () => {
                if (!onRequestLog)
                    return;
                if (cleanUrlPath === '/__outhost_livereload')
                    return;
                const durationMs = Math.max(0, Date.now() - startTime);
                const entry = {
                    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    timestamp: formatTimestamp(),
                    method,
                    path: cleanUrlPath || req.url || '/',
                    statusCode: res.statusCode,
                    durationMs,
                };
                try {
                    onRequestLog(entry);
                }
                catch {
                    // Ignore callback error
                }
            };
            let logged = false;
            const onFinishOrClose = () => {
                if (logged)
                    return;
                logged = true;
                emitLog();
            };
            res.on('finish', onFinishOrClose);
            res.on('close', onFinishOrClose);
            try {
                if (!req.url) {
                    res.writeHead(400);
                    res.end();
                    return;
                }
                // Strip query strings and hash
                cleanUrlPath = req.url.split('?')[0]?.split('#')[0] || '';
                // Safely decode URI
                try {
                    cleanUrlPath = decodeURIComponent(cleanUrlPath);
                }
                catch {
                    res.writeHead(400);
                    res.end('Bad Request');
                    return;
                }
                // Intercept Live Reload SSE endpoint
                if (cleanUrlPath === '/__outhost_livereload') {
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache, no-transform',
                        'Connection': 'keep-alive',
                        'Access-Control-Allow-Origin': '*',
                        'X-Accel-Buffering': 'no',
                    });
                    res.write(': connected\n\n');
                    clients.add(res);
                    const removeClient = () => {
                        clients.delete(res);
                    };
                    req.on('close', removeClient);
                    res.on('close', removeClient);
                    res.on('error', removeClient);
                    return;
                }
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                    res.writeHead(405);
                    res.end('Method Not Allowed');
                    return;
                }
                // Normalize slashes (convert backslashes to URL forward slashes)
                cleanUrlPath = cleanUrlPath.replace(/\\/g, '/');
                // Ensure leading slash
                if (!cleanUrlPath.startsWith('/')) {
                    cleanUrlPath = '/' + cleanUrlPath;
                }
                if (cleanUrlPath === '/') {
                    cleanUrlPath = '/index.html';
                }
                // Resolve against deployment root using path.resolve(rootDir, '.' + cleanUrlPath)
                const filePath = path.resolve(rootDir, '.' + cleanUrlPath);
                // Verify path traversal protection works identically on both Windows and Linux:
                // ensure the resolved file path starts with rootDir + path.sep (or equals rootDir)
                // using path.relative(rootDir, resolvedFilePath) (checking that it does not start with .. and is not path.isAbsolute())
                const rel = path.relative(rootDir, filePath);
                const isSafe = !rel.startsWith('..') &&
                    !path.isAbsolute(rel) &&
                    (filePath === rootDir || filePath.startsWith(rootDir + path.sep));
                if (!isSafe) {
                    res.writeHead(403);
                    res.end('Forbidden');
                    return;
                }
                let targetFile = filePath;
                if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
                    targetFile = path.join(targetFile, 'index.html');
                    const relTarget = path.relative(rootDir, targetFile);
                    if (relTarget.startsWith('..') ||
                        path.isAbsolute(relTarget) ||
                        (!targetFile.startsWith(rootDir + path.sep) && targetFile !== rootDir)) {
                        res.writeHead(403);
                        res.end('Forbidden');
                        return;
                    }
                }
                if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
                    const ext = path.extname(targetFile).toLowerCase();
                    const mimeTypes = {
                        '.html': 'text/html',
                        '.htm': 'text/html',
                        '.js': 'text/javascript',
                        '.mjs': 'text/javascript',
                        '.css': 'text/css',
                        '.json': 'application/json',
                        '.png': 'image/png',
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.gif': 'image/gif',
                        '.svg': 'image/svg+xml',
                        '.ico': 'image/x-icon',
                        '.woff': 'font/woff',
                        '.woff2': 'font/woff2',
                        '.ttf': 'font/ttf',
                        '.txt': 'text/plain',
                    };
                    const contentType = mimeTypes[ext] || 'application/octet-stream';
                    const headers = {
                        'Content-Type': contentType,
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        'Pragma': 'no-cache',
                    };
                    if (req.method === 'HEAD') {
                        res.writeHead(200, headers);
                        res.end();
                        return;
                    }
                    if (contentType === 'text/html') {
                        fs.readFile(targetFile, 'utf8', (readErr, content) => {
                            if (readErr) {
                                res.writeHead(500);
                                res.end('Server Error');
                                return;
                            }
                            const script = `\n<!-- OutHost Live Reload -->\n<script>\n(function() {\n  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;\n  try {\n    var es = new EventSource('/__outhost_livereload');\n    es.onmessage = function(e) {\n      if (e.data === 'reload') {\n        window.location.reload();\n      }\n    };\n    es.addEventListener('reload', function() {\n      window.location.reload();\n    });\n    es.onerror = function() {};\n  } catch (e) {}\n})();\n</script>\n`;
                            const bodyCloseIndex = content.toLowerCase().lastIndexOf('</body>');
                            const injected = bodyCloseIndex !== -1
                                ? content.slice(0, bodyCloseIndex) + script + content.slice(bodyCloseIndex)
                                : content + script;
                            const buffer = Buffer.from(injected, 'utf8');
                            res.writeHead(200, {
                                ...headers,
                                'Content-Length': String(buffer.byteLength),
                            });
                            res.end(buffer);
                        });
                        return;
                    }
                    res.writeHead(200, headers);
                    fs.createReadStream(targetFile).pipe(res);
                }
                else {
                    res.writeHead(404);
                    res.end('Not found');
                }
            }
            catch (err) {
                res.writeHead(500);
                res.end('Server Error');
            }
        });
        let stopped = false;
        const stop = () => {
            if (stopped)
                return;
            stopped = true;
            clearInterval(heartbeatInterval);
            if (debounceTimer) {
                clearTimeout(debounceTimer);
                debounceTimer = null;
            }
            for (const watcher of watchers) {
                try {
                    watcher.close();
                }
                catch { }
            }
            watchers.length = 0;
            for (const client of clients) {
                try {
                    client.end();
                }
                catch { }
            }
            clients.clear();
            if ('closeAllConnections' in server && typeof server.closeAllConnections === 'function') {
                try {
                    server.closeAllConnections();
                }
                catch { }
            }
            try {
                server.close();
            }
            catch { }
        };
        server.on('close', () => {
            stop();
        });
        server.on('error', (e) => {
            reject(new Error(`Failed to start server: ${e.message}`));
        });
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (address && typeof address !== 'string') {
                resolve({ server, port: address.port, stop });
            }
            else {
                reject(new Error("Failed to get server port."));
            }
        });
    });
}
//# sourceMappingURL=server.js.map