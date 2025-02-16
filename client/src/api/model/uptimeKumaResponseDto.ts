/**
 * SYS-HUB - REST API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { UptimeKumaHeartbeatDto } from './uptimeKumaHeartbeatDto';
import { UptimeKumaMonitorDto } from './uptimeKumaMonitorDto';


export interface UptimeKumaResponseDto { 
    /**
     * Heartbeat information
     */
    heartbeat: UptimeKumaHeartbeatDto;
    /**
     * Monitor information
     */
    monitor: UptimeKumaMonitorDto;
    /**
     * Response message
     */
    msg: string;
}

