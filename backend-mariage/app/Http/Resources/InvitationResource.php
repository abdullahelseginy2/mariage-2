<?php

namespace App\Http\Resources;

use App\Models\UploadSetting;
use App\Support\MediaUrlNormalizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvitationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdminRoute = $request->routeIs('api.v1.admin.*');
        $stripMissingMedia = ! $isAdminRoute;
        $uploadSettings = UploadSetting::values();
        $partyUpload = $this->value('party_upload', []);
        $invitationMaxImages = is_array($partyUpload) && isset($partyUpload['max_images'])
            ? (int) $partyUpload['max_images']
            : (int) $uploadSettings['guest_max_images'];

        return [
            'id' => $this->value('id'),
            'code' => $this->value('code'),
            'slug' => $this->value('slug'),
            'public_path' => $this->public_path,
            'groom_name' => $this->localizedString($this->value('groom_name')),
            'bride_name' => $this->localizedString($this->value('bride_name')),
            'couple_display_name' => $this->localizedString($this->value('couple_display_name')),
            'requester_name' => $this->value('requester_name'),
            'requester_whatsapp' => $this->value('requester_whatsapp'),
            'order_date' => $this->value('order_date')?->format('Y-m-d'),
            'is_published' => (bool) $this->value('is_published', false),
            'template' => $this->value('template', 'classic'),
            'locale' => $this->value('locale', 'en'),
            'font_family' => $this->value('font_family', 'elegant'),
            'font_sizes' => $this->value('font_sizes', []),
            'hero' => $this->normalizedValue('hero', [], $request, $stripMissingMedia),
            'loading' => $this->normalizedValue('loading', [], $request, $stripMissingMedia),
            'event' => $this->normalizedValue('event', [], $request, $stripMissingMedia),
            'love_story' => $this->normalizedValue('love_story', [], $request, $stripMissingMedia),
            'gallery' => $this->normalizedValue('gallery', [], $request, $stripMissingMedia),
            'countdown' => $this->normalizedValue('countdown', [], $request, $stripMissingMedia),
            'rsvp' => $this->normalizedValue('rsvp', [], $request, $stripMissingMedia),
            'footer' => $this->normalizedValue('footer', [], $request, $stripMissingMedia),
            'audio' => $this->normalizedValue('audio', [], $request, $stripMissingMedia),
            'party_upload' => $this->normalizedValue('party_upload', [], $request, $stripMissingMedia),
            'guest_upload_limits' => [
                'max_image_size_kb' => (int) $uploadSettings['guest_image_max_kb'],
                'max_images' => $invitationMaxImages,
            ],
            'rsvps_count' => $this->value('rsvps_count', 0),
            'organizer_username' => $this->when($isAdminRoute, $this->value('organizer_username')),
            'organizer_password' => $this->when($isAdminRoute, $this->value('organizer_password')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function value(string $key, mixed $default = null): mixed
    {
        if (! array_key_exists($key, $this->resource->getAttributes())) {
            return $default;
        }

        return $this->resource->getAttribute($key) ?? $default;
    }

    private function normalizedValue(string $key, mixed $default, Request $request, bool $stripMissingMedia): mixed
    {
        return MediaUrlNormalizer::normalize(
            $this->value($key, $default),
            $request,
            $stripMissingMedia
        );
    }

    private function localizedString(mixed $value): array|string|null
    {
        if (! is_string($value)) {
            return $value;
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : $value;
    }
}
