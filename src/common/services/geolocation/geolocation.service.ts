import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class GeolocationService {
    /**
     * Extract IP address from request
     * @param request - The Express request object
     * @returns The client's IP address
     */
    extractIpAddress(request: Request): string {
        // Check for IP from proxy headers first
        const forwardedFor = request.headers['x-forwarded-for'];
        if (forwardedFor) {
            const ips = typeof forwardedFor === 'string' 
                ? forwardedFor.split(',') 
                : forwardedFor;
            return ips[0].trim();
        }

        // Check other common proxy headers
        const realIp = request.headers['x-real-ip'];
        if (realIp) {
            return typeof realIp === 'string' ? realIp : realIp[0];
        }

        // Fall back to direct connection IP
        return request.ip || 
               request.socket.remoteAddress || 
               'unknown';
    }

    /**
     * Check if IP is a local/private IP
     * @param ipAddress - The IP address to check
     * @returns True if local/private IP
     */
    private isLocalIP(ipAddress: string): boolean {
        return ipAddress === 'unknown' || 
               ipAddress === '::1' || 
               ipAddress === '127.0.0.1' ||
               ipAddress.startsWith('192.168.') ||
               ipAddress.startsWith('10.') ||
               /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ipAddress);
    }

    /**
     * Extract geographic location from request
     * @param request - The Express request object
     * @returns Location string (City, Region, Country) or 'Unknown Location'
     */
    async getLocationFromRequest(request: Request): Promise<string> {
        try {
            // First, check if location info is provided in headers (from CDN/proxy)
            const cfCountry = request.headers['cf-ipcountry']; // Cloudflare
            const cfRegion = request.headers['cf-region'];
            
            if (cfCountry && typeof cfCountry === 'string') {
                const country = cfCountry;
                const region = cfRegion && typeof cfRegion === 'string' ? cfRegion : '';
                return region ? `${region}, ${country}` : country;
            }

            // Get IP address
            const ipAddress = this.extractIpAddress(request);
            
            // Skip geolocation for localhost/private IPs
            if (this.isLocalIP(ipAddress)) {
                return 'Local Network';
            }

            // Get location from IP
            return await this.getLocationFromIP(ipAddress);
        } catch (error) {
            console.error('Error extracting location from request:', error);
            return 'Unknown Location';
        }
    }

    /**
     * Get geographic location from IP address
     * @param ipAddress - The IP address to geolocate
     * @returns Location string (City, Region, Country) or 'Unknown Location'
     */
    async getLocationFromIP(ipAddress: string): Promise<string> {
        try {
            // Skip geolocation for localhost/private IPs
            if (this.isLocalIP(ipAddress)) {
                return 'Local Network';
            }

            // Use ip-api.com (free, no API key required, 45 requests/minute)
            const response = await fetch(
                `http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city`,
                { 
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                }
            );
            
            if (!response.ok) {
                return 'Unknown Location';
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                const parts = [];
                if (data.city) parts.push(data.city);
                if (data.regionName) parts.push(data.regionName);
                if (data.country) parts.push(data.country);
                
                return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
            }

            return 'Unknown Location';
        } catch (error) {
            console.error('Error getting location from IP:', error);
            return 'Unknown Location';
        }
    }
}
