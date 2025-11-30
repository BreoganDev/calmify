import { prisma } from '@/lib/prisma';

type MetaConfig = {
  pixelId?: string;
  capiEnabled?: boolean;
  accessToken?: string;
};

export async function getMetaConfig(): Promise<MetaConfig> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['META_PIXEL_ID', 'META_CAPI_ENABLED', 'META_ACCESS_TOKEN'] } },
  });
  return {
    pixelId: settings.find((s: any) => s.key === 'META_PIXEL_ID')?.value,
    capiEnabled: settings.find((s: any) => s.key === 'META_CAPI_ENABLED')?.value === 'true',
    accessToken: settings.find((s: any) => s.key === 'META_ACCESS_TOKEN')?.value,
  };
}

export async function sendMetaCapiEvent(eventName: string, payload: Record<string, any>) {
  const { pixelId, accessToken, capiEnabled } = await getMetaConfig();
  if (!capiEnabled || !pixelId || !accessToken) return;

  try {
    await fetch(`https://graph.facebook.com/v17.0/${pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            action_source: 'website',
            custom_data: payload,
          },
        ],
        access_token: accessToken,
      }),
    });
  } catch (error) {
    console.warn('Meta CAPI error', error);
  }
}
