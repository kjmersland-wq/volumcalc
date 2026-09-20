/**
 * Minimal SMTP (implicit TLS, port 465) client that works both in the
 * Cloudflare Worker runtime (cloudflare:sockets) and in local Node dev
 * (node:tls). Only what we need: EHLO, AUTH LOGIN, MAIL FROM, RCPT TO, DATA.
 */

type Duplex = {
  write: (chunk: Uint8Array) => Promise<void>;
  read: () => Promise<string>;
  close: () => Promise<void>;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function connectWorker(host: string, port: number): Promise<Duplex | null> {
  let connect: ((addr: string, opts?: unknown) => any) | undefined;
  try {
    const mod: any = await import(/* @vite-ignore */ ("cloudflare" + ":sockets") as string);
    connect = mod?.connect;
  } catch {
    return null;
  }
  if (!connect) return null;
  const socket = connect(`${host}:${port}`, { secureTransport: "on", allowHalfOpen: false });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  return {
    write: async (chunk) => {
      await writer.write(chunk);
    },
    read: async () => {
      const { value, done } = await reader.read();
      if (done || !value) return "";
      return decoder.decode(value);
    },
    close: async () => {
      try {
        await writer.close();
      } catch {
        /* ignore */
      }
      try {
        await socket.close();
      } catch {
        /* ignore */
      }
    },
  };
}

async function connectNode(host: string, port: number): Promise<Duplex> {
  const tls = await import("node:tls");
  const socket: any = await new Promise((resolve, reject) => {
    const s = tls.connect({ host, port, servername: host }, () => resolve(s));
    s.once("error", reject);
  });
  socket.setEncoding("utf8");

  const queue: string[] = [];
  let pending: ((value: string) => void) | null = null;
  socket.on("data", (chunk: string) => {
    if (pending) {
      const resolve = pending;
      pending = null;
      resolve(chunk);
    } else {
      queue.push(chunk);
    }
  });

  return {
    write: async (chunk) => {
      await new Promise<void>((resolve, reject) =>
        socket.write(Buffer.from(chunk), (err?: Error | null) => (err ? reject(err) : resolve())),
      );
    },
    read: async () => {
      const buffered = queue.shift();
      if (buffered !== undefined) return buffered;
      return new Promise<string>((resolve) => {
        pending = resolve;
      });
    },
    close: async () => {
      socket.end();
    },
  };
}

function base64(value: string): string {
  const bytes = encoder.encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function mimeHeader(value: string): string {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(value) ? value : `=?UTF-8?B?${base64(value)}?=`;
}

export interface SmtpMessage {
  from: string;
  fromName?: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}

export async function sendMailViaSmtp(message: SmtpMessage): Promise<void> {
  const host = process.env["MIGADU_SMTP_HOST"] || "smtp.migadu.com";
  const port = Number(process.env["MIGADU_SMTP_PORT"] || 465);
  const user = process.env["MIGADU_SMTP_USER"];
  const password = process.env["MIGADU_SMTP_PASSWORD"];
  if (!user || !password) throw new Error("SMTP credentials are not configured");

  const socket = (await connectWorker(host, port)) ?? (await connectNode(host, port));

  async function expect(codes: number[], label: string) {
    let response = "";
    // Read until we get a final line (code followed by a space).
    for (let i = 0; i < 10; i++) {
      response += await socket.read();
      const lines = response.trim().split(/\r?\n/);
      const last = lines[lines.length - 1] ?? "";
      if (/^\d{3} /.test(last)) break;
    }
    const code = Number(response.slice(0, 3));
    if (!codes.includes(code)) {
      throw new Error(`SMTP ${label} failed: ${response.trim().slice(0, 200)}`);
    }
    return response;
  }

  async function send(line: string) {
    await socket.write(encoder.encode(`${line}\r\n`));
  }

  try {
    await expect([220], "greeting");
    await send("EHLO volumcalc.com");
    await expect([250], "EHLO");
    await send("AUTH LOGIN");
    await expect([334], "AUTH");
    await send(base64(user));
    await expect([334], "username");
    await send(base64(password));
    await expect([235], "password");
    await send(`MAIL FROM:<${message.from}>`);
    await expect([250], "MAIL FROM");
    await send(`RCPT TO:<${message.to}>`);
    await expect([250, 251], "RCPT TO");
    await send("DATA");
    await expect([354], "DATA");

    const headers = [
      `From: ${mimeHeader(message.fromName ?? "VolumCalc")} <${message.from}>`,
      `To: <${message.to}>`,
      ...(message.replyTo ? [`Reply-To: <${message.replyTo}>`] : []),
      `Subject: ${mimeHeader(message.subject)}`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
    ].join("\r\n");

    const body = message.text
      .split(/\r?\n/)
      .map((line) => (line.startsWith(".") ? `.${line}` : line))
      .join("\r\n");

    await socket.write(encoder.encode(`${headers}\r\n\r\n${body}\r\n.\r\n`));
    await expect([250], "message body");
    await send("QUIT");
  } finally {
    await socket.close();
  }
}
