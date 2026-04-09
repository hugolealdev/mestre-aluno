import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

type CreateLessonEventInput = {
  summary: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  attendeeEmails: string[];
};

type UpdateLessonEventInput = CreateLessonEventInput & {
  eventId: string;
};

@Injectable()
export class GoogleCalendarService {
  constructor(private readonly configService: ConfigService) {}

  private buildOAuthClient(refreshToken?: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  async createLessonEvent(input: CreateLessonEventInput, refreshToken?: string) {
    const auth = this.buildOAuthClient(refreshToken);

    if (!auth) {
      return null;
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.insert({
      calendarId: this.configService.get<string>('GOOGLE_CALENDAR_ID') ?? 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: {
          dateTime: input.startAt.toISOString()
        },
        end: {
          dateTime: input.endAt.toISOString()
        },
        attendees: input.attendeeEmails.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `lesson-${Date.now()}`
          }
        }
      }
    });

    return {
      eventId: response.data.id ?? null,
      meetUrl:
        response.data.hangoutLink ??
        response.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')
          ?.uri ??
        null
    };
  }

  async updateLessonEvent(input: UpdateLessonEventInput, refreshToken?: string) {
    const auth = this.buildOAuthClient(refreshToken);

    if (!auth) {
      return null;
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.update({
      calendarId: this.configService.get<string>('GOOGLE_CALENDAR_ID') ?? 'primary',
      eventId: input.eventId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: {
          dateTime: input.startAt.toISOString()
        },
        end: {
          dateTime: input.endAt.toISOString()
        },
        attendees: input.attendeeEmails.map((email) => ({ email }))
      }
    });

    return {
      eventId: response.data.id ?? input.eventId,
      meetUrl:
        response.data.hangoutLink ??
        response.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')
          ?.uri ??
        null
    };
  }

  async cancelLessonEvent(eventId: string, refreshToken?: string) {
    const auth = this.buildOAuthClient(refreshToken);

    if (!auth) {
      return;
    }

    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.update({
      calendarId: this.configService.get<string>('GOOGLE_CALENDAR_ID') ?? 'primary',
      eventId,
      requestBody: {
        status: 'cancelled'
      }
    });
  }
}
