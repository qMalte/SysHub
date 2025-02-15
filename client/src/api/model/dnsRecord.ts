/**
 * SYS-HUB - REST API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface DnsRecord { 
    /**
     * The unique identifier of the DNS record
     */
    id: number;
    /**
     * The unique identifier of HealthCheck
     */
    healthCheckId: number;
    /**
     * The domain name
     */
    name: string;
    /**
     * The primary IPv4 address
     */
    primaryIp4: string;
    /**
     * The backup IPv4 address
     */
    backupIp4: string;
    /**
     * The primary IPv6 address
     */
    primaryIp6: string;
    /**
     * The backup IPv6 address
     */
    backupIp6: string;
    /**
     * The Cloudflare API token for this zone
     */
    apiToken: string;
    /**
     * The Secret-Key to allow Edit of Policy
     */
    secret: string;
    /**
     * The Token to init a deletion Request
     */
    deleteToken: string;
    /**
     * Whether the domain is currently in failover mode
     */
    isInFailover: boolean;
    /**
     * When the record was created
     */
    createdAt: string;
    /**
     * When the record was last updated
     */
    updatedAt: string;
}

