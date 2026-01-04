import crypto from 'crypto';

interface OAuthParams {
    [key: string]: string;
}

export class FatSecretClient {
    private consumerKey: string;
    private consumerSecret: string;
    private apiUrl = 'https://platform.fatsecret.com/rest/server.api';

    constructor() {
        this.consumerKey = process.env.FATSECRET_CLIENT_ID || '';
        this.consumerSecret = process.env.FATSECRET_CLIENT_SECRET || '';

        if (!this.consumerKey || !this.consumerSecret) {
            console.error('FATSECRET_CLIENT_ID or FATSECRET_CLIENT_SECRET is not set');
        }
    }

    private oauthEncoded(str: string): string {
        return encodeURIComponent(str)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }

    private generateSignature(params: OAuthParams): string {
        // 1. Sort keys
        const sortedKeys = Object.keys(params).sort();

        // 2. Create Parameter String
        const paramString = sortedKeys
            .map((key) => `${this.oauthEncoded(key)}=${this.oauthEncoded(params[key])}`)
            .join('&');

        // 3. Create Signature Base String
        const signatureBase = `POST&${this.oauthEncoded(this.apiUrl)}&${this.oauthEncoded(paramString)}`;

        // 4. Generate HMAC-SHA1
        const signingKey = `${this.oauthEncoded(this.consumerSecret)}&`; // No token secret for 2-legged OAuth
        return crypto
            .createHmac('sha1', signingKey)
            .update(signatureBase)
            .digest('base64');
    }

    async execute(method: string, extraParams: Record<string, string> = {}) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = crypto.randomUUID();

        const params: OAuthParams = {
            ...extraParams,
            method: method,
            format: 'json',
            oauth_consumer_key: this.consumerKey,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: timestamp,
            oauth_nonce: nonce,
            oauth_version: '1.0',
        };

        // Add signature
        params['oauth_signature'] = this.generateSignature(params);

        // Create Body
        const body = Object.keys(params)
            .sort() // FatSecret likes sorted params? Standard OAuth doesn't strictly require body sort, but consistent
            .map((key) => `${this.oauthEncoded(key)}=${this.oauthEncoded(params[key])}`)
            .join('&');

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`FatSecret API Error: ${response.status} ${text}`);
        }

        return response.json();
    }
}

export const fatSecretClient = new FatSecretClient();
