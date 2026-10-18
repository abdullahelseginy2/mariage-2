<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'slug',
        'requester_name',
        'requester_whatsapp',
        'order_date',
        'groom_name',
        'bride_name',
        'couple_display_name',
        'is_published',
        'template',
        'locale',
        'font_family',
        'font_sizes',
        'hero',
        'loading',
        'event',
        'love_story',
        'gallery',
        'countdown',
        'rsvp',
        'footer',
        'audio',
        'party_upload',
        'organizer_username',
        'organizer_password',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'order_date' => 'date',
            'font_sizes' => 'array',
            'couple_display_name' => 'array',
            'hero' => 'array',
            'loading' => 'array',
            'event' => 'array',
            'love_story' => 'array',
            'gallery' => 'array',
            'countdown' => 'array',
            'rsvp' => 'array',
            'footer' => 'array',
            'audio' => 'array',
            'party_upload' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Invitation $invitation) {
            if (empty($invitation->organizer_username)) {
                $groomEn = '';
                $groomName = $invitation->groom_name;
                if (is_string($groomName)) {
                    $decoded = json_decode($groomName, true);
                    $groomEn = is_array($decoded) ? ($decoded['en'] ?? '') : $groomName;
                }
                
                $brideEn = '';
                $brideName = $invitation->bride_name;
                if (is_string($brideName)) {
                    $decoded = json_decode($brideName, true);
                    $brideEn = is_array($decoded) ? ($decoded['en'] ?? '') : $brideName;
                }
                
                $username = Str::slug($groomEn . '-' . $brideEn);
                if (empty($username)) {
                    $username = 'organizer-' . str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
                }
                $invitation->organizer_username = $username;
            }

            if (empty($invitation->organizer_password)) {
                $invitation->organizer_password = strtolower(Str::random(8));
            }
        });
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(Rsvp::class);
    }

    public function guestPhotos(): HasMany
    {
        return $this->hasMany(GuestPhoto::class);
    }

    public function getPublicPathAttribute(): string
    {
        return "{$this->slug}-{$this->code}";
    }

    public static function makeSlug(string $groomName, string $brideName): string
    {
        return Str::slug($groomName.'-'.$brideName);
    }
}
