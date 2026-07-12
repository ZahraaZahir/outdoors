import { BadRequestException, Injectable, Logger } from '@nestjs/common';

export interface GeocodedLocation {
  displayName: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  async validateDestination(destination: string): Promise<GeocodedLocation> {
    const params = new URLSearchParams({
      q: destination,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });

    const res = await fetch(`${this.nominatimUrl}?${params}`, {
      headers: { 'User-Agent': 'OutdoorsBookingApp/1.0' },
    });

    if (!res.ok) {
      this.logger.warn(`Nominatim request failed: ${res.status}`);
      throw new BadRequestException('Unable to validate location. Please try again.');
    }

    const results = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (!results.length) {
      throw new BadRequestException(
        `"${destination}" is not a recognized location. Please enter a real city or place name.`,
      );
    }

    const match = results[0];
    this.logger.log(`Geocoded "${destination}" -> ${match.display_name}`);

    return {
      displayName: match.display_name,
      latitude: parseFloat(match.lat),
      longitude: parseFloat(match.lon),
    };
  }
}
