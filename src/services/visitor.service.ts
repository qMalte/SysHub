import { Injectable } from "@nestjs/common";
import * as useragent from "useragent";
import * as dns from "dns";
import { promisify } from "util";
import axios from "axios";
import {
  LocationInfoDto,
  UserAgentInfoDto,
  VisitorInfoResponseDto,
} from "../dto/visitor.dto";

@Injectable()
export class VisitorService {
  async getVisitorInfo(
    ip: string,
    userAgentString: string,
  ): Promise<VisitorInfoResponseDto> {
    const userAgentInfo = this.parseUserAgent(userAgentString);
    const fqdn = await this.resolveFQDN(ip);
    const { location, isp } = await this.getIpInfo(ip);

    return {
      ipAddress: ip,
      fqdn,
      isp,
      userAgent: userAgentString,
      userAgentInfo,
      location,
      timestamp: new Date(),
    };
  }

  private parseUserAgent(userAgentString: string): UserAgentInfoDto {
    const agent = useragent.parse(userAgentString);
    return {
      browser: agent.family,
      version: agent.toVersion(),
      os: agent.os.toString(),
      device: agent.device.family,
    };
  }

  private async resolveFQDN(ip: string): Promise<string | null> {
    try {
      const reverse = promisify(dns.reverse);
      const hostnames = await reverse(ip);
      return hostnames[0] || null;
    } catch (error) {
      console.error("Error resolving FQDN:", error);
      return null;
    }
  }

  private async getIpInfo(ip: string): Promise<{
    location: LocationInfoDto | null;
    isp: string | null;
  }> {
    try {
      const response = await axios.get(`https://ip-api.com/json/${ip}`);

      if (response.data.status === "success") {
        return {
          location: {
            country: response.data.country,
            city: response.data.city,
            latitude: response.data.lat,
            longitude: response.data.lon,
          },
          isp: response.data.isp,
        };
      }
    } catch (error) {
      console.error("Error fetching IP information:", error);
    }

    return {
      location: null,
      isp: null,
    };
  }
}